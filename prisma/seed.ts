import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { Role, WeekDay } from "../src/generated/prisma/enums.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const staff = [
  { fullName: "Dilnoza Rahimova", phone: "+998901112233", role: Role.ADMIN },
  { fullName: "Jasur Karimov", phone: "+998901112234", role: Role.FINANCE },
  { fullName: "Madina Yusupova", phone: "+998901112235", role: Role.TEACHER },
  { fullName: "Otabek Nazarov", phone: "+998901112237", role: Role.TEACHER },
  { fullName: "Nargiza Saidova", phone: "+998901112238", role: Role.TEACHER },
];

const studentNames = [
  "Aziza Tosheva",
  "Bekzod Rasulov",
  "Diyora Nazarova",
  "Javohir Aliyev",
  "Malika Sattorova",
  "Sardor Umarov",
  "Nodira Qodirova",
  "Otabek Yo‘ldoshev",
  "Kamola Ergasheva",
  "Islom Tursunov",
  "Sevinch Raximova",
  "Alisher Bekmurodov",
  "Gulnoza Sharipova",
  "Doniyor Mahmudov",
  "Madina Qosimova",
  "Jasurbek Norov",
  "Zarina Abdullayeva",
  "Sherzod To‘xtayev",
  "Nilufar Zokirova",
  "Timur Sirojov",
  "Robiya Fayzullayeva",
  "Abbos Xudoyorov",
  "Shahzoda Ne’matova",
  "Ulug‘bek Sobirov",
  "Mohira Aminova",
  "Dostonbek Qahhorov",
  "Laylo Zayniddinova",
  "Sanjar Ismoilov",
  "Feruza Boltaboyeva",
  "Akbar Malikov",
];

const students = studentNames.map((fullName, index) => ({
  fullName,
  phone: index === 0 ? "+998901112236" : `+99890120${String(index + 1).padStart(4, "0")}`,
  role: Role.STUDENT,
}));

const groupConfigs = [
  {
    id: "group-korean-a1",
    courseId: "course-korean",
    courseName: "Koreys tili",
    monthlyPrice: 450_000,
    name: "Koreys tili · Boshlang‘ich A1",
    teacherPhone: "+998901112235",
    weekDays: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
    startTime: "09:00",
    endTime: "10:30",
    room: "201-xona",
  },
  {
    id: "group-eps-topik",
    courseId: "course-eps-topik",
    courseName: "EPS-TOPIK",
    monthlyPrice: 600_000,
    name: "EPS-TOPIK · Intensiv",
    teacherPhone: "+998901112237",
    weekDays: [WeekDay.TUESDAY, WeekDay.THURSDAY, WeekDay.SATURDAY],
    startTime: "11:00",
    endTime: "13:00",
    room: "203-xona",
  },
  {
    id: "group-english-pre",
    courseId: "course-english",
    courseName: "Ingliz tili",
    monthlyPrice: 400_000,
    name: "Ingliz tili · Pre-Intermediate",
    teacherPhone: "+998901112238",
    weekDays: [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY],
    startTime: "14:00",
    endTime: "15:30",
    room: "105-xona",
  },
  {
    id: "group-ielts-foundation",
    courseId: "course-ielts",
    courseName: "IELTS",
    monthlyPrice: 550_000,
    name: "IELTS · Foundation",
    teacherPhone: "+998901112238",
    weekDays: [WeekDay.TUESDAY, WeekDay.THURSDAY, WeekDay.SATURDAY],
    startTime: "16:00",
    endTime: "18:00",
    room: "105-xona",
  },
];

function dateFromNow(offset: number) {
  const date = new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + offset));
}

