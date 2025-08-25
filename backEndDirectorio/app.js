

const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


// Rutas principales
const usuarios = require('./src/routes/usuario.js');
const negocios = require("./src/routes/negocio.js");
const tipoNegocios = require("./src/routes/tipoNegocio.js");


// Middleware de rutas
app.use('/api/usuario', usuarios);
app.use('/api/negocio', negocios);
app.use('/api/tipoNegocio', tipoNegocios);


// Conexión y servidor
const PORT = process.env.PORT || 3624;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ Conectado a MongoDB ⚓ Compas y Atlas ⏬⛈️'))
        .catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));
}); 
