require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// temporary in-memory storage
let storage = {};
console.log("Initialised database storage...");

// register
bot.onText(/\/start/, async (msg) => {
    bot.sendMessage(msg.chat.id, "Hello and welcome to Decky! This simple bot helps you remember which deck you have parked your car at.\n\n <b>Commands</b>\n/register: Register here first\n/park: Once registered, park your car here", {parse_mode: "HTML"});
})

bot.onText(/\/register/, async (msg) => {
    if (msg.from.id in storage) {
        bot.sendMessage(msg.chat.id, `You are registered! Carpark deck location: ${storage[msg.from.id]}`);
    } else {
        console.log(msg.from);
        const locationPrompt = await bot.sendMessage(msg.chat.id, `Hello ${msg.from.username}! I haven't met you before. What's your carpark deck location?`, {
            "reply_markup": {
                "force_reply": true
            }
        });
        bot.onReplyToMessage(msg.chat.id, locationPrompt.message_id, async (msg) => {
            const location = msg.text;
            const deckPrompt = await bot.sendMessage(msg.chat.id, `Got it! Enter the decks/levels of your carpark separated by a space. Example: 1A 1B 2A 2B`, {
                "reply_markup": {
                    "force_reply": true
                }
            })
            bot.onReplyToMessage(msg.chat.id, deckPrompt.message_id, async (msg) => {
                const decks = msg.text.split(" ");
                console.log(decks);
                storage[msg.from.id] = {
                    "location": location,
                    decks: decks
                };
                console.log(storage);
                bot.sendMessage(msg.chat.id, "You are now registered!");
            })
        })
    }
})