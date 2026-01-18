import mongoose, {Schema,model} from 'mongoose'

const deporteSchema = new Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    detalle:{
        type: String,
        required: true,
        trim: true
    },
    categoria:{
        type: String,
        required: true,
        trim: true
    },
    fechaInicio:{
        type: Date,
        trim: true
    },
     fechaFin:{
        type: Date,
        trim: true
    },
    horaInicio:{
        type: String,
        trim: true
    },
    horaFin:{
        type: String,
        trim: true
    },
    lugar:{
        type: String,
        trim: true
    },
    cupo:{
        type: Number,
        default: 0
    },
    EntrenamientoDia:{
        type: Date,
        trim: true
    },
    EntrenamientoHora:{
        type: String,
        trim: true
    },
    estadoDeporte:{
        type: Boolean,
        default: true
    },
     precioUniforme: {
        type: Number,
        default: 0,
        required: true
    },
    director:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Director'
    },
    categoria:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Categoria'
    },
   
},{
    timestamps: true
})



export default mongoose.models.Deporte || mongoose.model('Deporte', deporteSchema);
    