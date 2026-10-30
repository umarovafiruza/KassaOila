/**
 * Vercel Serverless Function — Telegram Webhook & Menu Button Auto Setup
 * Bir marta brauzerda https://<loyiha>.vercel.app/api/setup manzilini ochish orqali
 * bot va WebApp 100% Vercel bulutiga ulanadi va kompyuterga bog'liqlik uziladi!
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

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;
  const webhookUrl = `${baseUrl}/api/webhook`;
  const appUrl = `${baseUrl}/`;

  // 1. Webhook o'rnatish
  const webhookRes = await callTelegram('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query']
  });

  // 2. Menu Button (Ilovani ochish) tugmasini Vercel manziliga o'rnatish
  const menuRes = await callTelegram('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '📱 Ilovani ochish',
      web_app: { url: appUrl }
    }
  });

  // 3. Buyruqlarni sozlash
  const cmdRes = await callTelegram('setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish va Mini Appni ochish' },
      { command: 'hisob', description: 'Kirim-chiqim balansi va hisobot' },
      { command: 'help', description: 'Qo\'llanma va yordam' }
    ]
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vercel Telegram Bot Ulanishi</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 520px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; text-align: center; }
        h1 { color: #22c55e; font-size: 1.5rem; margin-top: 0; }
        .status-box { background: #0f172a; border-radius: 10px; padding: 14px; text-align: left; font-size: 0.88rem; margin: 20px 0; border: 1px solid #334155; }
        .status-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .status-row:last-child { margin-bottom: 0; }
        .tag-ok { color: #22c55e; font-weight: 700; }
        .btn { display: inline-block; background: #22c55e; color: #022c22; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="font-size: 3rem; margin-bottom: 10px;">🚀</div>
        <h1>Vercel Bulutiga Ulandi!</h1>
        <p style="color: #94a3b8; font-size: 0.95rem;">Telegram Bot va Mini App endi to‘liq Vercel serverlarida 24/7 ishlaydi. Kompyuteringizni o‘chirib qo‘ysangiz ham bo‘ladi!</p>
        
        <div class="status-box">
          <div class="status-row">
            <span style="color: #94a3b8;">Webhook:</span>
            <span class="tag-ok">${webhookRes.ok ? '✓ Faol (' + webhookUrl + ')' : '✕ Xato'}</span>
          </div>
          <div class="status-row">
            <span style="color: #94a3b8;">Mini App manzili:</span>
            <span class="tag-ok">${menuRes.ok ? '✓ Sozlandi' : '✕ Xato'}</span>
          </div>
          <div class="status-row">
            <span style="color: #94a3b8;">Bot buyruqlari:</span>
            <span class="tag-ok">${cmdRes.ok ? '✓ Tayyor' : '✕ Xato'}</span>
          </div>
        </div>

        <a href="https://t.me/KassaOilaBot" class="btn" target="_blank">Telegram Botni ochish (@KassaOilaBot)</a>
      </div>
    </body>
    </html>
  `);
};
