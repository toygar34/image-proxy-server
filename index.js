const express = require("express");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const bucket = require("./firebase");
const cors = require("cors");

const app = express();
app.use(express.json());

// ✅ Güvenli CORS middleware
app.use(cors({
  origin: "*", // dilersen domain belirtebilirsin
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.post("/upload", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send("Image URL required");

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": imageUrl, // Hedef sitenin kendi URL'si
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Image fetch failed: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const fileExt = path.extname(imageUrl).split("?")[0] || ".jpg";
    const fileName = `uploads/proxied-images/${uuidv4()}${fileExt}`;
    const file = bucket.file(fileName);

    const token = uuidv4();
    await file.save(buffer, {
      metadata: {
        contentType: response.headers.get("content-type"),
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });
    
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;
    

    res.status(200).json({ imageUrl: publicUrl });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).send("Upload failed");
  }
});

app.listen(3000, () => {
  console.log("✅ Image proxy server running on port 3000");
});
