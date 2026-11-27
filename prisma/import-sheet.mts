import "dotenv/config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { addMinutesToTime } from "../src/features/support/utils.js";
import { GroupStatus, Role, StudentPaymentStatus, WeekDay } from "../src/generated/prisma/enums.js";

const csvPath = process.argv.find((argument) => argument.endsWith(".csv")) ?? ".tools/forever-staff.csv";
const dryRun = process.argv.includes("--dry-run");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type ImportedStatus = "ACTIVE" | "FROZEN" | "COMPLETED" | "PROSPECT";
type SheetRow = {
  sourceRow: number;
  fullName: string;
  phone: string;
  phoneNote: string | null;
  courseType: string | null;
  teacherName: string | null;
  scheduleText: string | null;
  timeText: string | null;
  trialDate: Date | null;
  startDate: Date | null;
  startDateText: string | null;
  paymentStatus: StudentPaymentStatus;
  paymentTiming: string | null;
  debtAmount: number | null;
  salesManager: string | null;
  notes: string | null;
  status: ImportedStatus;
  frozenAt: Date | null;
};

type GroupConfig = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacherPhone: string;
  teacherName: string;
  weekDays: WeekDay[];
  startTime: string;
  startDate: Date;
};

const staffAccounts = [
  { fullName: "Dilnoza Sotiboldiyeva", phone: "+998901112233", role: Role.ADMIN, jobTitle: "Administrator" },
  { fullName: "Raxmonov Saidakbar", phone: "+998901112234", role: Role.FINANCE, jobTitle: "Menejer" },
  { fullName: "Imona SEM", phone: "+998901112235", role: Role.TEACHER, jobTitle: "Ustoz" },
  { fullName: "Ulugbek SEM", phone: "+998901112237", role: Role.TEACHER, jobTitle: "Ustoz" },
  { fullName: "Dilnura SEM", phone: "+998901112238", role: Role.TEACHER, jobTitle: "Ustoz" },
  { fullName: "Oygul Olibekova", phone: "+998901112239", role: Role.ADMIN, jobTitle: "Operator" },
  { fullName: "Lazizbek Almardonov", phone: "+998901112240", role: Role.TEACHER, jobTitle: "Support teacher" },
  { fullName: "Bonu", phone: "+998901112241", role: Role.TEACHER, jobTitle: "Support teacher 2" },
];

const demoStudentPhones = [
  "+998901112236",
  ...Array.from({ length: 29 }, (_, index) => `+99890120${String(index + 2).padStart(4, "0")}`),
];

const teacherConfig: Record<string, { key: string; phone: string; fullName: string }> = {
  iymona: { key: "imona", phone: "+998901112235", fullName: "Imona SEM" },
  dilnura: { key: "dilnura", phone: "+998901112238", fullName: "Dilnura SEM" },
  "ulug'bek": { key: "ulugbek", phone: "+998901112237", fullName: "Ulugbek SEM" },
};

const scheduleConfig: Record<string, { key: string; days: WeekDay[] }> = {
  "dush-chor-juma": { key: "mwf", days: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY] },
  "sesh-pay-shan": { key: "tts", days: [WeekDay.TUESDAY, WeekDay.THURSDAY, WeekDay.SATURDAY] },
};

function clean(value: unknown) {
  return String(value ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value: unknown) {
  const text = clean(value);
  const match = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])));
}

function parsePhone(rawPhone: string) {
  const beforeAlternate = rawPhone.split("(")[0];
  let digits = beforeAlternate.replace(/\D/g, "");
  if (!digits) digits = rawPhone.match(/\(\s*(\d+)\s*\)/)?.[1] ?? "";
  if (!/^\d{9}$/.test(digits)) throw new Error(`Telefon raqam 9 xonali emas: ${rawPhone}`);
  return `+998${digits}`;
}

