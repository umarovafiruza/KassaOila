/**
 * Vercel Serverless Function — Telegram Bot Webhook
 * Ushbu fayl Telegram botni 24/7 kompyutersiz, to'liq Vercel bulutida ishlashini ta'minlaydi.
 */

const BOT_TOKEN = process.env.BOT_TOKEN || '8884710929:AAEXm3OdlnKGbC-S2OHbEj7zhZlRBwzkxes';

async function callTelegram(method, params = {}) {
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

function getAppUrl(req) {
  if (process.env.WEBAPP_URL && process.env.WEBAPP_URL.startsWith('https://')) {
    return process.env.WEBAPP_URL;
  }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (host) {
    return `${proto}://${host}/`;
  }
  return 'https://umarovafiruza.github.io/KassaOila/';
}

async function handleCallbackQuery(query, appUrl) {
  const queryId = query.id;
  const chatId = query.message?.chat?.id;
  const data = query.data;

  await callTelegram('answerCallbackQuery', {
    callback_query_id: queryId
  });

  if (!chatId) return;

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
      `2️⃣ Asosiy ekranda <b>"+ Kirim"</b> yoki <b>"- Chiqim"</b> tugmasi orqali tezkor amallarni kiriting.\n` +
      `3️⃣ Kategoriya, summa va sanani kiritib <b>"Saqlash"</b> tugmasini bosing.\n` +
      `4️⃣ <b>Statistika</b> sahifasida sof jamg'arma va kirim-chiqim taqqoslanadi.\n` +
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

async function handleMessage(msg, appUrl) {
  const chatId = msg.chat.id;
  const rawText = (msg.text || '').trim();
  const text = rawText.toLowerCase();
  const userName = msg.from ? msg.from.first_name : 'Foydalanuvchi';

  // Mini App dan yuborilgan ma'lumot
  if (msg.web_app_data && msg.web_app_data.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);
      const isIncome = data.type === 'income';
      const header = isIncome ? `💰 <b>Yangi kirim qayd etildi!</b>` : `💸 <b>Yangi chiqim qayd etildi!</b>`;
      const sign = isIncome ? '+' : '-';
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `${header}\n\n📌 <b>Nomi:</b> ${data.title || data.category || 'Amal'}\n💵 <b>Summasi:</b> ${sign}${data.amount} so'm\n🏷️ <b>Toifa:</b> ${data.category || 'Boshqa'}\n📅 <b>Sana:</b> ${data.date || 'Bugun'}`,
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
          text: '📱 Kassa Oila (Kirim-Chiqim) ochish',
          web_app: { url: appUrl }
        }
      ]);
    }

    inlineKeyboard.push([
      { text: '📊 Balans & Hisobot', callback_data: 'hisob' },
      { text: 'ℹ️ Yordam', callback_data: 'help' }
    ]);

    const welcomeMsg = `Assalomu alaykum, <b>${userName}</b>! 👋\n\n` +
      `🌿 <b>"Kassa Oila — Kirim va Chiqim"</b> tizimiga xush kelibsiz!\n\n` +
      `Bu bot orqali barcha daromad va xarajatlaringizni, oilaviy oylik budjetingizni real vaqtda tahlil qilib boshqarishingiz mumkin.\n\n` +
      `Ilovani ishga tushirish uchun pastdagi tugmani bosing 👇`;

    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: welcomeMsg,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });
  } else if (text === '/hisob' || text === '/balans' || text.includes('hisob') || text.includes('balans')) {
    const hisobMsg = `📊 <b>Kirim-chiqim monitoringi va Balans:</b>\n\n` +
      `Sof jamg‘arma, oylik tushum va xarajatlarni toifalar bo‘yicha ko‘rish hamda tahlil qilish uchun ilovani oching 👇`;

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
  } else if (text === '/help' || text.includes('yordam')) {
    const helpMsg = `📖 <b>Qo‘llanma va Yordam:</b>\n\n` +
      `1️⃣ <b>"Ilovani ochish"</b> tugmasi orqali to‘liq Mini App ochiladi.\n` +
      `2️⃣ Asosiy ekranda <b>"+ Kirim"</b> yoki <b>"- Chiqim"</b> tugmasi orqali tezkor amallarni kiriting.\n` +
      `3️⃣ Kategoriya, summa va izohni kiritib <b>"Saqlash"</b> tugmasini bosing.\n` +
      `4️⃣ <b>Statistika</b> bo‘limida sof qoldiq, kirim-chiqim taqqoslashi va toifalar foizini kuzating.\n` +
      `5️⃣ Barcha ma'lumotlar qurilmangizda va Telegram bulutida xavfsiz saqlanadi.`;

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
  } else {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `Salom, <b>${userName}</b>! Xarajat va daromadlarni boshqarish uchun quyidagi tugmani bosing 👇`,
      parse_mode: 'HTML',
      reply_markup: appUrl ? {
        inline_keyboard: [
          [{ text: '📱 Ilovani ochish', web_app: { url: appUrl } }]
        ]
      } : undefined
    });
  }
}

module.exports = async (req, res) => {
  // CORS va HTTP metod tekshiruvi
  if (req.method === 'GET') {
    return res.status(200).send("Telegram Bot Webhook faol va ishlayapti!");
  }

  if (req.method !== 'POST') {
    return res.status(200).send("Faqat POST so'rovlari qabul qilinadi.");
  }

  const appUrl = getAppUrl(req);
  const update = req.body;

  if (update) {
    try {
      if (update.message) {
        await handleMessage(update.message, appUrl);
      } else if (update.callback_query) {
        await handleCallbackQuery(update.callback_query, appUrl);
      }
    } catch (err) {
      console.error("Webhook xatolik:", err);
    }
  }

  return res.status(200).json({ ok: true });
};
