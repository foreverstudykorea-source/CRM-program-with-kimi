import { getCurrentUser } from "@/features/auth/session";
import { readHomeworkFile } from "@/features/homework/storage";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role === "FINANCE") return Response.json({ error: "Ruxsat yo‘q." }, { status: 403 });

  const { filename } = await params;
  const attachmentUrl = `/api/files/${filename}`;
  const homework = await db.homework.findFirst({
    where: {
      attachmentUrl,
      ...(user.role === "TEACHER" ? { group: { teacherId: user.id } } : {}),
      ...(user.role === "STUDENT" ? { group: { students: { some: { studentId: user.id, leftAt: null } } } } : {}),
    },
    select: { id: true },
  });
  if (!homework) return Response.json({ error: "Fayl topilmadi." }, { status: 404 });

  const file = await readHomeworkFile(filename);
  if (!file) return Response.json({ error: "Fayl topilmadi." }, { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="material${filename.slice(filename.lastIndexOf("."))}"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
