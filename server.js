const express = require("express");
const uploadRoutes = require("./routes/uploadRoutes");
const linkRoutes = require("./routes/linkRoutes");
const fileRoutes = require("./routes/fileRoutes");
const qrcodeRoutes = require("./routes/qrcodeRoutes");
const {
  getLocalIP,
  createQRCodePDF
} = require("./controllers/qrcodeController");

const qrcode = require("qrcode");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/downloads", express.static("downloads"));

app.use(uploadRoutes);
app.use(linkRoutes);
app.use(fileRoutes);
app.use(qrcodeRoutes);

app.listen(port, "0.0.0.0", async () => {
  const localIP = getLocalIP();
  const url = `http://${localIP}:${port}`;

  try {
    const qr = await qrcode.toString(url, { type: "terminal" });
    console.log(`Servidor rodando em ${url}`);
    console.log(`\nAcesse o aplicativo escaneando o QR Code abaixo:\n`);
    console.log(qr);

    await createQRCodePDF(url);
  } catch (err) {
    console.error("Erro ao gerar o QR Code:", err);
  }
});