const homeworkByGroup: Record<string, Array<{ title: string; description: string; attachmentUrl: string; dueOffset: number; createdOffset: number }>> = {
  "group-korean-a1": [
    { title: "Hangul: ㅏ, ㅓ, ㅗ, ㅜ unli harflari", description: "1–4-bo‘limdagi hechalarni alohida daftarga yozing. Har bir unli harf uchun ikkitadan so‘z tuzing va talaffuzini ovozli yozuvga soling.", attachmentUrl: "https://www.korean.go.kr/", dueOffset: -3, createdOffset: -7 },
    { title: "O‘zini tanishtirish: 8 ta gap", description: "Ism, yosh, kasb, yashash joyi va sevimli mashg‘ulotingiz haqida 8 ta gap yozing. Keyingi darsda matnga qarashdan o‘qib berasiz.", attachmentUrl: "https://www.korean.go.kr/", dueOffset: 1, createdOffset: -2 },
    { title: "Kundalik so‘zlashuv uchun 20 ta so‘z", description: "Darslikdagi 20 ta yangi so‘zni tarjimasi va bittadan misol gap bilan yozing. So‘zlarni juftlikda o‘zaro so‘rash uchun tayyorlab qo‘ying.", attachmentUrl: "https://www.korean.go.kr/", dueOffset: 4, createdOffset: -1 },
    { title: "2-bo‘lim: ta’rif va savol shakllari", description: "이에요/예요 va 입니까? shakllaridan foydalanib 6 ta savol-javob yozing. To‘g‘ri va noto‘g‘ri shakllarni taqqoslab, qoidani qisqacha izohlang.", attachmentUrl: "https://www.korean.go.kr/", dueOffset: 8, createdOffset: 0 },
  ],
  "group-eps-topik": [
    { title: "EPS-TOPIK listening: 1–10 savollar", description: "Tinglab tushunish bo‘limining 1–10-savollarini vaqt belgilab bajaring. Xato javoblar uchun to‘g‘ri variantni qaysi ibora bildirganini yozing.", attachmentUrl: "https://www.topik.go.kr/", dueOffset: -2, createdOffset: -6 },
    { title: "Ishchi va ish haqi: fe’llar", description: "Berilgan fe’llar ro‘yxatidan 15 ta ish jarayoniga oid gap tuzing. Har bir gapda vaqt va joyni bildiruvchi so‘zlardan foydalaning.", attachmentUrl: "https://www.topik.go.kr/", dueOffset: 2, createdOffset: -2 },
    { title: "Reading: e’lonlar va qoidalar", description: "Ish joyidagi e’lonlar mavzusidagi matnlarni o‘qib, 12 ta savolga javob bering. Qiyin chiqqan iboralarni alohida ro‘yxatga yozing.", attachmentUrl: "https://www.topik.go.kr/", dueOffset: 5, createdOffset: -1 },
    { title: "Mock test: 3-modul xatolarini tahlil qilish", description: "Oxirgi sinov testidagi xatolaringizni jadvalga yozing: savol, xato sababi va to‘g‘ri qoida. Bir xil turdagi xatolar uchun qayta mashq bajaring.", attachmentUrl: "https://www.topik.go.kr/", dueOffset: 9, createdOffset: 0 },
  ],
  "group-english-pre": [
    { title: "Daily routine: 10 ta gap", description: "Write 10 sentences about your weekday routine. Use at least six frequency adverbs and underline the verb in each sentence.", attachmentUrl: "https://learnenglish.britishcouncil.org/", dueOffset: -4, createdOffset: -8 },
    { title: "Present Simple: intervyu", description: "Prepare eight questions for a classmate about work, family and free time. Write short follow-up notes for three possible answers.", attachmentUrl: "https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/present-simple", dueOffset: 1, createdOffset: -2 },
    { title: "Unit 5: Food vocabulary", description: "Learn 25 food and drink words from Unit 5. Write a short shopping list and four sentences about your eating habits.", attachmentUrl: "https://learnenglish.britishcouncil.org/vocabulary", dueOffset: 3, createdOffset: -1 },
    { title: "Listening: at the cafe", description: "Listen to the cafe conversation twice. Complete the order notes and write five phrases you can use when ordering food.", attachmentUrl: "https://learnenglish.britishcouncil.org/skills/listening", dueOffset: 7, createdOffset: 0 },
  ],
  "group-ielts-foundation": [
    { title: "IELTS Writing Task 1: chart", description: "Write at least 150 words describing the provided bar chart. Include an overview and two comparisons; highlight your key trend vocabulary.", attachmentUrl: "https://ielts.org/take-a-test/preparation-resources", dueOffset: -1, createdOffset: -5 },
    { title: "Speaking Part 1: hometown", description: "Record answers to six hometown questions. Each answer should be 20–30 seconds and include one specific example, not just a list of adjectives.", attachmentUrl: "https://ielts.org/take-a-test/preparation-resources/free-ielts-practice-tests/speaking", dueOffset: 2, createdOffset: -2 },
    { title: "Reading: matching headings", description: "Complete the matching-headings practice in 20 minutes. For every answer, underline the sentence in the passage that supports your choice.", attachmentUrl: "https://ielts.org/take-a-test/preparation-resources/free-ielts-practice-tests/reading", dueOffset: 6, createdOffset: -1 },
    { title: "Vocabulary: education", description: "Learn 20 education collocations from the class list. Write eight sentences about your own learning experience using at least ten of them.", attachmentUrl: "https://ielts.org/take-a-test/preparation-resources", dueOffset: 10, createdOffset: 0 },
  ],
};

