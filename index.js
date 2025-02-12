require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

const bot = new TelegramBot(process.env.BOT_API_KEY, { polling: true });

// 📌 Обробник команди /start (Реєстрація)
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Давай познайомимось ближче! Як тебе звати?");

  bot.once("message", (msg) => {
    const name = msg.text;
    bot.sendMessage(chatId, `Радий знайомству, ${name}!`);
    bot.sendMessage(
      chatId,
      "Напиши свій номер або поділися тим, що прив'язаний до твого Telegram:",
      {
        reply_markup: {
          keyboard: [
            [{ text: "📱 Поділитися номером", request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  });
});

// 📌 Обробка надсилання контакту
bot.on("contact", (msg) => {
  const chatId = msg.chat.id;
  const phone = msg.contact.phone_number;

  bot.sendMessage(
    chatId,
    `Дякую! Твій номер ${phone}. Щоб наш менеджер міг запропонувати найкращі умови, напиши свій нік в телеграм:`
  );

  bot.once("message", (msg) => {
    const username = msg.text;
    bot.sendMessage(
      chatId,
      `✅ Чудово, ${username}! Вже безмежно чекаємо тебе на нашому наступному потоці!`
    );

    setTimeout(() => {
      bot.sendMessage(
        chatId,
        "Поки ти чекаєш на повідомлення від нашої команди, ось корисний файл - *Як пришвидшити вивчення мови: секретні техніки лінгвістів та поліглотів*",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📥 Отримати файл", callback_data: "get_file" }],
            ],
          },
        }
      );
    }, 2000);
  });
});

// 📌 Команда /123 (Щоб відразу отримати кнопку)
bot.onText(/\/get_file/, async (msg) => {
  console.log("🔹 Команда /123 отримана");

  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "Натисни кнопку, щоб отримати файл:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📥 Отримати файл", callback_data: "get_file" }],
      ],
    },
  });

  console.log("✅ Кнопка відправлена");
});

bot.on("callback_query", async (query) => {
  console.log("🔹 Callback отримано:", query.data);

  if (query.data === "get_file") {
    const chatId = query.message.chat.id;
    const fileUrl =
      "https://drive.google.com/file/d/1nu_RYA5FU58_pRM6G2jeghz0-AgeYdyv/view?usp=drive_link";

    console.log("📩 Відправляємо посилання на файл:", fileUrl);

    await bot.sendMessage(
      chatId,
      `📄 Ось ваш файл! Ви можете його завантажити тут: [📥 Завантажити PDF](${fileUrl})`,
      { parse_mode: "Markdown" }
    );

    console.log("✅ Посилання на файл відправлено");
  }

  bot.answerCallbackQuery(query.id);
});

// 📌 Обробка помилок
bot.on("polling_error", (error) =>
  console.error("❌ Помилка Telegram API:", error.message)
);

console.log("🚀 Бот запущено!");
