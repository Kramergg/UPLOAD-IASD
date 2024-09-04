const fs = require("fs");
const path = require("path");

const fileController = {
  listFilesAndLinks: (req, res) => {
    const files = fs
      .readdirSync(path.join(__dirname, "../uploads"))
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
  },

  listDownloads: (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, "../downloads"));
    res.json(files);
  }
};

module.exports = fileController;
