import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from 'astro:env/server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.headers.get('Content-Type') !== 'application/json') {
      return new Response(
        JSON.stringify({ error: 'Content-Type debe ser application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { nombre, email, telefono, mensaje } = body;

    if (!nombre || !email || !mensaje) {
      return new Response(
        JSON.stringify({ error: 'Nombre, email y mensaje son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const validationErrors = [];

    const nombreRegex = /^[a-zA-ZÀ-ÿñÑ\s]{2,50}$/;
    const nombrePalabras = nombre.trim().split(/\s+/);
    if (!nombreRegex.test(nombre) || nombrePalabras.length < 2) {
      validationErrors.push('El nombre debe contener al menos 2 palabras, solo letras y espacios (2-50 caracteres)');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      validationErrors.push('El formato del correo electrónico no es válido');
    }

    if (telefono && telefono.trim() !== '') {
      const telefonoLimpio = telefono.replace(/\s|-/g, '');
      const telefonoRegex = /^9\d{8}$/;
      if (!telefonoRegex.test(telefonoLimpio)) {
        validationErrors.push('El teléfono debe ser un número peruano válido (9 dígitos que comience con 9, ej: 941104311)');
      }
    }

    if (mensaje.trim().length < 10) {
      validationErrors.push('El mensaje debe tener al menos 10 caracteres');
    }
    if (mensaje.length > 1000) {
      validationErrors.push('El mensaje no puede exceder 1000 caracteres');
    }

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Errores de validación', 
          details: validationErrors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!EMAIL_PASSWORD) {
      console.error('ERROR: EMAIL_PASSWORD no está definida en las variables de entorno');
      return new Response(
        JSON.stringify({ error: 'Configuración de email no disponible' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'conusper.efsystemas.net',
      port: 465,
      secure: true,
      auth: {
        user: 'info@conusper.efsystemas.net',
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"Formulario Web CONUSPER" <info@conusper.efsystemas.net>',
      to: ['info@conusper.efsystemas.net', 'henryayacucho@gmail.com'],
      subject: `Nuevo mensaje de ${nombre} - Formulario Web CONUSPER`,
      html: `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa;">
          <div style="background-color: #0f4c81; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">CONUSPER EIRL</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Nuevo mensaje desde el sitio web</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0f4c81; margin-top: 0; margin-bottom: 20px;">Detalles del Contacto</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #0f4c81;">Nombre:</strong> ${nombre}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #0f4c81;">Email:</strong> 
              <a href="mailto:${email}" style="color: #d32f2f; text-decoration: none;">${email}</a>
            </div>
            
            ${telefono ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #0f4c81;">Teléfono:</strong> ${telefono}
            </div>
            ` : ''}
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #0f4c81;">Mensaje:</strong>
            </div>
            
            <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
              ${mensaje.replace(/\n/g, '<br>')}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p style="font-size: 12px; color: #666; margin: 0;">
              Este mensaje fue enviado desde el formulario de contacto del sitio web de CONUSPER EIRL.
              <br>Fecha: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}
            </p>
          </div>
        </div>
      `,
      text: `
Nuevo mensaje de: ${nombre}
Email: ${email}
${telefono ? `Teléfono: ${telefono}` : ''}

Mensaje:
${mensaje}

Enviado el: ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Correo enviado exitosamente' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error al enviar correo:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor al enviar el correo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}; 