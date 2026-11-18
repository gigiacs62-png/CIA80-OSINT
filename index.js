const { Telegraf } = require("telegraf");

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN non configurato");
}

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply("CIA80-OSINT online. Usa /help");
});

bot.help((ctx) => {
  ctx.reply(
    "/dns dominio - informazioni DNS pubbliche\n" +
    "/ip indirizzo - informazioni IP pubbliche\n" +
    "/domain dominio - informazioni sul dominio\n" +
    "/report - guida ai controlli passivi"
  );
});

bot.command("dns", (ctx) => {
  ctx.reply("Controllo DNS pubblico: funzione in preparazione.");
});

bot.command("ip", (ctx) => {
  ctx.reply("Controllo IP pubblico: funzione in preparazione.");
});

bot.command("domain", (ctx) => {
  ctx.reply("Controllo dominio pubblico: funzione in preparazione.");
});

bot.command("report", (ctx) => {
  ctx.reply("CIA80-OSINT: report di controlli passivi.");
});

bot.launch();
console.log("CIA80-OSINT avviato");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
