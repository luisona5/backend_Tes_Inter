import mongoose, { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs'     // para proteger las contraseñas


const EstudianteSchema = new Schema({
  nombreEstudiante: { 
    type: String,
    trim:true,
    required: true 

},apellidoEstudiante: { 
    type: String,
    trim:true,
    required: true 

},cedulaEstudiante: {
    type:String,
    required:true,
    trim:true,
    unique:true

  },emailEstudiante: { 
    type: String, 
    required: true, 
    unique: true, 
    trim:true,

},passwordEstudiante:{
    type:String,
    required:true

},telefonoEstudiante: { 
    type: String,
    required:true,
    trim:true 

},
  direccionEstudiante: {
    type: String,
    required:true,
    trim:true 


},carreraEstudiante: { 
    type: String,
    trim:true,
    required: true, 


},genero: { 
    type: String,
    trim:true,
    required: true, 


},status: { 
    type: String, 
    enum: ['activo', 'graduado', 'retirado', 'inactivo'], 
    default: 'activo' 

},
estadoEstudiante:{
        type:Boolean,
        default:true
    },
token:{
    type:String,
    default:null

},rol:{
    type:String,
    default:"Estudiante"

},

administrador:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Administrator'


},director:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Director'


},


},
{ timestamps: true }  
);


EstudianteSchema.methods.encryptPassword = async function(password){
    const salt= await bcrypt.genSalt(10)    // para produccion se debe poner un factor de 12 o 14 
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password es el mismo de la BDD

EstudianteSchema.methods.matchPassword= async function(password){
    const response = await bcrypt.compare(password,this.passwordEstudiante)
    return response 
}

// Método para crear un token 

EstudianteSchema.methods.createToken= function(){
    const tokenGenerado=Math.random().toString(36).slice(2)
    this.token=tokenGenerado
    return tokenGenerado
}


 
export default model('Estudiante', EstudianteSchema);
