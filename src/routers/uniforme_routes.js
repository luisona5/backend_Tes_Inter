import {Router} from 'express'
import { actualizarPrecioUniforme, eliminarUniforme,
        listarUniformeEstudiante,
        pagarUniforme, 
        registrarUniforme } from '../controllers/uniforme_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()


router.post('/uniforme/registro',verificarTokenJWT,registrarUniforme)

router.get('/lista-de-uniforme/listar',verificarTokenJWT,listarUniformeEstudiante)

router.delete('/uniforme/eliminar/:id',verificarTokenJWT,eliminarUniforme)

router.post('/uniforme/pago',verificarTokenJWT,pagarUniforme)

router.put('/director/precio-uniforme/:id',verificarTokenJWT, actualizarPrecioUniforme);


export default router