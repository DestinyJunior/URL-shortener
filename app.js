const express = require("express");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const { sendEmail } = require("./emails");

const app = express();
const PORT = process.env.PORT || 3000;
const urlMappingsFilePath = path.join(__dirname, "urlMappings.json");

// Initialize URL mappings or load from file
let urlMappings = {};

async function loadUrlMappings() {
  try {
    const data = await fs.readFile(urlMappingsFilePath, "utf-8");
    console.log(data);
    urlMappings = JSON.parse(data);
  } catch (error) {
    console.error("Error loading URL mappings:", error.message);
  }
}

async function saveUrlMappings() {
  try {
    await fs.writeFile(
      urlMappingsFilePath,
      JSON.stringify(urlMappings, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error saving URL mappings:", error.message);
  }
}

loadUrlMappings(); // Load URL mappings on server startup

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'views' folder
app.use(express.static("views"));

// Route to handle shortening a URL
app.post("/shorten", (req, res) => {
  const longUrl = req.body.longUrl;
  // Ensure proper URL format
  const completeLongUrl = /^(f|ht)tps?:\/\//i.test(longUrl)
    ? longUrl
    : `http://${longUrl}`;

  const shortUrl = shortid.generate();

  // Store the URL mapping in memory and save to file
  urlMappings[shortUrl] = completeLongUrl;
  saveUrlMappings();

  // Send an email confirmation
  sendEmail(
    req.body.email,
    "URL Shortened",
    `Your short URL: http://localhost:${PORT}/${shortUrl}`
  );

  res.json({ shortUrl });
});

// Route to redirect to the original URL
app.get("/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const longUrl = urlMappings[shortUrl];

  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.status(404).send("Short URL not found");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
