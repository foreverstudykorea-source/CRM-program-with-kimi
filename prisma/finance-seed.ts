import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { ChargeStatus, PaymentMethod } from "../src/generated/prisma/enums.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  await prisma.course.updateMany({ where: { name: "Standard" }, data: { monthlyPrice: 690_000 } });
  await prisma.course.updateMany({ where: { name: "Individual" }, data: { monthlyPrice: 690_000 } });

  const finance = await prisma.user.findUniqueOrThrow({ where: { phone: "+998901112234" }, select: { id: true } });
  const now = new Date();
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const members = await prisma.groupStudent.findMany({
    where: { leftAt: null, group: { status: "ACTIVE" }, student: { studentProfile: { status: "ACTIVE" } } },
    select: {
      studentId: true,
      groupId: true,
      group: { select: { course: { select: { monthlyPrice: true } } } },
      student: { select: { studentProfile: { select: { paymentStatus: true, debtAmount: true } } } },
    },
  });

  for (const member of members) {
    const debt = member.student.studentProfile?.debtAmount ?? 0;
    const amount = Math.max(member.group.course.monthlyPrice, debt);
    const paymentStatus = member.student.studentProfile?.paymentStatus;
    const paidAmount = paymentStatus === "PAID" ? amount : paymentStatus === "DEBT" ? Math.max(amount - debt, 0) : 0;
    const status = paidAmount === 0 ? ChargeStatus.UNPAID : paidAmount >= amount ? ChargeStatus.PAID : ChargeStatus.PARTIAL;

    const charge = await prisma.charge.upsert({
      where: { studentId_groupId_month: { studentId: member.studentId, groupId: member.groupId, month } },
      update: {},
      create: { studentId: member.studentId, groupId: member.groupId, month, amount, discount: 0, status },
    });

    if (paidAmount > 0) {
      const existingPayment = await prisma.payment.findFirst({ where: { chargeId: charge.id }, select: { id: true } });
      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            studentId: member.studentId,
            chargeId: charge.id,
            amount: paidAmount,
            method: PaymentMethod.CASH,
            paidAt: month,
            receivedById: finance.id,
            note: "Google Sheets import: to‘lov uslubi ko‘rsatilmagan.",
          },
        });
      }
    }
  }

  console.log(`Finance baseline created for ${members.length} active memberships.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
