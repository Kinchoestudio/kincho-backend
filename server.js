// server.js
import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 10000;

app.use(cors());

app.post("/style-transfer", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);

    const response = await fetch("https://api-inference.huggingface.co/models/akhaliq/cartoonGAN", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "image/jpeg",
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      console.error("Error en la API:", response.status, await response.text());
      return res.status(500).json({ error: "Fallo al aplicar el estilo." });
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.startsWith("image/")) {
      const buffer = await response.buffer();
      const outputFilename = `uploads/estilizada-${Date.now()}.jpg`;
      fs.writeFileSync(outputFilename, buffer);
      return res.json({ output_url: `${req.protocol}://${req.get("host")}/${outputFilename}` });
    } else {
      const result = await response.json();
      return res.status(500).json({ error: result.error || "Respuesta inesperada de Hugging Face" });
    }
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
