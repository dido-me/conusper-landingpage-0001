# Configuración de Sistema de Correos - CONUSPER Landing Page

## Requisitos Previos

Para que el sistema de envío de correos funcione correctamente, necesitas instalar las siguientes dependencias:

```bash
npm install @astrojs/react react react-dom nodemailer @types/nodemailer
```

## Variables de Entorno

### Configuración Moderna con astro:env

El proyecto usa la nueva API `astro:env` de Astro 5 para variables de entorno type-safe.

**1. Configuración en astro.config.mjs (YA CONFIGURADO):**
```javascript
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  env: {
    schema: {
      EMAIL_PASSWORD: envField.string({ 
        context: "server", 
        access: "secret" 
      })
    }
  }
});
```

**2. Crear archivo `.env` en la raíz del proyecto:**
```env
EMAIL_PASSWORD=tu_contraseña_real_aqui
```

**3. Uso en el código (YA IMPLEMENTADO):**
```typescript
import { EMAIL_PASSWORD } from 'astro:env/server';
```

## Configuración SMTP

El sistema está configurado para usar los siguientes parámetros SMTP:

- **Host**: `conusper.efsystemas.net`
- **Puerto**: `465` (SSL/TLS)
- **Usuario**: `info@conusper.efsystemas.net`
- **Contraseña**: La definida en `EMAIL_PASSWORD`

### Configuración Completa del Servidor de Correo

```
Secure SSL/TLS Settings (Recommended)
Username: info@conusper.efsystemas.net
Password: [Usar la contraseña de la cuenta de correo]
Incoming Server: conusper.efsystemas.net
IMAP Port: 993 POP3 Port: 995
Outgoing Server: conusper.efsystemas.net
SMTP Port: 465
IMAP, POP3, and SMTP require authentication.
```

## Funcionalidades Implementadas

### 1. Endpoint de API (`/api/send-email`)
- Recibe datos del formulario vía POST
- Valida campos requeridos
- Envía correo usando nodemailer
- Retorna respuestas JSON con estado de éxito/error

### 2. Formulario y Modal React (`ContactForm.tsx`)
- Componente React completo con estado interno
- Formulario controlado con validación
- Modal de confirmación integrado
- Manejo de errores con mensajes descriptivos
- **Uso correcto de directivas client de Astro**

### 3. Validaciones Completas
- **Frontend (React)**: Validación en tiempo real mientras el usuario escribe
- **Backend (API)**: Validación robusta antes de enviar el correo
- **Campos validados**:
  - **Nombre**: Solo letras, espacios y acentos (mínimo 2 palabras, 2-50 caracteres)
  - **Email**: Formato de correo electrónico válido
  - **Teléfono**: Números peruanos de 9 dígitos que comienzan con 9 (ej: 942404311)
  - **Mensaje**: Entre 10 y 1000 caracteres

### 4. Manejo de Errores
- Mensajes de error específicos por campo
- Indicadores visuales de campos con errores
- Contador de caracteres para el mensaje
- Validación antes del envío
- Manejo de errores del servidor

## Estructura de Archivos

```
src/
├── components/
│   ├── Contact.astro                    # Componente principal que usa React
│   └── react/
│       ├── ContactForm.tsx              # Formulario React completo con modal
│       └── ContactForm.module.css       # Estilos CSS modules
├── pages/
│   └── api/
│       └── send-email.ts                # Endpoint para envío de correos
└── layouts/
    └── ConusperLayout.astro             # Layout con configuración de React
```

## Implementación según Best Practices de Astro

### ✅ Forma Correcta (Implementación Actual)

En `Contact.astro`:
```astro
---
import ContactForm from './react/ContactForm.tsx';
---

<ContactForm client:load />
```

Esta implementación:
- ✅ Importa el componente React en el frontmatter
- ✅ Usa directamente el componente con `client:load`
- ✅ React maneja su propio estado y lógica
- ✅ Sigue las directivas client de Astro

### ❌ Forma Incorrecta (Anterior)
```astro
<script>
  import { createRoot } from 'react-dom/client';
  // Renderizado manual con createRoot...
</script>
```

## Directivas Client Disponibles

- `client:load` - **Usado**: Carga inmediatamente al cargar la página
- `client:idle` - Carga cuando la página termina de cargar
- `client:visible` - Carga cuando el componente es visible
- `client:media` - Carga según media query

## Modo de Uso

1. El usuario ve el formulario de contacto (renderizado como HTML estático)
2. Al cargar la página, React se hidrata con `client:load`
3. El usuario llena y envía el formulario
4. React maneja la petición POST a `/api/send-email`
5. Se muestra el modal de confirmación o mensaje de error

## Beneficios de esta Implementación

- 🚀 **Performance**: Solo se carga JavaScript cuando es necesario
- 🎯 **SEO**: El HTML se genera en el servidor
- 🔧 **Mantenibilidad**: Separación clara entre Astro y React
- 📱 **UX**: Formulario funciona incluso sin JavaScript (progressive enhancement)

## Notas de Seguridad

- La contraseña del correo debe estar en variables de entorno
- No incluir credenciales en el código fuente
- El archivo `.env` está en `.gitignore` por seguridad

## Validaciones Implementadas

### 📋 **Reglas de Validación:**

#### Nombre Completo
- ✅ Solo letras, espacios y acentos (á, é, í, ó, ú, ñ)
- ✅ Mínimo 2 palabras (nombre y apellido)
- ✅ Entre 2 y 50 caracteres
- ❌ No se permiten números ni símbolos especiales

#### Correo Electrónico
- ✅ Formato estándar de email (usuario@dominio.com)
- ✅ Dominio válido con al menos 2 caracteres
- ❌ No se permiten espacios ni caracteres especiales no válidos

#### Teléfono (Opcional)
- ✅ Solo números peruanos: 9 dígitos que comienzan con 9
- ✅ Ejemplo válido: `942404311`, `987654321`
- ✅ Se eliminan automáticamente espacios y guiones
- ❌ No se permiten números que no empiecen con 9
- ❌ No se permiten más o menos de 9 dígitos

#### Mensaje
- ✅ Mínimo 10 caracteres
- ✅ Máximo 1000 caracteres
- ✅ Contador de caracteres en tiempo real
- ❌ No se permiten mensajes muy cortos o muy largos

### 🔄 **Flujo de Validación:**
1. **Tiempo Real**: Validación mientras el usuario escribe (después del primer blur)
2. **Al Enviar**: Validación completa antes de enviar al servidor
3. **Servidor**: Validación adicional por seguridad
4. **Feedback**: Mensajes específicos de error por campo

## Pruebas

Para probar el sistema:

1. Configura la variable `EMAIL_PASSWORD` en `.env`
2. Ejecuta `npm run dev`
3. Ve a la sección de contacto
4. **Prueba las validaciones**:
   - Intenta enviar campos vacíos
   - Prueba un email inválido (ej: `test@`)
   - Prueba un teléfono inválido (ej: `123456789`)
   - Prueba un nombre con números (ej: `Juan123`)
5. Llena correctamente y envía el formulario
6. Verifica que llegue el correo a `info@conusper.efsystemas.net` 