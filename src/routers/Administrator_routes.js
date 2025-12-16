import {Router} from 'express'
import { login, registro, perfil, 
        actualizarPerfil, actualizarPassword, 
        recuperarPassword,comprobarTokenPasword,crearNuevoPassword 
        
} from  '../controllers/administrator_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'


const router = Router()

router.post('/registro',registro)

router.post('/administrador/login',login)

router.get('/administrador/perfil',verificarTokenJWT,perfil)

router.put('/administrador/actualizarperfil/:id',verificarTokenJWT,actualizarPerfil)

router.put('/administrador/actualizarpassword/:id',verificarTokenJWT,actualizarPassword)

router.post('/administrador/recuperarpassword',recuperarPassword)

router.get('/administrador/recuperarpassword/:token',comprobarTokenPasword)

router.post('administrador/nuevopassword/:token',crearNuevoPassword)

export default router