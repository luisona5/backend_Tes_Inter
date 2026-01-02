import express from 'express';
import {
  inscripcionesPendientes,
  aprobarInscripcion,
  rechazarInscripcion,
  inscripcionesPorDeporte
} from '../controllers/aprobacion_controller.js';
import { verificarTokenJWT } from '../middlewares/JWT.js';

const router = express.Router();

router.get('/inscripciones/pendientes',verificarTokenJWT, inscripcionesPendientes);

router.put('/inscripcion/aprobar/:id',verificarTokenJWT, aprobarInscripcion);

router.put('/inscripcion/rechazar/:id', verificarTokenJWT, rechazarInscripcion);

router.get('/deporte/inscripcionesPorDeporte/:id', verificarTokenJWT, inscripcionesPorDeporte);



export default router
