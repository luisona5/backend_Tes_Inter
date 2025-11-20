import Administrator from "../models/administrator.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import { sendMailToRecoveryPassword} from "../helpers/RecoveryPassword.js"


import mongoose from "mongoose"



const registro = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar que email y password no estén vacíos
    if (!email || !password) {
      return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" })
    }

    // Crear nueva instancia de administrador
    const nuevoAdmin = new Administrator(req.body)

    nuevoAdmin.password = await nuevoAdmin.encryptPassword(password)


    await nuevoAdmin.save()
    res.status(200).json({msg:`Administrador creado `})
    
  } catch (error) {
    res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
  }
}



const login = async(req,res)=>{

    try {
        const {email,password} = req.body

        if (Object.values(req.body).includes("")) 
          
          return res.status(404).json({msg:"Debes llenar todos los campos"})

        const AdministradorBDD = await Administrator.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
        if(!AdministradorBDD.email) 
          return res.status(404).json({msg:"Usuario o contraseña es incorrecto"})

        const verificarPassword = await AdministradorBDD.matchPassword(password)

        if(!verificarPassword) 
          return res.status(401).json({msg:"Usuario o contraseña es incorrecto"})

        const {_id,rol} = AdministradorBDD
        const token = crearTokenJWT(AdministradorBDD._id, AdministradorBDD.rol)

        res.status(200).json({
            rol,
            _id,
            //email:AdministradorBDD.email,
            token
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const perfil =(req,res)=>{

	const {tokem,email,createdAt,updatedAt,__v,...datosPerfil} = req.administratorHeader

    res.status(200).json(datosPerfil)
}



const actualizarPerfil = async (req,res)=>{

    try {
        const {id} = req.params
        const {nombre,apellido,cedula,telefono,email} = req.body

        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(400).json({msg:`ID inválido: ${id}`})


        const administradorBDD = await Administrator.findById(id)

        if(!administradorBDD) return res.status(404).json({ msg: `No existe el administrador ${id}` })

        if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Debes llenar todos los campos"})
        
        // validando el campo telefono par que tenga 10 numeros
        if (!/^\d{10}$/.test(telefono)) {
            return res.status(400).json({ msg: "El número de celular debe tener 10 dígitos" });
        }

        if (!/^\d{10}$/.test(cedula)) {
            return res.status(400).json({ msg: "La cedula debe tener 10 dígitos" });
        }
        
        administradorBDD.nombre = nombre ?? administradorBDD.nombre
        administradorBDD.cedula = cedula ?? administradorBDD.cedula
        administradorBDD.apellido = apellido ?? administradorBDD.apellido
        administradorBDD.telefono = telefono ?? administradorBDD.telefono
        administradorBDD.email = email ?? administradorBDD.email

        // Validar si los datos son los mismos
        if (
        administradorBDD.nombre == nombre &&
        administradorBDD.cedula == cedula &&
        administradorBDD.apellido == apellido &&
        administradorBDD.telefono == telefono &&
        administradorBDD.email == email 
        ) {
            return res.status(200).json({ msg: "No se realizaron cambios, los datos son los mismos." });
        }


        await administradorBDD.save()
        res.status(200).json(administradorBDD)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const actualizarPassword = async (req,res)=>{

    const administradorBDD = await Administrator.findById(req.administratorHeader._id)
    if(!administradorBDD) 
      return res.status(404).json({msg:`Lo sentimos, no existe el administrador ${id}`})


    const verificarPassword = await administradorBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) 
      return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    administradorBDD.password = await administradorBDD.encryptPassword(req.body.passwordnuevo)

    await administradorBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}

const recuperarPassword = async (req, res) => {

    try {
        const { email } = req.body

        if (!email) 
          return res.status(400).json({ msg: "Debes ingresar un correo electrónico" })

        const administradorBDD = await Administrator.findOne({ email })

        if (!administradorBDD) 
          return res.status(404).json({ msg: "El usuario no se encuentra registrado" })

        const token = administradorBDD.createToken()
        administradorBDD.token = token
        await sendMailToRecoveryPassword(email, token)
        await administradorBDD.save()
        res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })
        
    } catch (error) {
    console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const comprobarTokenPasword = async (req,res)=>{
    try {
        const {token} = req.params
        const administradorBDD = await Administrator.findOne({token})
        if(administradorBDD?.token !== token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
    
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const crearNuevoPassword = async (req,res)=>{

    try {
        const{password,confirmpassword} = req.body

        const { token } = req.params
        if (Object.values(req.body).includes("")) 
          return res.status(404).json({msg:"Debes llenar todos los campos"})

        if(password !== confirmpassword) 
          return res.status(404).json({msg:"Los passwords no coinciden"})

        const administradorBDD = await Administrator.findOne({token})

        if(!administradorBDD)
           return res.status(404).json({msg:"No se puede validar la cuenta"})

        administradorBDD.token = null
        administradorBDD.password = await administradorBDD.encryptPassword(password)

        await administradorBDD.save()
        res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



export {
  registro,
  login,
  perfil,
  actualizarPerfil,
  actualizarPassword,
  recuperarPassword,
  comprobarTokenPasword,
  crearNuevoPassword
}
