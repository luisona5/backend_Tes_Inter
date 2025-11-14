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

export { registrarDirector };
