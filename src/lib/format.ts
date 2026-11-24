const tashkentTimeZone = "Asia/Tashkent";

export function formatMoney(amount: number) {
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} so‘m`;
}

export function formatDate(date: Date | string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: tashkentTimeZone,
  }).formatToParts(new Date(date));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get("day")}.${get("month")}.${get("year")}`;
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)}, ${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tashkentTimeZone,
  }).format(new Date(date))}`;
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(0, 12);
  const parts = [digits.slice(0, 3), digits.slice(3, 5), digits.slice(5, 8), digits.slice(8, 10), digits.slice(10, 12)].filter(Boolean);
  return parts.length ? `+${parts.join(" ")}` : "";
}

export function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatPhoneInput(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("998")) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  if (!digits) return "";

  const local = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
  return `+998${local.length ? ` ${local.join(" ")}` : ""}`;
}
