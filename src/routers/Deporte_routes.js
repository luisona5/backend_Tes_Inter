import {Router} from 'express'
import { actualizarDeporte, detalleDeporte, 
         eliminarDeporte, listarDeporte, 
         listarDeportesDisponibles, 
         obtenerCategorias, 
         registrarDeporte } from '../controllers/deporte_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'


const router = Router()

router.get('/categorias',verificarTokenJWT, obtenerCategorias);

router.post('/registro/Deporte',verificarTokenJWT,registrarDeporte)

router.get('/deportesEsfot/visualizarDeportes',verificarTokenJWT,listarDeporte);

router.get('/detalleDeporte/:id',verificarTokenJWT,detalleDeporte);

router.delete('/Deporte/eliminar/:id',verificarTokenJWT,eliminarDeporte)

router.put('/deportes/actualizar/:id',verificarTokenJWT,actualizarDeporte)

router.get('/deportes/disponibles', listarDeportesDisponibles)


export default router