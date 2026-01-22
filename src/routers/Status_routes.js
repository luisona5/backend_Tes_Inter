import express from 'express';
import { verificarTokenJWT } from '../middlewares/JWT.js';
import { cambiarStatusDirector, cambiarStatusEstudiante } from '../controllers/status_controller.js';

const router = express.Router();


router.put('/admin/director/status/:id',verificarTokenJWT,cambiarStatusDirector)


router.put('/estudiante/status/:id', verificarTokenJWT, cambiarStatusEstudiante);




export default router;
