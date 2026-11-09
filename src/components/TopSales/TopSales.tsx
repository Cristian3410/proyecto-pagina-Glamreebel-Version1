
import styles from "./TopSales.module.css";
import { useInventory } from "../../contexts/InventoryContext";
import { Link } from "react-router-dom";

/* =========================================
   FORMATEAR PRECIO
========================================= */

const parseDisplayPrice = (
    priceInput: string | number
): number => {
    let numericValue = 0;

    if (typeof priceInput === "number") {
        numericValue = priceInput;
    } else if (typeof priceInput === "string") {
        const cleaned = priceInput
            .trim()
            .replace(/[^\d,.-]/g, "");

        if (!cleaned) return 0;

        let normalized = cleaned;

        if (cleaned.includes(",") && cleaned.includes(".")) {
            normalized =
                cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
                    ? cleaned.replace(/\./g, "").replace(",", ".")
                    : cleaned.replace(/,/g, "");
        } else if (cleaned.includes(",")) {
            const parts = cleaned.split(",");

            normalized =
                parts.length === 2 && parts[1].length !== 3
                    ? `${parts[0]}.${parts[1]}`
                    : cleaned.replace(/,/g, "");
        } else if (cleaned.includes(".")) {
            const parts = cleaned.split(".");

            if (parts.length === 2 && parts[1].length === 3) {
                normalized = cleaned.replace(/\./g, "");
            }
        }

        numericValue = Number(normalized);
    }

    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return 0;
    }

    // Compatibilidad con precios almacenados en centavos.
    if (
        numericValue >= 100000 &&
        numericValue % 100 === 0
    ) {
        numericValue /= 100;
    }

    return numericValue;
};

/* =========================================
   NORMALIZAR IMÁGENES
========================================= */

const normalizeImages = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeImages(item));
    }

    if (typeof value !== "string") {
        return [];
    }

    const text = value.trim();

    if (
        !text ||
        text.toUpperCase() === "NULL" ||
        text === "{}" ||
        text === "[]"
    ) {
        return [];
    }

    // Array en formato JSON.
    if (text.startsWith("[") && text.endsWith("]")) {
        try {
            const parsed: unknown = JSON.parse(text);

            if (Array.isArray(parsed)) {
                return normalizeImages(parsed);
            }
        } catch {
            // Continuar con otros formatos.
        }
    }

    // Array de PostgreSQL representado como texto.
    if (text.startsWith("{") && text.endsWith("}")) {
        const content = text.slice(1, -1).trim();

        if (!content) return [];

        const items =
            content.match(/"(?:\\.|[^"\\])*"|[^,]+/g) ?? [];

        return items
            .map((item) => {
                const cleaned = item.trim();

                if (
                    cleaned.startsWith('"') &&
                    cleaned.endsWith('"')
                ) {
                    return cleaned
                        .slice(1, -1)
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, "\\");
                }

                return cleaned;
            })
            .filter(
                (item) =>
                    item.length > 0 &&
                    item.toUpperCase() !== "NULL"
            );
    }

    // Una sola imagen.
    return [text];
};

/* =========================================
   IMÁGENES PERSONALIZADAS DE HALLOWEEN
========================================= */

const halloweenImages: Record<number, string> = {
    345: "/images/7hallowen.png",
    46: "/images/8hallowen.png",
    195: "/images/9hallowen.png",
    244: "/images/10hallowen.png",
};

/* =========================================
   COMPONENTE TOP SALES
========================================= */

function TopSales() {
    const topSalesIds = [320, 330, 340, 350];

    const { inventory } = useInventory();

    const products = inventory
        .filter((product) =>
            topSalesIds.includes(Number(product.id))
        )
        .sort(
            (a, b) =>
                topSalesIds.indexOf(Number(a.id)) -
                topSalesIds.indexOf(Number(b.id))
        );

    return (
        <section
            id="top-sales"
            className={styles.container}
            aria-label="Productos destacados de Halloween"
        >
            <div className={styles.ContainerBox}>
                {/* ENCABEZADO */}

                <div className={styles.titles}>
                    <h1>MAS VENDIDOS</h1>

                    <p>
                        ENAMÓRATE DE NUESTROS PRODUCTOS MÁS VENDIDOS
                    </p>
                </div>

                {/* INDICADOR: SOLO APARECE EN CELULARES */}

                <p className={styles.swipeHint}>
                    DESLIZA PARA VER MÁS PRODUCTOS
                    <span aria-hidden="true"> →</span>
                </p>

                {/* CARRUSEL HORIZONTAL */}

                <div className={styles.carouselWrapper}>
                    <div
                        className={styles.carouselTrack}
                        aria-label="Desliza horizontalmente para explorar los productos"
                    >
                        {products.map((product) => {
                            const productId = Number(product.id);

                            // Obtener las imágenes registradas.
                            const productImages = [
                                ...new Set([
                                    ...normalizeImages(product.images),
                                    ...normalizeImages(product.image),
                                ]),
                            ];

                            // Mantener las imágenes personalizadas
                            // de Halloween para los cuatro productos.
                            const mainImage =
                                halloweenImages[productId] ||
                                productImages[0] ||
                                "";

                            const formattedPrice = parseDisplayPrice(
                                product.price as string | number
                            );

                            return (
                                <div
                                    key={product.id}
                                    className={styles.slideItemWrapper}
                                >
                                    <Link
                                        to={`/products/${product.id}`}
                                        className={styles.cardLink}
                                        aria-label={`Ver ${product.name}`}
                                    >
                                        <article
                                            className={styles.CardContainer}
                                        >
                                            {/* IMAGEN */}

                                            <div className={styles.CardImg}>
                                                {mainImage ? (
                                                    <img
                                                        src={mainImage}
                                                        alt={
                                                            product.name ||
                                                            "Producto de Halloween"
                                                        }
                                                        className={
                                                            styles.imagenBox
                                                        }
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div
                                                        className={
                                                            styles.imagePlaceholder
                                                        }
                                                    >
                                                        Imagen no disponible
                                                    </div>
                                                )}
                                            </div>

                                            {/* INFORMACIÓN */}

                                            <div
                                                className={styles.textContainer}
                                            >
                                                <p
                                                    className={styles.brandText}
                                                >
                                                    {product.brand || "Trendy"}
                                                </p>

                                                <p
                                                    className={styles.nameText}
                                                >
                                                    {product.name ||
                                                        "Producto sin nombre"}
                                                </p>

                                                <p
                                                    className={styles.priceText}
                                                >
                                                    $
                                                    {formattedPrice.toLocaleString(
                                                        "es-CO"
                                                    )}{" "}
                                                    COP
                                                </p>
                                            </div>
                                        </article>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TopSales;
