import Uniforme from "../models/uniforme.js"
import mongoose from "mongoose"
import Inscripcion from "../models/inscripcion.js"


const registrarUniforme = async (req, res) => {
    try {
        const { inscripcion, nombre, detalle, talla } = req.body;

        if (!req.estudianteHeader || !req.estudianteHeader._id) {
            return res.status(401).json({ msg: "Usuario no autenticado" });
        }

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
        });

        if (uniformeExiste) {
            return res.status(400).json({
                msg: "Ya existe un uniforme registrado para esta inscripción",
            });
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

        const uniformeCompleto = await Uniforme.findById(nuevoUniforme._id)
            .populate('deporte', 'nombre detalle precioUniforme')
            .populate('inscripcion', 'estado');

        return res.status(201).json({  msg: "Uniforme registrado con éxito",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({  
            msg: `❌ Error en el servidor - ${error.message}`
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



const listarUniformeEstudiante = async (req, res) => {
    try {
        // Obtener el ID del estudiante desde el token
        if (!req.estudianteHeader || !req.estudianteHeader._id) {
            return res.status(401).json({ msg: "Usuario no autenticado" });
        }

        const estudianteId = req.estudianteHeader._id;
        
        const uniformes = await Uniforme.find({ 
            estudiante: estudianteId 
        })
        .select("-__v")
        .populate('deporte', 'nombre detalle precioUniforme')
        .populate({
            path: 'inscripcion',
            select: 'nombre apellido cedula estado',
            match: { estado: 'Aprobada' } 
        })
        .sort({ createdAt: -1 });

        const uniformesConInscripcion = uniformes.filter(u => u.inscripcion !== null);

        res.status(200).json(uniformesConInscripcion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener uniformes del estudiante" });
    }
}

const listarUniformeParaDirector = async (req, res) => {
    try {
        const { estudianteId } = req.params; 
        
        
        const uniformes = await Uniforme.find({ estudiante: estudianteId })
                                       .populate('deporte','nombre detalle precioUniforme'); 

        res.status(200).json(uniformes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener uniformes del estudiante" });
    }
};

const obtenerUniformePorInscripcion = async (req, res) => {
    try {
        const { inscripcionId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(inscripcionId)) {
            return res.status(400).json({ msg: "ID de inscripción inválido" });
        }

        const uniforme = await Uniforme.findOne({ inscripcion: inscripcionId })
            .select("-__v")
            .populate('deporte', 'nombre detalle precioUniforme')
            .populate({
                path: 'inscripcion',
                select: 'nombre apellido cedula estado',
            })
            .populate('estudiante', 'nombre apellido cedula');

        

        res.status(200).json(uniforme);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: "Error al obtener el uniforme de la inscripción" 
        });
    }
};
export {
    registrarUniforme,
    eliminarUniforme,
    listarUniformeEstudiante,
    listarUniformeParaDirector,
    obtenerUniformePorInscripcion
}