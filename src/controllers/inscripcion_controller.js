import Inscripcion from '../models/inscripcion.js';
import Sport from '../models/sport.js';
import Estudiante from '../models/student.js';

import mongoose from 'mongoose';
import Uniforme from '../models/uniforme.js';


const registrarInscripcion = async (req, res) => {
  try {
    const { 
      cedula,
      nombre,
      apellido,
      email,
      direccion,
      telefono,
      deporte,
      informacionMedica,
      contactoEmergencia 
    } = req.body;

    if (!cedula || !nombre || !apellido || !email || !direccion || !telefono || !deporte || !contactoEmergencia) {
      return res.status(400).json({ msg: "Debes llenar todos los campos obligatorios" });
    }

    if (!contactoEmergencia.nombre || !contactoEmergencia.telefono || !contactoEmergencia.relacion) {
      return res.status(400).json({ 
        msg: "El contacto de emergencia debe incluir: nombre, teléfono y relación" 
      });
    }

    if (!/^\d{10}$/.test(cedula)) {
      return res.status(400).json({ msg: "La cédula debe tener exactamente 10 dígitos" });
    }

    if (!/^09\d{8}$/.test(telefono)) {
      return res.status(400).json({  msg: "El teléfono del estudiante debe tener formato válido (ejemplo: 0987654321)" });
    }

    if (!/^09\d{8}$/.test(contactoEmergencia.telefono)) {
      return res.status(400).json({ 
        msg: "El teléfono de emergencia debe tener formato válido (ejemplo: 0987654321)" 
      });
    }
    const dominio = "epn.edu.ec";
        
        if (!email.toLowerCase().endsWith(`@${dominio}`)) {
            return res.status(400).json({msg:`la inscripcion requiere de correo institucional.`});
        }

    const relacionesPermitidas = ['Padre', 'Madre', 'Hermano/a', 'Tío/a', 'Abuelo/a', 'Otro'];
    if (!relacionesPermitidas.includes(contactoEmergencia.relacion)) {
      return res.status(400).json({ 
        msg: `La relación debe ser una de: ${relacionesPermitidas.join(', ')}` 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(deporte)) {
      return res.status(400).json({ msg: "ID de deporte inválido" });
    }

    
    const deporteExiste = await Sport.findById(deporte).populate('categoria');
    
    if (!deporteExiste) {
      return res.status(404).json({ msg: "El deporte seleccionado no existe" });
    }

    if (!deporteExiste.estadoDeporte) {
      return res.status(400).json({ msg: "El deporte no está disponible actualmente" });
    }

    // cupos disponibles
    const inscritosActuales = await Inscripcion.countDocuments({ 
      deporte: deporte, 
      estadoInscripcion: true 
    });

    if (inscritosActuales >= deporteExiste.cupo) {
      return res.status(400).json({ 
        msg: "Lo sentimos, no hay cupos disponibles para este deporte" 
      });
    }

    const yaInscrito = await Inscripcion.findOne({
      cedula: cedula,
      deporte: deporte,
      estadoInscripcion: true
    });

    if (yaInscrito) {
      return res.status(400).json({ msg: "Ya existe una inscripción activa con esta cédula para este deporte" });
    }

    let estudianteId = null;
    
    if (req.estudianteHeader && req.estudianteHeader._id) {
      estudianteId = req.estudianteHeader._id;
    } 
    else {
      const estudianteExistente = await Estudiante.findOne({ cedulaEstudiante: cedula });
      if (estudianteExistente) {
        estudianteId = estudianteExistente._id;
      }
    }

    const nuevaInscripcion = new Inscripcion({
      ...req.body,
      deporte: deporteExiste._id,
      categoria: deporteExiste.categoria,  
      estudiante: estudianteId, 
      
    });

    await nuevaInscripcion.save();

    return res.status(201).json({ msg: "¡Inscripción realizada con éxito!"});

  } catch (error) {
    console.error( error);
    
    return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}`});
  }
};



const listarInscripciones = async (req, res) => {
    try {
        const inscripciones = 
        
        await Inscripcion.find({ estadoInscripcion: true, 
                              estudiante: req.estudianteHeader._id 
            })
        .select(" -createdAt -updatedAt -__v")
        .populate('estudiante','_id nombreEstudiante apellidoEstudiante')

        res.status(200).json(inscripciones)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const detalleInscripcion = async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({msg: `ID de la inscripcion inválido`});
        }

        const inscripcion = await Inscripcion.findById(id)
                                              .select("-createdAt -updatedAt -__v")
                                              .populate('estudiante', '_id nombreEstudiante apellidoEstudiante emailEstudiante cedulaEstudiante')
                                              .populate('deporte', '_id nombre descripcion')
                                              .populate('categoria', '_id nombre descripcion')

  
        const uniforme = await Uniforme.findOne({ 
            inscripcion: id,
            estadoUniforme: true 
        })
        .select("-createdAt -updatedAt -__v")

        const respuesta = {
            _id: inscripcion._id,
            cedula: inscripcion.cedula,
            nombre: inscripcion.nombre,
            apellido: inscripcion.apellido,
            email: inscripcion.email,
            direccion: inscripcion.direccion,
            telefono: inscripcion.telefono,
            informacionMedica: inscripcion.informacionMedica,
            contactoEmergencia: inscripcion.contactoEmergencia,
            deporte: inscripcion.deporte,
            categoria: inscripcion.categoria,
            estado: inscripcion.estado,
            fechaInscripcion: inscripcion.fechaInscripcion,
            estadoInscripcion: inscripcion.estadoInscripcion,
            uniforme: uniforme || null,
            aprobacion: inscripcion.aprobacion
        };

        res.status(200).json(respuesta);

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: `❌ Error en el servidor - ${error.message}` 
        });
    }
};


const eliminarInscripcion = async (req,res)=>{

    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe inscripcion ${id}`})

        await Inscripcion.findByIdAndUpdate(id,{estadoInscripcion:false})
        res.status(200).json({msg:"Inscripcion eliminado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



export {
    registrarInscripcion,
    listarInscripciones,
    detalleInscripcion,
    eliminarInscripcion
    
}
