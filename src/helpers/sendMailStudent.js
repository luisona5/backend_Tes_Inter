import sendMail from "../config/nodemailers.js"


const sendMailStudent = (userMail, password) => {

    return sendMail(
        userMail,
        "Bienvenido - Estudiante ",
        `
           <title>Bienvenido a POLISPORT</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial, sans-serif;color:#333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:30px;">
              <h1 style="margin:0;font-size:32px;color:#1a1a1a;">POLISPORT</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 30px 30px;">
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;">
                Hola <strong>Estudiante</strong>,
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;">
                ¡Bienvenido a <strong>POLISPORT</strong>! 
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;">
                Aquí tienes tus credenciales de acceso:
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;">
                <strong>Contraseña:</strong> <code style="background:#f0f0f0;padding:2px 4px;border-radius:4px;">${password}</code>
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;">
                Para iniciar sesión, haz clic en el botón de abajo:
              </p>
              <p style="text-align:center;margin:0 0 30px 0;">
                <a href="${process.env.VITE_URL_FRONTEND}" style="display:inline-block;padding:12px 20px;background-color:#007BFF;color:#ffffff;text-decoration:none;border-radius:5px;font-size:16px;">
                  Iniciar sesión
                </a>
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;">
                Te recomendamos cambiar tu contraseña tras el primer ingreso para garantizar la seguridad de tu cuenta.
              </p>
              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.5;">
                Si tienes cualquier duda o necesitas asistencia, no dudes en contactarnos.
              </p>
               
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9f9f9;padding:20px 30px;text-align:center;font-size:12px;color:#777777;">
              <p style="margin:0;">El equipo de POLISPORT te da la más cordial bienvenida   .</p>
              <p style="margin:0;">&copy; 2025 POLISPORT. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
        `
        )
}


export {
    
    sendMailStudent
}