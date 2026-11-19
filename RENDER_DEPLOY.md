# 🚀 BARBERSHOP PLATFORMASINI RENDERGA JOYLASH (DEPLOYMENT GUIDE)

Ushbu qo'llanma orqali siz **THE NOBLE BLADE** Barbershop tizimini (Backend, Frontend va Neon PostgreSQL ma'lumotlar bazasini) [Render.com](https://render.com) platformasiga 100% muvaffaqiyatli va bepul joylashtirishingiz mumkin.

---

## 1-QADAM: Loyihani GitHub'ga Yuklash

Agar loyihangiz hali GitHub'ga yuklanmagan bo'lsa:

1. [GitHub.com](https://github.com) ga kiring va yangi repository oching (masalan, `barbershop-platform`).
2. Terminalda (loyiha papkasida) quyidagi buyruqlarni bajaring:

```bash
# Agar remote qo'shilmagan bo'lsa (o'z havolangizni qo'ying):
git remote add origin https://github.com/USERNAME/barbershop-platform.git
git branch -M main
git push -u origin main
```

*(Barcha ortiqcha fayllar, `node_modules`, `dist` va maxfiy `.env` fayllar `.gitignore` ga kiritilgan va toza holatda yuklanadi).*

---

## 2-QADAM: Render.com orqali Joylashtirish (2 xil usul)

Sizda 2 xil qulay usul bor:
* **A usul (Eng tez va osoni):** `render.yaml` Blueprint orqali bir tugma bilan Backend va Frontendni birga yaratish.
* **B usul (Standart):** Backend va Frontendni alohida Web Service va Static Site sifatida yaratish.

---

### A USUL: Render Blueprint orqali (Tavsiya etiladi ⚡)

Loyiha ildizida tayyorlangan [render.yaml](file:///c:/Users/user/Desktop/Barbershop/render.yaml) fayli mavjud.

1. [Render Dashboard](https://dashboard.render.com/) ga kiring.
2. Yuqori o'ng burchakdagi **"New +"** tugmasini bosing va **"Blueprint"** ni tanlang.
3. GitHub repository'ingizni (`barbershop-platform`) tanlang.
4. Render avtomatik ravishda `render.yaml` ni o'qiydi va 2 ta servisni ko'rsatadi:
   * **barbershop-backend** (Node Web Service)
   * **barbershop-frontend** (Static Site)
5. **Environment Variables** so'ralganda:
   * `DATABASE_URL` maydoniga Neon PostgreSQL havolangizni kiriting:
     ```
     postgresql://neondb_owner:npg_NJH8ACiBrX2z@ep-cold-band-bdg0k49x-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   * `JWT_SECRET` avtomatik xavfsiz generatsiya qilinadi.
6. **"Apply"** tugmasini bosing. Render avtomatik ravishda bazani sozlaydi, jadvallarni yaratadi, boshlang'ich admin va xizmatlarni `seed` qiladi va tizimni ishga tushiradi!

---

### B USUL: Qo'lda (Manual) Joylashtirish

Agar har bir servisni alohida sozlashni xohlasangiz:

#### 1. Backendni Joylashtirish (Web Service):
1. Render Dashboard'da **"New +"** -> **"Web Service"** ni tanlang.
2. GitHub repository'ingizni ulang.
3. Quyidagi parametrlarni kiriting:
   * **Name:** `barbershop-backend`
   * **Region:** Frankfurt (yoki o'zingizga yaqin region)
   * **Branch:** `main`
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install && npm run render:build`
   * **Start Command:** `npm start`
   * **Plan:** Free
4. **Environment Variables** (Pastki qismdagi bo'lim):
   * `NODE_ENV` = `production`
   * `TZ` = `Asia/Tashkent`
   * `DATABASE_URL` = `postgresql://neondb_owner:npg_NJH8ACiBrX2z@ep-cold-band-bdg0k49x-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require`
   * `JWT_SECRET` = `barbershop_super_secret_jwt_key_2026_luxury_blades`
   * `JWT_EXPIRES_IN` = `7d`
5. **"Create Web Service"** tugmasini bosing.
6. 1-2 daqiqada servis ishga tushadi va sizga backend havolasi beriladi (masalan: `https://barbershop-backend.onrender.com`).
   * `/health` manzilini ochib tekshiring: `https://barbershop-backend.onrender.com/health` -> `{"status":"healthy"}` ko'rinadi.

---

#### 2. Frontendni Joylashtirish (Static Site):
1. Render Dashboard'da **"New +"** -> **"Static Site"** ni tanlang.
2. Xuddi shu GitHub repository'ingizni tanlang.
3. Quyidagi parametrlarni kiriting:
   * **Name:** `barbershop-frontend`
   * **Branch:** `main`
   * **Root Directory:** `frontend`
   * **Build Command:** `npm install && npm run build`
   * **Publish Directory:** `dist`
4. **Environment Variables:**
   * `VITE_API_BASE_URL` = `https://barbershop-backend.onrender.com/api` *(1-bosqichda chiqqan backend havolangiz + `/api`)*
5. **Redirects/Rewrites (Muhim!):**
   * Render Static Site sahifasida **"Redirects/Rewrites"** bo'limiga kiring:
     * **Type:** `Rewrite`
     * **Source:** `/*`
     * **Destination:** `/index.html`
   *(Eslatma: Biz loyihaning `frontend/public/_redirects` fayliga bu qoidani avtomatik kiritib qo'yganmiz, shuning uchun Render buni avtomatik taniydi).*
6. **"Create Static Site"** tugmasini bosing.

---

## 3-QADAM: Ishga Tushgach Tekshirish

Joylashtirish tugagach, Render sizga taqdim etgan frontend havolasini (masalan: `https://barbershop-frontend.onrender.com`) oching:

1. 🌟 **Bosh sahifa:** Barbershop interyeri, rasmlar, xizmatlar va usta barberlar Neon bazasidan dinamik yuklanadi.
2. ✂️ **Xizmatlar & Barberlar:** Barcha narxlar va fotosuratlar to'liq ko'rinadi.
3. 📅 **Bron Qilish:** 1 kishi = 45 daqiqa, 2 kishi = 90 daqiqa qoidasi bilan real bo'sh vaqtlarga buyurtma berib ko'ring.
4. 🛡️ **Admin Panel:**
   * Havola: `https://barbershop-frontend.onrender.com/admin/login`
   * **Login:** `admin@barber.uz`
   * **Parol:** `admin123`
   * Dashboard, bronlar, kalendar va sozlamalarni bemalol boshqarishingiz mumkin!
