import Inscripcion from '../models/inscripcion.js'
import Sport from '../models/sport.js'
import mongoose from 'mongoose';

const inscripcionesPendientes = async (req, res) => {
  try {
    if (!req.directorHeader || !req.directorHeader._id) {
      return res.status(401).json({ msg: "Director no identificado" });
    }

    const directorId = req.directorHeader._id;

    const deportesDelDirector = await Sport.find({ 
      director: directorId,
      estado: true 
    }).select('_id');

    if (deportesDelDirector.length === 0) {
      return res.status(200).json({
        msg: "No tienes deportes asignados",
        cantidad: 0,
        inscripciones: []
      });
    }

    const deporteIds = deportesDelDirector.map(d => d._id);

    const inscripciones = await Inscripcion.find({ 
      deporte: { $in: deporteIds },
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

    res.status(200).json({msg: "Inscripciones pendientes",cantidad: inscripciones.length,
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

    if (!req.directorHeader || !req.directorHeader._id) {
      return res.status(401).json({ msg: "Director no identificado" });
    }

    const directorId = req.directorHeader._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID de inscripción inválido: ${id}` });
    }

    const inscripcion = await Inscripcion.findById(id).populate('deporte');

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    if (!inscripcion.deporte.director) {
      return res.status(400).json({ msg: "Este deporte no tiene director asignado" });
    }

    

    if (!inscripcion.deporte.precioUniforme || inscripcion.deporte.precioUniforme <= 0) {
            return res.status(400).json({
                msg: `El deporte "${inscripcion.deporte.nombre}" no tiene un precio de uniforme establecido. Por favor, actualiza el deporte antes de aprobar inscripciones.`
            });
        }

    if (inscripcion.estado !== 'Pendiente') {
      return res.status(400).json({ 
        msg: `La inscripción ya fue ${inscripcion.estado.toLowerCase()}` 
      });
    }

    const inscripcionesAprobadas = await Inscripcion.countDocuments({
      deporte: inscripcion.deporte._id,
      estado: 'Aprobada',
      estadoInscripcion: true
    });

    if (inscripcionesAprobadas >= inscripcion.deporte.cupo) {
      return res.status(400).json({ 
        msg: "No hay cupos disponibles para aprobar esta inscripción" 
      });
    }

    const nombreDirector = `${req.directorHeader.nombreDirector} ${req.directorHeader.apellidoDirector}`;

    await Inscripcion.findByIdAndUpdate(id, {
      estado: 'Aprobada',
      'aprobacion.aprobadoPor': nombreDirector, 
      'aprobacion.fechaAprobacion': new Date(),
      'aprobacion.comentarios': comentarios || 'Inscripción aprobada'
    });

      return res.status(200).json({ msg: "Inscripción aprobada exitosamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error en el servidor - ${error.message}` 
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

    const directorId = req.directorHeader._id;

    if (!motivo || motivo.trim() === '') {
      return res.status(400).json({ 
        msg: "Debes proporcionar un motivo para rechazar la inscripción" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID de inscripción inválido: ${id}` });
    }

    // Buscar la inscripción
    const inscripcion = await Inscripcion.findById(id).populate('deporte');

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    if (!inscripcion.deporte.director) {
      return res.status(400).json({ msg: "Este deporte no tiene director asignado" });
    }

   

    if (inscripcion.estado !== 'Pendiente') {
      return res.status(400).json({ 
        msg: `La inscripción ya fue ${inscripcion.estado.toLowerCase()}`
      });
    }

    const nombreDirector = `${req.directorHeader.nombreDirector} ${req.directorHeader.apellidoDirector}`;

    await Inscripcion.findByIdAndUpdate(id, {
      estado: 'Rechazada',
      'aprobacion.aprobadoPor': nombreDirector,
      'aprobacion.fechaAprobacion': new Date(),
      'aprobacion.comentarios': motivo
    });

    return res.status(200).json({ 
      msg: "Inscripción rechazada exitosamente" 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      msg: `Error en el servidor - ${error.message}` 
    });
  }
};


const detalleInscripcion = async(req, res) => {
  try {
    const { id } = req.params;

    if (!req.directorHeader || !req.directorHeader._id) {
      return res.status(401).json({ msg: "Director no identificado" });
    }

    // ⭐ Ya no necesitas guardar el directorId si no lo vas a usar
    // const directorId = req.directorHeader._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID de la inscripción inválido` });
    }

    const inscripcion = await Inscripcion.findById(id)
      .select("-createdAt -updatedAt -__v")
      .populate('estudiante', '_id nombreEstudiante apellidoEstudiante emailEstudiante cedulaEstudiante')
      .populate('deporte', '_id nombre detalle fechaInicio horaInicio fechaFin horaFin lugar director EntrenamientoDia EntrenamientoHora precioUniforme')
      .populate('categoria', '_id nombre descripcion');

    if (!inscripcion) {
      return res.status(404).json({ msg: "Inscripción no encontrada" });
    }

    // ⭐ ELIMINA ESTA VALIDACIÓN - Ahora todos los directores pueden ver todas las inscripciones
    /*
    if (inscripcion.deporte.director.toString() !== directorId.toString()) {
      return res.status(403).json({ 
        msg: "No tienes permiso para ver esta inscripción. Solo puedes ver inscripciones de tus deportes." 
      });
    }
    */

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
      deporte: {
        _id: inscripcion.deporte._id,
        nombre: inscripcion.deporte.nombre,
        detalle: inscripcion.deporte.detalle,
        fechaInicio: inscripcion.deporte.fechaInicio,
        horaInicio: inscripcion.deporte.horaInicio,
        fechaFin: inscripcion.deporte.fechaFin,
        horaFin: inscripcion.deporte.horaFin,
        lugar: inscripcion.deporte.lugar,
        EntrenamientoDia: inscripcion.deporte.EntrenamientoDia,
        EntrenamientoHora: inscripcion.deporte.EntrenamientoHora,
        precioUniforme: inscripcion.deporte.precioUniforme 
      },
      categoria: inscripcion.categoria,
      estado: inscripcion.estado,
      fechaInscripcion: inscripcion.fechaInscripcion,
      estadoInscripcion: inscripcion.estadoInscripcion,
      aprobacion: inscripcion.aprobacion
    };

    res.status(200).json(respuesta);

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      msg: `Error en el servidor - ${error.message}` 
    });
  }
};

export {
  inscripcionesPendientes,
  aprobarInscripcion,
  rechazarInscripcion,
  detalleInscripcion
};  