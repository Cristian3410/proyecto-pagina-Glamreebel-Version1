
import { Link } from "react-router-dom";
import styles from "./Categorias.module.css";

interface Category {
    id: number;
    title: string;
    image: string;
    link: string;
}

const categoriesData: Category[] = [
    {
        id: 1,
        title: "PIEL",
        image: "/images/Piel.png",
        link: "/category/piel",
    },
    {
        id: 2,
        title: "MEJILLAS",
        image: "/images/mejillas.png",
        link: "/category/mejillas",
    },
    {
        id: 3,
        title: "LABIOS",
        image: "/images/labios.png",
        link: "/category/labios",
    },
    {
        id: 4,
        title: "OJOS",
        image: "/images/ojos.png",
        link: "/category/ojos",
    },
    {
        id: 5,
        title: "ACCESORIOS",
        image: "/images/ACCESORIOS.png",
        link: "/category/accesorios",
    },
];

function CategoriesSection() {
    return (
        <section
            className={styles.categoriesSection}
            aria-labelledby="categories-title"
        >
            <header className={styles.categoriesHeader}>
                <span className={styles.categoriesEyebrow}>
                    GLAM REEBEL
                </span>

                <h2
                    id="categories-title"
                    className={styles.categoriesMainTitle}
                >
                    CATEGORÍAS
                </h2>
            </header>

            <div className={styles.categoriesGrid}>
                {categoriesData.map((category) => (
                    <Link
                        to={category.link}
                        key={category.id}
                        className={styles.categoryCard}
                        aria-label={`Explorar categoría ${category.title}`}
                    >
                        <img
                            src={category.image}
                            alt={category.title}
                            className={styles.categoryImg}
                            loading="lazy"
                            decoding="async"
                        />

                        <div className={styles.categoryOverlay}>
                            <h3 className={styles.categoryTitle}>
                                {category.title}
                            </h3>

                            {/* Flecha dibujada con CSS */}
                            <span
                                className={styles.categoryArrow}
                                aria-hidden="true"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default CategoriesSection;
