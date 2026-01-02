import Estudiante from '../models/student.js';
import { sendMailStudent } from "../helpers/sendMailStudent.js";
import {sendMailToRegisterStudent} from "../helpers/sendMailToRegisterStudent.js"
import { crearTokenJWT } from "../middlewares/JWT.js"

import mongoose from 'mongoose';
import { sendMailToRecoveryPasswordEstudiante } from '../helpers/RecoveryPasswordEstudiante.js';


const registrarEstudiante = async (req, res) => {
  try {
    const { emailEstudiante, cedulaEstudiante, telefonoEstudiante } = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    const datosExistente = await Estudiante.findOne({ $or: [{ emailEstudiante }, { cedulaEstudiante }] });

    if (datosExistente) {
      return res.status(400).json({ msg: "cedula o email ya se encuentra registrado" });
    }
    const identificacionEstudiante = (cedulaEstudiante ).trim().replace(/[^\d]/g, '');

    if (!/^\d{10}$/.test(identificacionEstudiante)) { 
    return res.status(400).json({ msg: "Ingresa Identificación válida." });
    }

    const celularEstudiante = (telefonoEstudiante).trim().replace(/[^\d]/g, '');
    if (!/^0\d{9}$/.test(celularEstudiante)) { 
    return res.status(400).json({ msg: "Ingresa número de teléfono válido." });
    }
    const dominio = "epn.edu.ec";
        
        if (!emailEstudiante.toLowerCase().endsWith(`@${dominio}`)) {
            return res.status(400).json({msg:`El registro requiere un correo institucional perteneciente a la EPN.`});
        }
    
    const password = Math.random().toString(36).toUpperCase().slice(2, 15)   //--------------> estan 13 caracteres
    
    const nuevoEstudiante = new Estudiante({
      ...req.body,
    
      passwordEstudiante: await Estudiante.prototype.encryptPassword(password),
      administrador: req.administratorHeader?._id || null,
      director: req.directorHeader?._id || null

    });

    if (req.administratorHeader?._id || req.directorHeader?._id) {
        nuevoEstudiante.token = null; 
    } 
    

    await nuevoEstudiante.save()
    await sendMailStudent(emailEstudiante,password)

    
    return res.status(201).json({ msg: "Registro exitoso del Estudiante y correo enviado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
};










const listarEstudiante = async (req,res)=>{
    try {
        const estudiantes = 
        
        await Estudiante.find({ estadoEstudiante: true,
                                //indica por separado es decir, indicara solo los usuarios creado por el administrador o director
                                //administrador: req.administratorHeader?._id,
                                //director:req.directorHeader?._id,
                              })
                              .select(" -createdAt -updatedAt -__v")
                              .populate('administrador','_id nombre apellido')
                              .populate('director','_id nombreDirector apellidoDirector')
        res.status(200).json(estudiantes)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const detalleEstudiante = async(req,res)=>{

    try {
        const {id} = req.params

        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe el administrador ${id}`});

        const estudiante = await Estudiante.findById(id)
                                            .select("-createdAt -updatedAt -__v")
                                            .populate('administrador','_id nombre apellido')
                                            .populate('director','_id nombreDirector apellidoDirector')

        res.status(200).json(estudiante)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const eliminarEstudiante = async (req,res)=>{

    try {
        const {id} = req.params
        if( !mongoose.Types.ObjectId.isValid(id) ) 
          return res.status(404).json({msg:`No existe el Estudiante ${id}`})
        await Estudiante.findByIdAndUpdate(id,{estadoEstudiante:false})
        res.status(200).json({msg:"Estudiante eliminado exitosamente"})

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}




const actualizarEstudiante = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) 
      return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})

    if( !mongoose.Types.ObjectId.isValid(id) ) 
      return res.status(404).json({msg:`Lo sentimos, no existe el Estudiante ${id}`})
    
    await Estudiante.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del Estudiante"})
}





//------------------------------------------ESTUDIANTE------------------------------------------


const registroIndependienteStudent = async (req,res)=>{

    try {
        const {emailEstudiante,passwordEstudiante,
                cedulaEstudiante,telefonoEstudiante,
                
            } = req.body
        if (Object.values(req.body).includes("")) 
          return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        
        const dominio = "epn.edu.ec";
        
        if (!emailEstudiante.toLowerCase().endsWith(`@${dominio}`)) {
            return res.status(400).json({msg:`Requiere de correo institucional perteneciente a la EPN.`});
        }

        const identificacionEstudiante = (cedulaEstudiante ).trim().replace(/[^\d]/g, '');

        if (!/^\d{10}$/.test(identificacionEstudiante)) { 
        return res.status(400).json({ msg: "Ingresa Identificación válida." });
        }

        const celularEstudiante = (telefonoEstudiante).trim().replace(/[^\d]/g, '');
        if (!/^09\d{8}$/.test(celularEstudiante)) { 
        return res.status(400).json({ msg: "Ingresa número de teléfono válido." });
        }

        const verificarEmailBDD = await Estudiante.findOne({emailEstudiante})
        if(verificarEmailBDD) 
          return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})

        const nuevoEstudiante = new Estudiante(req.body)
        nuevoEstudiante.passwordEstudiante = await nuevoEstudiante.encryptPassword(passwordEstudiante)
        const token = nuevoEstudiante.createToken()
        await sendMailToRegisterStudent(emailEstudiante,token)
        await nuevoEstudiante.save()
        res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})

    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }

}

const confirmarMailEstudiante = async (req, res) => {
    try {
        const { token } = req.params
        const nuevoEstudiante = await Estudiante.findOne({ token })
        if (!nuevoEstudiante) 
          return res.status(404).json({ msg: "Token inválido o cuenta ya confirmada" })
        nuevoEstudiante.token = null
        nuevoEstudiante.confirmEmail = true
        await nuevoEstudiante.save()
        res.status(200).json({ msg: "Cuenta confirmada, ya puedes iniciar sesión" })

    } catch (error) {
    console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}



const loginEstudiante = async(req,res)=>{

    try {
        const {email:emailEstudiante, password:passwordEstudiante} = req.body
        if (Object.values(req.body).includes("")) 
          return res.status(404).json({msg:"Debes llenar todos los campos"})

        const estudianteBDD = await Estudiante.findOne({emailEstudiante})
        if(!estudianteBDD)
           return res.status(404).json({msg:"El estudinte no se encuentra registrado"})

        const verificarPassword = await estudianteBDD.matchPassword(passwordEstudiante)
        if(!verificarPassword) 
          return res.status(404).json({msg:"Usuario o contraseña incorrecta"})
        const token = crearTokenJWT(estudianteBDD._id,estudianteBDD.rol)

        const {_id,rol} = estudianteBDD

        res.status(200).json({
            rol,
            _id,
            token,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const perfilEstudiante = (req, res) => {

    try {
        const{_id, 
          nombreEstudiante,
          apellidoEstudiante,
          cedulaEstudiante,
          emailEstudiante,
          direccionEstudiante,
          carreraEstudiante,
          status,
          telefonoEstudiante,rol} = req.estudianteHeader

        res.status(200).json({
            rol,
            _id,
            nombreEstudiante,
            apellidoEstudiante,
            cedulaEstudiante,
            emailEstudiante,
            telefonoEstudiante,
            direccionEstudiante,
            carreraEstudiante,
            status
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}


const recuperarPasswordEstudiante = async (req, res) => {
    try {
        const { email: emailEstudiante } = req.body;

        if (!emailEstudiante) {
            return res.status(400).json({ msg: "Debes proporcionar un email" });
        }

        const estudianteBDD = await Estudiante.findOne({  email: emailEstudiante });
        if (!estudianteBDD) {
            return res.status(404).json({ msg: "La información proporcionada es incorrecta." });
        }

        

        const token = estudianteBDD.createToken()
        estudianteBDD.token = token
        await sendMailToRecoveryPasswordEstudiante(emailEstudiante, token)
        await estudianteBDD.save()
        res.status(200).json({ msg: "Revisa tu correo electrónico para reestablecer tu cuenta" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};


const comprobarTokenPasswordEstudiante = async (req, res) => {
    
        try {
             const {token} = req.params
                const estudianteBDD = await Estudiante.findOne({token})
                
                if(estudianteBDD?.token !== token) 
                  return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})

                res.status(200).json({msg:"Ya puedes crear tu nuevo password"}) 
            
            } catch (error) {
                console.error(error)
                res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
            }
};


const nuevoPasswordEstudiante = async (req, res) => {
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
            return res.status(400).json({msg: "Debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números"});
        }

        const estudianteBDD = await Estudiante.findOne({ token });

        if (!estudianteBDD) {
            return res.status(404).json({ msg: "Token inválido o expirado" });
        }

        estudianteBDD.passwordEstudiante = await estudianteBDD.encryptPassword(password); 
        estudianteBDD.token = null;
        estudianteBDD.cambioPassword = false;
        
        await estudianteBDD.save();

        res.status(200).json({ msg: "Contraseña restablecida exitosamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};



//  Actualizar perfil del estudiante (por sí mismo)
const actualizarPerfilEstudiante = async (req,res)=>{

try {
    const {id} = req.params
    const {nombreEstudiante,apellidoEstudiante,
          cedulaEstudiante,telefonoEstudiante,
          direccionEstudiante,carreraEstudiante,
          status, emailEstudiante} = req.body

    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(400).json({msg:`ID inválido: ${id}`})

    const estudianteBDD = await Estudiante.findById(id)

    if(!estudianteBDD) return res.status(404).json({ msg: `No existe el estudiante ${id}` })
    const dominio='epn.edu.ec'

    if (emailEstudiante && !emailEstudiante.toLowerCase().endsWith(`@${dominio}`)) {
        return res.status(40).json({msg: `Requiere de correo institucional perteneciente a la EPN.`});
    }
            
    const identificacion = (cedulaEstudiante ).trim().replace(/[^\d]/g, '');
    if (!/^\d{10}$/.test(identificacion)) { 
    return res.status(400).json({ msg: " Ingresa Identificación válida. " });
    }

    const celular = (telefonoEstudiante).trim().replace(/[^\d]/g, '');

    if (!/^0\d{9}$/.test(celular)) { 
    return res.status(400).json({ msg: " Ingresa número de teléfono válido. " });
    }

    estudianteBDD.nombreEstudiante = nombreEstudiante?? estudianteBDD.nombreEstudiante
    estudianteBDD.apellidoEstudiante = apellidoEstudiante?? estudianteBDD.apellidoEstudiante
    estudianteBDD.cedulaEstudiante = identificacion ?? estudianteBDD.cedulaEstudiante 
    estudianteBDD.telefonoEstudiante = celular?? estudianteBDD.telefonoEstudiante 
    estudianteBDD.emailEstudiante = emailEstudiante?? estudianteBDD.emailEstudiante
    estudianteBDD.direccionEstudiante= direccionEstudiante?? estudianteBDD.direccionEstudiante
    estudianteBDD.status= status?? estudianteBDD.status
    estudianteBDD.carreraEstudiante= carreraEstudiante?? estudianteBDD.carreraEstudiante
    await estudianteBDD.save()
    
    res.status(200).json(estudianteBDD)

  } catch (error) {
  console.error(error)
  res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
  }
};


export { registrarEstudiante,
          loginEstudiante,
          listarEstudiante,
          detalleEstudiante,
          eliminarEstudiante,
          actualizarEstudiante,
          
          perfilEstudiante,
          registroIndependienteStudent,
          confirmarMailEstudiante,
          recuperarPasswordEstudiante,
          comprobarTokenPasswordEstudiante,
          nuevoPasswordEstudiante,
          actualizarPerfilEstudiante
        };
