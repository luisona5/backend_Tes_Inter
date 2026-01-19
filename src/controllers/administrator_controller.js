import Administrator from "../models/administrator.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import { sendMailToRecoveryPassword} from "../helpers/RecoveryPassword.js"
import { capitalize } from "../config/formato.js"


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



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(404).json({ msg: "Debes llenar todos los campos" });
    }

    const dominio = "epn.edu.ec";
    if (!email.toLowerCase().endsWith(`@${dominio}`)) {
      return res.status(404).json({ msg: "Ingreso con correo institucional EPN" });
    }

    const AdministradorBDD = await Administrator
      .findOne({ email })
      .select("-status -__v -token -updatedAt -createdAt");

    if (!AdministradorBDD) {
      return res.status(404).json({ msg: "Usuario o contraseña es incorrecto" });
    }

    const verificarPassword = await AdministradorBDD.matchPassword(password);

    if (!verificarPassword) {
      return res.status(404).json({ msg: "Usuario o contraseña es incorrecto" });
    }

    const { _id, rol } = AdministradorBDD;
    const token = crearTokenJWT(_id, rol);

    res.status(200).json({
      rol,
      _id,
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `❌ Error en el servidor - ${error}` });
  }
};



const perfil =(req,res)=>{

	const {token,createdAt,updatedAt,__v,...datosPerfil} = req.administratorHeader

    res.status(200).json(datosPerfil)
}



const actualizarPerfil = async (req,res)=>{

try {
    const {id} = req.params
    const {nombre,apellido,cedula,telefono,email,status} = req.body

    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(400).json({msg:`ID inválido: ${id}`})

    const administradorBDD = await Administrator.findById(id)

    if(!administradorBDD) return res.status(404).json({ msg: `No existe el administrador ${id}` })
            
    // Validar cédula 
        if (cedula) {
          const identificacion = cedula.trim().replace(/[^\d]/g, '');
          if (!/^\d{10}$/.test(identificacion)) {
            return res.status(400).json({msg: "Ingresa Identificación válida."});
          }
          administradorBDD.cedula = identificacion;
        }
    
        // Validar teléfono
        if (telefono) {
          const celular = telefono.trim().replace(/[^\d]/g, '');
          if (!/^09\d{8}$/.test(celular)) {
            return res.status(400).json({msg: "Ingresa número de teléfono válido."});
          }
          administradorBDD.telefono = celular;
        }
    
        // Validar nombre 
        if (nombre ) {
          const nombreValidado = nombre.trim();
          
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreValidado)) {
            return res.status(400).json({msg: "El nombre solo puede contener letras."});
          }
          
          if (nombreValidado.length < 2) {
            return res.status(400).json({msg: "El nombre debe tener al menos 2 caracteres."});
          }
          
          administradorBDD.nombre = capitalize(nombreValidado);
        }
         const dominio = "epn.edu.ec";
        
        if (!email.toLowerCase().endsWith(`@${dominio}`)) {
            return res.status(403).json({msg:`ingreso con correo institucional EPN`});
        }
        // Validar apellido 
        if (apellido) {
          const apellidoValidado = apellido.trim();
          
          if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoValidado)) {
            return res.status(400).json({msg: "El apellido solo puede contener letras."});
          }
          
          if (apellidoValidado.length < 2) {
            return res.status(400).json({msg: "El apellido debe tener al menos 2 caracteres."});
          }
          
          administradorBDD.apellido = capitalize(apellidoValidado);
        }
    
        // Actualizar otros campos solo si se proporcionan
        if (email) administradorBDD.email = email;
        if (status !== undefined) administradorBDD.status = status;
    
        await administradorBDD.save()
        res.status(200).json(administradorBDD)

  } catch (error) {
  console.error(error)
  res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
  }
}


const actualizarPassword = async (req,res)=>{
  try {
    const administradorBDD = await Administrator.findById(req.administratorHeader._id)
    if(!administradorBDD) 
      return res.status(404).json({msg:`Lo sentimos, no existe el administrador ${id}`})


    const verificarPassword = await administradorBDD.matchPassword(req.body.passwordactual)

    if(!verificarPassword) 
      return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})

    administradorBDD.password = await administradorBDD.encryptPassword(req.body.passwordnuevo)

    await administradorBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
    
    } catch (error) {
    console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const recuperarPassword = async (req, res) => {

    try {
        const { email } = req.body

        if (!email) 
          return res.status(400).json({ msg: "Debes ingresar un correo electrónico" })

        const administradorBDD = await Administrator.findOne({ email })

        if (!administradorBDD) 
          return res.status(404).json({ msg: "La información proporcionada es incorrecta."})

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

// viene por parte del frontend

const comprobarTokenPasword = async (req,res)=>{
    try {
        const {token} = req.params
        const administradorBDD = await Administrator.findOne({token})
        
        if(administradorBDD?.token !== token) 
          return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        res.status(200).json({msg:"Ya puedes crear tu nuevo password"}) 
    
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