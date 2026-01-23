import Sport from '../models/sport.js';
import Inscripcion from '../models/inscripcion.js';
import Estudiante from '../models/student.js';
import Categoria from '../models/categoria.js';
import Director from '../models/directordeEvento.js';
import mongoose from 'mongoose';


const obtenerEstadisticasDirector = async (req, res) => {
    
    try {

        if (!req.directorHeader || req.directorHeader.rol !== 'Director') {
            return res.status(403).json({ 
                msg: 'Acceso denegado. Se requieren permisos de Director.' 
            });
        }

        const [
            totalEstudiantes,
            estudiantesActivos,
            totalDeportes,
            deportesActivos,
            totalCategorias,
            categoriasActivas,
            totalInscripciones,
            inscripcionesAprobadas,
            inscripcionesPendientes
        ] = await Promise.all([
            Estudiante.countDocuments(),
            Estudiante.countDocuments({ status: 'Activo' }),
            
           
            Sport.countDocuments(),
            Sport.countDocuments({ estadoDeporte: true }),
            
            Categoria.countDocuments(),
            Categoria.countDocuments({ estadoCategoria: true }),
            
            Inscripcion.countDocuments(),
            Inscripcion.countDocuments({ estado: 'Aprobada' }),
            Inscripcion.countDocuments({ estado: 'Pendiente' })
        ]);

        // 3. Cálculos adicionales
        const estudiantesInactivos = totalEstudiantes - estudiantesActivos;
        const deportesInactivos = totalDeportes - deportesActivos;
        const categoriasInactivas = totalCategorias - categoriasActivas;
        const inscripcionesRechazadas = totalInscripciones - inscripcionesAprobadas - inscripcionesPendientes;

        // 4. Cálculo de cupos
        console.log("🎯 Calculando cupos...");
        const deportesActivosList = await Sport.find({ estadoDeporte: true }).select('cupo cuposOcupados');
        const cuposTotales = deportesActivosList.reduce((sum, d) => sum + (d.cupo || 0), 0);
        const cuposOcupados = deportesActivosList.reduce((sum, d) => sum + (d.cuposOcupados || 0), 0);
        const cuposDisponibles = Math.max(0, cuposTotales - cuposOcupados);

        // 5. Preparar respuesta
        const fechaConsulta = new Date();
        
        const estadisticas = {
            estudiantes: {
                total: totalEstudiantes || 0,
                activos: estudiantesActivos || 0,
                inactivos: estudiantesInactivos || 0,
                
            },
            
            deportes: {
                total: totalDeportes || 0,
                activos: deportesActivos || 0,
                inactivos: deportesInactivos || 0,
               
            },
            categorias: {
                total: totalCategorias || 0,
                activas: categoriasActivas || 0,
                inactivas: categoriasInactivas || 0
            },
            inscripciones: {
                total: totalInscripciones || 0,
                aprobadas: inscripcionesAprobadas || 0,
                pendientes: inscripcionesPendientes || 0,
                rechazadas: inscripcionesRechazadas || 0
            },
            cupos: {
                total: cuposTotales || 0,
                ocupados: cuposOcupados || 0,
                disponibles: cuposDisponibles || 0,
                
            }
            
        };

        res.status(200).json(estadisticas);

    } catch (error) {
        console.log(`❌ Error en el servidor: ${error.message}`);
        console.error("Stack:", error.stack);
        
        res.status(500).json({ 
            msg: 'Error al obtener estadísticas',
            error: error.message 
        });
    }
};







