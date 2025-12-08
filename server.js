const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

// ============================
//  CORS
// ============================
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ============================
//  ROOT TEST
// ============================
app.get("/", (req, res) => {
  res.send("Backend aktif ✔️");
});

// ============================
//  PREFLIGHT
// ============================
app.options("/predict", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return res.sendStatus(200);
});

// ============================
//  PREDICT ENDPOINT
// ============================
app.post("/predict", (req, res) => {
  console.log("REQUEST MASUK:", req.body);

  // Kirim JSON utuh ke Python lewat 1 argumen
  const py = spawn(
    "/Library/Frameworks/Python.framework/Versions/3.13/bin/python3.13",
    [
      path.join(__dirname, "../ML/app.py"),
      JSON.stringify(req.body)
    ]
  );

  let output = "";
  let errorOutput = "";

  py.stdout.on("data", (data) => {
    output += data.toString();
  });

  py.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("PYTHON ERR:", data.toString());
  });

  py.on("close", () => {
    if (errorOutput) {
      console.error("PY ERROR FULL:", errorOutput);
    }

    try {
      const json = JSON.parse(output);
      res.json(json);
    } catch (err) {
      console.log("Raw output:", output);
      res.status(500).json({
        error: "Python output tidak valid",
        raw: output
      });
    }
  });
});

// ============================
const port = process.env.PORT || 5001;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server jalan di port ${port}`);
});
