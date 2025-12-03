import Estudiante from '../models/student.js';
import { sendMailStudent } from "../helpers/sendMailStudent.js";
import { crearTokenJWT } from "../middlewares/JWT.js"

import mongoose from 'mongoose';


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
    return res.status(400).json({ msg: " Ingresa Identificación válida. " });
    }

    const celularEstudiante = (telefonoEstudiante).trim().replace(/[^\d]/g, '');
    if (!/^0\d{9}$/.test(celularEstudiante)) { 
    return res.status(400).json({ msg: " Ingresa número de teléfono válido. " });
    }
    const dominio = "epn.edu.ec";
        
        if (!emailEstudiante.toLowerCase().endsWith(`@${dominio}`)) {
            return res.status(400).json({msg:`El registro requiere un correo institucional perteneciente a la EPN.`});
        }
    
    const password = Math.random().toString(36).toUpperCase().slice(2, 10)
    
    const nuevoEstudiante = new Estudiante({
      ...req.body,
            passwordEstudiante: await Estudiante.prototype.encryptPassword("SPORT"+password),
            administrator: req.administratorHeader._id            
    });



    await nuevoEstudiante.save()
    await sendMailStudent(emailEstudiante,"SPORT"+password)

    
    return res.status(201).json({ msg: "Registro exitoso del Estudiante y correo enviado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
};


const loginEstudiante = async(req,res)=>{

    try {
        const {email:emailEstudiante,password:passwordEstudiante} = req.body
        if (Object.values(req.body).includes("")) 
          return res.status(404).json({msg:"Debes llenar todos los campos"})

        const estudianteBDD = await Estudiante.findOne({emailEstudiante})
        if(!estudianteBDD)
           return res.status(404).json({msg:"El propietario no se encuentra registrado"})

        const verificarPassword = await estudianteBDD.matchPassword(passwordEstudiante)
        if(!verificarPassword) 
          return res.status(404).json({msg:"Usuario o contraseña incorrecta"})
        const token = crearTokenJWT(estudianteBDD._id,estudianteBDD.rol)

        const {_id,rol} = estudianteBDD

       /* const {_id,rol,
                cambioPassword: requirePasswordChange} = directorBDD

        const finalPassword = requirePasswordChange || false;*/
        res.status(200).json({
            rol,
            _id,
            token,
           // requirePasswordChange: finalPassword
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}







const listarEstudiante = async (req,res)=>{
    try {
        const estudiantes = 
        
        await Estudiante.find({ estadoEstudiante: true, administrator: req.administratorHeader._id }).select(" -createdAt -updatedAt -__v").populate('Administrador','_id nombreEstudiante apellidoEstudiante')
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

        const estudiante = await Estudiante.findById(id).select("-createdAt -updatedAt -__v").populate('Administrador','_id nombre apellido')
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



/*
const eliminarDirector = async (req,res)=>{

    try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ msg: `No existe el Director ${id}` });

    await Director.findByIdAndDelete({_id: id});
    res.status(200).json({ msg: "Director Eliminado de manera exitosa de la base de datos" });
    console.log(`eliminado ${id}`)
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: `Error en el servidor - ${error}` });
  }
}
*/
const actualizarEstudiante = async(req,res)=>{
    const {id} = req.params
    if (Object.values(req.body).includes("")) 
      return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})

    if( !mongoose.Types.ObjectId.isValid(id) ) 
      return res.status(404).json({msg:`Lo sentimos, no existe el Estudiante ${id}`})
    
    await Estudiante.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json({msg:"Actualización exitosa del Estudiante"})
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



export { registrarEstudiante,
          loginEstudiante,
          listarEstudiante,
          detalleEstudiante,
          eliminarEstudiante,
          actualizarEstudiante,
          perfilEstudiante
        };
