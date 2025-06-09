import React, { useState } from 'react';
import styles from './ContactForm.module.css';

interface ContactFormProps {
}

const ContactForm: React.FC<ContactFormProps> = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateNombre = (value: string): string => {
    const nombreRegex = /^[a-zA-ZÀ-ÿñÑ\s]{2,50}$/;
    const palabras = value.trim().split(/\s+/);
    
    if (!value.trim()) return 'El nombre es requerido';
    if (!nombreRegex.test(value)) return 'Solo se permiten letras, espacios y acentos';
    if (palabras.length < 2) return 'Ingrese al menos nombre y apellido';
    if (value.length < 2 || value.length > 50) return 'Debe tener entre 2 y 50 caracteres';
    return '';
  };

  const validateEmail = (value: string): string => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!value.trim()) return 'El correo electrónico es requerido';
    if (!emailRegex.test(value)) return 'Ingrese un correo electrónico válido';
    return '';
  };

  const validateTelefono = (value: string): string => {
    if (!value.trim()) return '';
    
    const telefonoLimpio = value.replace(/\s|-/g, '');
    const telefonoRegex = /^9\d{8}$/;
    
    if (!telefonoRegex.test(telefonoLimpio)) {
      return 'Debe ser un número peruano válido (9 dígitos que comience con 9)';
    }
    return '';
  };

  const validateMensaje = (value: string): string => {
    if (!value.trim()) return 'El mensaje es requerido';
    if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
    if (value.length > 1000) return 'El mensaje no puede exceder 1000 caracteres';
    return '';
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'nombre': return validateNombre(value);
      case 'email': return validateEmail(value);
      case 'telefono': return validateTelefono(value);
      case 'mensaje': return validateMensaje(value);
      default: return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const newErrors: {[key: string]: string} = {};
    Object.keys(formData).forEach(field => {
      const fieldError = validateField(field, formData[field as keyof typeof formData]);
      if (fieldError) {
        newErrors[field] = fieldError;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        nombre: true,
        email: true,
        telefono: true,
        mensaje: true
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowModal(true);
        setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
        setErrors({});
        setTouched({});
      } else {
        if (result.details && Array.isArray(result.details)) {
          setErrors({ general: result.details.join('. ') });
        } else {
          setErrors({ general: result.error || 'Error al enviar el mensaje' });
        }
      }
    } catch (err) {
      let errorMessage = 'Ha ocurrido un error al enviar su mensaje. ';
      
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          errorMessage += 'Por favor, verifique su conexión a internet e intente nuevamente.';
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'Por favor, intente nuevamente más tarde.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.contactForm}>
        <div className={styles.formGroup}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre Completo"
            value={formData.nombre}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.nombre ? styles.inputError : ''}
            required
          />
          {errors.nombre && (
            <div className={styles.fieldError}>
              {errors.nombre}
            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.email ? styles.inputError : ''}
            required
          />
          {errors.email && (
            <div className={styles.fieldError}>
              {errors.email}
            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono (ej: 942404311)"
            value={formData.telefono}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.telefono ? styles.inputError : ''}
            maxLength={9}
            pattern="9[0-9]{8}"
          />
          {errors.telefono && (
            <div className={styles.fieldError}>
              {errors.telefono}
            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <textarea
            name="mensaje"
            placeholder="Su mensaje o consulta"
            value={formData.mensaje}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.mensaje ? styles.inputError : ''}
            maxLength={1000}
            required
          />
          <div className={styles.charCount}>
            {formData.mensaje.length}/1000 caracteres
          </div>
          {errors.mensaje && (
            <div className={styles.fieldError}>
              {errors.mensaje}
            </div>
          )}
        </div>
        
        {errors.general && (
          <div className={styles.errorMessage}>
            {errors.general}
          </div>
        )}
        
        <button 
          type="submit" 
          className={styles.btn} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </form>

      {/* Modal de éxito */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              <h2>¡Mensaje Enviado!</h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <p>¡Gracias por contactarnos! Su mensaje ha sido enviado exitosamente.</p>
              <p className={styles.modalNote}>
                Nos pondremos en contacto con usted a la brevedad posible.
              </p>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.modalButton} onClick={closeModal}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactForm; 