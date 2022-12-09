require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// temporary in-memory storage
let storage = {};
console.log("Initialised database storage...");

bot.onText(/\/start/, async (msg) => {
    if (msg.from in storage) {
        bot.sendMessage(msg.chat.id, `You are registered! Home location: ${storage[msg.from]}`);
    } else {
        const namePrompt = await bot.sendMessage(msg.chat.id, "What's your name?");
        bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
            const userName = nameMsg.text;
            const locationPrompt = await bot.sendMessage(msg.chat.id, `Hello ${userName}! What's your location?`);

            bot.onReplyToMessage(msg.chat.id, locationPrompt.message_id, async (locationMsg) => {
                const location =locationMsg.text;
                storage[userName] = location;
                console.log(storage);
                await bot.sendMessage(msg.chat.id, `Successfully registered ${userName} with location: ${location}!`);
            })
        })
        
    }
})