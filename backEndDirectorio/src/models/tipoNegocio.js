const mongoose = require("mongoose");

const tipoNegocioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    descripcion: {
        type: String,
    },
    icono: { type: String }, // para frontend
    color: { type: String }, // para frontend
});

module.exports = mongoose.model("TipoNegocio", tipoNegocioSchema);
