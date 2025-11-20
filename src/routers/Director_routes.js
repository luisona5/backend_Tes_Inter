import express from 'express';
import { registrarDirector,loginDirector,listarDirector } from '../controllers/director_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = express.Router();

router.post('/directordeEvento/registro',verificarTokenJWT,registrarDirector);

router.get('/directordeEvento/visualizar',verificarTokenJWT,listarDirector);

router.post('/directordeEvento/login',loginDirector)


export default router;