async function main() {
  const passwordHash = await bcrypt.hash("Demo2026!", 12);
  const usersByPhone = new Map<string, string>();

  for (const account of [...staff, ...students]) {
    const user = await prisma.user.upsert({
      where: { phone: account.phone },
      update: { fullName: account.fullName, role: account.role, isActive: true, passwordHash },
      create: { ...account, passwordHash },
      select: { id: true, phone: true },
    });
    usersByPhone.set(user.phone, user.id);
  }

  for (const config of groupConfigs) {
    await prisma.course.upsert({
      where: { id: config.courseId },
      update: { name: config.courseName, monthlyPrice: config.monthlyPrice },
      create: { id: config.courseId, name: config.courseName, monthlyPrice: config.monthlyPrice },
    });

    const teacherId = usersByPhone.get(config.teacherPhone);
    if (!teacherId) throw new Error(`Teacher not found: ${config.teacherPhone}`);

    await prisma.group.upsert({
      where: { id: config.id },
      update: {
        name: config.name,
        courseId: config.courseId,
        teacherId,
        weekDays: config.weekDays,
        startTime: config.startTime,
        endTime: config.endTime,
        room: config.room,
        startDate: new Date("2026-09-01T00:00:00.000Z"),
      },
      create: {
        id: config.id,
        name: config.name,
        courseId: config.courseId,
        teacherId,
        weekDays: config.weekDays,
        startTime: config.startTime,
        endTime: config.endTime,
        room: config.room,
        startDate: new Date("2026-09-01T00:00:00.000Z"),
      },
    });
  }

  const groupSizes = [8, 8, 7, 7];
  let studentIndex = 0;

  for (let groupIndex = 0; groupIndex < groupConfigs.length; groupIndex += 1) {
    const config = groupConfigs[groupIndex];
    const teacherId = usersByPhone.get(config.teacherPhone);
    if (!teacherId) throw new Error(`Teacher not found: ${config.teacherPhone}`);

    for (let index = 0; index < groupSizes[groupIndex]; index += 1) {
      const student = students[studentIndex];
      const studentId = usersByPhone.get(student.phone);
      if (!studentId) throw new Error(`Student not found: ${student.phone}`);

      await prisma.groupStudent.upsert({
        where: { groupId_studentId: { groupId: config.id, studentId } },
        update: { leftAt: null },
        create: {
          groupId: config.id,
          studentId,
          joinedAt: new Date(Date.UTC(2026, 8 + (studentIndex % 2), 1 + (studentIndex % 20))),
        },
      });
      studentIndex += 1;
    }

    const homeworkItems = homeworkByGroup[config.id];
    for (let index = 0; index < homeworkItems.length; index += 1) {
      const item = homeworkItems[index];
      await prisma.homework.upsert({
        where: { id: `homework-${config.id}-${index + 1}` },
        update: { title: item.title, description: item.description, attachmentUrl: item.attachmentUrl, dueDate: dateFromNow(item.dueOffset), createdById: teacherId },
        create: {
          id: `homework-${config.id}-${index + 1}`,
          groupId: config.id,
          title: item.title,
          description: item.description,
          attachmentUrl: item.attachmentUrl,
          dueDate: dateFromNow(item.dueOffset),
          createdById: teacherId,
          createdAt: dateFromNow(item.createdOffset),
        },
      });
    }
  }

  console.log(`Seeded ${staff.length + students.length} accounts, ${groupConfigs.length} groups and 16 homework items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
