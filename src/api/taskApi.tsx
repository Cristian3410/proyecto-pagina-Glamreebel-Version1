export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const verifyEmail = async (dataEmail: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/task/verifyEmail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataEmail),
            credentials: "include"
        });

        const data = await response.json();
        return { status: response.status, data: data };

    } catch (error) {
        console.error("Error en la consulta", error);
        return { status: 500, data: null };
    }
}

export const createMercadoPagoPreference = async (orderData: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/task/CheckMercadoPago`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData),
            credentials: 'include' 
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Error al procesar la preferencia");
        }

        return data;
    } catch (error: any) {
        console.error("Error al crear preferencia de Mercado Pago:", error);
        return { success: false, message: error.message || "Error al conectar con el servidor" };
    }
};

export const getMyOrdersRequest = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/task/orders/my-orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' 
        });

        const data = await response.json();

        if (!response.ok) {
            throw data;
        }

        return data;
    } catch (error: any) {
        throw error || "Error al obtener los pedidos";
    }
};

export const deleteOrderRequest = async (orderId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/task/deleteMyOrder/${orderId}`, { // <-- Lo pasamos por la URL
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    } catch (error: any) {
        throw error || "Error al eliminar el pedido";
    }
};

export const updateShippingStatusRequest = async (orderId: number, shipping_status: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/task/update-shipping-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId, shipping_status }),
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    } catch (error: any) {
        throw error || "Error al actualizar el estado de envío";
    }
};


export const getAdminUsersRequest = async () => {
    const response = await fetch(`${API_BASE_URL}/task/admin/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw data || new Error("Error al obtener los usuarios");
    return data;
};

export const getAllOrdersAdminRequest = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/task/admin/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    } catch (error: any) {
        throw error || "Error al obtener los pedidos";
    }
};
