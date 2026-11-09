import { useState } from 'react';
import styles from "../Preguntas/Preguntas.module.css";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";

const faqsData = [
    {
        question: "¿Los productos son originales?",
        answer: "Sí, todos. Somos distribuidores oficiales de todas las marcas que manejamos, así que lo que compras con nosotros es original y de primera mano."
    },
    {
        question: "¿Tienen tienda física?",
        answer: "Sí, Estamos en la Cra 114 No. 152B - 34, Bogotá. Abrimos de lunes a domingo de 11:00 a.m. a 8:00 p.m."
    },
    {
        question: "¿Hacen envíos a todo el país?",
        answer: "Sí. Enviamos a toda Colombia a través de Interrapidísimo."
    },
    {
        question: "¿Cuánto cuesta el envío?",
        answer: (
            <>
                <p><strong>Bogotá:</strong> el domicilio tiene un costo de $10.000.</p>
                <p><strong>Nacional:</strong> es gratis en compras superiores a $200.000. Si tu compra es menor, el valor depende de tu ciudad y te lo confirmamos antes de pagar.</p>
            </>
        )
    },
    {
        question: "¿Puedo pagar contra entrega?",
        answer: "Sí, pero solo para pedidos en Bogotá. Para envíos nacionales el pago se hace antes del despacho."
    },
    {
        question: "¿Qué medios de pago reciben?",
        answer: "Nequi, Daviplata, transferencia Bre-B, tarjeta, PSE y efectivo."
    },
    {
        question: "¿Venden al por mayor?",
        answer: "Por ahora solo vendemos al detal."
    },
    {
        question: "No sé cuál es mi tono, ¿me ayudan?",
        answer: "¡Claro que sí! Escríbenos por WhatsApp y cuéntanos tu tipo de piel o mándanos una foto con luz natural, sin filtro, y te ayudamos a escoger. Si prefieres, ven a la tienda y lo miramos juntas."
    },
    {
        question: "¿Qué pasa si mi producto llega en mal estado?",
        answer: "Tienes un plazo de 24 horas desde que recibes el paquete para avisarnos por WhatsApp. Envíanos fotos del producto y del empaque como evidencia y revisamos tu caso."
    }
];

function PreguntasFrecuentes() {
    // 👈 Se agrega <number | null> para tipificar correctamente el useState
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className={styles.faqContainer}>
            <div className={styles.faqHeader}>
                <FaQuestionCircle className={styles.headerIcon} />
                <h1 className={styles.title}>Preguntas Frecuentes</h1>
                <p className={styles.subtitle}>Resuelve tus dudas sobre compras, envíos y productos de forma rápida.</p>
            </div>

            <div className={styles.faqList}>
                {faqsData.map((faq, index) => (
                    <div 
                        key={index} 
                        className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
                    >
                        <button 
                            className={styles.faqQuestion} 
                            onClick={() => toggleAccordion(index)}
                            type="button"
                        >
                            <span>{faq.question}</span>
                            <FaChevronDown className={styles.chevron} />
                        </button>
                        <div className={styles.faqAnswerContainer}>
                            <div className={styles.faqAnswer}>
                                {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PreguntasFrecuentes;