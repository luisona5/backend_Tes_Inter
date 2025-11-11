import {Router} from 'express'
import { login, registro, perfil, actualizarPerfil } from  '../controllers/administrator_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'


const router = Router()

router.post('/registro',registro)

router.post('/login',login)

router.get('/perfil',verificarTokenJWT,perfil)

router.put('/actualizarperfil/:id',verificarTokenJWT,actualizarPerfil)

export default router