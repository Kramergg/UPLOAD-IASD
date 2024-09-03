const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const qrcode = require("qrcode");
const PDFDocument = require("pdfkit");

const app = express();
const port = 3000;

// Middleware para parsear dados de formulários
app.use(express.urlencoded({ extended: true }));

// Configura o armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Configura o multer para utilizar o armazenamento definido
const upload = multer({ storage: storage });

// Servir arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Função para obter o IP local da máquina
function getLocalIP() {
  const interfaces = os.networkInterfaces();

  // Especificar o nome da interface de rede Wi-Fi (substitua 'Wi-Fi' pelo nome da sua interface)
  const wifiInterface = interfaces["Wi-Fi"] || interfaces["wlan0"];

  if (wifiInterface) {
    for (let alias of wifiInterface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }

  // Fallback para verificar outras interfaces
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }

  return "localhost";
}

// Função para criar um PDF com o QR Code

async function createQRCodePDF(url) {
  const pdfDir = path.join(__dirname, "qrcode");
  const pdfPath = path.join(pdfDir, "qrcode.pdf");

  // Verifica se a pasta 'pdfs' existe, se não, cria a pasta
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
  }

  // Verifica se o arquivo PDF já existe, se não, cria um novo
  if (!fs.existsSync(pdfPath)) {
    try {
      const qrImage = await qrcode.toDataURL(url);

      // Cria um novo documento PDF
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(pdfPath));

      // Adiciona o título ao PDF
      doc
        .fontSize(25)
        .text("ENVIE SEU ARQUIVO POR AQUI:", { align: "center", margin: 20 });

      // Adiciona o QR Code ao PDF
      doc.image(qrImage, {
        fit: [250, 250],
        align: "center",
        valign: "center"
      });

      doc.end();
    } catch (err) {
      console.error("Erro ao criar o PDF com QR Code:", err);
    }
  } else {
    console.log(`PDF com QR Code já existe em ${pdfPath}`);
  }
}

// Rota para upload de arquivos
app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    res.redirect(`/success.html?message=Arquivo enviado com sucesso!`);
  } else {
    res.send("Erro ao enviar arquivo.");
  }
});

// Rota para envio de links
app.post("/link", (req, res) => {
  const link = req.body.link;

  if (link) {
    fs.appendFileSync("uploads/links.txt", link + "\n");
    res.redirect(`/success.html?message=Link enviado com sucesso!`);
  } else {
    res.send("Erro ao enviar link.");
  }
});

// Rota para listar arquivos enviados e links
app.get("/files", (req, res) => {
  const files = fs
    .readdirSync(path.join(__dirname, "uploads"))
    .filter((file) => file !== "links.txt");
  const links = fs.existsSync("uploads/links.txt")
    ? fs.readFileSync("uploads/links.txt", "utf8").split("\n").filter(Boolean)
    : [];

  const fileLinksHtml = files
    .map(
      (file) =>
        `<a href="/uploads/${file}" class="text-blue-500 hover:underline">${file}</a>`
    )
    .join("<br>");
  const linksHtml = links
    .map(
      (link) =>
        `<a href="${link}" target="_blank" class="text-blue-500 hover:underline">${link}</a>`
    )
    .join("<br>");

  res.send(`${fileLinksHtml}<br><br>${linksHtml}`);
});

// Servir arquivos da pasta 'uploads'
app.use("/uploads", express.static("uploads"));

// Servir arquivos da pasta 'downloads'
app.use("/downloads", express.static("downloads"));

// Servir o arquivo HTML de downloads
app.get("/downloads-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "downloads.html"));
});

// Rota para listar arquivos na pasta 'downloads' como JSON
app.get("/list-downloads", (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, "downloads"));
  res.json(files);
});

// Inicia o servidor escutando em todas as interfaces de rede
app.listen(port, "0.0.0.0", async () => {
  const localIP = getLocalIP();
  const url = `http://${localIP}:${port}`;

  // Gera o QR Code da URL e exibe no console
  try {
    const qr = await qrcode.toString(url, { type: "terminal" });
    console.log(`Servidor rodando em ${url}`);
    console.log(`\nAcesse o aplicativo escaneando o QR Code abaixo:\n`);
    console.log(qr);

    // Cria o PDF com o QR Code
    await createQRCodePDF(url);
  } catch (err) {
    console.error("Erro ao gerar o QR Code:", err);
  }
});
