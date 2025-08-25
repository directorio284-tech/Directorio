const TipoNegocio = require('../models/tipoNegocio.js');

const httpTipoNegocio = {
    // Listar todos los tipos de negocio
    getTipos: async (req, res) => {
        try {
            const tipos = await TipoNegocio.find();
            res.json(tipos);
        } catch (error) {
            res.status(500).json({ msg: 'Error al listar tipos de negocio', error });
        }
    },

    // Listar tipo de negocio por ID
    getTipoPorId: async (req, res) => {
        try {
            const tipo = await TipoNegocio.findById(req.params.id);
            if (!tipo) return res.status(404).json({ msg: 'Tipo de negocio no encontrado' });
            res.json(tipo);
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener tipo de negocio', error });
        }
    },

    // Crear un nuevo tipo de negocio
postCrearTipo: async (req, res) => {
    try {
        const nuevoTipo = new TipoNegocio(req.body);
        await nuevoTipo.save();

        // Respuesta correcta con código 201 (creado) y un mensaje personalizado
        res.status(201).json({ 
            msg: 'Tipo de negocio creado exitosamente', 
            tipo: nuevoTipo 
        });

    } catch (error) {
        res.status(500).json({ 
            msg: 'Error al crear tipo de negocio', 
            error: error.message 
        });
    }
},

    // Editar tipo de negocio
putEditarTipo: async (req, res) => {
    try {
        const tipo = await TipoNegocio.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!tipo) {
            return res.status(404).json({ msg: 'Tipo de negocio no encontrado' });
        }

        res.status(200).json({ 
            msg: 'Tipo de negocio editado exitosamente', 
            tipo 
        });

    } catch (error) {
        res.status(500).json({ 
            msg: 'Error al editar tipo de negocio', 
            error: error.message 
        });
    }
},


    // Eliminar tipo de negocio
    deleteTipo: async (req, res) => {
        try {
            const tipo = await TipoNegocio.findByIdAndDelete(req.params.id);
            if (!tipo) return res.status(404).json({ msg: 'Tipo de negocio no encontrado' });
            res.json({ msg: 'Tipo de negocio eliminado', tipo });
        } catch (error) {
            res.status(500).json({ msg: 'Error al eliminar tipo de negocio', error });
        }
    }
};


module.exports = { httpTipoNegocio };
