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
    precioUniforme: {  
        type: Number,
        required: true,
        min: 0
    },
    estadoUniforme:{

    },
    inscripcion:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Inscripcion'
    },
    estudiante:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Estudiante'
    },
    director:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Director'
    },
    deporte:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Deporte'
    }
    

},{
    timestamps:true
})

export default model('Uniforme',uniformeSchema)