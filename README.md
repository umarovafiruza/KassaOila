# 🌿 Oila Expense Tracker — Telegram Bot & Mini App

Ushbu loyiha oilaviy xarajatlar va byudjetni boshqarish uchun yaratilgan zamonaviy **Telegram Mini App (TMA)** va **Telegram Bot** integratsiyasidir.

---

## 📁 Loyiha Tarkibi:

* [index.html](file:///c:/Users/user/Desktop/Umidjon/umidjon_ilova/index.html) — Telegram Mini App frontend qismi (HTML5, toza CSS va Vanilla JavaScript).
* [bot.js](file:///c:/Users/user/Desktop/Umidjon/umidjon_ilova/bot.js) — Telegram Bot va lokal veb-server (Node.js native).
* [.env](file:///c:/Users/user/Desktop/Umidjon/umidjon_ilova/.env) — Bot tokeni va WebApp havolasi saqlanadigan konfiguratsiya fayli.
* [package.json](file:///c:/Users/user/Desktop/Umidjon/umidjon_ilova/package.json) — Node.js loyiha sozlamalari.

---

## 🚀 Qadamma-qadam Ishga Tushirish Qo‘llanmasi:

### 1-qadam: Telegramda Bot va Token Olish
1. Telegramda **[@BotFather](https://t.me/BotFather)** botiga kiring.
2. Yangi bot ochish uchun `/newbot` buyrug‘ini yuboring.
3. Botga nom (masalan: `Oila Expense Tracker`) va username (masalan: `oila_hisob_bot`) bering.
4. BotFather sizga **HTTP API Token** beradi (masalan: `7829103948:AAFlw9J...`).
5. Mazkur tokenni loyihadagi [.env](file:///c:/Users/user/Desktop/Umidjon/umidjon_ilova/.env) faylidagi `BOT_TOKEN=` qatoriga yozing:
   ```env
   BOT_TOKEN=7829103948:AAFlw9J...
   ```

---

### 2-qadam: Mini Appni Internetga Joylashtirish (HTTPS)
Telegram Mini App ochilishi uchun saytingiz internetda **HTTPS** bilan ishlashi kerak. Buning eng oson va bepul yo‘llari:

* **Variant A (Vercel — eng qulayi, 1 daqiqa):**
  1. [vercel.com](https://vercel.com) saytiga kiring.
  2. Ushbu papkadagi `index.html` faylini loyiha sifatida yuklang (yoki GitHub orqali).
  3. Sizga bepul havola beradi (masalan: `https://oila-expense.vercel.app`).
  4. Ushbu havolani `.env` faylidagi `WEBAPP_URL=` qatoriga yozing.

* **Variant B (Lokal test qilish uchun — ngrok yoki localtunnel):**
  Terminalda quyidagilardan birini ishga tushiring:
  ```bash
  npx localtunnel --port 3000
  ```
  Berilgan `https://...loca.lt` havolasini `.env` dagi `WEBAPP_URL=` ga yozing.

---

### 3-qadam: BotFather orqali Mini App (Menu Button) Biriktirish
Foydalanuvchilar botga kirganda chap pastki burchakda doimiy **"📱 Ilovani ochish"** tugmasi paydo bo‘lishi uchun:

1. `@BotFather` ga kiring va `/mybots` buyrug‘ini bering.
2. O‘z botingizni tanlang -> **Bot Settings** -> **Menu Button** -> **Configure menu button**.
3. Mini App havolangizni (HTTPS) va tugma nomini (`📱 Ilovani ochish`) yuboring.

---

### 4-qadam: Botni Ishga Tushirish
Loyiha papkasida terminalni oching va buyruqni bering:
```bash
npm start
```
yoki:
```bash
node bot.js
```

Bot muvaffaqiyatli ishga tushgach:
```
🌐 WebApp Server ishga tushdi: http://localhost:3000
🤖 Telegram Bot ulandi: @oila_hisob_bot (Oila Expense Tracker)
🚀 Telegram Bot xabarlarni tinglamoqda...
```

Endi Telegramda o‘z botingizga kirib `/start` ni bossangiz, chiroyli salomlashish xabari va Mini App ochish tugmasi chiqadi!
