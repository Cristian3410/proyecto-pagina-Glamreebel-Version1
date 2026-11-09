import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaClock, FaHome, FaInfoCircle } from "react-icons/fa";

import { useCart } from "../../contexts/CartContext";
import styles from "../paySucces/Pay.module.css";

// El estado de la orden lo actualiza exclusivamente
// el webhook de Mercado Pago.

export default function CheckoutPendingPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id");

    const { clearCart } = useCart();
    const navigate = useNavigate();

    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        hasProcessed.current = true;

        try {
            clearCart();
        } catch (error) {
            console.error("Error al limpiar el carrito:", error);
        }
    }, [clearCart]);

    return (
        <main className={styles.payPage}>
            <section className={`${styles.payCard} ${styles.pendingCard}`}>

                <div className={`${styles.statusIcon} ${styles.pendingIcon}`}>
                    <FaClock />
                </div>

                <span className={`${styles.statusLabel} ${styles.pendingLabel}`}>
                    PAGO EN PROCESO
                </span>

                <h1 className={styles.payTitle}>
                    ¡Tu pago está pendiente!
                </h1>

                <p className={styles.payDescription}>
                    Hemos recibido tu solicitud de compra. Tu pago todavía
                    está pendiente de acreditación por parte de Mercado Pago.
                </p>

                <div className={styles.orderBox}>
                    <span className={styles.orderLabel}>
                        Número de pedido
                    </span>

                    <strong className={styles.orderNumber}>
                        #{orderId || "Recibido"}
                    </strong>
                </div>

                <div className={`${styles.infoBox} ${styles.pendingInfo}`}>
                    <FaInfoCircle className={styles.infoIcon} />

                    <p>
                        Para consultar el resultado de tu pago, ingresa a tu
                        perfil, selecciona <strong>Mis pedidos</strong> y
                        verifica el estado de tu compra. Cuando el pago sea
                        confirmado, aparecerá como <strong>Pagado</strong> o
                        <strong> Aprobado</strong>.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className={styles.primaryButton}
                >
                    <FaHome />
                    VOLVER AL INICIO
                </button>

                <p className={styles.footerMessage}>
                    Gracias por comprar en Glam Reebel.
                </p>

            </section>
        </main>
    );
}