import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { verifyEmail } from "../api/taskApi";
import { registerPost, LoginUserApi, verifyTokenRequest, logoutRequest } from "../api/authApi";
import Cookies from "js-cookie";

export const AuthContext = createContext<any>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth tiene que estar dentro del provider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);  
    const [zodErrros, setZodErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const formatErrors = (errObj: any): string[] => {
        if (!errObj) return ["Ocurrió un error desconocido"];
        if (Array.isArray(errObj)) return errObj;
        if (typeof errObj === "string") return [errObj];
        if (typeof errObj === "object") {
            if (errObj.message) return [errObj.message];
            if (errObj.error) return [errObj.error];
            try {
                return [JSON.stringify(errObj)];
            } catch {
                return ["Error de validación en el servidor"];
            }
        }
        return ["Error al procesar la solicitud"];
    };

    const signup = async (RegisterNewUser: any) => {
        try {
            setLoading(true);
            setZodErrors([]);
            setSuccessMessage(null);
            const res: any = await registerPost(RegisterNewUser);
            
            if (!res.success) {
                const errorMsg = formatErrors(res.errors || res.data);
                setZodErrors(errorMsg);
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }
            
            setSuccessMessage(res.data?.message || "Usuario registrado con éxito");
            setUser(res.data?.user || res.data);
            setIsAuthenticated(true);
            setZodErrors([]);
            return true;
        } catch (error: any) {
            const serverMsg = error.response?.data?.errors || error.response?.data || "Ocurrió un error inesperado en el cliente";
            setZodErrors(formatErrors(serverMsg));
            setIsAuthenticated(false);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signin = async (loginData: any) => {
        try {
            setLoading(true);
            setZodErrors([]);
            setSuccessMessage(null);
            const res: any = await LoginUserApi(loginData);
            
            if (!res.success) {
                const errorMsg = formatErrors(res.errors || res.data);
                setZodErrors(errorMsg);
                setIsAuthenticated(false);
                setUser(null);
                return null;
            }
            
            setSuccessMessage(res.data?.message || "Logueado con éxito");
            const userData = res.data?.user || res.data;
            setUser(userData);
            setIsAuthenticated(true);
            setZodErrors([]);
            
            return userData;
        } catch (error: any) {
            const serverMsg = error.response?.data?.errors || error.response?.data || "Ocurrió un error inesperado en el cliente";
            setZodErrors(formatErrors(serverMsg));
            setIsAuthenticated(false);
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    const verifyEmailSing = async (emailCheckUser: string) => {
        try {
            setLoading(true);
            setZodErrors([]);
            setSuccessMessage(null);
            
            const res: any = await verifyEmail({ correo: emailCheckUser });
            
            if (res.data && res.data.exists === true) {
                return { success: true, exists: true };
            }

            if (res.status === 400 || res.status === 409) {
                return { success: true, exists: true };
            }

            if (res.status !== 200) {
                return { success: false, exists: false };
            } 

            return { 
                success: true, 
                exists: res.data?.exists ?? false 
            };

        } catch (error) {
            console.log(error);
            setZodErrors(["Ocurrió un error inesperado en el cliente"]);
            return { success: false, exists: false };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await logoutRequest();
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove("token");
    };

    useEffect(() => {
        if (zodErrros.length > 0) {
            const timer = setTimeout(() => {
                setZodErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [zodErrros]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);
    
    useEffect(() => {
        let isMounted = true;
        async function checkLogin() {
            try {
                setLoading(true);
                const res: any = await verifyTokenRequest();
                
                if (!isMounted) return;

                if (!res || !res.data || res.status === 401) {
                    setIsAuthenticated(false);
                    setUser(null);
                    return;
                }

                setIsAuthenticated(true);
                setUser(res.data);
            } catch (error) {
                if (!isMounted) return;
                console.log("Error al verificar token:", error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        checkLogin();
        return () => { isMounted = false; };
    }, []);

    return (
        <AuthContext.Provider value={{
            signin,
            signup,
            zodErrros,
            successMessage,
            setIsAuthenticated,
            user,
            loading,
            verifyEmailSing,
            isAuthenticated,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};