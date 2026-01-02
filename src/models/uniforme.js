import mongoose, {Schema,model} from 'mongoose'

const uniformeSchema = new Schema({

    nombre:{
        type:String,
        required:true,
        trim:true
    },
    detalle:{
        type:String,
        required:true,
        trim:true
    },
    talla:{
        type:String,
        required:true,
        enum:['S','M','L','XL','XXL']
    },
    precio: {
        type: Number,
        required: true,
        min: 1
    },
    estadoPago: {
        type: String,
        enum: ['Pendiente', 'Pagado'],
        default: 'Pendiente'
    },
    
    inscripcion:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Inscripcion'
    },
    estudiante:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Estudiante'
    },

},{
    timestamps:true
})

export default model('Uniforme',uniformeSchema)