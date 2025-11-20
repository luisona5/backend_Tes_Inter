import Director from '../models/directordeEvento.js';
import { sendMailToOwner } from "../helpers/sendMail.js";


const registrarDirector = async (req, res) => {
  try {
    const { emailDirector } = req.body;

    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Debes llenar todos los campos" });
    }

    const emailExistente = await Director.findOne({ emailDirector });

    if (emailExistente) {
      return res.status(400).json({ msg: "El email ya se encuentra registrado" });
    }

    const password = Math.random().toString(36).toUpperCase().slice(2, 10)
    
    const nuevoDirector = new Director({
      ...req.body,
            passwordDirector: await Director.prototype.encryptPassword("SPORT"+password+"POLI"),
            administrator: req.administratorHeader._id            
    });



    await nuevoDirector.save()
    await sendMailToOwner(emailDirector,"SPORT"+password+"POLI")

    
    return res.status(201).json({ msg: "Registro exitoso del Director de Evento y correo enviado" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
  }
};


const loginDirector = async(req,res)=>{

    try {
        const {emailDirector,passwordDirector} = req.body

        if (Object.values(req.body).includes("")) 
          
          return res.status(404).json({msg:"Debes llenar todos los campos"})

        const DirectorBDD = await Director.findOne({emailDirector}).select("-status -__v -token -updatedAt -createdAt")
        if(!DirectorBDD) 
          return res.status(404).json({msg:"Usuario o contraseña es incorrecto"})

        if(!DirectorBDD.emailDirector) 
          return res.status(403).json({msg:"Usuario o contraseña es incorrecto"})

        const verificarPassword = await DirectorBDD.matchPassword(passwordDirector)

        if(!verificarPassword) 
          return res.status(401).json({msg:"Usuario o contraseña es incorrecto"})

        

        res.status(200).json({
            _id,
            cedulaDirector,
            nombreDirector,
            apellidoDirector,
            telefonoDirector, 
            emailDirector:DirectorBDD.email,
            
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}

const listarDirector = async (req,res)=>{
    try {
        const directores = 
        
        await Director.find({ estadoDirector: true, administrator: req.administratorHeader._id }).select(" -createdAt -updatedAt -__v").populate('Administrador','_id nombreDirector apellidoDirector')
        res.status(200).json(directores)

    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: `❌ Error en el servidor - ${error}` })
    }
}




export { registrarDirector,loginDirector,listarDirector };
