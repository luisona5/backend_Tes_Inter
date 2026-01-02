import mongoose, { Schema, model } from 'mongoose';

const inscripcionDeporteSchema = new Schema({
    cedula:{
        type:String,
        required:true,
        trim:true,
    },
    nombre:{
        type:String,
        required:true,
        trim:true
    },
    apellido:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    direccion:{
        type:String,
        required:true,
        default:null

    },
    telefono:{
        type:String,
        required:true,
        trim:true
    },
    
    fechaInscripcion: {
        type: Date,
        default: Date.now
    },
    
    informacionMedica: {
        alergias: {
            type: String,
            default: 'Ninguna',
            trim: true
        },
        estadoSalud: {
            type: String,
            default: 'Bueno',
            trim: true
        },
        medicamentos: {
            type: String,
            default: 'Ninguno',
            trim: true
        },
        condicionesMedicas: {
            type: String,
            default: 'Ninguna',
            trim: true
        }
    },
    
    contactoEmergencia: {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        telefono: {
            type: String,
            required: true,
            trim: true
        },
        relacion: {
            type: String,
            required: true,
            enum: ['Padre', 'Madre', 'Hermano/a', 'Tío/a', 'Abuelo/a', 'Otro'],
            trim: true
        }
    },
    
    estado: {
        type: String,
        enum: ['Pendiente', 'Aprobada', 'Rechazada'],
        default: 'Pendiente'
    },

    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
    },
    deporte: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deporte',
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
    },
    uniforme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Uniforme',
    },
    aprobacion: {
        aprobadoPor: {
            type: String,  
            default: null
        },
        fechaAprobacion: Date,
        comentarios: String
    },
    
    // ====== DATOS ACTIVOS ======
    estadoInscripcion: {
        type: Boolean,
        default: true
    }
    
}, {
    timestamps: true
});

// para evitar inscripciones duplicadas
inscripcionDeporteSchema.index({ estudiante: 1, deporte: 1, estadoInscripcion: 1 }, { unique: true });

export default model('Inscripcion', inscripcionDeporteSchema);