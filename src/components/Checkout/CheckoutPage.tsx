import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { createMercadoPagoPreference } from "../../api/taskApi";
import styles from "./Chekout.module.css";

export default function CheckoutPage() {
    const { user } = useAuth();
    const { cart, totalPrice } = useCart(); // Quitamos clearCart de aquí porque no debe borrarse al salir
    const [loading, setLoading] = useState(false);

    const [shippingForm, setShippingForm] = useState({
        shipping_name: "",
        shipping_apellido: "",
        shipping_cedula: "",
        shipping_phone: "",
        shipping_address: "",
        shipping_city: "",
        shipping_barrio: "",
        shipping_localidad: ""
    });

    useEffect(() => {
        if (user) {
            setShippingForm({
                shipping_name: user?.name || user?.usuario || "",
                shipping_apellido: user?.apellido || "",
                shipping_cedula: user?.cedula || "",
                shipping_phone: user?.telefono || "",
                shipping_address: user?.direccion || "",
                shipping_city: user?.city || "",
                shipping_barrio: user?.barrio || "",
                shipping_localidad: user?.localidad || ""
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingForm({
            ...shippingForm,
            [e.target.name]: e.target.value
        });
    };

    // Validamos si la ciudad escrita es Bogotá (ignorando mayúsculas, minúsculas o tildes)
    const isBogota = shippingForm.shipping_city
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes("bogota");

    // Costo de envío: $10.000 si es Bogotá, de lo contrario $0 (o pendiente de cotizar)
    const shippingCost = isBogota ? 10000 : 0;
    const finalTotalWithShipping = totalPrice + shippingCost;

    const handlePayment = async () => {
        if (!cart || cart.length === 0) {
            alert("Tu carrito está vacío");
            return;
        }

        if (!shippingForm.shipping_address || !shippingForm.shipping_phone || !shippingForm.shipping_city || !shippingForm.shipping_cedula || !shippingForm.shipping_barrio || !shippingForm.shipping_localidad) {
            alert("Por favor completa todos los datos obligatorios de envío (incluyendo ciudad, barrio y localidad).");
            return;
        }

        try {
            setLoading(true);

            // Mapeo seguro usando item.id y item.name que sí existen en el tipo de CartItem
            const formattedItems = cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                price: item.numericPrice,
                quantity: item.quantity,
                selectedColor: item.selectedColor || null
            }));

            const orderPayload = {
                userId: user?.id || user?.usuario_id,
                items: formattedItems,
                totalPrice: finalTotalWithShipping,
                shippingData: shippingForm,
                shippingCost: shippingCost
            };

            const data = await createMercadoPagoPreference(orderPayload);

            // Verificamos si la API devolvió el link de pago
            const paymentUrl = data.init_point || data.url || data.data?.init_point;

            if (paymentUrl) {
                // Redirigimos al usuario directamente a Mercado Pago en la misma pestaña
                window.location.href = paymentUrl;
            } else {
                alert(data.message || "No se pudo iniciar el pago con Mercado Pago.");
            }
        } catch (error: any) {
            console.error("Error al procesar el pago:", error);
            alert(error.message || "Ocurrió un error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.checkoutContainer}>
            <h2>Finalizar Compra y Envío</h2>
            
            <div className={styles.shippingSection}>
                <h4>Dirección de Destino:</h4>
                
                <div className={styles.gridTwoCols}>
                    <div>
                        <label className={styles.label}>Nombre:</label>
                        <input 
                            type="text" 
                            name="shipping_name" 
                            value={shippingForm.shipping_name} 
                            onChange={handleInputChange}
                            className={styles.input}
                        />
                    </div>
                    <div>
                        <label className={styles.label}>Apellido:</label>
                        <input 
                            type="text" 
                            name="shipping_apellido" 
                            value={shippingForm.shipping_apellido} 
                            onChange={handleInputChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.gridTwoCols}>
                    <div>
                        <label className={styles.label}>Cédula / NIT:</label>
                        <input 
                            type="text" 
                            name="shipping_cedula" 
                            value={shippingForm.shipping_cedula} 
                            onChange={handleInputChange}
                            className={styles.input}
                        />
                    </div>
                    <div>
                        <label className={styles.label}>Teléfono:</label>
                        <input 
                            type="text" 
                            name="shipping_phone" 
                            value={shippingForm.shipping_phone} 
                            onChange={handleInputChange}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Dirección exacta:</label>
                    <input 
                        type="text" 
                        name="shipping_address" 
                        value={shippingForm.shipping_address} 
                        onChange={handleInputChange}
                        placeholder="Ej: Calle 100 # 15-20 apto 301"
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Ciudad:</label>
                    <input 
                        type="text" 
                        name="shipping_city" 
                        value={shippingForm.shipping_city} 
                        onChange={handleInputChange}
                        placeholder="Ej: Bogotá"
                        className={styles.input}
                    />
                </div>

                <div className={styles.gridTwoCols}>
                    <div>
                        <label className={styles.label}>Barrio:</label>
                        <input 
                            type="text" 
                            name="shipping_barrio" 
                            value={shippingForm.shipping_barrio} 
                            onChange={handleInputChange}
                            placeholder="Ej: Chapinero"
                            className={styles.input}
                        />
                    </div>
                    <div>
                        <label className={styles.label}>Localidad:</label>
                        <input 
                            type="text" 
                            name="shipping_localidad" 
                            value={shippingForm.shipping_localidad} 
                            onChange={handleInputChange}
                            placeholder="Ej: Chapinero"
                            className={styles.input}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.productsSection}>
                <h4>Productos:</h4>
                {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedColor?.name || 'default'}`} className={styles.productRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                        <div>
                            <span style={{ fontWeight: "500" }}>{item.name}</span> (x{item.quantity})
                            
                            {/* Visualización del tono seleccionado en el Checkout */}
                            {item.selectedColor && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                                    <span 
                                        style={{ 
                                            width: "12px", 
                                            height: "12px", 
                                            borderRadius: "50%", 
                                            backgroundColor: item.selectedColor.hex,
                                            display: "inline-block",
                                            border: "1px solid #ccc"
                                        }} 
                                    />
                                    <span style={{ fontSize: "12px", color: "#666" }}>
                                        Tono: <strong>{item.selectedColor.name}</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className={styles.productPrice}>${(item.numericPrice * item.quantity).toLocaleString()} COP</span>
                    </div>
                ))}
            </div>

            {/* Desglose de Totales */}
            <div style={{ margin: "20px 0", fontSize: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal productos:</span>
                    <span>${totalPrice.toLocaleString()} COP</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Costo de envío {isBogota ? "(Bogotá)" : ""}:</span>
                    <span>{isBogota ? "$10.000 COP" : "A coordinar / Otro"}</span>
                </div>
            </div>

            <h3 className={styles.totalTitle}>Total a Pagar: ${finalTotalWithShipping.toLocaleString()} COP</h3>

            <button 
                onClick={handlePayment} 
                disabled={loading}
                className={styles.payButton}
            >
                {loading ? "Conectando con Mercado Pago..." : "Pagar con Mercado Pago"}
            </button>
        </div>
    );
}