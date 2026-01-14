import Estudiante from "../models/student.js";
import Director from "../models/directordeEvento.js";
import Administrator from "../models/administrator.js";

const comprobarTokenPasswordUniversal = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ msg: "Token no proporcionado" });
        }

        // Buscar en las 3 tablas
        let usuario = null;

        // Buscar en Estudiante
        usuario = await Estudiante.findOne({ token });

        // Buscar en Director
        if (!usuario) {
            usuario = await Director.findOne({ token });
        }

        // Buscar en Administrador
        if (!usuario) {
            usuario = await Administrator.findOne({ token });
        }

        // Validar que existe y el token coincide
        if (!usuario || usuario.token !== token) {
            return res.status(404).json({ 
                msg: "Lo sentimos, no se puede validar la cuenta. Token inválido o expirado." 
            });
        }

        res.status(200).json({ msg: "Token válido. Ya puedes crear tu nuevo password" });

    } catch (error) {
        console.error("Error en comprobarTokenPasswordUniversal:", error);
        res.status(500).json({ msg: `❌ Error en el servidor - ${error.message}` });
    }
};

export default comprobarTokenPasswordUniversal;