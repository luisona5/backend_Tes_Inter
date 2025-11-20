import sendMail from "../config/nodemailers.js";

const sendMailToRecoveryPassword = (userMail, token) => {
    const enlacepassword = `${process.env.VITE_BACKEND_URL}/recuperarpassword/${token}`;
    
    return sendMail(
        userMail,
        "Restablecimiento de Contraseña - POLISPORT",
        `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #2E86AB 0%, #1a5f7a 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                                        POLISPORT
                                    </h1>
                                    <p style="color: #e3f2fd; margin: 8px 0 0 0; font-size: 14px; font-weight: 300;">
                                        El deporte al servicio de la ESFOT
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Body Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                        🔐 Solicitud de Restablecimiento de Contraseña
                                    </h2>
                                    
                                    <p style="color: #555555; line-height: 1.8; margin: 0 0 15px 0; font-size: 15px;">
                                        Hola,
                                    </p>
                                    
                                    <p style="color: #555555; line-height: 1.8; margin: 0 0 15px 0; font-size: 15px;">
                                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>POLISPORT</strong>.
                                    </p>
                                    
                                    <p style="color: #555555; line-height: 1.8; margin: 0 0 25px 0; font-size: 15px;">
                                        Para continuar con el proceso de forma segura, haz clic en el siguiente botón:
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 20px 0;">
                                                <a href="${enlacepassword}" 
                                                   style="background: linear-gradient(135deg, #2E86AB 0%, #1a5f7a 100%);
                                                          color: #ffffff;
                                                          padding: 16px 40px;
                                                          text-decoration: none;
                                                          border-radius: 50px;
                                                          font-weight: 600;
                                                          font-size: 16px;
                                                          display: inline-block;
                                                          box-shadow: 0 4px 15px rgba(46, 134, 171, 0.3);
                                                          transition: all 0.3s ease;">
                                                    Restablecer Contraseña
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                
                                    <!-- Security Warning -->
                                    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 15px; margin: 25px 0;">
                                        <p style="color: #856404; margin: 0; font-size: 13px; line-height: 1.6;">
                                            ⚠️ <strong>Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá segura. 
                                        </p>
                                    </div>
                                    
                                    <p style="color: #666666; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                                        Saludos cordiales,<br>
                                        <strong style="color: #2E86AB;">Equipo POLISPORT</strong>
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                    <p style="color: #2E86AB; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                                        POLISPORT
                                    </p>
                                    <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 13px; line-height: 1.6;">
                                        El deporte es vida y salud
                                    </p>
                                    
                                    
                                    
                                    <p style="color: #999999; margin: 15px 0 0 0; font-size: 11px;">
                                        © ${new Date().getFullYear()} POLISPORT - ESFOT. Todos los derechos reservados.
                                    </p>
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