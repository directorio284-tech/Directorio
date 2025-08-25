const Negocio = require("../models/negocio.js");
const cloudinary = require("../utils/cloudinary.js");
const streamifier = require("streamifier");


const httpNegocios = {
  // Listar todos
  getNegocios: async (req, res) => {
    try {
      const negocios = await Negocio.find().populate("tipoNegocio");
      res.json(negocios);
    } catch (error) {
      res.status(500).json({ msg: "Error al listar negocios", error });
    }
  },

  // Listar por ID
  getNegocioPorId: async (req, res) => {
    try {
      const negocio = await Negocio.findByIdAndUpdate(
        req.params.id,
        { $inc: { visitas: 1 } }, // suma 1 visita
        { new: true }
      ).populate("tipoNegocio");

      if (!negocio)
        return res.status(404).json({ msg: "Negocio no encontrado" });

      res.json(negocio);
    } catch (error) {
      res.status(500).json({ msg: "Error al obtener negocio", error });
    }
  },

  // Crear negocio
 postCrearNegocio: async (req, res) => {
  
  try {
    const {
      nombre,
      direccion,
      telefono,
      email,
      sitioWeb,
      ciudad,
      horarios, 
      redes,
      tipoNegocio
    } = req.body;
      
    // Parsear strings JSON a objeto real
    const ubicacion = req.body.ubicacion ? JSON.parse(req.body.ubicacion) : undefined;
    const redesObj = req.body.redes ? JSON.parse(req.body.redes) : {};

    let imagenUrl = '';
    if (req.file) {
      const subirACloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const upload_stream = cloudinary.uploader.upload_stream(
            { folder: 'negocios' },
            (error, result) => {
              if (result) resolve(result.secure_url);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(upload_stream);
        });
      };
      imagenUrl = await subirACloudinary(req.file.buffer);
    }

    const nuevoNegocio = new Negocio({
      nombre,
      direccion,
      telefono,
      email,
      sitioWeb,
      ciudad,
      horarios,
      imagenes: imagenUrl ? [imagenUrl] : [],
      ubicacion,
      redes: redesObj,
      tipoNegocio
    });
    
    await nuevoNegocio.save();
     
    res.status(201).json({
      msg: 'Negocio creado exitosamente',
      negocio: nuevoNegocio
    });

  } catch (error) {
    console.error('❌ Error al crear negocio:', error.message);
    res.status(500).json({
      msg: 'Error al crear el negocio',
      error: error.message
    });
  }
},


  // Editar negocio
putEditarNegocio: async (req, res) => {
  try {
    if (req.body.ubicacion && typeof req.body.ubicacion === "string") {
      req.body.ubicacion = JSON.parse(req.body.ubicacion);
    }
    if (req.body.redes && typeof req.body.redes === "string") {
      req.body.redes = JSON.parse(req.body.redes);
    }

    if (req.file) {
      // Subir imagen a Cloudinary usando streamifier
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            { folder: "negocios" },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload(req);
      req.body.imagenes = [result.secure_url];
    } else {
      delete req.body.imagenes;
    }

    const negocio = await Negocio.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!negocio) {
      return res.status(404).json({ msg: "Negocio no encontrado" });
    }

    res.status(200).json({
      msg: "Negocio editado exitosamente",
      negocio,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al editar el negocio",
      error: error.message,
    });
  }
},

  // putEditarNegocio: async (req, res) => {
  //   try {
  //     const negocio = await Negocio.findByIdAndUpdate(req.params.id, req.body, {
  //       new: true,
  //     });

  //     if (!negocio) {
  //       return res.status(404).json({ msg: "Negocio no encontrado" });
  //     }

  //     res.status(200).json({
  //       msg: "Negocio editado exitosamente",
  //       negocio,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       msg: "Error al editar el negocio",
  //       error: error.message,
  //     });
  //   }
  // },

  // Activar negocio
  putActivarNegocio: async (req, res) => {
    try {
      const negocio = await Negocio.findByIdAndUpdate(
        req.params.id,
        { estado: 1 },
        { new: true }
      );
      if (!negocio)
        return res.status(404).json({ msg: "Negocio no encontrado" });
      res.json({ msg: "Negocio activado", negocio });
    } catch (error) {
      res.status(500).json({ msg: "Error al activar negocio", error });
    }
  },

  // Desactivar negocio
  putDesactivarNegocio: async (req, res) => {
    try {
      const negocio = await Negocio.findByIdAndUpdate(
        req.params.id,
        { estado: 0 },
        { new: true }
      );
      if (!negocio)
        return res.status(404).json({ msg: "Negocio no encontrado" });
      res.json({ msg: "Negocio desactivado", negocio });
    } catch (error) {
      res.status(500).json({ msg: "Error al desactivar negocio", error });
    }
  },
  deleteEliminarNegocio: async (req, res) => {
    try {
      const { id } = req.params;

      const negocio = await Negocio.findByIdAndDelete(id);

      if (!negocio) {
        return res.status(404).json({ msg: "Negocio no encontrado" });
      }

      res.status(200).json({
        msg: "Negocio eliminado correctamente",
        negocio,
      });
    } catch (error) {
      res.status(500).json({
        msg: "Error al eliminar el negocio",
        error: error.message,
      });
    }
  },
};

module.exports = { httpNegocios };
