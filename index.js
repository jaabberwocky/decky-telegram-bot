require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// temporary in-memory storage
let storage = {};
console.log("Initialised database storage...");

bot.onText(/\/start/, async (msg) => {
    if (msg.from.id in storage) {
        bot.sendMessage(msg.chat.id, `You are registered! Carpark deck location: ${storage[msg.from.id]}`);
    } else {
        console.log(msg.from);
        const locationPrompt = await bot.sendMessage(msg.chat.id, `Hello ${msg.from.username}! I haven't met you before. What's your carpark deck location?`, {
            "reply_markup": {
                "force_reply": true
            }
        });
        bot.onReplyToMessage(msg.chat.id, locationPrompt.message_id, (msg) => {
            storage[msg.from.id] = msg.text;
            console.log(`Stored value ${msg.from.id}[${msg.text}]`);
            bot.sendMessage(msg.chat.id, `I've registered you with location ${msg.text}!`);
        })    
    }
})