function parseStatus(value: string): ImportedStatus {
  if (value === "Faol") return "ACTIVE";
  if (value === "Muzlatilgan") return "FROZEN";
  if (value === "Kursni tugatdi") return "COMPLETED";
  return "PROSPECT";
}

function parsePaymentStatus(value: string) {
  if (value === "To‘ladi") return StudentPaymentStatus.PAID;
  if (value === "Qarzdor") return StudentPaymentStatus.DEBT;
  if (value === "Umuman to‘lamadi") return StudentPaymentStatus.UNPAID;
  return StudentPaymentStatus.UNKNOWN;
}

function parseDebt(notes: string, status: StudentPaymentStatus) {
  if (status !== StudentPaymentStatus.DEBT && !/qarz/i.test(notes)) return null;
  const compact = notes.replace(/[\s.]/g, "");
  const match = compact.match(/(\d{4,})/);
  return match ? Number(match[1]) : null;
}

function normalizeTime(value: string) {
  const time = value.replace(";", ":");
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : null;
}

function groupKeyFor(row: SheetRow) {
  if (!row.teacherName || !row.scheduleText || !row.timeText || !row.courseType) return null;
  const teacher = teacherConfig[row.teacherName.toLocaleLowerCase("uz")];
  const schedule = scheduleConfig[row.scheduleText.toLocaleLowerCase("uz")];
  if (!teacher || !schedule) return null;
  return `${teacher.key}|${row.courseType.toLocaleLowerCase("uz")}|${schedule.key}|${row.timeText.replace(":", "")}`;
}

