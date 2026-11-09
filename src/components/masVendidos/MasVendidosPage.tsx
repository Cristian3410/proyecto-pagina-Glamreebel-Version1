
import { useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./MasVendidos.module.css";
import { useInventory } from "../../contexts/InventoryContext";

/* =========================================
   FORMATEAR PRECIO
========================================= */

const parseDisplayPrice = (
    priceInput: string | number
): number => {
    if (typeof priceInput === "number") {
        if (!Number.isFinite(priceInput) || priceInput < 0) {
            return 0;
        }

        return priceInput >= 100000 && priceInput % 100 === 0
            ? priceInput / 100
            : priceInput;
    }

    const cleaned = String(priceInput ?? "")
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

    let result = Number(normalized);

    if (!Number.isFinite(result) || result < 0) {
        return 0;
    }

    if (result >= 100000 && result % 100 === 0) {
        result /= 100;
    }

    return result;
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

    // Array JSON.
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
   COMPONENTE MÁS VENDIDOS
========================================= */

function MasVendidos() {
    const topSalesIds = [301, 43, 46, 286, 320, 196, 300];

    const { inventory } = useInventory();

    const trackRef = useRef<HTMLDivElement>(null);

    // Mantener el orden original de los productos.
    const products = inventory
        .filter((product) =>
            topSalesIds.includes(Number(product.id))
        )
        .sort(
            (a, b) =>
                topSalesIds.indexOf(Number(a.id)) -
                topSalesIds.indexOf(Number(b.id))
        );

    // Desplazar el carrusel una tarjeta por vez.
    const scrollCarousel = (direction: "left" | "right") => {
        const track = trackRef.current;

        if (!track) return;

        const firstItem = track.querySelector<HTMLElement>(
            `.${styles.slideItemWrapper}`
        );

        if (!firstItem) return;

        const trackStyles = window.getComputedStyle(track);
        const gap = parseFloat(trackStyles.columnGap) || 16;
        const scrollAmount =
            firstItem.getBoundingClientRect().width + gap;

        track.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section
            id="favoritos-terror"
            className={styles.container}
            aria-label="Productos más vendidos de Halloween"
        >
            <div className={styles.ContainerBox}>
                {/* ENCABEZADO */}

                <div className={styles.titles}>
                    <span className={styles.eyebrow}>
                        LOS FAVORITOS
                    </span>

                    <h1>MÁS VENDIDOS</h1>

                    <p className={styles.Subtilos}>
                        Delineadores y sombras para destacar tu look
                    </p>
                </div>

                {/* INDICADOR PARA DISPOSITIVOS TÁCTILES */}

                <p className={styles.swipeHint}>
                    DESLIZA PARA DESCUBRIR MÁS
                    <span aria-hidden="true"> →</span>
                </p>

                {/* CARRUSEL */}

                <div className={styles.carouselWrapper}>
                    <button
                        type="button"
                        className={`${styles.arrowBtn} ${styles.leftArrow}`}
                        onClick={() => scrollCarousel("left")}
                        aria-label="Ver productos anteriores"
                    >
                        ‹
                    </button>

                    <div
                        className={styles.carouselTrack}
                        ref={trackRef}
                        role="group"
                        aria-label="Productos más vendidos. Desliza para ver más."
                    >
                        {products.map((product) => {
                            const productImages = [
                                ...new Set([
                                    ...normalizeImages(product.images),
                                    ...normalizeImages(product.image),
                                ]),
                            ];

                            const mainImage = productImages[0] || "";

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
                                        aria-label={`Ver ${product.name || "producto"}`}
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
                                                            "Producto de maquillaje"
                                                        }
                                                        className={styles.imagenBox}
                                                        loading="lazy"
                                                        decoding="async"
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
                                                <p className={styles.brandText}>
                                                    {product.brand || "Trendy"}
                                                </p>

                                                <p className={styles.nameText}>
                                                    {product.name ||
                                                        "Producto sin nombre"}
                                                </p>

                                                <p className={styles.priceText}>
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

                    <button
                        type="button"
                        className={`${styles.arrowBtn} ${styles.rightArrow}`}
                        onClick={() => scrollCarousel("right")}
                        aria-label="Ver más productos"
                    >
                        ›
                    </button>
                </div>
            </div>
        </section>
    );
}

export default MasVendidos;
