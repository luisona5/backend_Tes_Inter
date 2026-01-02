import {Router} from 'express'
import { eliminarUniforme,
        pagarUniforme, 
        registrarUniforme } from '../controllers/uniforme_controller.js'
import { verificarTokenJWT } from '../middlewares/JWT.js'
const router = Router()


router.post('/uniforme/registro',verificarTokenJWT,registrarUniforme)

router.delete('/uniforme/eliminar/:id',verificarTokenJWT,eliminarUniforme)

router.post('/uniforme/pago',verificarTokenJWT,pagarUniforme)


export default router