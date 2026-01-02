import express from 'express';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { actualizarCategoria, 
        detalleCategoria,
        eliminarCategoria, 
        listarCategoria, 
        registrarCategoria } from '../controllers/categoria_controller.js';

const router = express.Router();


router.post('/categoriadeEvento/registro',verificarTokenJWT,registrarCategoria);

router.get('/categoriadeEvento/visualizarDirectores',verificarTokenJWT,listarCategoria);

router.get('/categoriadeEvento/:id',verificarTokenJWT,detalleCategoria);

router.delete('/categoriadeEvento/eliminar/:id',verificarTokenJWT,eliminarCategoria)

router.put('/categoriadeEvento/actualizar/:id',verificarTokenJWT,actualizarCategoria)


export default router
