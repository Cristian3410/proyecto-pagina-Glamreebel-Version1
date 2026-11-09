import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { API_BASE_URL } from "../api/taskApi";

interface InventoryContextType {
    inventory: any[];
    inventoryLoading: boolean;
    inventoryError: string | null;
    updateStock: (id: number | string, newStock: number, additionalFields?: { colors?: any[] }) => Promise<void>;
    getProductStock: (id: number | string) => number;
    refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [inventory, setInventory] = useState<any[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);

    // Función para obtener el inventario real desde el backend
    const refreshInventory = useCallback(async () => {
        setInventoryLoading(true);
        setInventoryError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/task/products`, {
                credentials: "include"
            });
            if (!response.ok) throw new Error("No se pudo cargar el inventario.");
            const data = await response.json();
            const products = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.products)
                        ? data.products
                        : null;

            if (!products) throw new Error("El servidor devolvió un formato de inventario inesperado.");
            setInventory(products);
        } catch (error) {
            console.error("Error de conexión con el backend:", error);
            const message = error instanceof Error ? error.message : "Error al cargar el inventario.";
            setInventoryError(message);
            throw error;
        } finally {
            setInventoryLoading(false);
        }
    }, []);

    // Cargar los productos al iniciar la app
    useEffect(() => {
        void refreshInventory().catch(() => undefined);
    }, [refreshInventory]);

    // Función para actualizar el stock (y opcionalmente los colores/tonos) en la BD
    const updateStock = async (id: number | string, newStock: number, additionalFields?: { colors?: any[] }) => {
        const validatedStock = Math.max(0, newStock);
        
        try {
            // Construimos el body dinámicamente con el stock y los campos extra (si existen)
            const payload = {
                stock: validatedStock,
                ...(additionalFields || {})
            };

            const response = await fetch(`${API_BASE_URL}/task/admin/products/${id}/stock`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => null);
            if (!response.ok) throw new Error(result?.message || "No se pudo actualizar el stock en el servidor.");

            // Actualizamos el estado localmente reflejando tanto el stock como los colores nuevos al instante
            setInventory((prev) =>
                prev.map((item) => 
                    String(item.id) === String(id) 
                        ? { ...item, stock: validatedStock, ...(additionalFields || {}) } 
                        : item
                )
            );
        } catch (error) {
            console.error("Error al guardar en el backend:", error);
            throw error;
        }
    };

    const getProductStock = (id: number | string) => {
        const product = inventory.find((item) => String(item.id) === String(id));
        return product ? product.stock : 0;
    };

    return (
        <InventoryContext.Provider value={{ inventory, inventoryLoading, inventoryError, updateStock, getProductStock, refreshInventory }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error("useInventory debe estar dentro de un InventoryProvider");
    }
    return context;
};
