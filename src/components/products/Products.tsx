
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    useState,
    useEffect,
    useRef,
    type PointerEvent as ReactPointerEvent,
} from "react";

import {
    FaChevronLeft,
    FaShoppingCart,
    FaTruck,
    FaShieldAlt,
    FaCheckCircle,
} from "react-icons/fa";

import styles from "./Products.module.css";

import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useInventory } from "../../contexts/InventoryContext";

interface ProductColor {
    name: string;
    hex: string;
    stock?: number;
    imageIndex?: number;
}

function Products() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quantity, setQuantity] = useState(1);
    const [showAddedModal, setShowAddedModal] = useState(false);

    const [showMagnifier, setShowMagnifier] = useState(false);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    const [cursorPos, setCursorPos] = useState({
        x: 0,
        y: 0,
        imgX: 0,
        imgY: 0,
    });

    const [imageSize, setImageSize] = useState({
        width: 420,
        height: 420,
    });

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColorIndex, setSelectedColorIndex] =
        useState<number | null>(null);

    // Permite detectar el estado táctil inmediatamente.
    const touchMagnifierActiveRef = useRef(false);

    const { inventory } = useInventory();
    const { addToCart } = useCart();
    const { user } = useAuth() as any;

    const isAdmin = user?.role === "admin" || user?.is_admin;

    const product = inventory.find(
        (p: any) => String(p.id) === String(id)
    );

    // ==========================================
    // NORMALIZAR LAS IMÁGENES DEL PRODUCTO
    // Admite arrays, strings y arrays de PostgreSQL.
    // ==========================================

    const parseImageList = (value: unknown): string[] => {
        if (Array.isArray(value)) {
            return value.flatMap((item) => parseImageList(item));
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

        // Formato JSON: ["foto1.png", "foto2.png"]
        if (text.startsWith("[") && text.endsWith("]")) {
            try {
                const parsed: unknown = JSON.parse(text);

                if (Array.isArray(parsed)) {
                    return parseImageList(parsed);
                }
            } catch {
                // Continuar probando otros formatos.
            }
        }

        // Formato de array de PostgreSQL:
        // {"/images/foto1.png","/images/foto2.png"}
        if (text.startsWith("{") && text.endsWith("}")) {
            const content = text.slice(1, -1).trim();

            if (!content) {
                return [];
            }

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

        // Una única ruta.
        return [text];
    };

    // Combina ambas columnas sin duplicar rutas.
    const imageList: string[] = product
        ? [
              ...new Set([
                  ...parseImageList(product.images),
                  ...parseImageList(product.image),
              ]),
          ]
        : [];

    // ==========================================
    // PRECIO
    // ==========================================

    const parseDisplayPrice = (priceInput: unknown): number => {
        if (typeof priceInput === "number") {
            return Number.isFinite(priceInput) ? priceInput : 0;
        }

        const value = String(priceInput ?? "").trim();

        if (!value) {
            return 0;
        }

        const numericValue = Number(value);

        if (Number.isFinite(numericValue)) {
            return numericValue;
        }

        const cleaned = Number(value.replace(/[^\d]/g, ""));

        if (!Number.isFinite(cleaned)) {
            return 0;
        }

        // Compatibilidad con valores guardados en centavos.
        if (cleaned >= 100000 && cleaned % 100 === 0) {
            return cleaned / 100;
        }

        return cleaned;
    };

    const formattedPrice = product
        ? parseDisplayPrice(product.price)
        : 0;

    // ==========================================
    // COLORES DEL PRODUCTO
    // ==========================================

    const productColors: ProductColor[] =
        product && Array.isArray(product.colors)
            ? (product.colors as ProductColor[])
            : [];

    const currentSelectedColor =
        selectedColorIndex !== null
            ? productColors[selectedColorIndex] ?? null
            : null;

    // ==========================================
    // STOCK
    // ==========================================

    const productStock = Math.max(
        0,
        Number(product?.stock ?? 0) || 0
    );

    const currentStock = Math.max(
        0,
        Number(
            currentSelectedColor?.stock !== undefined
                ? currentSelectedColor.stock
                : productStock
        ) || 0
    );

    const isOutOfStock = currentStock <= 0 && !isAdmin;

    // ==========================================
    // REINICIAR ESTADOS AL CAMBIAR DE PRODUCTO
    // ==========================================

    useEffect(() => {
        setSelectedImage(0);
        setImageLoadFailed(false);
        setShowMagnifier(false);
        setQuantity(1);
        setShowAddedModal(false);

        touchMagnifierActiveRef.current = false;

        if (productColors.length > 0) {
            setSelectedColorIndex(0);
        } else {
            setSelectedColorIndex(null);
        }
    }, [id, product]);

    // Ajustar cantidad si supera el stock.
    useEffect(() => {
        if (currentStock > 0 && quantity > currentStock) {
            setQuantity(currentStock);
        }
    }, [currentStock, quantity]);

    // ==========================================
    // CAMBIAR IMAGEN SI FALLA LA ACTUAL
    // ==========================================

    const handleImageError = () => {
        setShowMagnifier(false);
        touchMagnifierActiveRef.current = false;

        if (selectedImage < imageList.length - 1) {
            setSelectedImage((previous) => previous + 1);
            setImageLoadFailed(false);
        } else {
            setImageLoadFailed(true);
        }
    };

    const handleSelectImage = (index: number) => {
        setSelectedImage(index);
        setImageLoadFailed(false);
        setShowMagnifier(false);
        touchMagnifierActiveRef.current = false;
    };

    // ==========================================
    // POSICIÓN Y ZOOM DE LA LUPA
    // ==========================================

    const updateMagnifierPosition = (
        clientX: number,
        clientY: number,
        element: HTMLDivElement
    ) => {
        const { left, top, width, height } =
            element.getBoundingClientRect();

        if (width <= 0 || height <= 0) {
            return;
        }

        const magnifierSize = 140;
        const halfSize = magnifierSize / 2;
        const zoomFactor = 1.8;

        // Coordenadas del puntero dentro de la fotografía.
        const x = Math.max(0, Math.min(clientX - left, width));
        const y = Math.max(0, Math.min(clientY - top, height));

        // Evitar que la lupa se salga de los bordes.
        const positionX = Math.max(
            0,
            Math.min(x - halfSize, Math.max(0, width - magnifierSize))
        );

        const positionY = Math.max(
            0,
            Math.min(y - halfSize, Math.max(0, height - magnifierSize))
        );

        const imgX =
            (x / width) * (width * zoomFactor) - halfSize;

        const imgY =
            (y / height) * (height * zoomFactor) - halfSize;

        setImageSize({ width, height });

        setCursorPos({
            x: positionX,
            y: positionY,
            imgX,
            imgY,
        });
    };

    // ==========================================
    // EVENTOS PARA RATÓN Y LÁPIZ
    // ==========================================

    const handlePointerEnter = (
        e: ReactPointerEvent<HTMLDivElement>
    ) => {
        if (e.pointerType === "touch" || imageLoadFailed) {
            return;
        }

        touchMagnifierActiveRef.current = false;
        setShowMagnifier(true);

        updateMagnifierPosition(
            e.clientX,
            e.clientY,
            e.currentTarget
        );
    };

    const handlePointerMove = (
        e: ReactPointerEvent<HTMLDivElement>
    ) => {
        if (!imageList.length || imageLoadFailed) {
            return;
        }

        if (e.pointerType === "touch") {
            // En móvil, mover el dedo solo cuando la lupa esté activa.
            if (!touchMagnifierActiveRef.current) {
                return;
            }
        } else {
            // En computador no hace falta clic previo.
            setShowMagnifier(true);
        }

        updateMagnifierPosition(
            e.clientX,
            e.clientY,
            e.currentTarget
        );
    };

    const handlePointerLeave = (
        e: ReactPointerEvent<HTMLDivElement>
    ) => {
        if (e.pointerType === "touch") {
            return;
        }

        setShowMagnifier(false);
    };

    // ==========================================
    // EVENTOS PARA PANTALLAS TÁCTILES
    // Primer toque: activar.
    // Segundo toque: desactivar.
    // ==========================================

    const handlePointerDown = (
        e: ReactPointerEvent<HTMLDivElement>
    ) => {
        if (e.pointerType !== "touch") {
            return;
        }

        if (!imageList.length || imageLoadFailed) {
            return;
        }

        // Evitar que se active la selección de texto.
        e.preventDefault();

        updateMagnifierPosition(
            e.clientX,
            e.clientY,
            e.currentTarget
        );

        const shouldActivate = !touchMagnifierActiveRef.current;

        touchMagnifierActiveRef.current = shouldActivate;
        setShowMagnifier(shouldActivate);

        // Permitir continuar siguiendo el dedo durante el gesto.
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // Algunos navegadores pueden no admitir la captura.
        }
    };

    const handlePointerUp = (
        e: ReactPointerEvent<HTMLDivElement>
    ) => {
        if (e.pointerType !== "touch") {
            return;
        }

        try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
        } catch {
            // La captura puede haberse liberado automáticamente.
        }
    };

    // ==========================================
    // PRODUCTO NO ENCONTRADO
    // ==========================================

    if (!product) {
        return (
            <div
                style={{
                    textAlign: "center",
                    padding: "5rem 20px",
                    fontFamily: "Poppins, sans-serif",
                }}
            >
                <h2>Producto no encontrado</h2>

                <Link
                    to="/"
                    style={{
                        color: "#111111",
                        fontWeight: "bold",
                    }}
                >
                    Volver al inicio
                </Link>
            </div>
        );
    }

    // ==========================================
    // AGREGAR PRODUCTO AL CARRITO
    // ==========================================

    const handleAddToCart = () => {
        if (!isAdmin && (isOutOfStock || quantity > currentStock)) {
            return;
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: formattedPrice,
            numericPrice: formattedPrice,
            image: imageList[selectedImage] || imageList[0] || "",
            quantity,
            stock: currentStock,
            selectedColor: currentSelectedColor,
        });

        setShowAddedModal(true);
    };

    return (
        <div className={styles.detailContainer}>
            <Link to="/" className={styles.backButton}>
                <FaChevronLeft />
                Volver a la tienda
            </Link>

            <div className={styles.detailGrid}>
                {/* ==================================
                    GALERÍA DE IMÁGENES
                ================================== */}

                <div className={styles.galleryContainer}>
                    <div
                        className={styles.imageSection}
                        onPointerEnter={handlePointerEnter}
                        onPointerLeave={handlePointerLeave}
                        onPointerMove={handlePointerMove}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                    >
                        {imageList.length > 0 && !imageLoadFailed ? (
                            <img
                                key={imageList[selectedImage]}
                                src={imageList[selectedImage]}
                                alt={product.name || "Imagen del producto"}
                                className={styles.mainImage}
                                decoding="async"
                                onError={handleImageError}
                                draggable={false}
                            />
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "12px",
                                    width: "100%",
                                    minHeight: "350px",
                                    padding: "20px",
                                    boxSizing: "border-box",
                                    background: "#f7f7f7",
                                    color: "#666666",
                                    textAlign: "center",
                                }}
                            >
                                <span style={{ fontSize: "40px" }}>
                                    📦
                                </span>

                                <p style={{ margin: 0, fontSize: "14px" }}>
                                    Imagen no disponible
                                </p>

                                {imageList.length === 0 && (
                                    <span
                                        style={{
                                            fontSize: "12px",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        Este producto no tiene una ruta de
                                        imagen válida.
                                    </span>
                                )}
                            </div>
                        )}

                        {/* LUPA */}

                        {imageList.length > 0 &&
                            !imageLoadFailed &&
                            showMagnifier && (
                                <div
                                    className={styles.magnifierGlass}
                                    style={{
                                        display: "block",
                                        top: `${cursorPos.y}px`,
                                        left: `${cursorPos.x}px`,
                                    }}
                                >
                                    <img
                                        src={imageList[selectedImage]}
                                        alt={`Zoom de ${product.name}`}
                                        className={styles.magnifierImage}
                                        draggable={false}
                                        onError={() => {
                                            setShowMagnifier(false);
                                            touchMagnifierActiveRef.current = false;
                                        }}
                                        style={{
                                            width: `${imageSize.width * 1.8}px`,
                                            height: `${imageSize.height * 1.8}px`,
                                            left: `-${cursorPos.imgX}px`,
                                            top: `-${cursorPos.imgY}px`,
                                            position: "absolute",
                                            maxWidth: "none",
                                            maxHeight: "none",
                                        }}
                                    />
                                </div>
                            )}
                    </div>

                    {/* MINIATURAS */}

                    {imageList.length > 1 && (
                        <div className={styles.thumbnailsContainer}>
                            {imageList.map((img: string, index: number) => (
                                <button
                                    key={`${img}-${index}`}
                                    type="button"
                                    className={`${styles.thumbnailBtn} ${
                                        selectedImage === index
                                            ? styles.activeThumbnail
                                            : ""
                                    }`}
                                    onClick={() => handleSelectImage(index)}
                                    aria-label={`Ver imagen ${
                                        index + 1
                                    } de ${product.name}`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} miniatura ${
                                            index + 1
                                        }`}
                                        loading="lazy"
                                        decoding="async"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ==================================
                    INFORMACIÓN DEL PRODUCTO
                ================================== */}

                <div className={styles.infoSection}>
                    <span className={styles.productCategory}>
                        {product.brand
                            ? `${String(product.brand).toUpperCase()} · `
                            : ""}
                        {product.category
                            ? String(product.category).toUpperCase()
                            : ""}
                    </span>

                    <h1 className={styles.productTitle}>
                        {product.name}
                    </h1>

                    <p className={styles.productPrice}>
                        ${formattedPrice.toLocaleString("es-CO")} COP
                    </p>

                    {/* TONOS */}

                   {productColors.length > 0 && (
    <div className={styles.tonesSection}>
        <div className={styles.tonesHeader}>
            <p className={styles.tonesLabel}>
                Tonos disponibles:
            </p>

            {currentSelectedColor && (
                <span className={styles.selectedTone}>
                    Seleccionado:{" "}
                    <strong>{currentSelectedColor.name}</strong>
                    {" — "}
                    {currentStock} disponible
                    {currentStock === 1 ? "" : "s"}
                </span>
            )}
        </div>

        <div className={styles.colorCirclesContainer}>
            {productColors.map((colorObj, index) => (
                <button
                    key={`${colorObj.name}-${index}`}
                    type="button"
                    className={`
                        ${styles.colorCircle}
                        ${selectedColorIndex === index
                            ? styles.activeColorCircle
                            : ""}
                        ${Number(colorObj.stock ?? 0) <= 0
                            ? styles.disabledColorCircle
                            : ""}
                    `}
                    aria-label={`Seleccionar ${colorObj.name}`}
                    aria-pressed={selectedColorIndex === index}
                    onClick={() => {
                        setSelectedColorIndex(index);

                        if (
                            colorObj.imageIndex !== undefined &&
                            imageList[colorObj.imageIndex]
                        ) {
                            handleSelectImage(colorObj.imageIndex);
                        }
                    }}
                    style={{
                        backgroundColor: colorObj.hex || "#cccccc"
                    }}
                    title={`${colorObj.name} - ${Number(
                        colorObj.stock ?? 0
                    )} disponibles`}
                />
            ))}
        </div>
    </div>
)}

                    {/* STOCK DISPONIBLE SIN TONOS */}

                   {!isAdmin &&
    productColors.length === 0 &&
    currentStock > 0 && (
        <p className={styles.stockAvailability}>
            <FaCheckCircle />
            Disponible: {currentStock}{" "}
            {currentStock === 1 ? "unidad" : "unidades"} en stock
        </p>
    )}
                    {/* AVISO DE POCAS UNIDADES */}

                   {!isAdmin &&
    productColors.length > 0 &&
    currentStock > 0 &&
    currentStock <= 5 && (
        <p className={styles.lowStockNotice}>
            ¡Solo quedan {currentStock} unidades de este tono!
        </p>
    )}

                    {/* PRODUCTO O TONO AGOTADO */}

                    {isOutOfStock && (
                        <p
                            style={{
                                fontSize: "13px",
                                color: "#b42318",
                                fontWeight: 600,
                                margin: "4px 0",
                            }}
                        >
                            {productColors.length > 0
                                ? "Tono agotado temporalmente."
                                : "Producto agotado temporalmente."}
                        </p>
                    )}

                    {/* DESCRIPCIÓN */}

                    <p className={styles.productDescription}>
                        {product.description}
                    </p>

                    <div className={styles.divider} />

                    {/* CANTIDAD Y CARRITO */}

                    <div className={styles.actionsContainer}>
                        <div className={styles.quantitySelector}>
                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((previous) =>
                                        previous > 1 ? previous - 1 : 1
                                    )
                                }
                                className={styles.qtyBtn}
                                aria-label="Disminuir cantidad"
                            >
                                -
                            </button>

                            <span className={styles.qtyValue}>
                                {quantity}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity((previous) =>
                                        !isAdmin && previous >= currentStock
                                            ? previous
                                            : previous + 1
                                    )
                                }
                                className={styles.qtyBtn}
                                disabled={
                                    !isAdmin && quantity >= currentStock
                                }
                                style={{
                                    opacity:
                                        !isAdmin && quantity >= currentStock
                                            ? 0.5
                                            : 1,
                                    cursor:
                                        !isAdmin && quantity >= currentStock
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                                aria-label="Aumentar cantidad"
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className={styles.addToCartBtn}
                            disabled={isOutOfStock}
                            style={{
                                opacity: isOutOfStock ? 0.6 : 1,
                                cursor: isOutOfStock
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                        >
                            <FaShoppingCart />{" "}
                            {isOutOfStock
                                ? "AGOTADO"
                                : "AÑADIR AL CARRITO"}
                        </button>
                    </div>

                    {/* BENEFICIOS */}

                    <div className={styles.benefitsBox}>
                        <div className={styles.benefitItem}>
                            <FaTruck className={styles.benefitIcon} />
                            <span>Envíos seguros a toda Colombia</span>
                        </div>

                        <div className={styles.benefitItem}>
                            <FaShieldAlt className={styles.benefitIcon} />
                            <span>
                                Productos 100% originales y garantizados
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================
                MODAL DE CONFIRMACIÓN DEL CARRITO
            ================================== */}

            {showAddedModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.addedModalContent}>
                        <FaCheckCircle className={styles.successIcon} />

                        <h3>¡Producto añadido al carrito!</h3>

                        <p>
                            {product.name}
                            {currentSelectedColor
                                ? ` (${currentSelectedColor.name})`
                                : ""}
                            {` - ${quantity} unidad${
                                quantity > 1 ? "es" : ""
                            }`}
                        </p>

                        <div className={styles.modalButtons}>
                            <button
                                type="button"
                                onClick={() => setShowAddedModal(false)}
                                className={styles.continueShoppingBtn}
                            >
                                Seguir comprando
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/cart")}
                                className={styles.goToCartBtn}
                            >
                                Ir al carrito
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;
