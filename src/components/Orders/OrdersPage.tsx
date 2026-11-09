import { useEffect, useState } from "react";
import { getMyOrdersRequest, deleteOrderRequest } from "../../api/taskApi";
import styles from "./Orders.module.css"; 

// Componente visual para la guía de pasos del pedido (Basado en shipping_status)
const OrderTracker = ({ currentStatus }: { currentStatus: string }) => {
    const steps = [
        { title: "Pedido recibido", key: "pendiente" },
        { title: "En preparación", key: "en preparación" },
        { title: "Despachado", key: "despachado" },
        { title: "Entregado", key: "entregado" }
    ];

    const getStepState = (stepKey: string, current: string) => {
        const statusOrder = ["pendiente", "en preparación", "despachado", "entregado"];
        const currentIndex = statusOrder.findIndex(s => (current || "").toLowerCase().includes(s));
        const stepIndex = statusOrder.findIndex(s => s === stepKey);

        if (currentIndex === -1) {
            return stepKey === "pendiente" ? "completed" : "pending";
        }

        if (stepIndex <= currentIndex) return "completed";
        return "pending";
    };

    return (
        <div style={{ display: "flex", justifyContent: "space-between", margin: "15px 0 25px 0", padding: "0 10px" }}>
            {steps.map((step, index) => {
                const state = getStepState(step.key, currentStatus);
                const isCompleted = state === "completed";

                return (
                    <div key={index} style={{ textAlign: "center", flex: 1, position: "relative" }}>
                        <div style={{
                            width: "28px",
                            height: "28px",
                            margin: "0 auto 6px",
                            borderRadius: "50%",
                            background: isCompleted ? "#ff1867" : "#e0e0e0",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "12px"
                        }}>
                            {index + 1}
                        </div>
                        <span style={{ fontSize: "11px", color: isCompleted ? "#333" : "#888", display: "block" }}>
                            {step.title}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await getMyOrdersRequest();
                if (res.success) {
                    setOrders(res.data);
                } else {
                    setError("No se pudieron cargar los pedidos.");
                }
            } catch (err) {
                setError("Ocurrió un error al obtener tus pedidos.");
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm(`¿Estás segura de que deseas eliminar el pedido #${orderId}?`)) {
            return;
        }

        try {
            const res = await deleteOrderRequest(orderId);
            if (res.success) {
                setOrders(orders.filter((order) => order.id !== orderId));
            } else {
                alert(res.message || "No se pudo eliminar el pedido.");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Ocurrió un error al intentar eliminar el pedido.");
        }
    };

    if (loading) return <div className={styles.loading}>Cargando tus pedidos...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.ordersContainer}>
            <h2>Mis Pedidos</h2>
            {orders.length === 0 ? (
                <div className={styles.emptyOrders}>
                    <p>Aún no has realizado ningún pedido.</p>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {orders.map((order) => {
                        const statusLower = (order.status || "").toLowerCase();
                        const canDelete = statusLower.includes("pendiente") || statusLower.includes("rechazado");

                        return (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderTitle}>Pedido #${order.id}</span>
                                    <span className={styles.statusBadge}>{order.status}</span>
                                </div>
                                
                                {/* 🚀 USAMOS EL SHIPPING_STATUS PARA LOS 4 CÍRCULOS */}
                                <OrderTracker currentStatus={order.shipping_status} />

                                <div className={styles.orderDetails}>
                                    <p><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString()}</p>
                                    <p><strong>Método de pago:</strong> {order.payment_method}</p>
                                    <p><strong>Estado de envío:</strong> {order.shipping_status}</p>
                                    <p><strong>Total:</strong> <span className={styles.totalPrice}>${Number(order.total).toLocaleString()} COP</span></p>
                                </div>

                                {order.shippingData && (
                                    <div className={styles.shippingBox}>
                                        <p className={styles.shippingTitle}>📦 Datos de Envío:</p>
                                        <p><strong>Destinatario:</strong> {order.shippingData.shipping_name} {order.shippingData.shipping_apellido}</p>
                                        <p><strong>Cédula:</strong> {order.shippingData.shipping_cedula}</p>
                                        <p><strong>Teléfono:</strong> {order.shippingData.shipping_phone}</p>
                                        <p><strong>Dirección:</strong> {order.shippingData.shipping_address}</p>
                                        <p><strong>Barrio / Localidad:</strong> {order.shippingData.shipping_barrio} - {order.shippingData.shipping_localidad}</p>
                                        <p><strong>Ciudad:</strong> {order.shippingData.shipping_city}</p>
                                    </div>
                                )}

                                <div className={styles.itemsSection}>
                                    <h4>Productos comprados:</h4>
                                    <ul>
                                        {order.items.map((item: any) => (
                                            <li key={item.id} className={styles.itemRow}>
                                                <span>{item.product_name} (x{item.quantity})</span>
                                                <span className={styles.itemPrice}>${Number(item.price).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {canDelete && (
                                    <div className={styles.orderActions} style={{ marginTop: "15px", textAlign: "right" }}>
                                        <button 
                                            onClick={() => handleDeleteOrder(order.id)}
                                            style={{
                                                background: "#ff4d4f",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 14px",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            🗑️ Eliminar Pedido
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
