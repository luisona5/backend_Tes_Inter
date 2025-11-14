import express from 'express';
import { registrarDirector } from '../controllers/director_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = express.Router();

router.post('/directordeEvento/registro',verificarTokenJWT,registrarDirector);

export default router;
