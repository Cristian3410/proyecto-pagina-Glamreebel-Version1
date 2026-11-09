import { useEffect } from "react";
import styles from "../Orders/Orders.module.css";

type Props = { src: string; alt: string; onClose: () => void };

export default function AdminImagePreview({ src, alt, onClose }: Props) {
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [onClose]);

    return (
        <div className={styles.adminImageLightbox} role="presentation" onClick={onClose}>
            <section className={styles.adminImageLightboxContent} role="dialog" aria-modal="true" aria-label={`Imagen ampliada: ${alt}`} onClick={(event) => event.stopPropagation()}>
                <button type="button" className={styles.adminImageLightboxClose} onClick={onClose} aria-label="Cerrar imagen ampliada">×</button>
                <img className={styles.adminImageLightboxImage} src={src} alt={alt} />
            </section>
        </div>
    );
}
