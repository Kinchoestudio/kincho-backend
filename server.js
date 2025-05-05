
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/style-transfer', upload.single('image'), async (req, res) => {
    try {
        const fileStream = fs.createReadStream(req.file.path);
        const form = new FormData();
        form.append('image', fileStream);

        const response = await axios.post(
            'https://hf.space/embed/akhaliq/CartoonGAN/+/api/predict/',
            {
                data: [form]
            },
            {
                headers: {
                    ...form.getHeaders()
                }
            }
        );

        fs.unlinkSync(req.file.path); // limpiar archivo temporal

        const outputUrl = response.data.data[0];
        res.json({ output_url: outputUrl });
    } catch (error) {
        console.error('Error en la API:', error.message);
        res.status(500).json('Error al aplicar el estilo.');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