const obtenerEstadisticasAdmin = async (req, res) => {
    
    try {
        // 1. Verificar autenticación y permisos
        if (!req.administratorHeader || req.administratorHeader.rol !== 'Administrador') {
            return res.status(403).json({ 
                msg: 'Acceso denegado. Se requieren permisos de administrador.' 
            });
        }

        // 2. Consultas en paralelo
        const [
            totalEstudiantes,
            estudiantesActivos,
            totalDirectores, 
            directoresActivos,
            totalDeportes,
            deportesActivos,
            totalCategorias,
            categoriasActivas,
            totalInscripciones,
            inscripcionesAprobadas,
            inscripcionesPendientes
        ] = await Promise.all([
            Estudiante.countDocuments(),
            Estudiante.countDocuments({ status: 'Activo' }),
            
            Director.countDocuments(),
            Director.countDocuments({ status: 'Activo' }),
            
            Sport.countDocuments(),
            Sport.countDocuments({ estadoDeporte: true }),
            
            Categoria.countDocuments(),
            Categoria.countDocuments({ estadoCategoria: true }),
            
            Inscripcion.countDocuments(),
            Inscripcion.countDocuments({ estado: 'Aprobada' }),
            Inscripcion.countDocuments({ estado: 'Pendiente' })
        ]);

        // 3. Cálculos adicionales
        const estudiantesInactivos = totalEstudiantes - estudiantesActivos;
        const directoresInactivos = totalDirectores - directoresActivos;
        const deportesInactivos = totalDeportes - deportesActivos;
        const categoriasInactivas = totalCategorias - categoriasActivas;
        const inscripcionesRechazadas = totalInscripciones - inscripcionesAprobadas - inscripcionesPendientes;

        // 4. Cálculo de cupos
        console.log("🎯 Calculando cupos...");
        const deportesActivosList = await Sport.find({ estadoDeporte: true }).select('cupo cuposOcupados');
        const cuposTotales = deportesActivosList.reduce((sum, d) => sum + (d.cupo || 0), 0);
        const cuposOcupados = deportesActivosList.reduce((sum, d) => sum + (d.cuposOcupados || 0), 0);
        const cuposDisponibles = Math.max(0, cuposTotales - cuposOcupados);

        // 5. Preparar respuesta
        const fechaConsulta = new Date();
        
        const estadisticas = {
            estudiantes: {
                total: totalEstudiantes || 0,
                activos: estudiantesActivos || 0,
                inactivos: estudiantesInactivos || 0,
                porcentajeActivos: totalEstudiantes > 0 ? 
                    Math.round((estudiantesActivos / totalEstudiantes) * 100) : 0
            },
            directores: {
                total: totalDirectores || 0,
                activos: directoresActivos || 0,
                inactivos: directoresInactivos || 0,
                porcentajeActivos: totalDirectores > 0 ? 
                    Math.round((directoresActivos / totalDirectores) * 100) : 0
            },
            deportes: {
                total: totalDeportes || 0,
                activos: deportesActivos || 0,
                inactivos: deportesInactivos || 0,
                porcentajeActivos: totalDeportes > 0 ? 
                    Math.round((deportesActivos / totalDeportes) * 100) : 0
            },
            categorias: {
                total: totalCategorias || 0,
                activas: categoriasActivas || 0,
                inactivas: categoriasInactivas || 0
            },
            inscripciones: {
                total: totalInscripciones || 0,
                aprobadas: inscripcionesAprobadas || 0,
                pendientes: inscripcionesPendientes || 0,
                rechazadas: inscripcionesRechazadas || 0
            },
            cupos: {
                total: cuposTotales || 0,
                ocupados: cuposOcupados || 0,
                disponibles: cuposDisponibles || 0,
                porcentajeOcupacion: cuposTotales > 0 ? 
                    Math.round((cuposOcupados / cuposTotales) * 100) : 0
            }
            
        };

        console.log("✅ Estadísticas generadas exitosamente");
        res.status(200).json(estadisticas);

    } catch (error) {
        console.log(`❌ Error en el servidor: ${error.message}`);
        console.error("Stack:", error.stack);
        
        res.status(500).json({ 
            msg: 'Error al obtener estadísticas',
            error: error.message 
        });
    }
};







export { obtenerEstadisticasDirector,
        obtenerEstadisticasAdmin
 };