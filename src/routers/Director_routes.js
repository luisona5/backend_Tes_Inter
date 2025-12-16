import express from 'express';
import { registrarDirector,loginDirector,
         listarDirector, detalleDirector,
         eliminarDirector,actualizarDirector, 
         perfilDirector,
         recuperarPasswordDirector,
         comprobarTokenPasswordDirector,
         nuevoPasswordDirector,
         actualizarPerfilDirector
       } from '../controllers/director_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = express.Router();


// Las rutas  controladas por el administrador


router.get('/directordeEvento/perfil',verificarTokenJWT,perfilDirector)

router.post('/directordeEvento/registro',verificarTokenJWT,registrarDirector);

router.get('/directordeEvento/visualizarDirectores',verificarTokenJWT,listarDirector);

router.get('/directordeEvento/:id',verificarTokenJWT,detalleDirector);

router.delete('/directordeEvento/eliminar/:id',verificarTokenJWT,eliminarDirector)

router.put('/directordeEvento/actualizar/:id',verificarTokenJWT,actualizarDirector)



//las rutas controladas por el director de evento
router.post('/directordeEvento/login',loginDirector)

router.post('/recuperarpasswordDirector',recuperarPasswordDirector)

router.get('/recuperarpasswordDirector/:token',comprobarTokenPasswordDirector)

router.post('/nuevopasswordDirector/:token',nuevoPasswordDirector)

router.put('/actualizarperfilDirector/:id',verificarTokenJWT,actualizarPerfilDirector)
    

export default router;
