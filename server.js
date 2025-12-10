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
  console.log("REQUEST KE BACKEND:", req.body);

  try {
    const response = await axios.post(HF_API, req.body, {  
      headers: { "Content-Type": "application/json" },
      timeout: 30000
    });

    console.log("HASIL DARI HF:", response.data);
    res.json(response.data);

  } catch (err) {
    console.error("ERROR HF:", err.response?.data || err.message);

    res.status(500).json({
      error: "Gagal mengambil hasil prediksi dari HuggingFace",
      detail: err.response?.data || err.message
    });
  }
});



const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server berjalan di port ${port}`));
