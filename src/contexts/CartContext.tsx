import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

// Definimos la interfaz para el color seleccionado
interface ProductColor {
    name: string;
    hex: string;
    imageIndex?: number;
}

interface CartItem {
    id: string | number;
    name: string;
    price: string | number;
    numericPrice: number;
    image: string;
    quantity: number;
    stock: number;
    selectedColor?: ProductColor | null; // <--- Añadido aquí
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    increaseQuantity: (productId: string | number) => void;
    decreaseQuantity: (productId: string | number) => void;
    removeFromCart: (productId: string | number) => void;
    clearCart: () => void;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const savedCart = localStorage.getItem("cart");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error al leer el carrito de localStorage:", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(cart));
        } catch (error) {
            console.error("Error al guardar el carrito en localStorage:", error);
        }
    }, [cart]);

    const parsePrice = (priceInput: string | number) => {
        let numericValue = 0;
        if (typeof priceInput === "number") {
            numericValue = priceInput;
        } else if (typeof priceInput === "string") {
            numericValue = Number(priceInput.replace(/[^0-9]/g, ""));
        }
        
        // CORREGIDO: Ajustado el umbral a 100,000 para que detecte correctamente valores como 900000 (9.000 COP en centavos)
        if (numericValue >= 100000 && numericValue % 100 === 0) {
            numericValue = numericValue / 100;
        }
        return numericValue;
    };

    const addToCart = (product: any) => {
        const isAdmin = user?.role === "admin" || user?.is_admin;

        if (product.stock === 0 && !isAdmin) {
            alert("Lo sentimos, este producto se encuentra agotado.");
            return;
        }

        setCart((prevCart) => {
            // Buscamos si ya existe el producto Y ADEMÁS tiene el mismo tono seleccionado
            const existingIndex = prevCart.findIndex(
                (item) => item.id === product.id && item.selectedColor?.name === product.selectedColor?.name
            );
            
            const qtyToAdd = product.quantity ? Number(product.quantity) : 1;

            if (existingIndex > -1) {
                const updated = [...prevCart];
                const newQty = updated[existingIndex].quantity + qtyToAdd;

                if (newQty > product.stock && !isAdmin) {
                    alert("No hay suficiente stock disponible para agregar más unidades.");
                    return prevCart;
                }

                updated[existingIndex].quantity = newQty;
                return updated;
            }

            if (qtyToAdd > product.stock && !isAdmin) {
                alert("La cantidad solicitada supera el stock disponible.");
                return prevCart;
            }

            return [
                ...prevCart,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    numericPrice: parsePrice(product.price),
                    image: product.image,
                    quantity: qtyToAdd,
                    stock: product.stock ?? 0,
                    selectedColor: product.selectedColor || null // <--- Guardamos el tono aquí
                }
            ];
        });
    };

    const increaseQuantity = (productId: string | number) => {
        const isAdmin = user?.role === "admin" || user?.is_admin;

        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === productId) {
                    if (item.quantity + 1 > item.stock && !isAdmin) {
                        alert("Has alcanzado el límite del stock disponible.");
                        return item;
                    }
                    return { ...item, quantity: item.quantity + 1 };
                }
                return item;
            })
        );
    };

    const decreaseQuantity = (productId: string | number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId: string | number) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    const totalPrice = cart.reduce((acc, item) => acc + item.numericPrice * item.quantity, 0); 

    return (
        <CartContext.Provider value={{ cart, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart tiene que estar dentro del CartProvider");
    }
    return context;
};