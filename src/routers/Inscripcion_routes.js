import { Router } from 'express';
import {
    registrarInscripcion,
    listarInscripciones,
    detalleInscripcion,
    eliminarInscripcion, 
obtenerDeporte
} from '../controllers/inscripcion_controller.js';

import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = Router();

router.get('/deporte/disponible',verificarTokenJWT, obtenerDeporte);

router.post('/registro/estudiante/Incripcion', verificarTokenJWT, registrarInscripcion);

router.get('/inscripciones/listar', verificarTokenJWT, listarInscripciones);

router.get('/inscripciones/detalle/:id', verificarTokenJWT, detalleInscripcion);

router.delete('/inscripciones/eliminar/:id', verificarTokenJWT, eliminarInscripcion);

export default router;