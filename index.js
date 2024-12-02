import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import Url from './models/Url.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Create Short URL
app.post("/api/shorten", async (req, res) => {
  const { longUrl } = req.body;

  // Check long URL
  if (!longUrl) return res.status(400).json({ message: "Invalid URL" });

  try {
    const shortId = nanoid(8); // Generate a short ID
    const newUrl = new Url({ longUrl, shortUrl: shortId });
    await newUrl.save();
    res.json({ shortUrl: `${process.env.BASE_URL}/${shortId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating short URL" });
  }
});

// Redirect short URL to Original URL
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const urlData = await Url.findOne({ shortUrl });
    if(!urlData) return res.status(404).json({ message: "URL not found" });

    res.redirect(urlData.longUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error redirecting" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));