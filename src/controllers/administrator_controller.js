import Administrator from "../models/administrator.js"
import { crearTokenJWT } from "../middlewares/JWT.js"

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

    const token = nuevoAdmin.createToken()
    await nuevoAdmin.save()
    res.status(200).json({msg:`Administrador creado ${token}`})
    
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
        if(!AdministradorBDD) 
          return res.status(404).json({msg:"Usuario o contraseña es incorrecto"})

        if(!AdministradorBDD.email) 
          return res.status(403).json({msg:"Debes verificar tu cuenta antes de iniciar sesión"})

        const verificarPassword = await AdministradorBDD.matchPassword(password)

        if(!verificarPassword) 
          return res.status(401).json({msg:"Usuario o contraseña es incorrecto"})

        const {nombre,apellido,cedula,telefono,_id} = AdministradorBDD
        const token = crearTokenJWT(AdministradorBDD._id, AdministradorBDD.rol)

        res.status(200).json({
            _id,
            nombre,
            apellido,
            cedula,
            telefono, 
            email:AdministradorBDD.email,
            token
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const perfil =(req,res)=>{
	const {token,email,createdAt,updatedAt,__v,...datosPerfil} = req.administratorHeader
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
        
        administradorBDD.nombre = nombre ?? administradorBDD.nombre
        administradorBDD.cedula = cedula ?? administradorBDD.cedula
        administradorBDD.apellido = apellido ?? administradorBDD.apellido
        administradorBDD.telefono = telefono ?? administradorBDD.telefono
        administradorBDD.email = email ?? administradorBDD.email
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


export {
  registro,
  login,
  perfil,
  actualizarPerfil,
  actualizarPassword
}
