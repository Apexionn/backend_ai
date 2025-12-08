const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

// CORS bebas (untuk deploy)
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend aktif ✔️");
});

app.post("/predict", (req, res) => {
  console.log("REQUEST MASUK:", req.body);

  const py = spawn("python3", [
    path.join(__dirname, "ML/app.py"),
    JSON.stringify(req.body)
  ]);

  let output = "";
  let errorOutput = "";

  py.stdout.on("data", (data) => output += data.toString());
  py.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("PYTHON ERROR:", data.toString());
  });

  py.on("close", () => {
    if (errorOutput) console.error("PY ERROR FULL:", errorOutput);

    try {
      res.json(JSON.parse(output));
    } catch (e) {
      res.status(500).json({
        error: "Python output tidak valid",
        raw: output
      });
    }
  });
});

const port = process.env.PORT || 5001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server jalan di port ${port}`);
});
