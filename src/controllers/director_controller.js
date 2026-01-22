import Director from '../models/directordeEvento.js';
import { sendMailToOwner } from "../helpers/sendMail.js";
import { sendMailToRecoveryPasswordDirector} from "../helpers/RecoveryPasswordDirector.js"
import { capitalize } from '../config/formato.js';
 
import { crearTokenJWT } from "../middlewares/JWT.js"

import mongoose from 'mongoose';
import inscripcion from '../models/inscripcion.js';



const registrarDirector = async (req, res) => {
  try {
    const { emailDirector, cedulaDirector, telefonoDirector, nombreDirector, apellidoDirector,status } = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    const datosExistente = await Director.findOne({ $or: [{ emailDirector }, { cedulaDirector }] });

    
    const identificacionDirector = (cedulaDirector ).trim().replace(/[^\d]/g, '');
    
    if (datosExistente) 
        {
      if (datosExistente.status === 'Inactivo') {
        return res.status(409).json({ 
          msg: `Director se encuentra en estado Inactivo. Por favor, actívalo desde la gestión de directores.`,
          
        });
      } else {
        return res.status(400).json({ 
          msg: "La cédula o email ya se encuentra registrado y está activo" 
        });
      }
    }


    if (!/^\d{10}$/.test(identificacionDirector)) { 
    return res.status(400).json({ msg: " Ingresa Identificación válida. " });
    }

    const celularDirector = (telefonoDirector).trim().replace(/[^\d]/g, '');

    if (!/^09\d{8}$/.test(celularDirector)) { 
    return res.status(400).json({ msg: " Ingresa número de teléfono válido. " });
    }
    const dominio = "epn.edu.ec";
        
        if (!emailDirector.toLowerCase().endsWith(`@${dominio}`)) {
            return res.status(400).json({msg:`El registro requiere un correo institucional perteneciente a la EPN.`});
        }

    const formato = {
      ...req.body,
      nombreDirector: capitalize(nombreDirector),
      apellidoDirector: capitalize(apellidoDirector),
      status:status
      

    }
    const password = Math.random().toString(36).toUpperCase().slice(2, 15)
    
    const nuevoDirector = new Director({
      ...formato,
            passwordDirector: await Director.prototype.encryptPassword(password),
            administrador: req.administratorHeader?._id || null,
    });



    await nuevoDirector.save()
    await sendMailToOwner(emailDirector, password)

    
    return res.status(201).json({ msg: "Registro exitoso del Director de Evento y correo enviado" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
};



const listarDirector = async (req,res)=>{
    try {
        const directores = 
        
        await Director.find({   administrator: req.administratorHeader._id 
            })
        .select(" -createdAt -updatedAt -__v")
        .populate('administrador','_id nombre apellido')

        res.status(200).json(directores)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const detalleDirector = async(req,res)=>{

    try {
        const {id} = req.params

        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe el director ${id}`});

        const director = await Director.findById(id).select("-createdAt -updatedAt -__v")
                                                    .populate('administrador', '_id nombre apellido')
        res.status(200).json(director)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarDirector = async (req,res)=>{

    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe el Director de Evento ${id}`})
        await Director.findByIdAndUpdate(id,{estadoDirector:false})
        res.status(200).json({msg:"Director de Evento eliminado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const actualizarDirector = async (req, res) => {
    try {
        const { id } = req.params;

        if (Object.values(req.body).includes(""))
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ msg: `Lo sentimos, no existe el Director ${id}` });

        const { nombreDirector, apellidoDirector, 
                telefonoDirector, status, 
                cedulaDirector, emailDirector } = req.body;

        const celularDirector = telefonoDirector.trim().replace(/[^\d]/g, '');

        if (!/^09\d{8}$/.test(celularDirector)) { 
            return res.status(400).json({ msg: "Ingresa número de teléfono válido." });
        }

        // Preparar datos actualizados
        const informacionActualizada = {
            nombreDirector: capitalize(nombreDirector),
            apellidoDirector: capitalize(apellidoDirector),
            telefonoDirector: celularDirector, 
            status,
            cedulaDirector, 
            emailDirector
        };
        const directorActualizado = await Director.findByIdAndUpdate(
            id,
            informacionActualizada,
            { new: true }
        );

        if (!directorActualizado) {
            return res.status(404).json({ msg: "Director no encontrado" });
        }

        res.status(200).json({ 
            msg: `Director ${informacionActualizada.nombreDirector} ${informacionActualizada.apellidoDirector} actualizado exitosamente` 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};


const perfilDirector = (req, res) => {

    try {
        const{_id, 
            nombreDirector,
            apellidoDirector,
            cedulaDirector,
            emailDirector,
            telefonoDirector,
            rol,
            status
            } = req.directorHeader

        res.status(200).json({
            rol,
            _id,
            nombreDirector,
            apellidoDirector,
            cedulaDirector,
            emailDirector,
            telefonoDirector,
            status
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const loginDirector = async(req,res)=>{

    try {
        const {email:emailDirector,password:passwordDirector} = req.body
        if (Object.values(req.body).includes("")) 
          return res.status(404).json({msg:"Debes llenar todos los campos"})

        const directorBDD = await Director.findOne({emailDirector})

        if(!directorBDD)
           return res.status(404).json({msg:"Usuario o contraseña incorrecta"})

        const verificarPassword = await directorBDD.matchPassword(passwordDirector)

        if(!verificarPassword) 
          return res.status(404).json({msg:"Usuario o contraseña incorrecta"})
        const token = crearTokenJWT(directorBDD._id,directorBDD.rol)

        const {_id,rol} = directorBDD

      
        res.status(200).json({
            rol,
            _id,
            token
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const recuperarPasswordDirector = async (req, res) => {
    try {
        const { email: emailDirector } = req.body;

        if (!emailDirector) {
            return res.status(400).json({ msg: "Debes proporcionar un email" });
        }

        const directorBDD = await Director.findOne({  email: emailDirector });
        if (!directorBDD) {
            return res.status(404).json({ msg: "La información proporcionada es incorrecta." });
        }

        

        const token = directorBDD.createToken()
        directorBDD.token = token
        await sendMailToRecoveryPasswordDirector(emailDirector, token)
        await directorBDD.save()
        res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};


const comprobarTokenPasswordDirector = async (req, res) => {
    
        try {
             const {token} = req.params
                const directorBDD = await Director.findOne({token})
                
                if(directorBDD?.token !== token) 
                  return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})

                res.status(200).json({msg:"Ya puedes crear tu nuevo password"}) 
            
            } catch (error) {
                console.error(error)
                res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
            }
};


const nuevoPasswordDirector = async (req, res) => {
    try {
        const { token } = req.params;
        
        const { password, confirmpassword } = req.body;

        if (!password || !confirmpassword) {
            return res.status(400).json({ msg: "Debes llenar todos los campos" });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ msg: "Las contraseñas no coinciden" });
        }

        const passwordvalidator = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!passwordvalidator.test(password)) {
            return res.status(400).json({msg: "Debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números"
            });
        }

        const directorBDD = await Director.findOne({ token });

        if (!directorBDD) {
            return res.status(404).json({ msg: "Token inválido o expirado" });
        }

        directorBDD.passwordDirector = await directorBDD.encryptPassword(password); 
        directorBDD.token = null;
        directorBDD.cambioPassword = false;
        
        await directorBDD.save();

        res.status(200).json({ msg: "Contraseña restablecida exitosamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};



//  Actualizar perfil del director (por sí mismo)
const actualizarPerfilDirector = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreDirector, apellidoDirector, cedulaDirector, telefonoDirector, emailDirector } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: `ID inválido: ${id}` });
    }

    const directorBDD = await Director.findById(id);

    if (!directorBDD) {
      return res.status(404).json({ msg: `No existe el director ${id}` });
    }

    // Validar cédula solo si viene en el body
    if (cedulaDirector) {
      const identificacion = cedulaDirector.trim().replace(/[^\d]/g, '');
      if (!/^\d{10}$/.test(identificacion)) {
        return res.status(400).json({ msg: "Ingresa Identificación válida." });
      }
      directorBDD.cedulaDirector = identificacion;
    }

    // Validar teléfono solo si viene en el body
    if (telefonoDirector) {
      const celular = telefonoDirector.trim().replace(/[^\d]/g, '');
      if (!/^0\d{9}$/.test(celular)) {
        return res.status(400).json({ msg: "Ingresa número de teléfono válido." });
      }
      directorBDD.telefonoDirector = celular;
    }

    // Actualizar otros campos capitalizando nombres
    if (nombreDirector) directorBDD.nombreDirector = capitalize(nombreDirector);
    if (apellidoDirector) directorBDD.apellidoDirector = capitalize(apellidoDirector);
    if (emailDirector) directorBDD.emailDirector = emailDirector;

    await directorBDD.save();

    res.status(200).json(directorBDD);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `❌ Error en el servidor - ${error}` });
  }
};


const actualizarPasswordDirector= async (req,res)=>{
    try {
        const directorBDD = await Director.findById(req.directorHeader._id)
        if(!directorBDD) 
            return res.status(404).json({msg:`Lo sentimos, no existe el Director ${id}`})
        const verificarPassword = await directorBDD.matchPassword(req.body.passwordactual)
        if(!verificarPassword) 
            return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
        directorBDD.passwordDirector = await directorBDD.encryptPassword(req.body.passwordnuevo)
        await directorBDD.save()

        return res.status(200).json({msg:"Password actualizado correctamente"})
    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

export { registrarDirector,
          loginDirector,
          listarDirector,
          detalleDirector,
          eliminarDirector,
          actualizarDirector,
          perfilDirector,

          recuperarPasswordDirector,
          comprobarTokenPasswordDirector,
          nuevoPasswordDirector,
          actualizarPerfilDirector,

          actualizarPasswordDirector,
          
        };
