const express = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-token');

const { negocioHelper } = require('../helpers/negocio.js');
const { httpNegocios } = require('../controllers/negocio.js');
const { tipoNegocioHelper } = require('../helpers/tipoNegocio.js');
const upload = require('../middlewares/upload.js');

const router = express.Router();


// Listar todos los negocios
router.get("/listar", validarCampos, httpNegocios.getNegocios);

// Listar negocio por ID
router.get("/listar/:id", [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(negocioHelper.existeNegocioID),
    validarCampos
], httpNegocios.getNegocioPorId);

// Crear nuevo negocio
router.post('/crear', [
    validarJWT,
    upload.single('imagen'),
    check('nombre', 'El nombre es obligatorio').trim().not().isEmpty(),
    check('direccion', 'La dirección es obligatoria').trim().not().isEmpty(),
    check('telefono', 'Teléfono inválido (debe tener entre 7 y 15 dígitos)')
        .not().isEmpty().matches(/^[0-9]{7,15}$/),
    check('ciudad', 'La ciudad es obligatoria').not().isEmpty(),
    check('ubicacionUrl', 'La ubicación es obligatoria').not().isEmpty(),
    check('sitioWeb', 'El sitio web debe ser una URL válida').not().isEmpty(),
    check('horarios', 'Los horarios son obligatorios').not().isEmpty(),
    check('email', 'Email inválido').isEmail().not().isEmpty(),
    check('tipoNegocio', 'El tipo de negocio debe ser un ID válido').isMongoId(),
    check('tipoNegocio').custom(tipoNegocioHelper.existeTipoNegocioID),
    check('nombre').custom(negocioHelper.noExisteNombreRepetido),
 // Valida si existe el negocio
    validarCampos
], httpNegocios.postCrearNegocio);

//  Editar negocio
router.put("/editar/:id", [
    validarJWT,    
     upload.single('imagen'),                                                                                                                                                                                           
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(negocioHelper.existeNegocioID),

    validarCampos
], httpNegocios.putEditarNegocio);

//  Activar negocio
router.put("/activar/:id", [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(negocioHelper.existeNegocioID),
    validarCampos
], httpNegocios.putActivarNegocio);

// Desactivar negocio
router.put("/desactivar/:id", [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(negocioHelper.existeNegocioID),
    validarCampos
], httpNegocios.putDesactivarNegocio);


// eliminar negocio

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(negocioHelper.existeNegocioID),
    validarCampos
], httpNegocios.deleteEliminarNegocio);

module.exports = router;
