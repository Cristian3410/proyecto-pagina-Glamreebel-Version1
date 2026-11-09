
import { Link } from "react-router-dom";
import styles from "../Newsletter/NewsletterSection.module.css";

const imagesList = [
    "/images/¿TE GUSTÓ (3).png",
    "/images/FOTO2.jpeg",
    "/images/wtf es la vida sin maquillaje.jpg (1).jpeg",
    "/images/FOTO4.jpeg",
];

function NewsletterSection() {
    return (
        <section
            className={styles.newsletterSection}
            aria-label="Inspiración y publicidad de Glam Reebel"
        >
            <div className={styles.newsletterCard}>
                <div className={styles.photoGrid}>
                    {/* IMAGEN 1: PROMOCIÓN INTERACTIVA */}
                    <div className={`${styles.photoCard} ${styles.featuredCard}`}>
                        <img
                            src={imagesList[0]}
                            alt="Peptide Lip Balm"
                            className={styles.photoImg}
                            loading="lazy"
                            decoding="async"
                        />

                        <div className={styles.overlayContent}>
                            <span className={styles.promoTag}>
                                CUIDA TUS LABIOS
                            </span>

                            <h3 className={styles.promoTitle}>
                                LABIOS MÁS DEFINIDOS E HIDRATADOS
                            </h3>

                            <p className={styles.promoDescription}>
                                Conoce el Peptide Lip Balm.
                            </p>

                            <Link
                                to="/products/238"
                                className={styles.promoBtn}
                            >
                                VER PRODUCTO <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* IMÁGENES 2, 3 Y 4: PUBLICIDAD VISUAL */}
                    {imagesList.slice(1).map((imgSrc, index) => (
                        <div
                            key={imgSrc}
                            className={styles.photoCard}
                        >
                            <img
                                src={imgSrc}
                                alt={`Fotografía publicitaria Glam Reebel ${index + 2}`}
                                className={styles.photoImg}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default NewsletterSection;
