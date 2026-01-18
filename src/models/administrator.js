import { Schema, model } from "mongoose";  //organiza y guarda en la base de datos de manera estructurada
import bcrypt from 'bcryptjs'     // para proteger las contraseñas

const administratorSchema = new Schema({
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
    cedula:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    telefono:{
        type:String,
        trim:true,
        default:null
    },
    email:{
        type:String,
        required:true,
        trim:true,
		unique:true
    },
    password:{
        type:String,
        required:true
    },
    status: { 
    type: String, 
    enum: ['Activo', 'Inactivo'], 
    default: 'Activo' 
   },
    
    estadoAdministrador:{
        type:Boolean,
        default:true
    },
    token:{
        type:String,
        default:null
    },
    rol:{
        type:String,
        default:"Administrador"
    }

},{
    timestamps:true
})

// metodo para cifrar el password

administratorSchema.methods.encryptPassword = async function(password){
    const salt= await bcrypt.genSalt(10)    // para produccion se debe poner un factor de 12 o 14 
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password es el mismo de la BDD

administratorSchema.methods.matchPassword= async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response 
}

// Método para crear un token 

administratorSchema.methods.createToken= function(){
    const tokenGenerado=Math.random().toString(36).slice(2)
    this.token=tokenGenerado
    return tokenGenerado
}


export default model ('Administrator',administratorSchema)