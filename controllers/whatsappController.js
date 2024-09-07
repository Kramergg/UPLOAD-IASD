const { Client, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Cria uma instância do cliente WhatsApp
const client = new Client({
  authStrategy: new NoAuth()
});

// Gera o QR code no terminal quando necessário
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Confirma quando o cliente estiver pronto
client.on("ready", () => {
  console.log("Aplicativo rodando!");
});

// Escuta as mensagens criadas
client.on("message_create", async (msg) => {
  if (msg.body === "!everyone") {
    // Obtém o chat atual
    const chat = await msg.getChat();
    let text = "";
    let ids = [];

    // Adiciona todos os participantes ao texto e ids
    for (let participant of chat.participants) {
      ids.push(`${participant.id.user}@c.us`);
      text += ` @${participant.id.user} `;
    }

    // Envia a mensagem mencionando todos os participantes
    await chat.sendMessage(text, { mentions: ids });
  }

  // Define o caminho absoluto para a pasta 'downloads' na raiz do projeto
  const downloadsPath = path.resolve(__dirname, "..", "uploads");

  if (msg.body.startsWith("!arquivo")) {
    // Verifica se a mensagem tem mídia
    if (msg.hasMedia) {
      try {
        const media = await msg.downloadMedia();

        if (media) {
          // Extraia a extensão do arquivo com base no tipo MIME
          let extension = media.mimetype.split("/")[1];

          // Obtém o nome do arquivo fornecido pelo usuário ou gera um UUID curto
          const commandParts = msg.body.split(" ");
          const customFileName = commandParts[1] || uuidv4().split("-")[0];

          // Define o nome do arquivo com a extensão correta
          const fileName = `${customFileName}.${extension}`;
          const filePath = path.join(downloadsPath, fileName);

          // Cria o diretório 'downloads' se não existir
          if (!fs.existsSync(downloadsPath)) {
            fs.mkdirSync(downloadsPath);
          }

          // Salva o arquivo no caminho especificado
          fs.writeFileSync(filePath, media.data, "base64");
          msg.react("✅");
          await msg.reply(
            `Mídia baixada e salva como ${fileName} com sucesso! ✅`
          );
        } else {
          await msg.reply("Nenhuma mídia encontrada para download. ❌");
        }
      } catch (error) {
        console.error("Erro ao baixar a mídia:", error);
        msg.react("❌");
        await msg.reply("Erro ao baixar a mídia.");
      }
    } else {
      msg.react("⚠");
      await msg.reply("Nenhuma mídia anexada a esta mensagem. ⚠");
    }
  } else if (msg.body.startsWith("!ajuda")) {
    // Fornece instruções sobre como usar o comando !enviarmedia e !links
    await msg.reply(
      "*COMANDOS DISPONÍVEIS:*\n\n" +
        "*!arquivo [nome_opcional]*\n\n" +
        " - Baixa e salva a mídia anexada à mensagem. Se um nome for fornecido, será usado como nome do arquivo. Caso contrário, um nome será gerado.\n\n" +
        "*!links [nome_arquivo_opcional] [link1] [link2] ...*\n\n" +
        " - Os links fornecidos são enviados em um arquivo de texto. Se um nome de arquivo for fornecido, será usado. Caso contrário, um nome será gerado.\n\n"
    );
  } else if (msg.body.startsWith("!links")) {
    // Salva os links em um arquivo
    const commandParts = msg.body.split(" ");
    const customFileName = commandParts[1] || `${uuidv4().split("-")[0]}.txt`;
    const links = commandParts.slice(2);

    if (links.length > 0) {
      const fileName = customFileName.endsWith(".txt")
        ? customFileName
        : `${customFileName}.txt`;
      const filePath = path.join(downloadsPath, fileName);
      const fileContent = links.join("\n");

      try {
        fs.writeFileSync(filePath, fileContent, "utf8");
        msg.react("✅");
        await msg.reply(`Links salvos no arquivo ${fileName} com sucesso! ✅`);
      } catch (error) {
        console.error("Erro ao salvar os links:", error);
        msg.react("❌");
        await msg.reply("Erro ao salvar os links.");
      }
    } else {
      msg.react("⚠");
      await msg.reply("Nenhum link fornecido. ⚠");
    }
  }
});

client.on("authenticated", (session) => {
  console.log("Autenticação", session);
});

client.on("auth_failure", (msg) => {
  console.error("Autenticação falhou", msg);
});

client.on("disconnected", (reason) => {
  console.log("O cliente foi desconectado", reason);
});

// Inicializa o cliente WhatsApp
client.initialize();

module.exports = client;
