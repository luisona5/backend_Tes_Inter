import express from 'express';
import { registrarEstudiante,loginEstudiante,
         listarEstudiante, detalleEstudiante,
         eliminarEstudiante,actualizarEstudiante, 
         perfilEstudiante} from '../controllers/estudiante_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = express.Router();

router.post('/estudiante/login',loginEstudiante)

router.get('/estudiante/perfil',verificarTokenJWT,perfilEstudiante)
    

router.post('/estudiante/registro',verificarTokenJWT,registrarEstudiante);

router.get('/estudiante/visualizarEstudiantes',verificarTokenJWT,listarEstudiante);

router.get('/estudiante/:id',verificarTokenJWT,detalleEstudiante);

router.delete('/estudiante/eliminar/:id',verificarTokenJWT,eliminarEstudiante)

router.put('/estudiante/actualizar/:id',verificarTokenJWT,actualizarEstudiante)


export default router;
