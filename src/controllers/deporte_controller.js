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
    const { nombre, categoria, cupo, lugar,
        fechaInicio, fechaFin, horaInicio, horaFin, 
        EntrenamientoDia, EntrenamientoHora, precioUniforme} = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
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

    if (precioUniforme !== undefined && precioUniforme < 0) {
            return res.status(400).json({ msg: "El precio del uniforme debe ser mayor o igual a 0"});
        }

    // Validar que no falten valores
    if (!fechaInicio || !fechaFin || !horaInicio || !horaFin || !EntrenamientoDia || !EntrenamientoHora) {
      return res.status(400).json({ msg: "Faltan fechas u horas" });
    }

    // Parsear fechas
    const [yi, mi, di] = fechaInicio.split("-");
    const inicioDate = new Date(yi, mi - 1, di);
    
    const [yf, mf, df] = fechaFin.split("-");
    const finDate = new Date(yf, mf - 1, df);

    const [y, m, d] = EntrenamientoDia.split("-");
    const diaDate = new Date(y, m - 1, d);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (inicioDate < hoy) {
      return res.status(400).json({ msg: "La fecha de inicio debe ser hoy o una fecha futura" });
    }

    if (finDate < hoy) {
      return res.status(400).json({ msg: "La fecha de fin debe ser hoy o una fecha futura" });
    }

    if (finDate < inicioDate) {
      return res.status(400).json({ msg: "La fecha de fin debe ser igual o mayor que la fecha de inicio" });
    }

    if (finDate > diaDate) {
      return res.status(400).json({ msg: "La fecha de Entrenamiento debe ser mayor que la fecha fin" });
    }

   

    const [hiH, hiM] = horaInicio.split(":").map(Number);
    const [hfH, hfM] = horaFin.split(":").map(Number);
    const [hH, hM] = EntrenamientoHora.split(":").map(Number);

    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    const minutosInicio = hiH * 60 + hiM;
    const minutosFin = hfH * 60 + hfM;
    const minutosEntrenamiento = hH * 60 + hM;

    const fechaInicioHoy = (fechaInicio === hoy.toISOString().split("T")[0]);

    if (fechaInicioHoy) {
      if (minutosInicio < horaActual) {
        return res.status(400).json({ 
          msg: "La hora de inicio debe ser igual o mayor a la hora actual" 
        });
      }
    }

    if (minutosFin <= minutosInicio) {
      return res.status(400).json({ 
        msg: "La hora de fin debe ser mayor que la hora de inicio" 
      });
    }

    if (!minutosEntrenamiento || minutosEntrenamiento === 0) {
      return res.status(400).json({ 
        msg: "Debe elegir una hora válida para el entrenamiento" 
      });
    }


    const formato = {
      ...req.body,
      precioUniforme: precioUniforme || 0,
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
        .populate('categoria','nombre descripcion')

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
    const { fechaInicio, fechaFin, horaInicio, horaFin,nombre,EntrenamientoDia,EntrenamientoHora, precioUniforme } = req.body;

    if (Object.values(req.body).includes("")) 
      return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})

    if( !mongoose.Types.ObjectId.isValid(id) ) 
      return res.status(404).json({msg:`Lo sentimos, no existe el Deporte ${id}`})

    if (!fechaInicio || !fechaFin || !horaInicio || !horaFin || !EntrenamientoDia || !EntrenamientoHora) {
      return res.status(400).json({ msg: "Faltan fechas u horas" });
    }

     // Parsear fechas
    const [yi, mi, di] = fechaInicio.split("-");
    const inicioDate = new Date(yi, mi - 1, di);
    
    const [yf, mf, df] = fechaFin.split("-");
    const finDate = new Date(yf, mf - 1, df);

    const [y, m, d] = EntrenamientoDia.split("-");
    const diaDate = new Date(y, m - 1, d);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (inicioDate < hoy) {
      return res.status(400).json({ msg: "La fecha de inicio debe ser hoy o una fecha futura" });
    }

    if (finDate < hoy) {
      return res.status(400).json({ msg: "La fecha de fin debe ser hoy o una fecha futura" });
    }

    if (finDate < inicioDate) {
      return res.status(400).json({ msg: "La fecha de fin debe ser igual o mayor que la fecha de inicio" });
    }

    if (finDate > diaDate) {
      return res.status(400).json({ msg: "La fecha de Entrenamiento debe ser mayor que la fecha fin" });
    }

   

    const [hiH, hiM] = horaInicio.split(":").map(Number);
    const [hfH, hfM] = horaFin.split(":").map(Number);
    const [hH, hM] = EntrenamientoHora.split(":").map(Number);

    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

    const minutosInicio = hiH * 60 + hiM;
    const minutosFin = hfH * 60 + hfM;
    const minutosEntrenamiento = hH * 60 + hM;

    const fechaInicioHoy = (fechaInicio === hoy.toISOString().split("T")[0]);

    if (fechaInicioHoy) {
      if (minutosInicio < horaActual) {
        return res.status(400).json({ msg: "La hora de inicio debe ser igual o mayor a la hora actual" 
        });
      }
    }

    if (minutosFin <= minutosInicio) {
      return res.status(400).json({ msg: "La hora de fin debe ser mayor que la hora de inicio" 
      });
    }

    if (!minutosEntrenamiento || minutosEntrenamiento === 0) {
      return res.status(400).json({  msg: "Debe elegir una hora válida para el entrenamiento" 
      });
    }

    if (precioUniforme !== undefined && precioUniforme < 0) {
            return res.status(400).json({ msg: "El precio del uniforme debe ser mayor o igual a 0"
            });
        }


  const datosActuales = {
    ...req.body,
    precioUniforme ,
    nombre: capitalize(nombre)

}

    
    await Sport.findByIdAndUpdate(id, datosActuales, { new: true })
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