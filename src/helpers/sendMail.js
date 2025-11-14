import sendMail from "../config/nodemailers.js"

const sendMailToOwner = (userMail, password) => {

    return sendMail(
        userMail,
        "Bienvenido - Director",
        `
            <h1>POSLISPORT - </h1>
            <p>Bienvenido a SMARTVET, estas son tus credenciales de acceso:</p>
            <p><strong>Contraseña:</strong> ${password}</p>
            <a href="${process.env.VITE_BACKEND_URL}login">Iniciar sesión</a>
            <hr>
            <footer>El equipo te da la más cordial bienvenida.</footer>
        `
        )
}


export {
    
    sendMailToOwner
}