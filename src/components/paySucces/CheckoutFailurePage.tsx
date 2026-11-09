import { useSearchParams, useNavigate } from "react-router-dom";

import {
    FaTimesCircle,
    FaRedoAlt,
    FaInfoCircle,
} from "react-icons/fa";

import styles from "../paySucces/Pay.module.css";

export default function CheckoutFailurePage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id");
    const navigate = useNavigate();

    const handleRetry = (e: any) => {
        e.preventDefault();

        try {
            navigate("/checkout", { replace: true });
        } catch {
            window.location.href = "/checkout";
        }
    };

    return (
        <main className={styles.payPage}>
            <section className={`${styles.payCard} ${styles.failureCard}`}>

                {/* ICONO DE PAGO RECHAZADO */}
                <div className={`${styles.statusIcon} ${styles.rejectedIcon}`}>
                    <FaTimesCircle />
                </div>

                {/* ESTADO */}
                <span className={`${styles.statusLabel} ${styles.rejectedLabel}`}>
                    PAGO NO APROBADO
                </span>

                {/* TÍTULO */}
                <h1 className={styles.payTitle}>
                    El pago no pudo procesarse
                </h1>

                {/* DESCRIPCIÓN */}
                <p className={styles.payDescription}>
                    Lo sentimos, hubo un inconveniente al procesar tu pago.
                    Tu compra no pudo ser completada en este momento.
                </p>

                {/* NÚMERO DE PEDIDO */}
                <div className={styles.orderBox}>
                    <span className={styles.orderLabel}>
                        Número de pedido
                    </span>

                    <strong className={styles.orderNumber}>
                        #{orderId || "Actual"}
                    </strong>
                </div>

                {/* INFORMACIÓN */}
                <div className={`${styles.infoBox} ${styles.rejectedInfo}`}>
                    <FaInfoCircle className={styles.infoIcon} />

                    <p>
                        <strong>¡No te preocupes!</strong> Tus productos
                        siguen seguros en tu carrito. Puedes regresar al
                        proceso de pago e intentarlo nuevamente utilizando
                        otro medio de pago o verificando tus datos.
                    </p>
                </div>

                {/* BOTÓN PARA REINTENTAR */}
                <button
                    type="button"
                    onClick={handleRetry}
                    className={styles.primaryButton}
                >
                    <FaRedoAlt />
                    VOLVER A INTENTAR
                </button>

                {/* MENSAJE INFERIOR */}
                <p className={styles.footerMessage}>
                    Gracias por comprar en Glam Reebel.
                </p>

            </section>
        </main>
    );
}