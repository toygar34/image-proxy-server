const express = require("express");
const fetch = require("node-fetch"); // <- Mutlaka bu olmalı
const app = express();

app.get("/proxy", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send("Image URL required");
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://bundle.app"
      }
    });

    if (!response.ok) {
      console.error("Fetch failed:", response.status, response.statusText);
      return res.status(response.status).send(`Image fetch failed: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.buffer();

    res.set("Content-Type", contentType);
    res.send(buffer);
  } catch (err) {
    console.error("Proxy Error:", err.message);
    console.error(err.stack);
    res.status(500).send("Proxy server error");
  }
});

app.listen(3000, () => {
  console.log("✅ Image proxy server running at http://localhost:3000");
});
