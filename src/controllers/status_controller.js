import Director from '../models/directordeEvento.js';
import Estudiante from '../models/student.js'; 

import mongoose from 'mongoose';

const cambiarStatusDirector = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ msg: `No existe el director ${id}` });
        }

        if (!['Activo', 'Inactivo'].includes(status)) {
            return res.status(400).json({ 
                msg: "Status inválido. Debe ser 'Activo' o 'Inactivo'" 
            });
        }

        const director = await Director.findById(id);
        
        if (!director) {
            return res.status(404).json({ msg: "Director no encontrado" });
        }

        if (director.administrador?.toString() !== req.administratorHeader._id.toString()) {
            return res.status(403).json({ msg: "No tienes permisos para modificar este director" 
            });
        }

        director.status = status;
        await director.save();

        res.status(200).json({
            msg: `Director ${status === 'Activo' ? 'activado' : 'Inactivo'} exitosamente`,
            director: {
                _id: director._id,
                nombreDirector: director.nombreDirector,
                apellidoDirector: director.apellidoDirector,
                status: director.status
            }
        });

    } catch (error) {
        res.status(500).json({ 
            msg: `❌ Error en el servidor - ${error.message}` 
        });
    }
};




const cambiarStatusEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ msg: `No existe el estudiante ${id}` });
        }

        // Validar status
        if (!['Activo', 'Inactivo'].includes(status)) {
            return res.status(400).json({ 
                msg: "Status inválido. Debe ser 'Activo' o 'Inactivo'" 
            });
        }

        const estudiante = await Estudiante.findById(id);
        
        if (!estudiante) {
            return res.status(404).json({ msg: "Estudiante no encontrado" });
        }

        const esAdministrador = req.administratorHeader?._id;
        const esDirector = req.directorHeader?._id;

        if (!esAdministrador && !esDirector) {
            return res.status(403).json({ 
                msg: "No tienes permisos para modificar estudiantes" 
            });
        }

        


        estudiante.status = status;
        await estudiante.save();

        res.status(200).json({
            msg: `Estudiante ${status === 'Activo' ? 'activado' : 'desactivado'} exitosamente`,
            estudiante: {
                _id: estudiante._id,
                nombreEstudiante: estudiante.nombreEstudiante,
                apellidoEstudiante: estudiante.apellidoEstudiante,
                status: estudiante.status
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            msg: `❌ Error en el servidor - ${error.message}` 
        });
    }
};

const obtenerEstadoEstudiante = async (req, res) => {
    try {
        // Obtener el ID del estudiante desde el token/header
        const estudianteId = req.estudianteHeader?._id;
        
        if (!estudianteId) {
            return res.status(401).json({ 
                msg: "No se pudo identificar al estudiante" 
            });
        }

        const estudiante = await Estudiante.findById(estudianteId)
            .select('nombreEstudiante apellidoEstudiante status cedulaEstudiante emailEstudiante');
        
        if (!estudiante) {
            return res.status(404).json({ 
                msg: "Estudiante no encontrado" 
            });
        }
        
        res.status(200).json({
            status: estudiante.status || 'Activo',
            nombre: estudiante.nombreEstudiante,
            apellido: estudiante.apellidoEstudiante,
            cedula: estudiante.cedulaEstudiante,
            email: estudiante.emailEstudiante
        });
        
    } catch (error) {
        console.error("Error al obtener estado del estudiante:", error);
        res.status(500).json({ 
            msg: `❌ Error en el servidor - ${error.message}` 
        });
    }
};




export {
    cambiarStatusDirector,
    cambiarStatusEstudiante
   
};