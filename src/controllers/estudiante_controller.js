import Estudiante from '../models/student.js';
import { sendMailStudent } from "../helpers/sendMailStudent.js";
import {sendMailToRegisterStudent} from "../helpers/sendMailToRegisterStudent.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import { capitalize } from '../config/formato.js';

import mongoose from 'mongoose';
import { sendMailToRecoveryPasswordEstudiante } from '../helpers/RecoveryPasswordEstudiante.js';


const registrarEstudiante = async (req, res) => {
  try {
    const { emailEstudiante, cedulaEstudiante, 
            telefonoEstudiante,direccionEstudiante,
            nombreEstudiante,apellidoEstudiante,genero,carreraEstudiante,semestre } = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    const datosExistente = await Estudiante.findOne({ $or: [{ emailEstudiante }, { cedulaEstudiante }] });

     if (datosExistente) 
        {
      if (datosExistente.status === 'Inactivo') {
        return res.status(409).json({ 
          msg: `Estudiante se encuentra en estado Inactivo. Por favor, actívalo desde la gestión de estudinates.`,
          
        });
      } else {
        return res.status(400).json({ 
          msg: "La cédula o email ya se encuentra registrado y está activo" 
        });
      }
    }
    
    const identificacionEstudiante = (cedulaEstudiante || '').trim().replace(/[^\d]/g, '');

    if (!/^\d{10}$/.test(identificacionEstudiante)) {
        return res.status(400).json({ 
            msg: "La identificación debe contener exactamente 10 dígitos numéricos." 
        });
    }
   

    const celularEstudiante = (telefonoEstudiante).trim().replace(/[^\d]/g, '');
    if (!/^09\d{8}$/.test(celularEstudiante)) { 
    return res.status(400).json({ msg: "Ingresa número de teléfono válido." });
    }
    const dominio = "epn.edu.ec";
        
        if (!emailEstudiante.toLowerCase().endsWith(`@${dominio}`)) {
            return res.status(400).json({msg:`El registro requiere un correo institucional perteneciente a la EPN.`});
        }

    const formato = {
      ...req.body,
      nombreEstudiante: capitalize(nombreEstudiante),
      apellidoEstudiante: capitalize(apellidoEstudiante),
      direccionEstudiante: capitalize(direccionEstudiante),
      genero: capitalize(genero),
      semestre:semestre,
      carreraEstudiante:carreraEstudiante

    };
    const password = Math.random().toString(36).toUpperCase().slice(2, 15)   //--------------> estan 13 caracteres

    const nuevoEstudiante = new Estudiante({
      ...formato,

      passwordEstudiante: await Estudiante.prototype.encryptPassword(password),
      administrador: req.administratorHeader?._id || null,
      director: req.directorHeader?._id || null

    });


    if (req.administratorHeader?._id || req.directorHeader?._id) {
        nuevoEstudiante.token = null;
        nuevoEstudiante.confirmEmail =true
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
                nombreEstudiante,apellidoEstudiante,
                direccionEstudiante,genero,semestre
              
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
        const datosExistente = await Estudiante.findOne({ $or: [{ emailEstudiante }, { cedulaEstudiante }] });

        if (datosExistente) {
          return res.status(400).json({ msg: "cedula o email ya se encuentra registrado" });
        }


        const formato = {
        ...req.body,
        nombreEstudiante: capitalize(nombreEstudiante),
        apellidoEstudiante: capitalize(apellidoEstudiante),
        direccionEstudiante: capitalize(direccionEstudiante),
        genero: capitalize(genero),

    }

        const nuevoEstudiante = new Estudiante(formato)
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
                                              .select(" -__v  -updatedAt -createdAt")

        if(!estudianteBDD)
           return res.status(404).json({msg:"Usuario o contraseña incorrecta"})

        if(estudianteBDD.status === false || estudianteBDD.status === "Inactivo") {
          return res.status(403).json({msg: "Tu cuenta está inactiva. Por favor contacta al administrador o director.",
          })
        }

        const fueCreadoPorAdminODirector = estudianteBDD.administrador || estudianteBDD.director;
        
        if (!fueCreadoPorAdminODirector && !estudianteBDD.confirmEmail) {
            return res.status(403).json({ msg: "Debes verificar tu cuenta antes de iniciar sesión" });
        }

        if(!estudianteBDD.confirmEmail) 
          return res.status(403).json({msg:"Debes verificar tu cuenta antes de iniciar sesión"})


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
          genero,
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
            genero,
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
const actualizarPerfilEstudiante = async (req, res) => {
  try {
    const {id} = req.params;
    const {nombreEstudiante, apellidoEstudiante,
          cedulaEstudiante, telefonoEstudiante,
          direccionEstudiante, carreraEstudiante,
          status, emailEstudiante} = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({msg: `ID inválido: ${id}`});
    }

    const estudianteBDD = await Estudiante.findById(id);

    if (!estudianteBDD) {
      return res.status(404).json({msg: `No existe el estudiante ${id}`});
    }

    const dominio = 'epn.edu.ec';

    // Validar email 
    if (emailEstudiante && !emailEstudiante.toLowerCase().endsWith(`@${dominio}`)) {
      return res.status(400).json({msg: `Requiere de correo institucional perteneciente a la EPN.`});
    }

    // Validar cédula 
    if (cedulaEstudiante) {
      const identificacion = cedulaEstudiante.trim().replace(/[^\d]/g, '');
      if (!/^\d{10}$/.test(identificacion)) {
        return res.status(400).json({msg: "Ingresa Identificación válida."});
      }
      estudianteBDD.cedulaEstudiante = identificacion;
    }

    // Validar teléfono
    if (telefonoEstudiante) {
      const celular = telefonoEstudiante.trim().replace(/[^\d]/g, '');
      if (!/^0\d{9}$/.test(celular)) {
        return res.status(400).json({msg: "Ingresa número de teléfono válido."});
      }
      estudianteBDD.telefonoEstudiante = celular;
    }

    // Validar nombre 
    if (nombreEstudiante ) {
      const nombreValidado = nombreEstudiante.trim();
      
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreValidado)) {
        return res.status(400).json({msg: "El nombre solo puede contener letras."});
      }
      
      if (nombreValidado.length < 2) {
        return res.status(400).json({msg: "El nombre debe tener al menos 2 caracteres."});
      }
      
      estudianteBDD.nombreEstudiante = capitalize(nombreValidado);
    }

    // Validar apellido 
    if (apellidoEstudiante) {
      const apellidoValidado = apellidoEstudiante.trim();
      
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoValidado)) {
        return res.status(400).json({msg: "El apellido solo puede contener letras."});
      }
      
      if (apellidoValidado.length < 2) {
        return res.status(400).json({msg: "El apellido debe tener al menos 2 caracteres."});
      }
      
      estudianteBDD.apellidoEstudiante = capitalize(apellidoValidado);
    }

    // Actualizar otros campos solo si se proporcionan
    if (emailEstudiante) estudianteBDD.emailEstudiante = emailEstudiante;
    if (direccionEstudiante) estudianteBDD.direccionEstudiante = direccionEstudiante;
    if (status !== undefined) estudianteBDD.status = status;
    if (carreraEstudiante) estudianteBDD.carreraEstudiante = carreraEstudiante;

    await estudianteBDD.save();
    
    res.status(200).json(estudianteBDD);

  } catch (error) {
    console.error(error);
    res.status(500).json({msg: `❌ Error en el servidor - ${error.message}`});
  }
};


const actualizarPasswordEstudiante = async (req,res)=>{
    try {
        const estudianteBDD = await Estudiante.findById(req.estudianteHeader._id)
        if(!estudianteBDD) 
            return res.status(404).json({msg:`Lo sentimos, no existe el estudiante ${id}`})
        const verificarPassword = await estudianteBDD.matchPassword(req.body.passwordactual)
        if(!verificarPassword) 
            return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
        estudianteBDD.passwordEstudiante = await estudianteBDD.encryptPassword(req.body.passwordnuevo)
        await estudianteBDD.save()

        return res.status(200).json({msg:"Password actualizado correctamente"})
    } catch (error) {
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}
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
          actualizarPerfilEstudiante,
          actualizarPasswordEstudiante
        };
