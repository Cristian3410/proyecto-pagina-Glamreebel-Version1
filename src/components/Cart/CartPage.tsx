import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Cart.module.css";
import { useState } from "react";

interface CartPageProps {
  onOpenLogin: () => void;
}

export default function CartPage({ onOpenLogin }: CartPageProps) {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  // Extraemos también "user" para verificar si es administrador
  const { isAuthenticated, verifyEmailSing, zodErrros, signup, user } = useAuth() as any;
  const navigate = useNavigate();
  
  const [emailInput, setEmailInput] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  // Estado para controlar la ciudad seleccionada
  const [shippingDestination, setShippingDestination] = useState("bogota");

  // Cálculo del envío: $10.000 si es Bogotá, $0 si es otra ciudad (o pendiente de calcular)
  const shippingCost = shippingDestination === "bogota" ? 10000 : 0;
  const finalTotal = totalPrice + shippingCost;

  // Verificamos si el usuario actual es admin
  const isAdmin = user?.role === "admin" || user?.is_admin;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      setShowEmailInput(true);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const result = await verifyEmailSing(emailInput);
    if (result.success) {
      if (result.exists) {
        setShowEmailInput(false);
        onOpenLogin();
      } else {
        setIsNewUser(true);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    
    const defaultUsername = emailInput.split("@")[0];
    const registerData = {
        correo: emailInput,
        usuario: defaultUsername,
        contrasena: passwordInput 
    };

    const success = await signup(registerData);
    if (success) {
        setIsNewUser(false);    
        setShowEmailInput(false); 
        navigate("/checkout");   
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <h2>Tu carrito de compras está vacío</h2>
        <p>¿Aún no te decides? Explora nuestro catálogo y llena tu cosmetiquera de brillo.</p>
        <Link to="/catalog" className={styles.emptyButton}>
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1>TUS PRODUCTOS SELECCIONADOS</h1>
      
      <div className={styles.cartLayout}>
        <div className={styles.itemsList}>
          {cart.map((item) => (
            <div key={`${item.id}-${item.selectedColor?.name || 'default'}`} className={styles.cartItemCard}>
              <Link to={`/products/${item.id}`} className={styles.itemImageLink}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
              </Link>
              
              <div className={styles.itemDetails}>
                <Link to={`/products/${item.id}`} className={styles.itemTitleLink}>
                  <h3>{item.name}</h3>
                </Link>

                {/* Muestra visual del tono seleccionado */}
                {item.selectedColor && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "4px 0" }}>
                    <span 
                      style={{ 
                        width: "14px", 
                        height: "14px", 
                        borderRadius: "50%", 
                        backgroundColor: item.selectedColor.hex,
                        display: "inline-block",
                        border: "1px solid #ddd"
                      }} 
                    />
                    <span style={{ fontSize: "13px", color: "#666", fontWeight: "500" }}>
                      Tono: <strong>{item.selectedColor.name}</strong>
                    </span>
                  </div>
                )}

                <p className={styles.itemPrice}>{item.price}</p>
                
                {/* Indicador visual de stock si está cerca del límite y no es admin */}
                {!isAdmin && item.stock <= 5 && item.stock > 0 && (
                  <p style={{ fontSize: "12px", color: "#d9534f", margin: "4px 0 0 0" }}>
                    ¡Solo quedan {item.stock} unidades!
                  </p>
                )}
              </div>

              <div className={styles.quantityControls}>
                <span className={styles.cuantiti}>Cantidad: <strong>{item.quantity}</strong></span>
                <div className={styles.buttonsGroup}>
                  <button onClick={() => decreaseQuantity(item.id)} title="Disminuir cantidad">-</button>
                  <button 
                    onClick={() => increaseQuantity(item.id)} 
                    title={!isAdmin && item.quantity >= item.stock ? "Stock máximo alcanzado" : "Aumentar cantidad"}
                    disabled={!isAdmin && item.quantity >= item.stock}
                    style={{ opacity: !isAdmin && item.quantity >= item.stock ? 0.5 : 1, cursor: !isAdmin && item.quantity >= item.stock ? "not-allowed" : "pointer" }}
                  >
                    +
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className={styles.deleteBtn} title="Eliminar producto">🗑️</button>
                </div>
              </div>

              <div className={styles.subtotal}>
                <p>Subtotal:</p>
                <strong>${(item.numericPrice * item.quantity).toLocaleString()} COP</strong>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className={styles.clearBtn}>
            Vaciar Carrito
          </button>
        </div>

        <div className={styles.summaryCard}>
          <h2 className={styles.resumeOrder}>Resumen de la Orden</h2>
          
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${totalPrice.toLocaleString()} COP</span>
          </div>

          {/* Selector de Envío */}
          <div className={styles.summaryRow} style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px", margin: "12px 0" }}>
            <span style={{ fontSize: "14px", fontWeight: "600" }}>Destino de envío:</span>
            <select 
              value={shippingDestination} 
              onChange={(e) => setShippingDestination(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="bogota">Bogotá (Tarifa fija: $10.000)</option>
              <option value="otra">Otra ciudad de Colombia (Calculado en checkout)</option>
            </select>
          </div>

          <div className={styles.summaryRow}>
            <span>Costo de Envío</span>
            <span>{shippingCost > 0 ? `$${shippingCost.toLocaleString()} COP` : "Calculado en pago"}</span>
          </div>

          <hr />
          
          <div className={styles.summaryTotal}>
            <span className={styles.totalPrices}>Total</span>
            <span className={styles.pricesFinal}>${finalTotal.toLocaleString()} COP</span>
          </div>

          <button onClick={handleCheckout} className={styles.checkoutBtn}>
            Pagar Ahora
          </button>
          
          {showEmailInput && !isAuthenticated && !isNewUser && (
            <div className={styles.modalCardStyle}>
              <p className={styles.authTitle}>Verifica tu correo para continuar:</p>

              {zodErrros && zodErrros.length > 0 && (
                <p className={styles.errorText}>{zodErrros[0]}</p>
              )}

              <form onSubmit={handleVerifySubmit}>
                <input 
                  type="email" 
                  placeholder="Correo electrónico"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={styles.modalInputStyle}
                  required
                />
                <button type="submit" className={styles.modalBtnStyle}>
                  Continuar
                </button>
              </form>
            </div>
          )}

          {isNewUser && !isAuthenticated && (
            <div className={styles.modalCardStyle}>
              <p className={styles.authTitle}>¡Correo nuevo! Crea tu contraseña:</p>

              {zodErrros && zodErrros.length > 0 && (
                <p className={styles.errorText}>{zodErrros[0]}</p>
              )}

              <form onSubmit={handleRegisterSubmit}>
                <input 
                  type="email" 
                  value={emailInput} 
                  disabled 
                  className={`${styles.modalInputStyle} ${styles.disabledInput}`} 
                />
                <input 
                  type="password" 
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={styles.modalInputStyle}
                  required
                />
                <button type="submit" className={styles.modalBtnStyle}>
                  Registrarse y Pagar
                </button>
              </form>
            </div>
          )}

          {!isAuthenticated && !showEmailInput && !isNewUser && (
            <p className={styles.guestHint}>
              * No te preocupes, podrás revisar tus datos o crear tu cuenta al continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}