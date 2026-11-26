import ExcelJS from "exceljs";
import { requireRole } from "@/features/auth/session";
import { getDebtors, getMonthlySummary, getMonthValue, getRevenueMonths } from "@/features/finance/queries";
import { paymentMethodLabels, formatMonth } from "@/features/finance/labels";
import { db } from "@/lib/db";
import { getServerTime } from "@/lib/server-time";
import { formatDate } from "@/lib/format";

export async function GET() {
  await requireRole("FINANCE");
  const month = getMonthValue(await getServerTime());
  const [summary, debtors, revenue, payments] = await Promise.all([
    getMonthlySummary(month),
    getDebtors(),
    getRevenueMonths(),
    db.payment.findMany({ include: { student: true, charge: { include: { group: true } } }, orderBy: { paidAt: "desc" } }),
  ]);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Forever Study";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Moliya xulosasi");
  summarySheet.addRows([
    ["Ko‘rsatkich", "UZS"],
    ["Kutilayotgan tushum", summary.expected],
    ["Yig‘ilgan mablag‘", summary.collected],
    ["Umumiy qarz", summary.debt],
    ["Yig‘ish foizi", `${summary.collectionRate}%`],
  ]);
  summarySheet.getColumn(1).width = 28;
  summarySheet.getColumn(2).width = 20;

  const debtorSheet = workbook.addWorksheet("Qarzdorlar");
  debtorSheet.addRow(["O‘quvchi", "Telefon", "Guruhlar", "Oylar soni", "Qarz (UZS)"]);
  for (const debtor of debtors) debtorSheet.addRow([debtor.fullName, debtor.phone, [...debtor.groups].join(", "), debtor.months.size, debtor.debt]);
  debtorSheet.getColumn(1).width = 26;
  debtorSheet.getColumn(3).width = 48;
  debtorSheet.getColumn(5).width = 18;

  const revenueSheet = workbook.addWorksheet("12 oylik tushum");
  revenueSheet.addRow(["Oy", "Tushum (UZS)"]);
  for (const item of revenue) revenueSheet.addRow([item.month, item.value]);
  revenueSheet.getColumn(1).width = 20;
  revenueSheet.getColumn(2).width = 20;

  const paymentSheet = workbook.addWorksheet("To‘lovlar");
  paymentSheet.addRow(["Sana", "O‘quvchi", "Guruh", "Oy", "Usul", "Summa (UZS)", "Izoh"]);
  for (const payment of payments) paymentSheet.addRow([formatDate(payment.paidAt), payment.student.fullName, payment.charge?.group.name ?? "", payment.charge ? formatMonth(payment.charge.month) : "", paymentMethodLabels[payment.method], payment.amount, payment.note ?? ""]);
  paymentSheet.getColumn(1).width = 16;
  paymentSheet.getColumn(2).width = 26;
  paymentSheet.getColumn(3).width = 44;
  paymentSheet.getColumn(7).width = 42;
  for (const sheet of workbook.worksheets) sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="forever-study-${month}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
