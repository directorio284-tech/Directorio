const express = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');
const { httpTipoNegocio } = require('../controllers/tipoNegocio.js');
const { tipoNegocioHelper } = require('../helpers/tipoNegocio.js');

const router = express.Router();

// Listar todos
router.get("/listar", 
//   validarJWT,
     httpTipoNegocio.getTipos);

// Listar por ID
router.get("/listar/:id", [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(tipoNegocioHelper.existeTipoNegocioID),
    validarCampos
], httpTipoNegocio.getTipoPorId);

// Crear (solo admins)
router.post("/crear", [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], httpTipoNegocio.postCrearTipo);

// Editar
router.put("/editar/:id", [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(tipoNegocioHelper.existeTipoNegocioID),
    validarCampos
], httpTipoNegocio.putEditarTipo);

// Eliminar
router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(tipoNegocioHelper.existeTipoNegocioID),
    validarCampos
], httpTipoNegocio.deleteTipo);

module.exports = router;
