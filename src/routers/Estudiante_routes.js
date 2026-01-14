import express from 'express';
import { registrarEstudiante,loginEstudiante,
         listarEstudiante, detalleEstudiante,
         eliminarEstudiante,actualizarEstudiante, 
         perfilEstudiante,
         registroIndependienteStudent,
         confirmarMailEstudiante,
         recuperarPasswordEstudiante,
         comprobarTokenPasswordEstudiante,
         nuevoPasswordEstudiante,
         actualizarPerfilEstudiante,
         actualizarPasswordEstudiante} from '../controllers/estudiante_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = express.Router();


    

router.post('/estudiante/registro',verificarTokenJWT,registrarEstudiante);

router.get('/estudiante/visualizarEstudiantes',verificarTokenJWT,listarEstudiante);

router.get('/estudiante/detalle/:id',verificarTokenJWT,detalleEstudiante);

router.delete('/estudiante/eliminar/:id',verificarTokenJWT,eliminarEstudiante)

router.put('/estudiante/actualizar/:id',verificarTokenJWT,actualizarEstudiante)

//-------------------------------------------------------------------------------

router.post('/registro/estudiante',registroIndependienteStudent)

router.get('/confirmar/estudiante/:token',confirmarMailEstudiante)

router.post('/estudiante/login',loginEstudiante)

router.get('/estudiante/perfil',verificarTokenJWT,perfilEstudiante)


router.post('/recuperarpasswordEstudiante',recuperarPasswordEstudiante)

router.get('/recuperarpasswordEstudiante/:token',comprobarTokenPasswordEstudiante)

router.post('/nuevopasswordEstudiante/:token',nuevoPasswordEstudiante)

router.put('/actualizarperfilEstudiante/:id',verificarTokenJWT,actualizarPerfilEstudiante)

router.put('/actualizarpasswordEstudiante/:id',verificarTokenJWT,actualizarPasswordEstudiante)

export default router;
