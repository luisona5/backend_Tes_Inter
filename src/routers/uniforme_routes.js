import {Router} from 'express'
import {  eliminarUniforme,
        listarUniformeEstudiante,
        listarUniformeParaDirector,
        registrarUniforme } from '../controllers/uniforme_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()


router.post('/uniforme/registro',verificarTokenJWT,registrarUniforme)

router.get('/lista-de-uniforme/listar/:id',verificarTokenJWT,listarUniformeEstudiante)

router.delete('/uniforme/eliminar/:id',verificarTokenJWT,eliminarUniforme)

router.get('/lista-de-uniforme/estudiante/:Id', verificarTokenJWT, listarUniformeParaDirector);


export default router