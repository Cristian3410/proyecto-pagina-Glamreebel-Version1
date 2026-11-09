
import { useEffect, useMemo, useState } from "react";
import { useInventory } from "../../contexts/InventoryContext";
import styles from "../Orders/Orders.module.css";
import AdminImagePreview from "./AdminImagePreview";

type Notice = {
    type: "success" | "error";
    message: string;
};

const getAvailableStock = (product: any): number => {
    const colors = Array.isArray(product.colors) ? product.colors : [];
    if (colors.length > 0) {
        return colors.reduce(
            (sum: number, color: any) => sum + Math.max(0, Number(color?.stock) || 0),
            0
        );
    }
    return Math.max(0, Number(product.stock) || 0);
};

export function AdminInventoryPage() {
    const { inventory, inventoryLoading, inventoryError, updateStock, refreshInventory } = useInventory();

    const [localStock, setLocalStock] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
    const [imagePreview, setImagePreview] = useState<{ src: string; alt: string } | null>(null);

    // Ocultar automáticamente las notificaciones.
    useEffect(() => {
        if (!notice) return;

        const timer = window.setTimeout(() => {
            setNotice(null);
        }, 3500);

        return () => window.clearTimeout(timer);
    }, [notice]);

    const showNotice = (type: Notice["type"], message: string) => {
        setNotice({ type, message });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshInventory();
            showNotice("success", "Inventario actualizado.");
        } catch (error) {
            showNotice("error", error instanceof Error ? error.message : "No se pudo actualizar el inventario.");
        } finally {
            setRefreshing(false);
        }
    };

    const setSaving = (key: string, isSaving: boolean) => {
        setSavingKeys((previous) => ({
            ...previous,
            [key]: isSaving,
        }));
    };

    const handleInputChange = (key: string | number, value: number) => {
        const validatedStock = Math.max(
            0,
            Number.isFinite(value) ? Math.floor(value) : 0
        );

        setLocalStock((previous) => ({
            ...previous,
            [String(key)]: validatedStock,
        }));
    };

    const parseDisplayPrice = (priceInput: unknown): number => {
        if (typeof priceInput === "number") {
            return Number.isFinite(priceInput) ? priceInput : 0;
        }

        if (typeof priceInput !== "string") return 0;

        let numericValue = Number(priceInput.replace(/[^0-9]/g, ""));

        if (!Number.isFinite(numericValue)) return 0;

        if (numericValue >= 100000 && numericValue % 100 === 0) {
            numericValue /= 100;
        }

        return numericValue;
    };

    // Algunas respuestas de PostgreSQL entregan image como un arreglo.
    const getMainImage = (product: any): string => {
        if (Array.isArray(product.image) && product.image.length > 0) {
            return product.image[0] || "";
        }

        if (typeof product.image === "string" && product.image) {
            return product.image;
        }

        if (Array.isArray(product.images) && product.images.length > 0) {
            return product.images[0] || "";
        }

        return "";
    };

    // Guardar inventario general para productos sin tonos.
    const handleSaveStock = async (product: any) => {
        const key = String(product.id);
        const savingKey = `product-${key}`;

        const newStock = Math.max(
            0,
            Math.floor(
                Number(
                    localStock[key] !== undefined
                        ? localStock[key]
                        : product.stock ?? 0
                ) || 0
            )
        );

        setSaving(savingKey, true);

        try {
            await updateStock(product.id, newStock);

            setLocalStock((previous) => {
                const next = { ...previous };
                delete next[key];
                return next;
            });

            showNotice(
                "success",
                `${product.name}: inventario actualizado a ${newStock} ${
                    newStock === 1 ? "unidad" : "unidades"
                }.`
            );
        } catch (error) {
            console.error("Error actualizando stock:", error);
            showNotice(
                "error",
                `No se pudo guardar el stock de "${product.name}". Intenta nuevamente.`
            );
        } finally {
            setSaving(savingKey, false);
        }
    };

    // Guardar stock individual de un tono.
    const handleSaveColorStock = async (
        product: any,
        colorItem: any,
        index: number
    ) => {
        const colorKey = `${product.id}-color-${index}`;
        const savingKey = `color-${colorKey}`;

        const currentStockValue = Math.max(
            0,
            Math.floor(
                Number(
                    localStock[colorKey] !== undefined
                        ? localStock[colorKey]
                        : (
                            typeof colorItem === "object" &&
                            colorItem !== null
                                ? colorItem.stock
                                : 0
                        ) ?? 0
                ) || 0
            )
        );

        const updatedColors = Array.isArray(product.colors)
            ? [...product.colors]
            : [];

        if (
            typeof updatedColors[index] === "object" &&
            updatedColors[index] !== null
        ) {
            updatedColors[index] = {
                ...updatedColors[index],
                stock: currentStockValue,
            };
        } else {
            updatedColors[index] = {
                name: String(colorItem),
                stock: currentStockValue,
                hex: "#cccccc",
            };
        }

        const totalNewStock = updatedColors.reduce(
            (total: number, color: any) =>
                total + (Number(color?.stock) || 0),
            0
        );

        setSaving(savingKey, true);

        try {
            await updateStock(product.id, totalNewStock, {
                colors: updatedColors,
            });

            setLocalStock((previous) => {
                const next = { ...previous };
                delete next[colorKey];
                return next;
            });

            showNotice(
                "success",
                `${product.name} — ${
                    updatedColors[index].name || `Tono ${index + 1}`
                }: stock actualizado a ${currentStockValue}.`
            );
        } catch (error) {
            console.error("Error actualizando stock del tono:", error);
            showNotice(
                "error",
                `No se pudo guardar el tono de "${product.name}". Intenta nuevamente.`
            );
        } finally {
            setSaving(savingKey, false);
        }
    };

    const categories = useMemo(() => {
        return Array.from(new Set(
            inventory.map((product) => String(product.category || "Sin categoría").trim())
        )).sort((a, b) => a.localeCompare(b, "es"));
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        const normalize = (value: unknown) => String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        const term = normalize(searchTerm.trim());

        return inventory.filter((product) => {
            const matchesSearch = !term || [
                product.name,
                product.brand,
                product.category,
                product.id,
            ].some((value) => normalize(value).includes(term));
            const matchesCategory = categoryFilter === "all" ||
                String(product.category || "Sin categoría").trim() === categoryFilter;
            const availableStock = getAvailableStock(product);
            const matchesStock = stockFilter === "all" ||
                (stockFilter === "available" && availableStock > 5) ||
                (stockFilter === "low" && availableStock > 0 && availableStock <= 5) ||
                (stockFilter === "out" && availableStock === 0);

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [inventory, searchTerm, categoryFilter, stockFilter]);

    const pageSize = 24;
    const pageCount = Math.max(1, Math.ceil(filteredInventory.length / pageSize));
    const visibleInventory = filteredInventory.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, categoryFilter, stockFilter]);

    useEffect(() => {
        if (page > pageCount) setPage(pageCount);
    }, [page, pageCount]);

    const totalUnits = inventory.reduce((total, product) => {
        return total + getAvailableStock(product);
    }, 0);

    const lowStockCount = inventory.filter((product) => {
        const stock = getAvailableStock(product);
        return stock > 0 && stock <= 5;
    }).length;

    const outOfStockCount = inventory.filter((product) => {
        const colors = Array.isArray(product.colors) ? product.colors : [];

        if (colors.length > 0) {
            return colors.every(
                (color: any) => (Number(color?.stock) || 0) <= 0
            );
        }

        return (Number(product.stock) || 0) <= 0;
    }).length;

    return (
        <div className={styles.inventoryPage}>
            {/* ENCABEZADO */}
            <header className={styles.inventoryHeader}>
                <div>
                    <span className={styles.inventoryEyebrow}>
                        ADMINISTRACIÓN
                    </span>

                    <h2 className={styles.inventoryTitle}>
                        Gestión de inventario
                    </h2>

                    <p className={styles.inventorySubtitle}>
                        Controla las existencias de tus productos y de cada tono.
                        Los cambios se guardan en tu inventario de producción.
                    </p>
                </div>
            </header>

            {/* RESUMEN */}
            <div className={styles.inventoryStats}>
                <div className={styles.inventoryStatCard}>
                    <span className={styles.inventoryStatIcon}>📦</span>
                    <div>
                        <span className={styles.inventoryStatLabel}>
                            Productos registrados
                        </span>
                        <strong className={styles.inventoryStatValue}>
                            {inventory.length}
                        </strong>
                    </div>
                </div>

                <div className={styles.inventoryStatCard}>
                    <span className={styles.inventoryStatIcon}>🧮</span>
                    <div>
                        <span className={styles.inventoryStatLabel}>
                            Unidades disponibles
                        </span>
                        <strong className={styles.inventoryStatValue}>
                            {totalUnits}
                        </strong>
                    </div>
                </div>

                <div className={styles.inventoryStatCard}>
                    <span className={styles.inventoryStatIcon}>⚠️</span>
                    <div>
                        <span className={styles.inventoryStatLabel}>
                            Productos agotados
                        </span>
                        <strong className={styles.inventoryStatValue}>
                            {outOfStockCount}
                        </strong>
                    </div>
                </div>

                <div className={styles.inventoryStatCard}>
                    <span className={styles.inventoryStatIcon}>🟡</span>
                    <div>
                        <span className={styles.inventoryStatLabel}>
                            Stock bajo (1–5 unidades)
                        </span>
                        <strong className={styles.inventoryStatValue}>
                            {lowStockCount}
                        </strong>
                    </div>
                </div>
            </div>

            {inventoryError && (
                <div className={styles.adminPanelError} role="alert">
                    {inventoryError} Verifica que el backend tenga activa la ruta de productos.
                </div>
            )}

            {/* NOTIFICACIÓN INTEGRADA, SIN ALERTAS DEL NAVEGADOR */}
            {notice && (
                <div
                    key={`${notice.type}-${notice.message}`}
                    role={notice.type === "error" ? "alert" : "status"}
                    className={`${styles.inventoryToast} ${
                        notice.type === "success"
                            ? styles.inventoryToastSuccess
                            : styles.inventoryToastError
                    }`}
                >
                    <span className={styles.inventoryToastIcon}>
                        {notice.type === "success" ? "✓" : "!"}
                    </span>

                    <span className={styles.inventoryToastMessage}>
                        {notice.message}
                    </span>

                    <button
                        type="button"
                        className={styles.inventoryToastClose}
                        aria-label="Cerrar notificación"
                        onClick={() => setNotice(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* BUSCADOR */}
            <div className={styles.inventoryToolbar}>
                <div className={styles.inventorySearchBox}>
                    <span aria-hidden="true">⌕</span>

                    <input
                        type="text"
                        placeholder="Buscar producto, marca, categoría o ID..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        aria-label="Buscar productos del inventario"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className={styles.inventoryClearSearch}
                            aria-label="Limpiar búsqueda"
                        >
                            ×
                        </button>
                    )}
                </div>

                <span className={styles.inventoryResultCount}>
                    {filteredInventory.length}{" "}
                    {filteredInventory.length === 1
                        ? "producto"
                        : "productos"}
                </span>

                <div className={styles.adminInventoryFilters}>
                    <label>
                        <span>Categoría</span>
                        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                            <option value="all">Todas</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>Disponibilidad</span>
                        <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
                            <option value="all">Cualquier stock</option>
                            <option value="available">Disponible (más de 5)</option>
                            <option value="low">Stock bajo (1–5)</option>
                            <option value="out">Agotado</option>
                        </select>
                    </label>
                    <button type="button" className={styles.adminRefreshButton} onClick={handleRefresh} disabled={refreshing || inventoryLoading}>
                        {refreshing || inventoryLoading ? "Actualizando…" : "↻ Actualizar"}
                    </button>
                </div>
            </div>

            {/* LISTADO */}
            <div className={styles.inventoryList}>
                {inventoryLoading && inventory.length === 0 ? (
                    <div className={styles.inventoryEmpty} role="status">
                        <span>⏳</span>
                        <h3>Cargando inventario</h3>
                        <p>Estamos consultando los productos registrados.</p>
                    </div>
                ) : filteredInventory.length === 0 ? (
                    <div className={styles.inventoryEmpty}>
                        <span>🔎</span>
                        <h3>No encontramos productos</h3>
                        <p>
                            Prueba con otro nombre, marca, categoría o número de ID.
                        </p>
                    </div>
                ) : (
                    visibleInventory.map((product) => {
                        const mainImage = getMainImage(product);
                        const hasColors =
                            Array.isArray(product.colors) &&
                            product.colors.length > 0;

                        const productKey = String(product.id);
                        const generalStockKey = productKey;

                        const currentGeneralStock = Math.max(
                            0,
                            Number(
                                localStock[generalStockKey] !== undefined
                                    ? localStock[generalStockKey]
                                    : product.stock ?? 0
                            ) || 0
                        );

                        const generalSaving =
                            !!savingKeys[`product-${productKey}`];

                        return (
                            <article
                                key={product.id}
                                className={styles.inventoryCard}
                            >
                                {/* IDENTIFICACIÓN DEL PRODUCTO */}
                                <div className={styles.inventoryProductHeader}>
                                    <div className={styles.inventoryImageWrapper}>
                                        {mainImage ? (
                                            <button
                                                type="button"
                                                className={styles.inventoryImageZoomButton}
                                                onClick={() => setImagePreview({ src: mainImage, alt: product.name })}
                                                aria-label={`Ampliar imagen de ${product.name}`}
                                            >
                                                <img
                                                    src={mainImage}
                                                    alt={product.name}
                                                    className={styles.inventoryProductImage}
                                                    loading="lazy"
                                                />
                                            </button>
                                        ) : (
                                            <div className={styles.inventoryImagePlaceholder}>
                                                📦
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.inventoryProductInfo}>
                                        <span className={styles.inventoryProductMeta}>
                                            {product.brand || "Sin marca"}
                                            {" · "}
                                            {product.category || "Sin categoría"}
                                        </span>

                                        <h3 className={styles.inventoryProductName}>
                                            {product.name}
                                        </h3>

                                        <div className={styles.inventoryProductFooter}>
                                            <span className={styles.inventoryProductId}>
                                                ID: {product.id}
                                            </span>

                                            <span className={styles.inventoryProductPrice}>
                                                ${parseDisplayPrice(
                                                    product.price
                                                ).toLocaleString("es-CO")}{" "}
                                                COP
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* GESTIÓN DE TONOS */}
                                {hasColors ? (
                                    <div className={styles.inventoryStockSection}>
                                        <div className={styles.inventorySectionTitle}>
                                            <span>🎨</span>
                                            <div>
                                                <strong>Inventario por tonos</strong>
                                                <small>
                                                    Modifica y guarda las unidades de cada tono por separado.
                                                </small>
                                            </div>
                                        </div>

                                        <div className={styles.inventoryToneList}>
                                            {product.colors.map(
                                                (colorItem: any, index: number) => {
                                                    const colorKey =
                                                        `${product.id}-color-${index}`;

                                                    const colorName =
                                                        typeof colorItem === "object" &&
                                                        colorItem !== null
                                                            ? colorItem.name ||
                                                              colorItem.tone ||
                                                              `Tono ${index + 1}`
                                                            : String(colorItem);

                                                    const colorStock =
                                                        Math.max(
                                                            0,
                                                            Number(
                                                                typeof colorItem === "object" &&
                                                                colorItem !== null
                                                                    ? colorItem.stock ?? 0
                                                                    : 0
                                                            ) || 0
                                                        );

                                                    const currentStock =
                                                        localStock[colorKey] !== undefined
                                                            ? localStock[colorKey]
                                                            : colorStock;

                                                    const isOutOfStock =
                                                        currentStock <= 0;

                                                    const toneSavingKey =
                                                        `color-${colorKey}`;

                                                    const isSaving =
                                                        !!savingKeys[toneSavingKey];

                                                    const isDirty =
                                                        localStock[colorKey] !== undefined &&
                                                        currentStock !== colorStock;

                                                    return (
                                                        <div
                                                            key={`${colorName}-${index}`}
                                                            className={styles.inventoryToneRow}
                                                        >
                                                            <div className={styles.inventoryToneInfo}>
                                                                {colorItem?.hex && (
                                                                    <span
                                                                        className={styles.inventoryToneSwatch}
                                                                        style={{
                                                                            backgroundColor:
                                                                                colorItem.hex,
                                                                        }}
                                                                    />
                                                                )}

                                                                <div className={styles.inventoryToneNameBlock}>
                                                                    <strong>
                                                                        {colorName}
                                                                    </strong>

                                                                    <span
                                                                        className={`${styles.inventoryBadge} ${
                                                                            isOutOfStock
                                                                                ? styles.inventoryBadgeOut
                                                                                : styles.inventoryBadgeAvailable
                                                                        }`}
                                                                    >
                                                                        {isOutOfStock
                                                                            ? "Agotado"
                                                                            : `${currentStock} ${
                                                                                  currentStock === 1
                                                                                      ? "unidad"
                                                                                      : "unidades"
                                                                              }`}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className={styles.inventoryStockControls}>
                                                                <label
                                                                    className={styles.inventoryInputLabel}
                                                                    htmlFor={`stock-${colorKey}`}
                                                                >
                                                                    Existencias
                                                                </label>

                                                                <input
                                                                    id={`stock-${colorKey}`}
                                                                    className={styles.inventoryStockInput}
                                                                    type="number"
                                                                    min="0"
                                                                    step="1"
                                                                    value={currentStock}
                                                                    onChange={(event) =>
                                                                        handleInputChange(
                                                                            colorKey,
                                                                            Number(event.target.value)
                                                                        )
                                                                    }
                                                                />

                                                                <button
                                                                    type="button"
                                                                    className={styles.inventorySaveButton}
                                                                    disabled={isSaving || !isDirty}
                                                                    onClick={() =>
                                                                        handleSaveColorStock(
                                                                            product,
                                                                            colorItem,
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    {isSaving ? (
                                                                        <>
                                                                            <span className={styles.inventorySpinner} />
                                                                            Guardando
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span>✓</span>
                                                                            Guardar
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* GESTIÓN DE STOCK GENERAL */
                                    <div className={styles.inventoryGeneralStock}>
                                        <div className={styles.inventoryGeneralStatus}>
                                            <span
                                                className={`${styles.inventoryBadge} ${
                                                    currentGeneralStock <= 0
                                                        ? styles.inventoryBadgeOut
                                                        : styles.inventoryBadgeAvailable
                                                }`}
                                            >
                                                {currentGeneralStock <= 0
                                                    ? "Agotado"
                                                    : `Disponible · ${currentGeneralStock} ${
                                                          currentGeneralStock === 1
                                                              ? "unidad"
                                                              : "unidades"
                                                      }`}
                                            </span>

                                            <p>
                                                Este producto administra un único stock general.
                                            </p>
                                        </div>

                                        <div className={styles.inventoryStockControls}>
                                            <label
                                                htmlFor={`stock-product-${product.id}`}
                                                className={styles.inventoryInputLabel}
                                            >
                                                Cantidad
                                            </label>

                                            <input
                                                id={`stock-product-${product.id}`}
                                                className={styles.inventoryStockInput}
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={currentGeneralStock}
                                                onChange={(event) =>
                                                    handleInputChange(
                                                        product.id,
                                                        Number(event.target.value)
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className={styles.inventorySaveButton}
                                                disabled={generalSaving}
                                                onClick={() =>
                                                    handleSaveStock(product)
                                                }
                                            >
                                                {generalSaving ? (
                                                    <>
                                                        <span className={styles.inventorySpinner} />
                                                        Guardando
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>✓</span>
                                                        Guardar cambios
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })
                )}
            </div>

            {filteredInventory.length > 0 && (
                <nav className={styles.adminPagination} aria-label="Paginación del inventario">
                    <span>
                        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredInventory.length)} de {filteredInventory.length}
                    </span>
                    <div>
                        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Anterior</button>
                        <strong>Página {page} de {pageCount}</strong>
                        <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Siguiente</button>
                    </div>
                </nav>
            )}
            {imagePreview && <AdminImagePreview src={imagePreview.src} alt={imagePreview.alt} onClose={() => setImagePreview(null)} />}
        </div>
    );
}

export default AdminInventoryPage;
