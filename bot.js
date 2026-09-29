/**
 * ==============================================================================
 * OILA EXPENSE TRACKER — TELEGRAM BOT & WEBAPP SERVER (@KassaOilaBot)
 * ==============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 1. .env faylini xavfsiz o'qish
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    });
  }
}

loadEnv();

const BOT_TOKEN = process.env.BOT_TOKEN || '8884710929:AAEXm3OdlnKGbC-S2OHbEj7zhZlRBwzkxes';
const ADMIN_ID = process.env.ADMIN_ID || '7949632456';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://umarovafiruza.github.io/KassaOila/';
const PORT = parseInt(process.env.PORT, 10) || 3000;

// 2. Lokal WebApp Server (index.html faylini tarqatish)
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  if (urlPath === '/' || urlPath === '/index.html') {
    const indexPath = path.join(__dirname, 'index.html');
    fs.readFile(indexPath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("index.html faylini o'qishda xatolik yuz berdi.");
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else if (urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bot: '@KassaOilaBot', time: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Sahifa topilmadi');
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌐 WebApp Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`======================================================`);
});

// 3. Telegram API chaqiruvlari
async function callTelegram(method, params = {}) {
  if (!BOT_TOKEN) return { ok: false, description: "Token topilmadi" };

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Bot buyruqlari ro'yxatini sozlash
async function setupBotCommands() {
  await callTelegram('setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish va Mini Appni ochish' },
      { command: 'hisob', description: 'Xarajatlar monitoringi va hisobot' },
      { command: 'help', description: 'Qo\'llanma va yordam' }
    ]
  });
}

// Doimiy Menu Button (Ilovani ochish) sozlash
async function setupMenuButton() {
  if (!WEBAPP_URL || !WEBAPP_URL.startsWith('https://')) return;

  const res = await callTelegram('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '📱 Ilovani ochish',
      web_app: { url: WEBAPP_URL }
    }
  });

  if (res.ok) {
    console.log(`✅ Telegram Menu Button sozlandi: ${WEBAPP_URL}`);
  }
}

// Botni tekshirish
async function checkBot() {
  const res = await callTelegram('getMe');
  if (res.ok && res.result) {
    console.log(`🤖 Telegram Bot faol: @${res.result.username} (${res.result.first_name})`);
    await setupBotCommands();
    await setupMenuButton();
    return res.result;
  } else {
    console.error(`❌ Bot tokenida xatolik:`, res.description || res.error);
    return null;
  }
}

// 4. Telegram yangilanishlarini qabul qilish (Long Polling)
let lastUpdateId = 0;
let isPolling = false;

async function pollUpdates() {
  if (!BOT_TOKEN || isPolling) return;
  isPolling = true;

  try {
    const res = await callTelegram('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 25,
      allowed_updates: ['message', 'callback_query']
    });

    if (res.ok && Array.isArray(res.result)) {
      for (const update of res.result) {
        lastUpdateId = update.update_id;

        // Xabarlar (matn, buyruq)
        if (update.message) {
          await handleMessage(update.message);
        }

        // Inline tugmalar bosilganda (Callback Query)
        if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        }
      }
    }
  } catch (e) {
    // Tarmoq xatoliklarida xotirjam davom etish
  } finally {
    isPolling = false;
    setTimeout(pollUpdates, 400);
  }
}

// INLINE TUGMALAR (CALLBACK QUERY) ISHLOVCHISI
async function handleCallbackQuery(query) {
  const queryId = query.id;
  const chatId = query.message.chat.id;
  const data = query.data;
  const appUrl = (WEBAPP_URL && WEBAPP_URL.startsWith('https://')) ? WEBAPP_URL : null;

  // 1. Telegramga callback javobini berish (tugmadagi aylanayotgan yuklanish to'xtashi uchun)
  await callTelegram('answerCallbackQuery', {
    callback_query_id: queryId
  });

  // 2. Tugma turiga qarab javob qaytarish
  if (data === 'hisob') {
    const hisobMsg = `📊 <b>Xarajatlar monitoringi va Hisobot</b>\n\n` +
      `Bugungi, haftalik va oylik barcha hisob-kitoblarni real vaqt rejimida ko‘rish, sarflangan summalarni tahlil qilish uchun quyidagi tugmani bosing 👇`;

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: hisobMsg,
      parse_mode: 'HTML',
      reply_markup: appUrl ? {
        inline_keyboard: [
          [{ text: '📱 Hisobotni Mini Appda ochish', web_app: { url: appUrl } }]
        ]
      } : undefined
    });

  } else if (data === 'help') {
    const helpMsg = `📖 <b>Bot va Mini Appdan foydalanish qo‘llanmasi:</b>\n\n` +
      `1️⃣ <b>"Ilovani ochish"</b> tugmasi orqali to‘liq Mini App dasturi ochiladi.\n` +
      `2️⃣ Yangi xarajat kiritish uchun ekran markazidagi sariq <b>"+"</b> tugmasini bosing.\n` +
      `3️⃣ Kategoriya (Oziq-ovqat, Kommunal, Transport va h.k.), summa va sanani kiritib <b>"Saqlash"</b> tugmasini bosing.\n` +
      `4️⃣ <b>Statistika</b> sahifasida xarajatlar diagrammasi va foizlar avtomatik hisoblab boriladi.\n` +
      `5️⃣ Barcha hisoblar Telegram xotirasida doimiy va xavfsiz saqlanadi.`;

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: helpMsg,
      parse_mode: 'HTML',
      reply_markup: appUrl ? {
        inline_keyboard: [
          [{ text: '📱 Mini Appni ochish', web_app: { url: appUrl } }]
        ]
      } : undefined
    });
  }
}

// XABARLAR VA BUYRUQLAR ISHLOVCHISI
async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const rawText = (msg.text || '').trim();
  const text = rawText.toLowerCase();
  const userName = msg.from ? msg.from.first_name : 'Foydalanuvchi';
  const appUrl = (WEBAPP_URL && WEBAPP_URL.startsWith('https://')) ? WEBAPP_URL : null;

  // Mini App dan kelgan xarajat ma'lumoti
  if (msg.web_app_data && msg.web_app_data.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `✅ <b>Yangi xarajat qayd etildi!</b>\n\n📌 <b>Nomi:</b> ${data.title}\n💰 <b>Summasi:</b> ${data.amount} so'm\n🏷️ <b>Kategoriya:</b> ${data.category || 'Boshqa'}`,
        parse_mode: 'HTML'
      });
      return;
    } catch (e) {}
  }

  // /start buyrug'i
  if (text.startsWith('/start')) {
    const inlineKeyboard = [];
    if (appUrl) {
      inlineKeyboard.push([
        {
          text: '📱 Oila Expense Tracker-ni ochish',
          web_app: { url: appUrl }
        }
      ]);
    }

    inlineKeyboard.push([
      { text: '📊 Hisobot', callback_data: 'hisob' },
      { text: 'ℹ️ Yordam', callback_data: 'help' }
    ]);

    const welcomeMsg = `Assalomu alaykum, <b>${userName}</b>! 👋\n\n` +
      `🌿 <b>"Oila Expense Tracker"</b> botiga xush kelibsiz!\n\n` +
      `Bu bot orqali oilaviy byudjetni boshqarishingiz, xarajatlarni toifalar bo‘yicha kiritishingiz va tahlil qilishingiz mumkin.\n\n` +
      `Ilovani ishga tushirish uchun pastdagi tugmani bosing 👇`;

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: welcomeMsg,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });

  // /hisob, hisobot, hisob-kitob buyruqlari
  } else if (text === '/hisob' || text === '/balans' || text.includes('hisob')) {
    const hisobMsg = `📊 <b>Xarajatlar monitoringi va Hisobot:</b>\n\n` +
      `Barcha xarajatlaringiz ro‘yxatini ko‘rish, yangi sarf qo‘shish va tahlil qilish uchun ilovani oching 👇`;

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: hisobMsg,
      parse_mode: 'HTML',
      reply_markup: appUrl ? {
        inline_keyboard: [
          [{ text: '📱 Hisobotni Mini Appda ochish', web_app: { url: appUrl } }]
        ]
      } : undefined
    });

  // /help, yordam buyruqlari
  } else if (text === '/help' || text.includes('yordam')) {
    const helpMsg = `📖 <b>Qo‘llanma va Yordam:</b>\n\n` +
      `1️⃣ <b>"Ilovani ochish"</b> tugmasi orqali to‘liq Mini App ochiladi.\n` +
      `2️⃣ Yangi xarajat qo‘shish uchun <b>"+"</b> tugmasini bosing.\n` +
      `3️⃣ Kategoriya, summa va sanani kiritib <b>"Saqlash"</b> tugmasini bosing.\n` +
      `4️⃣ Barcha hisoblar qurilmangizda va Telegram xotirasida xavfsiz saqlanadi.`;

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: helpMsg,
      parse_mode: 'HTML',
      reply_markup: appUrl ? {
        inline_keyboard: [
          [{ text: '📱 Ilovani ochish', web_app: { url: appUrl } }]
        ]
      } : undefined
    });

  // Boshqa har qanday xabarga yo'naltiruvchi javob
  } else {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `Salom, <b>${userName}</b>! Xarajatlarni boshqarish uchun quyidagi tugmani bosing 👇`,
      parse_mode: 'HTML',
      reply_markup: appUrl ? {
        inline_keyboard: [
          [{ text: '📱 Ilovani ochish', web_app: { url: appUrl } }]
        ]
      } : undefined
    });
  }
}

// Ishga tushirish
(async () => {
  const botInfo = await checkBot();
  if (botInfo) {
    console.log(`🚀 Telegram Bot xabarlar va callback tugmalarni qabul qilishga tayyor!`);
    pollUpdates();
  }
})();
