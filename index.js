
const { Telegraf } = require("telegraf");
const dns = require("node:dns").promises;
const net = require("node:net");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("CIA80-OSINT online. Usa /help");
});

bot.help((ctx) => {
  ctx.reply(
    "/dns dominio - record DNS pubblici\n" +
    "/ip indirizzo - verifica indirizzo IP\n" +
    "/domain dominio - riepilogo DNS\n" +
    "/report - informazioni sul servizio"
  );
});

function validDomain(value) {
  return value.length <= 253 &&
    /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/.test(value);
}

bot.command("dns", async (ctx) => {
  const domain = ctx.message.text.split(/\s+/)[1]?.toLowerCase();

  if (!domain || !validDomain(domain)) {
    return ctx.reply("Uso: /dns esempio.com");
  }

  try {
    const [a, mx, ns] = await Promise.allSettled([
      dns.resolve4(domain),
      dns.resolveMx(domain),
      dns.resolveNs(domain)
    ]);

    const result = [
      `DNS pubblico: ${domain}`,
      `A: ${a.status === "fulfilled" ? a.value.join(", ") : "Non disponibile"}`,
      `MX: ${mx.status === "fulfilled" ? mx.value.map(x => x.exchange).join(", ") : "Non disponibile"}`,
      `NS: ${ns.status === "fulfilled" ? ns.value.join(", ") : "Non disponibile"}`
    ];

    ctx.reply(result.join("\n"));
  } catch {
    ctx.reply("Impossibile completare la consultazione DNS.");
  }
});

bot.command("ip", async (ctx) => {
  const address = ctx.message.text.split(/\s+/)[1];

  if (!address || !net.isIP(address)) {
    return ctx.reply("Uso: /ip 8.8.8.8");
  }

  try {
    const result = await dns.reverse(address);
    ctx.reply(
      `IP: ${address}\nReverse DNS: ${result.join(", ") || "Nessun risultato"}`
    );
  } catch {
    ctx.reply(`IP: ${address}\nNessun record PTR disponibile.`);
  }
});

bot.command("domain", async (ctx) => {
  const domain = ctx.message.text.split(/\s+/)[1]?.toLowerCase();

  if (!domain || !validDomain(domain)) {
    return ctx.reply("Uso: /domain esempio.com");
  }

  try {
    const result = await dns.lookup(domain, { all: true });
    ctx.reply(
      `Dominio: ${domain}\nIndirizzi pubblicamente risolti:\n` +
      result.map(x => `${x.address} (IPv${x.family})`).join("\n")
    );
  } catch {
    ctx.reply("Dominio non risolto o consultazione non disponibile.");
  }
});

bot.command("report", (ctx) => {
  ctx.reply(
    "CIA80-OSINT\n" +
    "Stato: operativo\n" +
    "Modalità: consultazione passiva\n" +
    "Fonti: record DNS pubblici\n" +
    "Nessun accesso ad account privati."
  );
});

bot.launch();
console.log("CIA80-OSINT avviato");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
