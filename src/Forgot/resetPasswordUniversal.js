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

        // Buscar en las 3 tablas
        let usuario = null;
        let tipoUsuario = null;

        // Buscar en Estudiante
        usuario = await Estudiante.findOne({ emailEstudiante: email });
        if (usuario) {
            tipoUsuario = 'estudiante';
        }

        // Buscar en Director
        if (!usuario) {
            usuario = await Director.findOne({ emailDirector: email });
            if (usuario) {
                tipoUsuario = 'director';
            }
        }

        // Buscar en Administrador
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

        // Generar token
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
        console.error("Error en recuperarPasswordUniversal:", error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};

export default recuperarPasswordUniversal;