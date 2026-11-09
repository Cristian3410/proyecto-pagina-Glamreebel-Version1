import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function AdminRoute() {
    const { user, isAuthenticated, loading } = useAuth();

    // Mientras se verifica el token al recargar la página, muestra el loader
    if (loading) {
        return <div style={{ textAlign: "center", marginTop: "50px" }}>Cargando sesión...</div>;
    }

    // Como tu app maneja un modal de login en lugar de una ruta /login dedicada, 
    // redirigimos al inicio ("/") si no está autenticado o no es admin.
    if (!isAuthenticated || user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    // Si pasa la validación, renderiza el componente protegido
    return <Outlet />;
}