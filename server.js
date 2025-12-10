const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// === CORS ===
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

const HF_API = "https://apexion-crop-yield-prediction.hf.space/predict";

app.get("/", (req, res) => {
  res.send("Backend aktif ✔️");
});

app.post("/predict", async (req, res) => {
  console.log("REQUEST MASUK:", req.body);

  try {
    const payload = { data: [req.body] };

    const response = await axios.post(HF_API, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000
    });

    console.log("HASIL HF:", response.data);

    const hasil = response.data.data?.[0] || response.data;

    res.json(hasil);

  } catch (err) {
    console.error("HF ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "Gagal mengambil prediksi dari HuggingFace",
      detail: err.response?.data || err.message
    });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server berjalan di port ${port}`));
