import sendMail from "../config/nodemailers.js"


const sendMailToRegisterStudent = (userMail, token) => {

   return sendMail(
    userMail,
    "Bienvenido a POLISPORT",
    `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            <!-- HEADER -->
            <tr>
              <td style="background-color: #2E86AB; color: white; text-align: center; padding: 25px; font-size: 24px; font-weight: bold;">
                ¡Bienvenido a POLISPORT!
              </td>
            </tr>
            <!-- BODY -->
            <tr>
              <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.5;">
                <p>Hola 👋</p>
                <p>Gracias por registrarte en POLISPORT. Para confirmar tu cuenta, por favor haz clic en el siguiente botón:</p>
                <p style="text-align: center;">
                  <a href="${process.env.VITE_URL_FRONTEND}confirmar/estudiante/${token}"
                     style="background-color: #2E86AB; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; display: inline-block; font-size: 16px;">
                    Confirmar mi cuenta
                  </a>
                </p>
                <p>Si no creaste esta cuenta, simplemente ignora este mensaje.</p>
              </td>
            </tr>
            <!-- FOOTER -->
            <tr>
              <td style="background-color:#f9f9f9;padding:20px 30px;text-align:center;font-size:12px;color:#777777;">
              <p style="margin:0;">El equipo de POLISPORT te da la más cordial bienvenida   .</p>
              <p style="margin:0;">&copy; 2025 POLISPORT. Todos los derechos reservados.</p>
            </td>            </tr>
          </table>
        </td>
      </tr>
    </table>
    `
  );
}

export {
    
    sendMailToRegisterStudent
}