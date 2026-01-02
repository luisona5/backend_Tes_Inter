
import { Stripe } from "stripe"
import Uniforme from "../models/uniforme.js"
import mongoose from "mongoose"
import Inscripcion from "../models/inscripcion.js"
import Estudiante from "../models/student.js"
const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)



const registrarUniforme = async (req, res) => {
    try {
        const { inscripcion } = req.body;

        if (!inscripcion) {
            return res.status(400).json({msg: "Debes proporcionar el ID de la inscripción"});
        }

        if (Object.values(req.body).includes("")) {
            return res.status(400).json({ msg: "Debes llenar todos los campos"});
        }

        // Validar que sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(inscripcion)) {
            return res.status(400).json({msg: `ID de inscripción inválido: ${inscripcion}`});
        }

        const inscripcionExiste = await Inscripcion.findById(inscripcion);
        
        if (!inscripcionExiste) {
            return res.status(404).json({msg: `no existe inscripción con ID ${inscripcion} `});
        }

        // Verificar que la inscripción esté aprobada
        if (inscripcionExiste.estado !== 'Aprobada' ) {
            return res.status(400).json({msg: `La inscripción está ${inscripcionExiste.estado} y no puedes solicitar uniforme hasta que sea aprobada.`});
        }

        const uniformeExiste = await Uniforme.findOne({ 
            inscripcion: inscripcion,
            estadoUniforme: true 
        });

        if (uniformeExiste) {
            return res.status(400).json({msg: "Ya existe un uniforme registrado para esta inscripción"});
        }

        const nuevoUniforme = new Uniforme(req.body);
        await nuevoUniforme.save();


        return res.status(201).json({ msg: " Registro exitoso del uniforme", });

    } catch (error) {
        console.error(error);
        res.status(500).json({  msg: `❌ Error en el servidor - ${error.message}`});
    }
};


const eliminarUniforme = async(req,res)=>{
    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) 
            return res.status(404).json({msg:`No existe el uniforme ${id}`})
        await Uniforme.findByIdAndDelete(id)
        res.status(200).json({msg:"Uniforme eliminado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const pagarUniforme = async (req, res) => {
    try {
        const { paymentMethodId, uniformeId, cantidad, motivo } = req.body
        
        const uniforme = await Uniforme.findById(uniformeId).populate({
            path: 'inscripcion',
            populate: {
                path: 'estudiante'
            }
        })

        if (!uniforme) 
            return res.status(404).json({ message: "Uniforme no encontrado" })

        if (uniforme.estadoPago === "Pagado") 
            return res.status(400).json({ message: "Este uniforme ya fue pagado" })

        if (!paymentMethodId) 
            return res.status(400).json({ message: "paymentMethodId no proporcionado" })

        const estudiante = uniforme.inscripcion.estudiante

        const clienteStripe = await stripe.customers.create({
            name: estudiante.nombreEstudiante,   
            email: estudiante.emailEstudiante
        })

        const payment = await stripe.paymentIntents.create({
            amount: cantidad,
            currency: "usd",
            description: motivo,
            payment_method: paymentMethodId,
            confirm: true,
            customer: clienteStripe.id,
            receipt_email: estudiante.emailEstudiante,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never"
            }
        })

        if (payment.status === "succeeded") {
            await Uniforme.findByIdAndUpdate(uniformeId, { estadoPago: "Pagado" })
            return res.status(200).json({ msg: "El pago se realizó exitosamente" })
        } else {
            return res.status(400).json({ msg: `El pago no se completó: ${payment.status}` })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error al intentar pagar el uniforme - ${error.message}` })
    }
}




export{
    registrarUniforme,
    eliminarUniforme,
    pagarUniforme
}