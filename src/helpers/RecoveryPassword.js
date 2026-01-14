import sendMail from "../config/nodemailers.js";

const sendMailToRecoveryPassword = (userMail, token) => {
    
    const recoveryLink = `${process.env.VITE_URL_FRONTEND}reset/recuperar-password/usuarios/${token}`;
    
    return sendMail(
        userMail,
        "Recupera tu contraseña - POLISPORT",
        `
       



            <title>Recuperación de Contraseña</title>



       
        <body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f2f5; padding: 50px 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                            
                            <!-- Header profesional -->
                            <tr>
                                <td style="background-color: #2E86AB; padding: 45px 40px; text-align: center; border-bottom: 4px solid #1a5f7a;">
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center">
                                                <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700; letter-spacing: 3px;">
                                                    POLISPORT
                                                </h1>
                                               
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Contenido principal -->
                            <tr>
                                <td style="padding: 50px 45px;">
                                    
                                    
                                    
                                    <h2 style="color: #1a3a4a; margin: 0 0 18px 0; font-size: 26px; font-weight: 700; text-align: center; line-height: 1.3; letter-spacing: -0.5px;">
                                        Recuperación de Contraseña
                                    </h2>
                                    
                                    <p style="color: #4a5568; line-height: 1.7; margin: 0 0 15px 0; font-size: 15px; text-align: left;">

                                        Has solicitado restablecer tu contraseña.
                                    </p>
                                    
                                    <p style="color: #718096; line-height: 1.7; margin: 0 0 40px 0; font-size: 14px; text-align: left;">
                                        Por favor, haz clic en el botón de abajo para establecer una nueva contraseña segura.
                                    </p>
                                    
                                    <!-- Botón principal -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 5px 0 35px 0;">
                                                <table cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td align="center" style="border-radius: 6px; background-color: #2E86AB">
                                                            <a href="${recoveryLink}" 
                                                               style="background-color: #2E86AB;
                                                                      color: #ffffff !important;
                                                                      padding: 16px 48px;
                                                                      text-decoration: none;
                                                                      border-radius: 6px;
                                                                      font-weight: 600;
                                                                      font-size: 15px;
                                                                      display: inline-block;
                                                                      letter-spacing: 0.3px;
                                                                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                                                <span style="color: #ffffff;">Restablecer Contraseña</span>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    
                                </td>
                            </tr>
                        
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `
    );
};

export { sendMailToRecoveryPassword };