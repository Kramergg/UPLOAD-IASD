const path = require("path");
const fs = require("fs");

const uploadController = {
  uploadFile: (req, res) => {
    if (req.file) {
      let newFileName = req.body.newFileName;

     
      if (newFileName) {
        const extension = path.extname(req.file.originalname);
        newFileName = `${newFileName}${extension}`;
        const newPath = path.join(__dirname, "../uploads", newFileName);

        // Renomeia o arquivo no servidor
        fs.renameSync(req.file.path, newPath);

        res.redirect(`/success.html?message=Arquivo enviado e renomeado para ${newFileName}!`);
      } else {
        res.redirect(`/success.html?message=Arquivo enviado com sucesso!`);
      }
    } else {
      res.send("Erro ao enviar arquivo.");
    }
  },
};

module.exports = uploadController;
