import Estudiante from "../models/student.js";
import Director from "../models/directordeEvento.js";
import Administrator from "../models/administrator.js";
import { sendMailToRecoveryPassword } from "../helpers/RecoveryPassword.js";
import {sendMailToRecoveryPasswordDirector} from '../helpers/RecoveryPasswordDirector.js'
import {sendMailToRecoveryPasswordEstudiante} from '../helpers/RecoveryPasswordEstudiante.js'

const recuperarPasswordUniversal = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "El correo es obligatorio" });
        }

        let usuario = null;
        let tipoUsuario = null;

        usuario = await Estudiante.findOne({ emailEstudiante: email });
        if (usuario) {
            tipoUsuario = 'estudiante';
        }

        if (!usuario) {
            usuario = await Director.findOne({ emailDirector: email });
            if (usuario) {
                tipoUsuario = 'director';
            }
        }

        if (!usuario) {
            usuario = await Administrator.findOne({ email: email });
            if (usuario) {
                tipoUsuario = 'administrador';
            }
        }

        if (!usuario) {
            return res.status(404).json({ 
                msg: "No existe una cuenta asociada a este correo electrónico" 
            });
        }

        const token = usuario.createToken();
        usuario.token = token;
        await usuario.save();

        // Enviar email según el tipo de usuario
        if (tipoUsuario === 'estudiante') {
            await sendMailToRecoveryPasswordEstudiante(email, token); 
        } else if (tipoUsuario === 'director') {
            await sendMailToRecoveryPasswordDirector(email, token);
        } else {
            await sendMailToRecoveryPassword(email, token);
        }

        res.status(200).json({ 
            msg: "Revisa tu correo electrónico para restablecer tu contraseña" 
        });

    } catch (error) {
        console.error( error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};

export default recuperarPasswordUniversal;