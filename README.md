# THE NOBLE BLADE — Professional Barbershop Platform

Ushbu platforma mijozlar uchun eksklyuziv veb-sayt, to'liq integratsiyalangan professional Admin boshqaruv paneli va PostgreSQL bazasida ishlovchi qudratli Backend tizimini o'z ichiga oladi.

---

## 🚀 Texnologiyalar To'plami (Tech Stack)

### 1. Frontend (Mijozlar Sayti & Admin Panel)
- **React 18** & **TypeScript**
- **Vite**
- **Tailwind CSS** (Maxsus `gold`, `charcoal` ranglar, shohona tipografiya)
- **Framer Motion** (Silliq va zamonaviy animatsiyalar)
- **Lucide Icons**
- **Recharts** (Admin panel uchun interaktiv grafiklar va tahlillar)
- **Axios** (JWT interceptorlar bilan)

### 2. Backend (Production-Ready REST API)
- **Node.js** & **Express.js** (TypeScript)
- **PostgreSQL 16** (Real relatsion ma'lumotlar bazasi)
- **Prisma ORM** (Migratsiya va turlar bilan to'liq jihozlangan)
- **Zod** (Barcha kiruvchi so'rovlarni qat'iy validatsiya qilish)
- **JWT** (Admin va Mijoz tokenlari)
- **bcryptjs** (Parollarni xavfsiz heshlash)
- **Helmet**, **CORS**, **Express Rate Limit**
- **Asia/Tashkent** vaqt zonasi

---

## 💈 Asosiy Xususiyatlar va Imkoniyatlar

### 🌟 Mijozlar Sayti (Customer Website)
1. **Mijozni Ro'yxatdan O'tkazish va Qayta Tanish:**
   - Telefon raqami va to'liq ism kiritiladi.
   - Bazada saqlanadi va keyingi tashriflarda mijoz avtomatik taniladi.
2. **Katta Premium Hero Section:**
   - Shiori: *"SOCH VA SOQOLDA MUTLAQ MUKAMMALLIK"*.
   - Barbershop interyeri va jarayon rasmlari mozaikasi.
   - Sterilizatsiya, qahva-bar va vaqt qadri bo'yicha imtiyozlar.
3. **Dinamik Xizmatlar & Narxlar:**
   - Barcha ma'lumotlar to'g'ridan-to'g'ri PostgreSQL bazasidan olinadi.
   - Kategoriya bo'yicha saralash (Soch, Soqol, Kompleks, VIP, SPA).
4. **Barberlar Ko'rgazmasi:**
   - Ustalarning rasmi, tajribasi, tavsifi va haftalik ish kunlari.
5. **Intellektual 7-Bosqichli Onlayn Bron Tizimi:**
   - **Formula:** 1 kishi = 45 daqiqa, 2 kishi = 90 daqiqa, 3 kishi = 135 daqiqa, 4 kishi = 180 daqiqa.
   - **Hisoblash:** Tanlangan odamlar soniga qarab davomiylik avtomatik hisoblanadi.
   - **Haqiqiy Bo'sh Vaqtlar:** Backend barberning ish jadvali, tanaffuslari (lunch break), maxsus dam olish kunlari va mavjud bronlarni tekshirib, faqat haqiqiy bo'sh slotlarni taqdim etadi.
   - **Tranzaksiya va Concurrency Himoyasi:** PostgreSQL Transaction va Advisory Locks orqali bir vaqtning o'zida bir nechta mijoz bitta vaqtni tanlasa, faqat birinchisiga ruxsat beriladi.
6. **Mijoz Kabineti:**
   - Shaxsiy ma'lumotlar, tashriflar soni.
   - Yaqinlashayotgan va o'tgan bronlar tarixi.
   - Bronni bekor qilish imkoniyati (bekor qilingan vaqt darhol boshqa mijozlarga ochiladi).
7. **Xarita va Lokatsiya:**
   - Interaktiv quyuq uslubdagi Yandex Maps xaritasi.
   - Yandex Maps orqali to'g'ridan-to'g'ri yo'l ko'rsatish ("Yo'nalish olish") tugmasi va Google Maps havolasi.

---

### 🛡️ Professional Admin Dashboard
- **Xavfsiz Kirish:** JWT va role-based himoya (`/admin/login`).
  - **Login:** `admin@barber.uz`
  - **Parol:** `admin123`
- **Dashboard:**
  - Jami mijozlar, bugungi bronlar, kutilayotgan, tasdiqlangan, bekor qilingan bronlar va umumiy tushum.
  - Oxirgi 7 kunlik mijozlar dinamikasi (AreaChart) va eng ko'p buyurtma qilingan xizmatlar reytingi.
  - Bugungi qabullarning jonli lentalari va tezkor tasdiqlash/tugallash tugmalari.
- **Bronlar Boshqaruvi:**
  - Barcha bronlar ro'yxati, mijoz ismi, telefon, barber, xizmat, sana, vaqt, davomiylik, narx va holat.
  - Sana, barber, status bo'yicha filtrlash va qidiruv.
  - Holatni o'zgartirish (Pending, Confirmed, Completed, Cancelled), tahrirlash va o'chirish.
- **Mijozlar Bazasi:**
  - Har bir mijozning birinchi tashrif sanasi, necha marta kelgani va to'liq buyurtmalar tarixi modali.
- **Barberlar Boshqaruvi:**
  - Yangi barber qo'shish, rasm, telefon, tajriba va tavsifni tahrirlash, o'chirish va faollikni boshqarish.
- **Ish Jadvali (Schedule Management):**
  - Har bir usta uchun haftalik 7 kunlik jadval (Dushanba - Yakshanba).
  - Ish boshlanish/tugash vaqtlari, tanaffus (break) vaqtlari va dam olish kunlari.
  - Maxsus dam olish kunlari (Day Off) kalendari.
  - Admin jadvalni o'zgartirishi bilan mijozlar saytida bo'sh vaqtlar darhol yangilanadi.
- **Xizmatlar Boshqaruvi:**
  - Yangi soch turmagi/xizmat qo'shish, narx, davomiylik, rasm va kategoriya tahrirlash, yashirish/faollashtirish.
- **Bronlar Kalendari (Calendar View):**
  - Kunlik va haftalik vizual taqvim, usta bo'yicha filtrlash va har bir qabul tafsilotlari.
- **Barbershop Sozlamalari:**
  - Salon nomi, logotip, manzil, telefon, ish rejimi, Yandex xarita havolasi va ijtimoiy tarmoqlar.

---

## 🔌 API Endpointlar Hujjatlari

### Autentifikatsiya
- `POST /api/auth/admin/login` — Admin email va parol orqali JWT olish
- `GET /api/auth/admin/profile` — Admin profilini tekshirish (Himoyalangan)
- `POST /api/auth/customer/identify` — Mijozni telefon raqami va ism orqali ro'yxatdan o'tkazish / tanish
- `GET /api/auth/customer/lookup?phone=...` — Telefon raqami bo'yicha mijozni tekshirish

### Bronlar (Bookings)
- `GET /api/bookings/available-times?barberId=...&date=...&peopleCount=...` — Intellektual bo'sh vaqtlarni olish
- `POST /api/bookings` — Yangi bron yaratish (Tranzaksiya va advisory lock bilan)
- `GET /api/bookings/my-bookings?phone=...` — Mijozning barcha bronlarini olish
- `POST /api/bookings/:id/cancel` — Mijoz tomonidan bronni bekor qilish
- `GET /api/bookings/admin/all` — Admin: Barcha bronlar (filter va search bilan)
- `GET /api/bookings/admin/calendar` — Admin: Kalendar voqealari
- `PATCH /api/bookings/admin/:id/status` — Admin: Bron holatini o'zgartirish
- `PUT /api/bookings/admin/:id` — Admin: Bronni tahrirlash
- `DELETE /api/bookings/admin/:id` — Admin: Bronni o'chirish

### Barberlar va Ish Jadvali
- `GET /api/barbers` — Faol barberlar ro'yxati
- `GET /api/barbers/:id` — Barber tafsilotlari va haftalik jadvali
- `GET /api/barbers/admin/all` — Admin: Barcha barberlar
- `POST /api/barbers/admin` — Admin: Yangi barber qo'shish
- `PUT /api/barbers/admin/:id` — Admin: Barberni tahrirlash
- `DELETE /api/barbers/admin/:id` — Admin: Barberni o'chirish
- `PUT /api/barbers/admin/:id/schedule` — Admin: Haftalik ish jadvalini yangilash
- `POST /api/barbers/admin/:id/day-off` — Admin: Dam olish kuni belgilash
- `DELETE /api/barbers/admin/:id/day-off/:dayOffId` — Admin: Dam olish kunini olib tashlash

### Xizmatlar (Services)
- `GET /api/services` — Faol xizmatlar ro'yxati
- `GET /api/services/admin/all` — Admin: Barcha xizmatlar
- `POST /api/services/admin` — Admin: Yangi xizmat qo'shish
- `PUT /api/services/admin/:id` — Admin: Xizmatni tahrirlash
- `DELETE /api/services/admin/:id` — Admin: Xizmatni o'chirish

### Dashboard & Statistika
- `GET /api/admin/dashboard-stats` — Barcha KPI ko'rsatkichlari, chartlar va bugungi qabullar
- `GET /api/admin/clients` — Barcha mijozlar va ularning tashriflar soni
- `GET /api/admin/clients/:id` — Mijoz tafsilotlari va bronlar tarixi

### Sozlamalar
- `GET /api/settings` — Barbershop umumiy ma'lumotlari
- `PUT /api/settings` — Admin: Sozlamalarni yangilash

---

## 🏃 Loyihani Ishga Tushirish (Quick Start)

### 1. Baza holatini tekshirish
PostgreSQL xizmati `localhost:5432` portida ishlab turibdi, `barbershop_db` bazasi to'liq migratsiya qilingan va seed qilingan.

### 2. Backendni ishga tushirish:
```bash
cd backend
npm run dev
```
Backend `http://localhost:5000` manzilida ishlaydi.

### 3. Frontendni ishga tushirish:
```bash
cd frontend
npm run dev
```
Frontend `http://localhost:5173` manzilida ishlaydi.

---

## 🔑 Sinov Uchun Ma'lumotlar:
- **Mijozlar Sayti:** `http://localhost:5173`
- **Admin Panel:** `http://localhost:5173/admin/login`
- **Admin Email:** `admin@barber.uz`
- **Admin Parol:** `admin123`
- **Mavjud Mijoz Telefon:** `+998 90 987 65 43` yoki yangi raqam kiritishingiz mumkin.