if (process.env.VERCEL === "1" || process.env.IMPORT_CSV_URL) {
  const url = process.env.IMPORT_CSV_URL ?? "https://docs.google.com/spreadsheets/d/1kcqnwgshO23uKWRGX2qpWrNBfHEJGPtGJhNTaLPENag/export?format=csv";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download Google Sheets CSV: ${response.status}`);
  mkdirSync(".tools", { recursive: true });
  writeFileSync(csvPath, await response.text(), "utf8");
}

const parsedRows = parse(readFileSync(csvPath, "utf8"), { relax_column_count: true, skip_empty_lines: false }) as string[][];
const headerIndex = parsedRows.findIndex((row) => clean(row[0]) === "No");
if (headerIndex < 0) throw new Error("Jadvaldagi ‘No’ ustuni topilmadi.");

const students: SheetRow[] = parsedRows.slice(headerIndex + 1).filter((row) => clean(row[1])).map((row) => {
  const rawPhone = clean(row[2]);
  const rawStartDate = clean(row[8]);
  const originalNotes = clean(row[12]);
  const status = parseStatus(clean(row[13]));
  const paymentStatus = parsePaymentStatus(clean(row[10]));
  const noteParts = [originalNotes];
  if (/[A-Za-zÀ-ž()]/.test(rawPhone)) noteParts.push(`Kontakt izohi: ${rawPhone}`);
  if (rawStartDate && !parseDate(rawStartDate)) noteParts.push(`Dars boshlash izohi: ${rawStartDate}`);
  const frozenMatch = originalNotes.match(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);

  return {
    sourceRow: Number(clean(row[0])),
    fullName: clean(row[1]),
    phone: parsePhone(rawPhone),
    phoneNote: /[A-Za-zÀ-ž()]/.test(rawPhone) ? rawPhone : null,
    courseType: clean(row[3]) || null,
    teacherName: clean(row[4]) || null,
    scheduleText: clean(row[5]) || null,
    timeText: normalizeTime(clean(row[6])),
    trialDate: parseDate(row[7]),
    startDate: parseDate(rawStartDate),
    startDateText: rawStartDate && !parseDate(rawStartDate) ? rawStartDate : null,
    paymentStatus,
    paymentTiming: clean(row[9]) || null,
    debtAmount: parseDebt(originalNotes, paymentStatus),
    salesManager: clean(row[11]) || null,
    notes: noteParts.filter(Boolean).join("\n") || null,
    status,
    frozenAt: status === "FROZEN" && frozenMatch ? new Date(Date.UTC(Number(frozenMatch[3]), Number(frozenMatch[2]) - 1, Number(frozenMatch[1]))) : null,
  };
});

const phoneCounts = new Map<string, number>();
for (const student of students) phoneCounts.set(student.phone, (phoneCounts.get(student.phone) ?? 0) + 1);
const duplicates = Array.from(phoneCounts.entries()).filter(([, count]) => count > 1);
if (duplicates.length) throw new Error(`Takroriy telefon raqamlar: ${duplicates.map(([phone]) => phone).join(", ")}`);
const staffPhones = new Set(staffAccounts.map((account) => account.phone));
if (students.some((student) => staffPhones.has(student.phone))) throw new Error("Xodim va o‘quvchi telefon raqami takrorlandi.");

const groupMap = new Map<string, GroupConfig>();
for (const student of students) {
  const key = groupKeyFor(student);
  if (!key) continue;
  const teacher = teacherConfig[student.teacherName!.toLocaleLowerCase("uz")];
  const schedule = scheduleConfig[student.scheduleText!.toLocaleLowerCase("uz")];
  const courseName = student.courseType!;
  const startDate = student.startDate ?? student.trialDate ?? new Date();
  const existing = groupMap.get(key);
  if (existing && startDate < existing.startDate) existing.startDate = startDate;
  if (existing) continue;

  groupMap.set(key, {
    id: `sheet-${key.replaceAll("|", "-")}`,
    name: `${teacher.fullName.replace(" SEM", "")} · ${student.scheduleText} · ${student.timeText}`,
    courseId: `sheet-course-${courseName.toLocaleLowerCase("uz")}`,
    courseName,
    teacherPhone: teacher.phone,
    teacherName: teacher.fullName,
    weekDays: schedule.days,
    startTime: student.timeText!,
    startDate,
  });
}

const statusCounts = students.reduce<Record<string, number>>((counts, student) => {
  counts[student.status] = (counts[student.status] ?? 0) + 1;
  return counts;
}, {});
console.log("Import rows:", students.length, statusCounts);
console.table(Array.from(groupMap.values()).map((group) => ({
  group: group.name,
  course: group.courseName,
  teacher: group.teacherName,
  active: students.filter((student) => student.status === "ACTIVE" && groupKeyFor(student) === group.id.replace("sheet-", "").replaceAll("-", "|")).length,
})));

async function main() {
  if (process.env.VERCEL === "1") {
    const studentCount = await prisma.user.count({ where: { role: Role.STUDENT } });
    if (studentCount > 0) {
      console.log("Production data already exists, skipping initial import.");
      return;
    }
  }

  const passwordHash = await bcrypt.hash("Demo2026!", 12);
  const importDate = new Date();

  await prisma.$transaction(async (transaction) => {
    const staffIds = new Map<string, string>();
    for (const account of staffAccounts) {
      const user = await transaction.user.upsert({
        where: { phone: account.phone },
        update: { ...account, isActive: true, passwordHash },
        create: { ...account, isActive: true, passwordHash },
        select: { id: true, phone: true },
      });
      staffIds.set(user.phone, user.id);
    }

    await transaction.user.deleteMany({ where: { role: Role.STUDENT, phone: { in: demoStudentPhones } } });
    await transaction.group.updateMany({
      where: { id: { in: ["group-korean-a1", "group-eps-topik", "group-english-pre", "group-ielts-foundation"] } },
      data: { status: GroupStatus.ARCHIVED },
    });

    const groupIds = new Map<string, string>();
    for (const [key, group] of groupMap) {
      const teacherId = staffIds.get(group.teacherPhone);
      if (!teacherId) throw new Error(`Ustoz topilmadi: ${group.teacherPhone}`);
      await transaction.course.upsert({
        where: { id: group.courseId },
        update: { name: group.courseName },
        create: { id: group.courseId, name: group.courseName, monthlyPrice: 0 },
      });
      await transaction.group.upsert({
        where: { id: group.id },
        update: {
          name: group.name,
          courseId: group.courseId,
          teacherId,
          weekDays: group.weekDays,
          startTime: group.startTime,
          endTime: addMinutesToTime(group.startTime, 90),
          room: null,
          startDate: group.startDate,
          status: GroupStatus.ACTIVE,
        },
        create: {
          id: group.id,
          name: group.name,
          courseId: group.courseId,
          teacherId,
          weekDays: group.weekDays,
          startTime: group.startTime,
          endTime: addMinutesToTime(group.startTime, 90),
          room: null,
          startDate: group.startDate,
          status: GroupStatus.ACTIVE,
        },
      });
      groupIds.set(key, group.id);
    }

    for (const student of students) {
      const user = await transaction.user.upsert({
        where: { phone: student.phone },
        update: {
          fullName: student.fullName,
          role: Role.STUDENT,
          jobTitle: "O‘quvchi",
          isActive: student.status === "ACTIVE",
          passwordHash,
        },
        create: {
          fullName: student.fullName,
          phone: student.phone,
          role: Role.STUDENT,
          jobTitle: "O‘quvchi",
          isActive: student.status === "ACTIVE",
          passwordHash,
        },
        select: { id: true },
      });

      await transaction.studentProfile.upsert({
        where: { sourceRow: student.sourceRow },
        update: {
          userId: user.id,
          status: student.status,
          courseType: student.courseType,
          teacherName: student.teacherName,
          scheduleText: student.scheduleText,
          timeText: student.timeText,
          trialDate: student.trialDate,
          startDate: student.startDate,
          startDateText: student.startDateText,
          paymentStatus: student.paymentStatus,
          paymentTiming: student.paymentTiming,
          debtAmount: student.debtAmount,
          salesManager: student.salesManager,
          notes: student.notes,
        },
        create: {
          userId: user.id,
          sourceRow: student.sourceRow,
          status: student.status,
          courseType: student.courseType,
          teacherName: student.teacherName,
          scheduleText: student.scheduleText,
          timeText: student.timeText,
          trialDate: student.trialDate,
          startDate: student.startDate,
          startDateText: student.startDateText,
          paymentStatus: student.paymentStatus,
          paymentTiming: student.paymentTiming,
          debtAmount: student.debtAmount,
          salesManager: student.salesManager,
          notes: student.notes,
        },
      });

      await transaction.groupStudent.updateMany({
        where: { studentId: user.id, leftAt: null, group: { id: { startsWith: "sheet-" } } },
        data: { leftAt: importDate },
      });

      const groupKey = groupKeyFor(student);
      const groupId = groupKey ? groupIds.get(groupKey) : null;
      if (groupId && (student.status === "ACTIVE" || student.status === "FROZEN")) {
        await transaction.groupStudent.upsert({
          where: { groupId_studentId: { groupId, studentId: user.id } },
          update: { joinedAt: student.startDate ?? student.trialDate ?? importDate, leftAt: student.frozenAt },
          create: { groupId, studentId: user.id, joinedAt: student.startDate ?? student.trialDate ?? importDate, leftAt: student.frozenAt },
        });
      }
    }

    await transaction.auditLog.create({
      data: {
        userId: staffIds.get("+998901112233"),
        action: "DATA_IMPORT",
        entity: "StudentProfile",
        meta: { source: "Google Sheets", rows: students.length, groups: groupMap.size },
      },
    });
  });

  console.log(`Imported ${students.length} students, ${staffAccounts.length} staff accounts and ${groupMap.size} groups.`);
}

async function run() {
  if (dryRun) {
    console.log("Dry run complete. Database was not changed.");
    return;
  }
  await main();
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
