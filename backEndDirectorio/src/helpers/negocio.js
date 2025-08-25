const Negocio = require('../models/negocio.js');

const negocioHelper = {
 noExisteNombreRepetido: async (nombre = '') => {
        const existe = await Negocio.findOne({ nombre: nombre.trim() });
        if (existe) {
            throw new Error(`Ya existe un negocio con el nombre '${nombre}'`);
        }
    },
    existeNegocioID: async (_id) => {
        const existe = await Negocio.findById(_id);
        if (!existe) {
            throw new Error('El negocio ya existe');
        }
    }
};

module.exports = { negocioHelper };

