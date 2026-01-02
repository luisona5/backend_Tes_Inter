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
    horario:{
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
    
    estadoDeporte:{
        type: Boolean,
        default: true
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
    