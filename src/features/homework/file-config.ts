export const MAX_HOMEWORK_FILE_SIZE = 8 * 1024 * 1024;

export const allowedHomeworkFiles: Record<string, { extension: string; contentType: string }> = {
  "application/pdf": { extension: ".pdf", contentType: "application/pdf" },
  "application/msword": { extension: ".doc", contentType: "application/msword" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extension: ".docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  "application/vnd.ms-powerpoint": { extension: ".ppt", contentType: "application/vnd.ms-powerpoint" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { extension: ".pptx", contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  "image/png": { extension: ".png", contentType: "image/png" },
  "image/jpeg": { extension: ".jpg", contentType: "image/jpeg" },
  "image/webp": { extension: ".webp", contentType: "image/webp" },
  "application/zip": { extension: ".zip", contentType: "application/zip" },
  "text/plain": { extension: ".txt", contentType: "text/plain; charset=utf-8" },
};

export const homeworkFileAccept = Object.keys(allowedHomeworkFiles).join(",");

export function validateHomeworkFile(file: File) {
  if (file.size > MAX_HOMEWORK_FILE_SIZE) return "Fayl hajmi 8 MB dan oshmasligi kerak.";
  if (!allowedHomeworkFiles[file.type]) return "Faqat PDF, Office hujjati, rasm, ZIP yoki TXT fayl yuklash mumkin.";
  return null;
}
