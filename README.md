# Forever Study CRM

Forever Study ta’lim markazi uchun ichki CRM. Next.js App Router, TypeScript, Tailwind CSS, Radix/shadcn/ui, PostgreSQL va Prisma asosida qurilgan.

## Talablar

- Node.js 24 LTS
- PostgreSQL 16 yoki undan yangi
- npm 11 yoki undan yangi

## Lokal ishga tushirish

1. Paketlarni o‘rnating:

   ```bash
   npm install
   ```

2. `.env.example` asosida `.env` yarating va `DATABASE_URL` ni o‘z PostgreSQL hisobingizga moslang:

   ```bash
   cp .env.example .env
   ```

   Windows Command Prompt uchun: `copy .env.example .env`

   Misol uchun PostgreSQL’da quyidagi lokal hisob va bazani yaratish mumkin:

   ```sql
   CREATE USER forever WITH PASSWORD 'forever';
   CREATE DATABASE forever_study OWNER forever;
   ```

3. Migratsiyalarni qo‘llang va demo hisoblarni yarating:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Dasturni ishga tushiring:

   ```bash
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) manzilini oching.

## Xodimlar va o‘quvchilar

Hozirgi lokal bazada Google Sheets’dan import qilingan 55 o‘quvchi, 8 xodim va 10 real guruh mavjud. O‘quvchilar: 38 faol, 2 muzlatilgan, 3 kursni tugatgan va 12 nomalum holatda. Faqat faol o‘quvchilar tizimga kira oladi.

Barcha lokal hisoblar paroli: **Demo2026!**

| Lavozim | Telefon | Ism |
| --- | --- | --- |
| Administrator | `+998 90 111 22 33` | Dilnoza Sotiboldiyeva |
| Menejer | `+998 90 111 22 34` | Raxmonov Saidakbar |
| Operator | `+998 90 111 22 39` | Oygul Olibekova |
| Ustoz | `+998 90 111 22 35` | Imona SEM |
| Ustoz | `+998 90 111 22 37` | Ulugbek SEM |
| Ustoz | `+998 90 111 22 38` | Dilnura SEM |
| Support teacher | `+998 90 111 22 40` | Lazizbek Almardonov |
| Support teacher 2 | `+998 90 111 22 41` | Bonu |

Xodimlarning telefon raqamlari jadvalda bo‘lmagani uchun ularga vaqtinchalik login raqamlari berildi. O‘quvchilar jadvaldagi haqiqiy telefon raqamlari va yuqoridagi umumiy demo parol bilan kiradi; real foydalanishdan oldin parollarni almashtiring.

## Google Sheets import

Google Sheets’ni CSV formatida yuklab olib, quyidagi buyruqni ishga tushiring:

```bash
npm run data:import -- /path/to/students.csv
```

Bazaga yozmasdan tekshirish uchun `--dry-run` qo‘shing. Import telefonlarni `+998XXXXXXXXX` formatiga keltiradi, faol o‘quvchilarni ustoz/dars jadvali/vaqt bo‘yicha guruhlaydi, to‘lov va sotuv menejeri ma’lumotlarini saqlaydi. Muzlatilgan, kursni tugatgan va nomalum o‘quvchilar faol guruhga qo‘shilmaydi.

`npm run db:seed` alohida demo fixtures uchun; real importdan keyin uni qayta ishga tushirmang. Production’da demo parollarni ishlatmang.

## Muhit o‘zgaruvchilari

| O‘zgaruvchi | Majburiy | Tavsif |
| --- | --- | --- |
| `DATABASE_URL` | Ha | PostgreSQL connection URL. Prisma CLI va Next.js server runtime ishlatadi. |
| `ALLOW_INSECURE_LOCAL_COOKIES` | Yo‘q | Faqat lokal HTTP production preview’da `true` qilinadi. Production’da har doim `false`. |

Session’lar tasodifiy, bir martalik token va PostgreSQL’dagi SHA-256 token hash orqali ishlaydi; alohida JWT secret talab qilinmaydi. Cookie `HttpOnly`, `SameSite=Lax`, production’da `Secure` va 7 kunlik muddat bilan yaratiladi.

## Foydali buyruqlar

| Buyruq | Vazifasi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Strict TypeScript tekshiruvi |
| `npm run db:check` | Prisma schema validatsiyasi |
| `npm run db:generate` | Prisma Client generatsiyasi |
| `npm run db:migrate` | Yangi development migratsiyasi |
| `npm run db:deploy` | Production migratsiyalarini qo‘llash |
| `npm run db:seed` | Demo ma’lumotlarni yuklash |
| `npm run db:studio` | Prisma Studio |
| `npm run data:import -- file.csv` | Google Sheets CSV import |

## Vercel + Neon deploy

1. Neon’da database oching va connection string’ni oling.
2. Vercel project’ning **Settings → Environment Variables** bo‘limiga qo‘shing:

   ```text
   DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DATABASE?sslmode=require
   ```

   Neon parol va host’ni GitHub’ga commit qilmang. Pooled host (`-pooler`) tavsiya etiladi.
3. Bir martalik migratsiyani lokal terminalda Neon URL bilan bajaring:

   ```bash
   DATABASE_URL="neon-connection-url" npm run db:deploy
   ```

4. Vercel `npm install` paytida Prisma Client avtomatik generatsiya qilinadi. Build davomida `prisma migrate deploy` bajariladi. Bo‘sh production bazasida Google Sheets’dagi o‘quvchilar, xodimlar va guruhlar bir marta import qilinadi; keyingi deploy’larda import takrorlanmaydi.
5. Production’da demo seed, demo parollar va `ALLOW_INSECURE_LOCAL_COOKIES=true` ishlatilmaydi.

Agar build `DATABASE_URL muhit o‘zgaruvchisi ko‘rsatilmagan` desa, Vercel’dagi environment variable build environment’da ham, production’da ham yo‘qilganini tekshiring. Agar `table does not exist` desa, `prisma migrate deploy` bajarilmagan.

## Production

```bash
npm run db:deploy
npm run build
npm start
```

Build va development server Windows’da symbolic-link/junction uchun qo‘shimcha ruxsat talab qilmasligi uchun webpack rejimida ishlaydi.

Yuklangan uy vazifasi fayllari `.data/uploads` ichida saqlanadi va `/api/files/[filename]` orqali rolni tekshirib beriladi. Production’da bu katalog uchun doimiy disk va backup sozlang; serverless fayl tizimida ulash mumkin bo‘lgan obyekt storage ishlatiladi.

Production’da HTTPS va ishonchli reverse proxy sozlang. Login rate-limit IP manzilni `x-forwarded-for` / `x-real-ip` header’laridan oladi; bu header’larni faqat ishonchli proxy yozishiga ruxsat bering. Demo parollarni almashtiring va `.env` faylini versiya nazoratiga qo‘shmang.

## Dizayn sozlamalari

- Brend rangi: `src/app/globals.css` ichidagi `--brand` (standart `#4f46e5`).
- Asosiy shrift: Inter, `next/font` orqali lokal optimizatsiya qilinadi.
- Sana va vaqt: `Asia/Tashkent`, `DD.MM.YYYY`, 24 soat.
- Pul: `src/lib/format.ts` ichidagi `formatMoney`, butun UZS va bo‘shliq ajratgich bilan.
- Tema: `next-themes`, yorug‘ / tungi / tizim rejimi.

## Tuzilishi

- `src/features/auth` — login, session, parol tekshiruvi va server RBAC.
- `src/components/layout` — sidebar, topbar, command palette va navigatsiya.
- `src/components/ui` — qayta ishlatiladigan Radix/shadcn komponentlari.
- `src/app/(auth)` — faqat kirish sahifasi.
- `src/app/(dashboard)` — himoyalangan ichki sahifalar.
- `prisma` — schema, migratsiyalar va seed.
