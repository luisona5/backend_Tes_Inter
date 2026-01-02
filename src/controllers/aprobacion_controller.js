// controllers/director_controller.js
import Inscripcion from '../models/inscripcion.js'
import Sport from '../models/sport.js'
import mongoose from 'mongoose';

const inscripcionesPendientes = async (req, res) => {
  try {

    const inscripciones = await Inscripcion.find({ director: req.directorHeader._id,
                                                   estado: 'Pendiente',
                                                   estadoInscripcion: true
                                                 })
    .populate('estudiante', 'nombreEstudiante apellidoEstudiante emailEstudiante cedulaEstudiante')
    .populate({
      path: 'deporte',
      select: 'nombre categoria cupo lugar',
      populate: { path: 'categoria', select: 'nombre' }
    })
    .sort({ fechaInscripcion: -1 });

    res.status(200).json({
      msg: "Inscripciones pendientes",
      cantidad: inscripciones.length,
      inscripciones
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error en el servidor - ${error.message}` });
  }
};


const aprobarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    // Validar que el director está autenticado
    if (!req.directorHeader || !req.directorHeader._id) {
      return res.status(401).json({ msg: "Director no identificado" });
    }

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID de inscripción inválido: ${id}` });
    }

    // Buscar la inscripción
    const inscripcion = await Inscripcion.findById(id).populate('deporte');

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // Verificar que la inscripción está pendiente
    if (inscripcion.estado !== 'Pendiente') {
      return res.status(400).json({  msg: `La inscripción ya fue ${inscripcion.estado.toLowerCase()}` });
    }

    // Verificar cupos disponibles
    const inscripcionesAprobadas = await Inscripcion.countDocuments({
      deporte: inscripcion.deporte._id,
      estado: { $in: ['Aprobada', 'Activa'] },
      estadoInscripcion: true
    });

    if (inscripcionesAprobadas >= inscripcion.deporte.cupo) {
      return res.status(400).json({ msg: "No hay cupos disponibles para aprobar esta inscripción"});
    }

    // Nombre completo del director que aprueba
    const nombreDirector = `${req.directorHeader.nombreDirector} ${req.directorHeader.apellidoDirector}`;

    // Aprobar la inscripción
    await Inscripcion.findByIdAndUpdate(id, {
      estado: 'Aprobada',
      'aprobacion.aprobadoPor': nombreDirector, 
      'aprobacion.fechaAprobacion': new Date(),
      'aprobacion.comentarios': comentarios || ''
    });

    return res.status(200).json({ msg: "Inscripción aprobada exitosamente"});

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      msg: `❌ Error en el servidor - ${error.message}` 
    });
  }
};



const rechazarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body; 

    if (!req.directorHeader || !req.directorHeader._id) {
      return res.status(401).json({ msg: "Director no identificado" });
    }

    // Validar que se proporcione un motivo
    if (!motivo || motivo.trim() === '') {
      return res.status(400).json({ msg: "Debes proporcionar un motivo para el rechazo" });
    }

    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID de inscripción inválido: ${id}` });
    }

    // Buscar la inscripción
    const inscripcion = await Inscripcion.findById(id).populate('deporte');

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

  
    // Verificar que la inscripción está pendiente
    if (inscripcion.estado !== 'Pendiente') {
      return res.status(400).json({ msg: `La inscripción ya fue ${inscripcion.estado.toLowerCase()}`});
    }

    const nombreDirector = `${req.directorHeader.nombreDirector} ${req.directorHeader.apellidoDirector}`;

    // Rechazar la inscripción
    await Inscripcion.findByIdAndUpdate(id, {
      estado: 'Rechazada',
      'aprobacion.aprobadoPor': nombreDirector,
      'aprobacion.fechaAprobacion': new Date(),
      'aprobacion.comentarios': motivo
    });

    return res.status(200).json({ msg: "Inscripción rechazada exitosamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error en el servidor - ${error.message}` });
  }
};




const inscripcionesPorDeporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.query; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID de deporte inválido: ${id}` });
    }
    // Verificar que el deporte existe 
    const deporte = await Sport.findById(id);

    if (!deporte) {
      return res.status(404).json({ msg: "Deporte no encontrado" });
    }

    // Construir filtro
    const filtro = {
      deporte: id,
      estadoInscripcion: true
    };

    if (estado) {
      filtro.estado = estado;
    }

    // Obtener inscripciones
    const inscripciones = await Inscripcion.find(filtro)
      .populate('estudiante', 'nombreEstudiante apellidoEstudiante emailEstudiante cedulaEstudiante')
      .populate('aprobacion.aprobadoPor', 'nombreDirector apellidoDirector')
      .sort({ fechaInscripcion: -1 });

    res.status(200).json({
      cantidad: inscripciones.length,
      inscripciones
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error en el servidor - ${error.message}` });
  }
};


export {
  inscripcionesPendientes,
  aprobarInscripcion,
  rechazarInscripcion,
  inscripcionesPorDeporte
  
};