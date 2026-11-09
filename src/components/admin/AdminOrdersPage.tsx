import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllOrdersAdminRequest, updateShippingStatusRequest } from "../../api/taskApi";
import { useInventory } from "../../contexts/InventoryContext";
import styles from "../Orders/Orders.module.css";
import AdminImagePreview from "./AdminImagePreview";

type AdminOrder = {
    id: number | string;
    status?: string;
    shipping_status?: string;
    payment_method?: string;
    total?: number | string;
    created_at?: string;
    shipping_email?: string;
    shippingData?: Record<string, string | undefined>;
    items?: any[];
    products?: any[];
};

type Notice = { type: "success" | "error"; message: string };

const SHIPPING_STATUSES = ["Pendiente", "En preparación", "Despachado", "Entregado"];

const normalize = (value: unknown) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const parseDisplayPrice = (value: unknown): number => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value !== "string") return 0;
    const parsed = Number(value.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(parsed)) return 0;
    return parsed >= 100000 && parsed % 100 === 0 ? parsed / 100 : parsed;
};

const formatDate = (value?: string) => {
    if (!value) return "Fecha no disponible";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Fecha no disponible"
        : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const getOrderImage = (item: any, inventory: any[]) => {
    let image = item?.image || item?.product_image || item?.img || item?.images?.[0] || "";
    if (Array.isArray(image)) image = image[0] || "";
    if (!image) {
        const itemId = item?.product_id || item?.id;
        const itemName = normalize(item?.name || item?.product_name);
        const product = inventory.find((candidate) =>
            (itemId && String(candidate.id) === String(itemId)) ||
            (itemName && normalize(candidate.name) === itemName)
        );
        image = product?.image || product?.img || product?.images?.[0] || "";
        if (Array.isArray(image)) image = image[0] || "";
    }
    if (typeof image !== "string" || !image) return "";
    return image.startsWith("http") ? image : encodeURI(image.startsWith("/") ? image : `/${image}`);
};

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<Notice | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [shippingFilter, setShippingFilter] = useState("all");
    const [shippingDrafts, setShippingDrafts] = useState<Record<string, string>>({});
    const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [imagePreview, setImagePreview] = useState<{ src: string; alt: string } | null>(null);
    const { inventory } = useInventory();
    const pageSize = 20;

    const fetchAllOrders = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const response = await getAllOrdersAdminRequest();
            if (!response?.success || !Array.isArray(response.data)) {
                throw new Error(response?.message || "El servidor devolvió un formato de pedidos inesperado.");
            }
            setOrders([...response.data].sort((a, b) => Number(b.id) - Number(a.id)));
        } catch (err: any) {
            const message = err?.message || "Error al conectar con el servidor.";
            setError(message);
            setNotice({ type: "error", message });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void fetchAllOrders();
    }, [fetchAllOrders]);

    useEffect(() => {
        if (!notice) return;
        const timeout = window.setTimeout(() => setNotice(null), 4500);
        return () => window.clearTimeout(timeout);
    }, [notice]);

    const filteredOrders = useMemo(() => {
        const term = normalize(searchTerm.trim());
        return orders.filter((order) => {
            const buyer = order.shippingData || {};
            const searchable = [
                order.id,
                order.shipping_email,
                buyer.shipping_name,
                buyer.shipping_apellido,
                buyer.shipping_email,
                buyer.shipping_phone,
                buyer.shipping_cedula,
                buyer.shipping_address,
                buyer.shipping_city,
                ...(order.items || order.products || []).flatMap((item: any) => [item.product_name, item.name]),
            ];
            const matchesSearch = !term || searchable.some((value) => normalize(value).includes(term));
            const paymentStatus = normalize(order.status);
            const matchesPayment = paymentFilter === "all" ||
                (paymentFilter === "approved" && paymentStatus.includes("aprob")) ||
                (paymentFilter === "pending" && paymentStatus.includes("pend")) ||
                (paymentFilter === "rejected" && (paymentStatus.includes("rechaz") || paymentStatus.includes("fall")));
            const shippingStatus = normalize(order.shipping_status || "Pendiente");
            const matchesShipping = shippingFilter === "all" || shippingStatus === normalize(shippingFilter);
            return matchesSearch && matchesPayment && matchesShipping;
        });
    }, [orders, searchTerm, paymentFilter, shippingFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, paymentFilter, shippingFilter]);

    useEffect(() => {
        if (page > pageCount) setPage(pageCount);
    }, [page, pageCount]);

    const handleStatusChange = async (order: AdminOrder) => {
        const key = String(order.id);
        const nextStatus = shippingDrafts[key] ?? order.shipping_status ?? "Pendiente";
        if (normalize(nextStatus) === normalize(order.shipping_status || "Pendiente")) return;
        setUpdatingOrder(key);
        try {
            const response = await updateShippingStatusRequest(Number(order.id), nextStatus);
            if (!response?.success) throw new Error(response?.message || "No se pudo actualizar el estado de envío.");
            setOrders((current) => current.map((item) =>
                String(item.id) === key ? { ...item, shipping_status: nextStatus } : item
            ));
            setNotice({ type: "success", message: `El envío del pedido #${order.id} ahora está: ${nextStatus}.` });
        } catch (err: any) {
            setNotice({ type: "error", message: err?.message || "Ocurrió un error al actualizar el envío." });
        } finally {
            setUpdatingOrder(null);
        }
    };

    const getPaymentBadgeStyle = (status: string) => {
        const value = normalize(status);
        if (value.includes("aprob")) return styles.adminBadgeSuccess;
        if (value.includes("rechaz") || value.includes("fall")) return styles.adminBadgeDanger;
        return styles.adminBadgePending;
    };

    if (loading && orders.length === 0) {
        return <div className={styles.loading}>Cargando panel de pedidos…</div>;
    }

    return (
        <main className={`${styles.ordersContainer} ${styles.adminOrdersPage}`}>
            <header className={styles.adminOrdersHeader}>
                <div>
                    <span className={styles.adminOrdersEyebrow}>ADMINISTRACIÓN</span>
                    <h1>Pedidos y despachos</h1>
                    <p>Busca órdenes, revisa los datos de entrega y actualiza el avance logístico.</p>
                </div>
                <button type="button" className={styles.adminRefreshButton} onClick={() => void fetchAllOrders(true)} disabled={refreshing}>
                    {refreshing ? "Actualizando…" : "↻ Actualizar pedidos"}
                </button>
            </header>

            {notice && (
                <div className={`${styles.adminNotice} ${notice.type === "error" ? styles.adminNoticeError : styles.adminNoticeSuccess}`} role={notice.type === "error" ? "alert" : "status"}>
                    <span>{notice.message}</span>
                    <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso">×</button>
                </div>
            )}

            {error && orders.length === 0 ? (
                <section className={styles.adminPanelError} role="alert">
                    <h2>No se pudieron cargar los pedidos</h2>
                    <p>{error}</p>
                    <p>El backend debe exponer la ruta administrativa de pedidos y validar el rol de administrador.</p>
                    <button type="button" className={styles.adminRefreshButton} onClick={() => void fetchAllOrders(true)} disabled={refreshing}>Intentar de nuevo</button>
                </section>
            ) : (
                <>
                    <section className={styles.adminOrderFilters} aria-label="Filtros de pedidos">
                        <label className={styles.adminOrderSearch}>
                            <span aria-hidden="true">⌕</span>
                            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nombre, correo, pedido o producto…" aria-label="Buscar pedidos por nombre, correo, pedido o producto" />
                            {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpiar búsqueda">×</button>}
                        </label>
                        <label>
                            <span>Pago</span>
                            <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
                                <option value="all">Todos</option>
                                <option value="approved">Aprobado</option>
                                <option value="pending">Pendiente</option>
                                <option value="rejected">Rechazado</option>
                            </select>
                        </label>
                        <label>
                            <span>Envío</span>
                            <select value={shippingFilter} onChange={(event) => setShippingFilter(event.target.value)}>
                                <option value="all">Todos</option>
                                {SHIPPING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </label>
                        <strong className={styles.adminOrdersCount}>{filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}</strong>
                    </section>

                    {filteredOrders.length === 0 ? (
                        <div className={styles.emptyOrders}>No hay pedidos que coincidan con esos filtros.</div>
                    ) : (
                        <div className={styles.ordersList}>
                            {visibleOrders.map((order) => {
                                const key = String(order.id);
                                const buyer = order.shippingData || {};
                                const items = order.items || order.products || [];
                                const currentShipping = order.shipping_status || "Pendiente";
                                const selectedShipping = shippingDrafts[key] ?? currentShipping;
                                const isUpdating = updatingOrder === key;
                                const paymentApproved = normalize(order.status).includes("aprob");

                                return (
                                    <article key={key} className={styles.orderCard}>
                                        <div className={styles.orderHeader}>
                                            <div>
                                                <span className={styles.adminOrdersEyebrow}>ORDEN</span>
                                                <h2 className={styles.orderTitle}>#{order.id}</h2>
                                                <span className={styles.adminOrderDate}>{formatDate(order.created_at)}</span>
                                            </div>
                                            <div className={styles.adminOrderBadges}>
                                                <span className={`${styles.adminStatusBadge} ${getPaymentBadgeStyle(order.status || "")}`}>Pago · {order.status || "Pendiente"}</span>
                                                <span className={`${styles.adminStatusBadge} ${styles.adminShippingBadge}`}>Envío · {currentShipping}</span>
                                            </div>
                                        </div>

                                        <div className={styles.adminOrderInfoGrid}>
                                            <section>
                                                <h3>Cliente y entrega</h3>
                                                <p><strong>Nombre:</strong> {[buyer.shipping_name, buyer.shipping_apellido].filter(Boolean).join(" ") || "Sin dato"}</p>
                                                <p><strong>Correo:</strong> {order.shipping_email || buyer.shipping_email || "Sin dato"}</p>
                                                <p><strong>Teléfono:</strong> {buyer.shipping_phone || "Sin dato"}</p>
                                                <p><strong>Documento:</strong> {buyer.shipping_cedula || "Sin dato"}</p>
                                                <p><strong>Dirección:</strong> {buyer.shipping_address || "Sin dato"}</p>
                                                <p><strong>Zona:</strong> {[buyer.shipping_barrio, buyer.shipping_localidad, buyer.shipping_city].filter(Boolean).join(" · ") || "Sin dato"}</p>
                                            </section>
                                            <section>
                                                <h3>Resumen de pago</h3>
                                                <p><strong>Método:</strong> {order.payment_method || "Sin dato"}</p>
                                                <p><strong>Estado del pago:</strong> {order.status || "Pendiente"}</p>
                                                <p className={styles.adminOrderTotal}><strong>Total:</strong> ${parseDisplayPrice(order.total).toLocaleString("es-CO")} COP</p>
                                            </section>
                                        </div>

                                        <section className={styles.adminOrderItems}>
                                            <h3>Productos ({items.length})</h3>
                                            {items.length ? items.map((item: any, index: number) => {
                                                const image = getOrderImage(item, inventory);
                                                const quantity = Math.max(1, Number(item.quantity) || 1);
                                                const name = item.product_name || item.name || "Producto";
                                                const unitPrice = parseDisplayPrice(item.price);
                                                const subtotal = item.subtotal !== undefined ? parseDisplayPrice(item.subtotal) : unitPrice * quantity;
                                                return (
                                                    <div className={styles.adminOrderItem} key={`${item.product_id || item.id || name}-${index}`}>
                                                        {image ? <button type="button" className={styles.adminOrderImageButton} onClick={() => setImagePreview({ src: image, alt: name })} aria-label={`Ampliar foto de ${name}`}><img src={image} alt={name} loading="lazy" /></button> : <div className={styles.adminOrderImagePlaceholder}>Sin foto</div>}
                                                        <div className={styles.adminOrderItemName}><strong>{name}</strong><span>Cantidad: {quantity} · Unitario: ${unitPrice.toLocaleString("es-CO")} COP</span></div>
                                                        <strong>${subtotal.toLocaleString("es-CO")} COP</strong>
                                                    </div>
                                                );
                                            }) : <p>El pedido no contiene productos detallados.</p>}
                                        </section>

                                        <footer className={styles.adminShippingControls}>
                                            <label htmlFor={`shipping-${key}`}>
                                                <span>Actualizar estado del envío{!paymentApproved && " · disponible al aprobarse el pago"}</span>
                                                <select id={`shipping-${key}`} value={selectedShipping} disabled={!paymentApproved || isUpdating} onChange={(event) => setShippingDrafts((drafts) => ({ ...drafts, [key]: event.target.value }))}>
                                                    {!SHIPPING_STATUSES.includes(currentShipping) && <option value={currentShipping}>{currentShipping}</option>}
                                                    {SHIPPING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                            </label>
                                            <button type="button" className={styles.adminSaveShippingButton} disabled={!paymentApproved || isUpdating || normalize(selectedShipping) === normalize(currentShipping)} onClick={() => void handleStatusChange(order)}>
                                                {isUpdating ? "Guardando…" : "Guardar envío"}
                                            </button>
                                        </footer>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {filteredOrders.length > 0 && (
                        <nav className={styles.adminPagination} aria-label="Paginación de pedidos">
                            <span>Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredOrders.length)} de {filteredOrders.length}</span>
                            <div>
                                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Anterior</button>
                                <strong>Página {page} de {pageCount}</strong>
                                <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Siguiente</button>
                            </div>
                        </nav>
                    )}
                </>
            )}
            {imagePreview && <AdminImagePreview src={imagePreview.src} alt={imagePreview.alt} onClose={() => setImagePreview(null)} />}
        </main>
    );
}

export default AdminOrdersPage;
