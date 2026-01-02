import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const CategoriaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,      
    trim: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  estadoCategoria:{
        type:Boolean,
        default:true
    },
   director:{
              type:mongoose.Schema.Types.ObjectId,
              ref:'Director'
  },

},{
    timestamps: true
});

export default model('Categoria', CategoriaSchema)
