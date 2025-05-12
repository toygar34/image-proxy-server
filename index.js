const express = require("express");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const bucket = require("./firebase");

const app = express();
app.use(express.json());

app.post("/upload", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send("Image URL required");

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://bundle.app",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send(`Image fetch failed: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const fileExt = path.extname(imageUrl).split("?")[0] || ".jpg";
    const fileName = `uploads/proxied-images/${uuidv4()}${fileExt}`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: response.headers.get("content-type"),
        firebaseStorageDownloadTokens: uuidv4()
      }
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

    res.status(200).json({ imageUrl: publicUrl });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).send("Upload failed");
  }
});


app.listen(3000, () => {
  console.log("✅ Image proxy server running at http://localhost:3000");
});
