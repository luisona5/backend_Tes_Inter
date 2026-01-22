import Sport from '../models/sport.js';
import Categoria from '../models/categoria.js';
import mongoose from 'mongoose';
import { capitalize } from '../config/formato.js';

const obtenerFechaEcuador = () => {
    const opciones = { 
        timeZone: 'America/Guayaquil', 
        year: 'numeric', month: 'numeric', day: 'numeric', 
        hour: 'numeric', minute: 'numeric', second: 'numeric', 
        hour12: false 
    };
    const formatter = new Intl.DateTimeFormat('en-US', opciones);
    const partes = formatter.formatToParts(new Date());
    
    const d = {};
    partes.forEach(({ type, value }) => d[type] = value);
    
    return new Date(d.year, d.month - 1, d.day, d.hour, d.minute, d.second);
};

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
            EntrenamientoDia, EntrenamientoHora, precioUniforme } = req.body;

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

        // --- PROCESAMIENTO DE FECHAS DE INPUT ---
        const [yi, mi, di] = fechaInicio.split("-");
        const inicioDate = new Date(yi, mi - 1, di);
        inicioDate.setHours(0, 0, 0, 0);

        const [yf, mf, df] = fechaFin.split("-");
        const finDate = new Date(yf, mf - 1, df);
        finDate.setHours(0, 0, 0, 0);

        const [y, m, d] = EntrenamientoDia.split("-");
        const diaDate = new Date(y, m - 1, d);
        diaDate.setHours(0, 0, 0, 0);

        // --- OBTENCIÓN DE HORA ACTUAL (ECUADOR) ---
        const ahoraEcuador = obtenerFechaEcuador();
        const hoyEcuador = new Date(ahoraEcuador);
        hoyEcuador.setHours(0, 0, 0, 0);

        // --- VALIDACIONES DE FECHAS ---
        if (inicioDate < hoyEcuador) {
            return res.status(400).json({ msg: "La fecha de inicio debe ser hoy o una fecha futura" });
        }

        if (finDate < hoyEcuador) {
            return res.status(400).json({ msg: "La fecha de fin debe ser hoy o una fecha futura" });
        }

        if (finDate < inicioDate) {
            return res.status(400).json({ msg: "La fecha de fin debe ser igual o mayor que la fecha de inicio" });
        }

        if (diaDate <= finDate) {
            return res.status(400).json({ msg: "La fecha de Entrenamiento debe ser mayor que la fecha fin" });
        }

        // --- VALIDACIÓN DE HORA INICIO (IGUAL O POSTERIOR A LA ACTUAL) ---
        const [hiH, hiM] = horaInicio.split(":").map(Number);
        const minutosElegidos = hiH * 60 + hiM;
        const minutosActuales = ahoraEcuador.getHours() * 60 + ahoraEcuador.getMinutes();

        // Solo validamos la hora si el deporte empieza el mismo día de hoy
        if (inicioDate.getTime() === hoyEcuador.getTime()) {
            if (minutosElegidos < minutosActuales) {
                const horaActualStr = `${ahoraEcuador.getHours().toString().padStart(2, '0')}:${ahoraEcuador.getMinutes().toString().padStart(2, '0')}`;
                return res.status(400).json({ 
                    msg: `La hora de inicio (${horaInicio}) ya pasó. Debe ser igual o posterior a la hora actual de Ecuador (${horaActualStr}).` 
                });
            }
        }

        // --- VALIDACIÓN DE HORA FIN (SI ES EL MISMO DÍA) ---
        const [hfH, hfM] = horaFin.split(":").map(Number);
        const minutosFin = hfH * 60 + hfM;

        if (inicioDate.getTime() === finDate.getTime() && minutosFin <= minutosInicio) {
            return res.status(400).json({ msg: "La hora de fin debe ser mayor que la hora de inicio" });
        }

        // --- GUARDADO ---
        const nuevoDeporte = new Sport({
            ...req.body,
            precioUniforme: precioUniforme || 0,
            nombre: capitalize(nombre),
            director: req.directorHeader._id 
        });

        await nuevoDeporte.save();
        return res.status(201).json({ msg: "Registro exitoso del deporte" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};

const actualizarDeporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaInicio, horaInicio, nombre, precioUniforme } = req.body;

        if (Object.values(req.body).includes("")) 
            return res.status(400).json({ msg: "Debes llenar todos los campos" });

        const ahoraEcuador = obtenerFechaEcuador();
        const hoyEcuador = new Date(ahoraEcuador);
        hoyEcuador.setHours(0, 0, 0, 0);

        const [yi, mi, di] = fechaInicio.split("-");
        const inicioDate = new Date(yi, mi - 1, di);
        inicioDate.setHours(0, 0, 0, 0);

        // Validación estricta de hora en actualización
        const [hiH, hiM] = horaInicio.split(":").map(Number);
        const minutosElegidos = hiH * 60 + hiM;
        const minutosActuales = ahoraEcuador.getHours() * 60 + ahoraEcuador.getMinutes();

        if (inicioDate < hoyEcuador) {
            return res.status(400).json({ msg: "La fecha de inicio no puede ser menor a la fecha actual" });
        }

        if (inicioDate.getTime() === hoyEcuador.getTime() && minutosElegidos < minutosActuales) {
            return res.status(400).json({ msg: "No puedes actualizar a una hora que ya pasó" });
        }

        await Sport.findByIdAndUpdate(id, {
            ...req.body,
            precioUniforme: precioUniforme || 0,
            nombre: capitalize(nombre)
        }, { new: true });

        res.status(200).json({ msg: "Actualización exitosa del Deporte" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};

// ... (El resto de funciones listarDeporte, detalleDeporte, eliminarDeporte permanecen igual)
const listarDeporte = async (req,res)=>{
    try {
        const deportes = await Sport.find({ estadoDeporte: true })
        .select(" -createdAt -updatedAt -__v")
        .populate('director','_id nombreDirector apellidoDirector')
        .populate('categoria','nombre descripcion')
        res.status(200).json(deportes)
    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const detalleDeporte = async(req,res)=>{
    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`No existe el Deporte ${id}`});
        const deporte = await Sport.findById(id).select("-createdAt -updatedAt -__v")
                                                .populate('director','_id nombreDirector apellidoDirector')
                                                .populate('categoria','_id nombre descripcion')
        res.status(200).json(deporte)
    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarDeporte = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:`No existe el Deporte ${id}`});
    const deporte = await Sport.findById(id);
    if (!deporte) return res.status(404).json({msg: "Deporte no encontrado"});
    if (deporte.director.toString() !== req.directorHeader._id.toString()) return res.status(403).json({msg: "No tienes permiso para eliminar este deporte"});
    await Sport.findByIdAndUpdate(id, {estadoDeporte: false});
    res.status(200).json({msg: "Deporte eliminado exitosamente"});
  } catch (error) {
    res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
};

const listarDeportesDisponibles = async (req, res) => {
    try {
        const deportes = await Sport.find({ estadoDeporte: true }).select("-createdAt -updatedAt -__v").populate('director', 'nombreDirector apellidoDirector')
        res.status(200).json(deportes)
    } catch (error) {
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