import express from 'express';

import { verificarTokenJWT } from '../middlewares/JWT.js';
import { obtenerEstadisticasAdmin, 
    obtenerEstadisticasDirector, 
     } from '../controllers/estadistica_controller.js';

const router = express.Router();


router.get('/admin', verificarTokenJWT, obtenerEstadisticasAdmin);

router.get('/director', verificarTokenJWT, obtenerEstadisticasDirector);




export default router;
