import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

import {
    FaCheckCircle,
    FaHome,
    FaInfoCircle,
} from "react-icons/fa";

import styles from "../paySucces/Pay.module.css";

export default function CheckoutSuccessPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id");

    const { clearCart } = useCart();
    const navigate = useNavigate();

    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        hasProcessed.current = true;

        // Limpiamos el carrito local de forma segura
        try {
            clearCart();
        } catch (error) {
            console.error("Error al limpiar el carrito:", error);
        }
    }, [clearCart]);

    const handleGoHome = (e: any) => {
        e.preventDefault();

        // Conservamos la navegación original
        try {
            navigate("/", { replace: true });
        } catch (error) {
            window.location.href = "/";
        }
    };

    return (
        <main className={styles.payPage}>
            <section className={`${styles.payCard} ${styles.successCard}`}>

                {/* ICONO DE PAGO EXITOSO */}
                <div className={`${styles.statusIcon} ${styles.successIcon}`}>
                    <FaCheckCircle />
                </div>

                {/* ESTADO */}
                <span className={`${styles.statusLabel} ${styles.successLabel}`}>
                    PAGO APROBADO
                </span>

                {/* TÍTULO */}
                <h1 className={styles.payTitle}>
                    ¡Pago exitoso!
                </h1>

                {/* DESCRIPCIÓN */}
                <p className={styles.payDescription}>
                    Tu compra ha sido procesada correctamente.
                    Estamos preparando tu pedido para que puedas
                    disfrutarlo muy pronto.
                </p>

                {/* NÚMERO DEL PEDIDO */}
                <div className={styles.orderBox}>
                    <span className={styles.orderLabel}>
                        Número de pedido
                    </span>

                    <strong className={styles.orderNumber}>
                        #{orderId || "Recibida"}
                    </strong>
                </div>

                {/* INFORMACIÓN */}
                <div className={`${styles.infoBox} ${styles.successInfo}`}>
                    <FaInfoCircle className={styles.infoIcon} />

                    <p>
                        Gracias por comprar en Glam Reebel.
                        En unos minutos recibirás un correo electrónico
                        con la confirmación de tu pedido y los detalles
                        de tu compra.
                    </p>
                </div>

                {/* BOTÓN PRINCIPAL */}
                <button
                    type="button"
                    onClick={handleGoHome}
                    className={styles.primaryButton}
                >
                    <FaHome />
                    VOLVER AL INICIO
                </button>

                {/* MENSAJE INFERIOR */}
                <p className={styles.footerMessage}>
                    ¡Gracias por elegir Glam Reebel!
                </p>

            </section>
        </main>
    );
}