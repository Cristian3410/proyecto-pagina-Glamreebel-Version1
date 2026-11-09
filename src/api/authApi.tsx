const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const LoginUserApi = async (dataLogin: any) => {
    try {
        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataLogin),
            credentials: "include"
        });

        const data = await response.json();

        return {
            success: response.ok, 
            status: response.status,
            data: data
        };

    } catch (error) {
        console.error("Error en la solicitud", error);
        return { success: false, status: 500, data: null };
    }
}

export const registerPost = async (registerData: any) => {
    try {
        const response = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerData),
            credentials: "include"
        });

        const data = await response.json();

        return {
            success: response.ok, 
            status: response.status,
            data: data
        };

    } catch (error) {
        console.error("Error en la solicitud", error);
        return { success: false, status: 500, data: null };
    }
}

export const verifyTokenRequest = async () => {
    try {
        const response = await fetch(`${API}/verifyToken`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        const data = await response.json();
        return { status: response.status, data: data };
    } catch (error) {
        console.log(error);
        return { status: 401, data: null };
    }
}

export const logoutRequest = async () => {
    try {
        const response = await fetch(`${API}/logout`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json", 
            },
            credentials: "include",
        });
        const data = await response.json();
        return { status: response.status, data: data };

    } catch (error) {
        console.log(error);
        return { status: 500, data: null };
    }
}