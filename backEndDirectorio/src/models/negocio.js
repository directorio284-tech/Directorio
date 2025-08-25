const mongoose = require("mongoose");

const negocioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: String, match: /^[0-9]{7,15}$/ },
    email: { type: String, match: /.+@.+\..+/ },
    sitioWeb: { type: String },
    ciudad: { type: String, required: true },
    horarios: { type: String }, // texto libre o JSON
    imagenes: [{ type: String }], // array de URLs
    ubicacion: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
    redes: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      whatsapp: String,
    },
    
    tipoNegocio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TipoNegocio",
      required: true,
    },
    visitas: { type: Number, default: 0 },
    estado: { type: Number, required: true, default: 1 }
  },
  {
    timestamps: true,
  }
);

negocioSchema.index({ ubicacion: "2dsphere" });

module.exports = mongoose.model("Negocio", negocioSchema);
