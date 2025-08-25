const TipoNegocio = require('../models/tipoNegocio.js');

const tipoNegocioHelper = {
    existeTipoNegocioID: async (id) => {
        const existe = await TipoNegocio.findById(id);
        if (!existe) {
            throw new Error(`El tipo de negocio con id ${id} existe`);
        }
    }
};

module.exports = { tipoNegocioHelper };
