import Sport from '../models/sport.js';
import  Categoria  from '../models/categoria.js';
import mongoose from 'mongoose';
import { capitalize } from '../config/formato.js';

const obtenerCategorias = async (req, res) => {
  try {
    const categoria = await Categoria.find({ estadoCategoria: true }); 
    return res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `❌ Error al obtener categorías - ${error.message}` });
  }
};

const registrarDeporte = async (req, res) => {
  try {
    const { nombre, categoria, cupo, lugar,fechaInicio,fechaFin,horaInicio,horaFin } = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    const formatoHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!formatoHora.test(horaInicio) || !formatoHora.test(horaFin)) {
      return res.status(400).json({ msg: "Formato de hora inválido. Usa HH:mm" });
    }

    const categoriaExiste = await Categoria.findById(categoria);
    if (!categoriaExiste) {
      return res.status(400).json({ msg: "La categoría seleccionada no existe" });
    }

    const deporteExiste = await Sport.findOne({ nombre });
    if (deporteExiste) {
      return res.status(400).json({ msg: "El Deporte ya se encuentra registrado" });
    }
    if(cupo <= 0){
      return res.status(400).json({ msg: "No puedes registrar cupos con valores negativos" });
    }
    if (!fechaInicio || !fechaFin || !horaInicio || !horaFin) {
  return res.status(400).json({ 
    msg: "El deporte no tiene fechas de inscripción configuradas correctamente" 
  });
  }

    const ahora = new Date();

    
    const fechaInicioStr = fechaInicio instanceof Date 
      ? fechaInicio.toISOString().split('T')[0] 
      : fechaInicio;

    const fechaFinStr = fechaFin instanceof Date 
      ? fechaFin.toISOString().split('T')[0] 
      : fechaFin;

    const inicioInscripcion = new Date(`${fechaInicioStr}T${horaInicio}:00`);
    const finInscripcion = new Date(`${fechaFinStr}T${horaFin}:00`);


    if (ahora < inicioInscripcion) {
      const fechaFormateada = inicioInscripcion.toLocaleDateString('es-EC', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return res.status(400).json({ 
        msg: `Las inscripciones para este deporte inician el ${fechaFormateada}` 
      });
    }

    // Validando si las inscripciones ya cerraron
    if (ahora > finInscripcion) {
      const fechaFormateada = finInscripcion.toLocaleDateString('es-EC', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return res.status(400).json({ 
        msg: `Las inscripciones para este deporte cerraron el ${fechaFormateada}` 
      });
    }

  
    
    const formato ={
      ...req.body,
      nombre: capitalize(nombre)
    }
    const nuevoDeporte = new Sport({
      ...formato,      
      director: req.directorHeader._id 

    });

    await nuevoDeporte.save();

    return res.status(201).json({ msg: "Registro exitoso del deporte" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
};



const listarDeporte = async (req,res)=>{
    try {
        const deportes = 
        
        await Sport.find({ estadoDeporte: true, 
                              director: req.directorHeader._id 
            })
        .select(" -createdAt -updatedAt -__v")
        .populate('director','_id nombreDirector apellidoDirector')
        .populate('categoria','nombre')

        res.status(200).json(deportes)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const detalleDeporte = async(req,res)=>{

    try {
        const {id} = req.params

        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe el Deporte ${id}`});

        const deporte = await Sport.findById(id).select("-createdAt -updatedAt -__v")
                                                .populate('director','_id nombreDirector apellidoDirector')
                                                .populate('categoria','_id nombre descripcion')
        res.status(200).json(deporte)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarDeporte = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) 
      return res.status(404).json({msg:`No existe el Deporte ${id}`});
    
    const deporte = await Sport.findById(id);
    if (!deporte) {
      return res.status(404).json({msg: "Deporte no encontrado"});
    }
    
      if (deporte.director.toString() !== req.directorHeader._id.toString()) {
      return res.status(403).json({msg: "No tienes permiso para eliminar este deporte"});
    }

    await Sport.findByIdAndUpdate(id, {estadoDeporte: false});
    res.status(200).json({msg: "Deporte eliminado exitosamente"});

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
};

const actualizarDeporte = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) 
      return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})

    if( !mongoose.Types.ObjectId.isValid(id) ) 
      return res.status(404).json({msg:`Lo sentimos, no existe el Deporte ${id}`})
    
    await Sport.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del Deporte"})


}

const listarDeportesDisponibles = async (req, res) => {
    try {
        const deportes = await Sport.find({ 
            estadoDeporte: true 
        })
        .select("-createdAt -updatedAt -__v")
        .populate('director', 'nombreDirector apellidoDirector')

        res.status(200).json(deportes)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

export{
    obtenerCategorias,
    registrarDeporte,
    listarDeporte,
    detalleDeporte,
    eliminarDeporte,
    actualizarDeporte,
    listarDeportesDisponibles
}