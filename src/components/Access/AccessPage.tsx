import { useForm } from "react-hook-form";
import styles from "../Access/Access.module.css";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface AccesPageProps {
    isOpen: boolean;
    onClose: () => void;
}

function AccesPage({ isOpen, onClose }: AccesPageProps) {
    const [isRegister, setIsRegister] = useState(false);  
    const { register, handleSubmit, reset } = useForm();
    const { signin, signup, zodErrros, successMessage } = useAuth() as any;
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        let response: any = null;

        if (isRegister) {
            const registerData = {
                correo: data.correo,
                usuario: data.usuario,
                contrasena: data.contraseña || data.contrasena,
                contrasea: data.contraseña || data.contrasena
            };
            response = await signup(registerData); 
        } else {
            const loginData = {
                identificador: data.usuario, 
                contrasena: data.contraseña || data.contrasena,
                contrasea: data.contraseña || data.contrasena
            };
            // Asegúrate de que tu función 'signin' y 'signup' en el AuthContext 
            // retornen el objeto del usuario o un indicador de éxito con los datos, por ejemplo: { success: true, user: {...} }
            // O si solo retorna booleano, evaluamos el rol directamente desde el backend response si lo tienes.
            response = await signin(loginData); 
        }

        // Si la autenticación fue exitosa (asumiendo que signin retorna el usuario o true)
        if (response) {
            reset();
            onClose();      
            
            // Verificamos el rol ya sea del objeto devuelto o del usuario actual
            const userRole = response.user?.role || response.role;

            if (userRole === "admin") {
                navigate("/admin/orders");
            } else {
                navigate("/");  
            }
        }
    };
     
    const toggleMode = () => {
        setIsRegister(!isRegister);
        reset();
    };

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.activeOverlay : ""}`}>
            <div className={styles.formPopup}>
                <div className={styles.iconClose} onClick={onClose}>
                    <IoMdClose />
                </div>
                <div className={styles.formBoxLogin}>
                    <img src="/images/LOGO GLAM REEBEL PNG.png" alt="Logo Empresa" className={styles.imgLogo} />
                    
                    {zodErrros && zodErrros.length > 0 && (
                        <div style={{ backgroundColor: "#ffe6e6", color: "#d9534f", padding: "10px", borderRadius: "5px", marginBottom: "15px", fontSize: "14px" }}>
                            <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                {zodErrros.map((errorMsg: string, index: number) => (
                                    <li key={index}>
                                        {errorMsg}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {successMessage && (
                        <div style={{ backgroundColor: "#e6ffed", color: "#28a745", padding: "10px", borderRadius: "5px", marginBottom: "15px", fontSize: "14px", textAlign: "center" }}>
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {isRegister && (
                            <div className={styles.inputField}>
                                <input
                                    type="email"
                                    placeholder=""
                                    {...register("correo", {
                                        required: "El correo es obligatorio",
                                    })}
                                />
                                <label>Correo Electrónico</label>
                            </div>
                        )}

                        <div className={styles.inputField}>
                            <input
                                type="text"
                                placeholder=""
                                {...register("usuario", {
                                    required: isRegister ? "El usuario es obligatorio" : "El usuario o correo es obligatorio",
                                    pattern: isRegister ? {
                                        value: /^[A-Za-z0-9]+$/,
                                        message: "Solo letras y números",
                                    } : undefined,
                                })}
                            />
                            <label>{isRegister ? "Nombre de Usuario" : "Usuario o Email"}</label>
                        </div>

                        <div className={styles.inputField}>
                            <input 
                                type="password"
                                placeholder=""
                                {...register("contraseña", {
                                    required: "La contraseña es obligatoria",
                                })}
                            />
                            <label>Contraseña</label>
                        </div>

                        <button className={styles.button}>
                            {isRegister ? "Registrarse" : "Iniciar sesión"}
                        </button>

                        <div className={styles.switchTextContainer}>
                            {!isRegister && (
                                <a className={styles.forgotPassword}>¿Olvidaste tu contraseña?</a>
                            )}
                            <p className={styles.toggleText}>
                                {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
                                <span onClick={toggleMode}>
                                    {isRegister ? "Inicia sesión" : "Regístrate aquí"}
                                </span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>  
    );
}

export default AccesPage;