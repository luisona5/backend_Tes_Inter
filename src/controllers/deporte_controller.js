import Sport from '../models/sport.js';
import Categoria from '../models/categoria.js';
import mongoose from 'mongoose';
import { capitalize } from '../config/formato.js';

// --- FUNCIÓN PARA OBTENER LA HORA REAL DE ECUADOR EN CUALQUIER SERVIDOR ---
const obtenerFechaEcuador = () => {
    // Obtenemos la fecha actual en formato de Ecuador
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
    
    // Retornamos un objeto Date basado exactamente en la hora de Ecuador
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

        if (cupo <= 0) {
            return res.status(400).json({ msg: "No puedes registrar cupos con valores negativos" });
        }

        // PROCESAMIENTO DE FECHAS (Input del usuario)
        const [yi, mi, di] = fechaInicio.split("-");
        const inicioDate = new Date(yi, mi - 1, di);
        inicioDate.setHours(0, 0, 0, 0);

        const [yf, mf, df] = fechaFin.split("-");
        const finDate = new Date(yf, mf - 1, df);
        finDate.setHours(0, 0, 0, 0);

        const [y, m, d] = EntrenamientoDia.split("-");
        const diaDate = new Date(y, m - 1, d);
        diaDate.setHours(0, 0, 0, 0);

        // HORA ACTUAL DE ECUADOR (Ajuste para Vercel)
        const ahoraEcuador = obtenerFechaEcuador();
        const hoyEcuador = new Date(ahoraEcuador);
        hoyEcuador.setHours(0, 0, 0, 0);

        // VALIDACIONES DE FECHAS
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

        // VALIDACIÓN DE HORA (Solo si el inicio es hoy)
        const [hiH, hiM] = horaInicio.split(":").map(Number);
        const minutosInicio = hiH * 60 + hiM;
        const horaActualEcuadorMinutos = ahoraEcuador.getHours() * 60 + ahoraEcuador.getMinutes();

        if (inicioDate.getTime() === hoyEcuador.getTime() && minutosInicio < horaActualEcuadorMinutos) {
            const horaFormateada = `${ahoraEcuador.getHours().toString().padStart(2, '0')}:${ahoraEcuador.getMinutes().toString().padStart(2, '0')}`;
            return res.status(400).json({ 
                msg: `La hora de inicio debe ser ${horaFormateada} o mayor (Hora Ecuador)` 
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

const actualizarDeporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaInicio, fechaFin, horaInicio, EntrenamientoDia, nombre, precioUniforme } = req.body;

        if (Object.values(req.body).includes("")) 
            return res.status(400).json({ msg: "Debes llenar todos los campos" });

        if (!mongoose.Types.ObjectId.isValid(id)) 
            return res.status(404).json({ msg: `No existe el Deporte ${id}` });

        // Ajuste de fecha de Ecuador para la validación
        const ahoraEcuador = obtenerFechaEcuador();
        const hoyEcuador = new Date(ahoraEcuador);
        hoyEcuador.setHours(0, 0, 0, 0);

        const [yi, mi, di] = fechaInicio.split("-");
        const inicioDate = new Date(yi, mi - 1, di);
        inicioDate.setHours(0, 0, 0, 0);

        if (inicioDate < hoyEcuador) {
            return res.status(400).json({ msg: "La fecha de inicio no puede ser menor a la fecha actual de Ecuador" });
        }

        const datosActuales = {
            ...req.body,
            precioUniforme: precioUniforme || 0,
            nombre: capitalize(nombre)
        };

        await Sport.findByIdAndUpdate(id, datosActuales, { new: true });
        res.status(200).json({ msg: "Actualización exitosa del Deporte" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};

const listarDeporte = async (req, res) => {
    try {
        const deportes = await Sport.find({ estadoDeporte: true })
            .select(" -createdAt -updatedAt -__v")
            .populate('director', '_id nombreDirector apellidoDirector')
            .populate('categoria', 'nombre descripcion');
        res.status(200).json(deportes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` });
    }
};

const detalleDeporte = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) 
            return res.status(404).json({ msg: `No existe el Deporte ${id}` });

        const deporte = await Sport.findById(id).select("-createdAt -updatedAt -__v")
            .populate('director', '_id nombreDirector apellidoDirector')
            .populate('categoria', '_id nombre descripcion');
        res.status(200).json(deporte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` });
    }
};

const eliminarDeporte = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) 
            return res.status(404).json({ msg: `No existe el Deporte ${id}` });
        
        const deporte = await Sport.findById(id);
        if (!deporte) return res.status(404).json({ msg: "Deporte no encontrado" });
        
        if (deporte.director.toString() !== req.directorHeader._id.toString()) {
            return res.status(403).json({ msg: "No tienes permiso para eliminar este deporte" });
        }

        await Sport.findByIdAndUpdate(id, { estadoDeporte: false });
        res.status(200).json({ msg: "Deporte eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};

const listarDeportesDisponibles = async (req, res) => {
    try {
        const deportes = await Sport.find({ estadoDeporte: true })
            .select("-createdAt -updatedAt -__v")
            .populate('director', 'nombreDirector apellidoDirector');
        res.status(200).json(deportes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` });
    }
};

export {
    obtenerCategorias,
    registrarDeporte,
    listarDeporte,
    detalleDeporte,
    eliminarDeporte,
    actualizarDeporte,
    listarDeportesDisponibles
};