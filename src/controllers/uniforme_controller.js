
import { Stripe } from "stripe"
import Uniforme from "../models/uniforme.js"
import mongoose from "mongoose"
import Inscripcion from "../models/inscripcion.js"
import Director from "../models/directordeEvento.js"

const stripe = new Stripe(`${process.env.STRIPE_PRIVATE_KEY}`)


const registrarUniforme = async (req, res) => {
    try {
        const { inscripcion, nombre, detalle, talla } = req.body;

        // Verificar autenticación del estudiante
        if (!req.estudianteHeader || !req.estudianteHeader._id) {
            return res.status(401).json({ msg: "Usuario no autenticado" });
        }

        // Validar campos obligatorios
        if (!inscripcion || !nombre || !detalle || !talla) {
            return res.status(400).json({ msg: "Debes llenar todos los campos obligatorios" });
        }

        if (!mongoose.Types.ObjectId.isValid(inscripcion)) {
            return res.status(400).json({msg: `ID de inscripción inválido: ${inscripcion}`});
        }

        const inscripcionExiste = await Inscripcion.findById(inscripcion)
            .populate('deporte');
        
        if (!inscripcionExiste) {
            return res.status(404).json({msg: `No existe inscripción con ID ${inscripcion}`});
        }

        if (inscripcionExiste.estudiante.toString() !== req.estudianteHeader._id.toString()) {
            return res.status(403).json({
                msg: "No tienes permiso para solicitar uniforme para esta inscripción"
            });
        }

        if (inscripcionExiste.estado !== 'Aprobada') {
            return res.status(400).json({
                msg: `La inscripción está ${inscripcionExiste.estado}. Solo puedes solicitar uniforme cuando sea aprobada.`
            });
        }

        const deporteId = inscripcionExiste.deporte._id;
        const precioUniforme = inscripcionExiste.deporte.precioUniforme;

        if (!precioUniforme || precioUniforme <= 0) {
            return res.status(400).json({msg: "El deporte no tiene un precio de uniforme establecido"});
        }

        const uniformeExiste = await Uniforme.findOne({ 
            inscripcion: inscripcion,
            estadoUniforme: true 
        });

        if (uniformeExiste) {
            return res.status(400).json({msg: "Ya existe uniforme para esta inscripción"});
        }

        const nuevoUniforme = new Uniforme({
            nombre,
            detalle,
            talla,
            precioUniforme: precioUniforme,
            inscripcion: inscripcion,
            estudiante: req.estudianteHeader._id,
            deporte: deporteId  
        });
        
        await nuevoUniforme.save();

        return res.status(201).json({  msg: "Uniforme registrada con éxito "});

    } catch (error) {
        console.error(error);
        res.status(500).json({  msg: `❌ Error en el servidor - ${error.message}`
        });
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



const actualizarPrecioUniforme = async (req, res) => {
    try {
        const { directorId } = req.params;
        const { precioUniforme } = req.body;

        if (!precioUniforme || precioUniforme <= 0) {
            return res.status(400).json({
                msg: "Debes proporcionar un precio válido"
            });
        }

        const director = await Director.findByIdAndUpdate(
            directorId,
            { precioUniforme },
            { new: true }
        );

        if (!director) {
            return res.status(404).json({msg: "Director no encontrado"});
        }

        await res.status(200).json({msg: "Precio de uniforme actualizado exitosamente"});

    } catch (error) {
        console.error(error);
        res.status(500).json({msg: `❌ Error en el servidor - ${error.message}`});
    }
};



const actualizarTallaUniforme = async (req, res) => {
    try {
        const { id } = req.params;
        const { talla } = req.body;

        if (!talla) {
            return res.status(400).json({msg: "Debes proporcionar una talla"});
        }

        const uniforme = await Uniforme.findById(id);

        if (!uniforme) {
            return res.status(404).json({msg: "Uniforme no encontrado"});
        }

        if (uniforme.estadoPago === 'Pagado') {
            return res.status(400).json({msg: "No puedes cambiar la talla de un uniforme ya pagado"
            });
        }

        uniforme.talla = talla;
        await uniforme.save();

        return res.status(200).json({
            msg: "Talla actualizada exitosamente",
            uniforme
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({msg: `❌ Error en el servidor - ${error.message}`});
    }
};


const pagarUniforme = async (req, res) => {
    try {
        const { paymentMethodId, uniformeId, motivo } = req.body;
        
        const uniforme = await Uniforme.findById(uniformeId)
            .populate({
                path: 'inscripcion',
                populate: {
                    path: 'estudiante'
                }
            })
            .populate('director');

        if (!uniforme) 
            return res.status(404).json({ message: "Uniforme no encontrado" });

        if (uniforme.estadoPago === "Pagado") 
            return res.status(400).json({ message: "Este uniforme ya fue pagado" });

        if (uniforme.talla === 'Por definir') 
            return res.status(400).json({ 
                message: "Debes seleccionar una talla antes de realizar el pago" 
            });

        if (!paymentMethodId) 
            return res.status(400).json({ message: "paymentMethodId no proporcionado" });

        const cantidad = uniforme.precio * 100; 
        const estudiante = uniforme.inscripcion.estudiante;

        const clienteStripe = await stripe.customers.create({
            name: estudiante.nombreEstudiante,   
            email: estudiante.emailEstudiante
        });

        const payment = await stripe.paymentIntents.create({
            amount: cantidad,
            currency: "usd",
            description: motivo || `Pago de uniforme talla ${uniforme.talla}`,
            payment_method: paymentMethodId,
            confirm: true,
            customer: clienteStripe.id,
            receipt_email: estudiante.emailEstudiante,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never"
            }
        });

        if (payment.status === "succeeded") {
            uniforme.estadoPago = "Pagado";
            await uniforme.save();
            
            return res.status(200).json({ 
                msg: "El pago se realizó exitosamente",
                monto: uniforme.precio,
                talla: uniforme.talla
            });
        } else {
            return res.status(400).json({ 
                msg: `El pago no se completó: ${payment.status}` 
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: `❌ Error al intentar pagar el uniforme - ${error.message}` 
        });
    }
};

const listarUniformeEstudiante = async (req, res) => {
    try {
        const uniformes = await Uniforme.find({ 
            estudiante: req.estudianteHeader._id 
        })
        .select("-__v")
        .populate('deporte', 'nombre  detalle precioUniforme');

        res.status(200).json(uniformes);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener tus uniformes" });
    }
}


export {
    registrarUniforme,
    eliminarUniforme,
    pagarUniforme,
    actualizarTallaUniforme,
    actualizarPrecioUniforme,
    listarUniformeEstudiante
}



