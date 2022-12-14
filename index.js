require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// temporary in-memory storage
let storage = {};
let parked = {};
console.log("Initialised database storage...");

bot.onText(/\/start/, async (msg) => {
    bot.sendMessage(msg.chat.id, "Hello and welcome to Decky! This simple bot helps you remember which deck you have parked your car at.\n\n <b>Commands</b>\n/register: Register here first\n/park: Once registered, park your car here\n/where: Find out where your car is parked", { parse_mode: "HTML" });
})

bot.onText(/\/help/, async (msg) => {
    bot.sendMessage(msg.chat.id, "<b>Commands</b>\n/register: Register here first\n/park: Once registered, park your car here\n/where: Find out where your car is parked", { parse_mode: "HTML" });
})

bot.onText(/\/register/, async (msg) => {
    if (msg.from.id in storage) {
        bot.sendMessage(msg.chat.id, `You are registered! Carpark deck location: ${storage[msg.from.id]["location"]}`);
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

                // convert decks to array of arrays for usage as keyboard input
                for (let i = 0; i < decks.length; i++) {
                    decks[i] = [`/at` + " Deck " + decks[i]];
                }
                storage[msg.from.id] = {
                    "location": location,
                    "decks": decks
                };
                console.log(storage);
                bot.sendMessage(msg.chat.id, "You are now registered!\nUse /help to see available commands");
            })
        })
    }
})

// handles the parking function
bot.onText(/\/at/, async (msg) => {
    console.log("Parking...")
    const deckParked = msg.text.split(" ")[1] + " " + msg.text.split(" ")[2] 
    parked[msg.from.id] = {
        deck: deckParked,
        timestamp: Date.now()
    }
    console.log(parked);
    bot.sendMessage(msg.chat.id, `Parked at ${deckParked}!`);
    bot.sendMessage(msg.chat.id, "Use /help to see available commands");
})

bot.onText(/\/park/, async (msg) => {
    if (!storage.hasOwnProperty(msg.from.id)) {
        bot.sendMessage(msg.chat.id, "You are not registered, please register first using /register");
    } else {
        bot.sendMessage(msg.chat.id, `Alright, you are parking at ${storage[msg.from.id]["location"]}! Which deck are you at?`, {
            "reply_markup": {
                "keyboard": storage[msg.from.id]['decks'],
                "force_reply": true
            }
        })
    }
})



bot.onText(/\/where/, async (msg) => {
    if (!parked.hasOwnProperty(msg.from.id)) {
        bot.sendMessage(msg.chat.id, "You are not registered, please register first using /register");
    } else {
        const localeDateString = new Date(parked[msg.from.id]['timestamp']).toLocaleString('en-SG', {
            timeZone: 'Asia/Singapore',
            hour12: false
          });
        bot.sendMessage(msg.chat.id, `Your car is parked at ${parked[msg.from.id]['deck']} at ${localeDateString}\nUse /help to see available commands`)
    }
}
)