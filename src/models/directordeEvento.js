import mongoose, {Schema,model} from 'mongoose'
import bcrypt from "bcryptjs"

const directorSchema = new Schema({

   cedulaDirector:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    nombreDirector:{
        type:String,
        required:true,
        trim:true
    },
    apellidoDirector:{
        type:String,
        required:true,
        trim:true
    },
    emailDirector:{
        type:String,
        required:true,
        trim:true,
        unique: true
    },
    passwordDirector:{
        type:String,
        required:true,
        default:null

    },
    telefonoDirector:{
        type:String,
        required:true,
        trim:true
    },
    
    estadoDirector:{
        type:Boolean,
        default:true
    },
    token:{
        type:String,
        default:null
    },
    rol:{
        type:String,
        default:"Director_de_evento"
    },
    Administrador:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Administrator'
    }
},{
    timestamps:true
})


// Método para cifrar el password
directorSchema.methods.encryptPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}


// Método para verificar si el password es el mismo de la BDD
directorSchema.methods.matchPassword = async function(password){
    return bcrypt.compare(password, this.passwordDirector)
}


export default model('Director',directorSchema)