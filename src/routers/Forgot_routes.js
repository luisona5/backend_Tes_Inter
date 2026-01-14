import express from 'express';
import recuperarPasswordUniversal from '../Forgot/resetPasswordUniversal.js';
import comprobarTokenPasswordUniversal from '../Forgot/ComprobarPasswordUniversal.js';
import nuevoPasswordUniversal from '../Forgot/nuevoPasswordUniversal.js';

const router = express.Router();

router.post('/recuperar-password', recuperarPasswordUniversal);

router.get('/recuperarpasswordUniversal/:token',comprobarTokenPasswordUniversal)

router.post('/nuevopasswordUniversal/:token',nuevoPasswordUniversal)

export default router;