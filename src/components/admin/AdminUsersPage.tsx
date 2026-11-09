import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminUsersRequest } from "../../api/taskApi";
import styles from "../Orders/Orders.module.css";

type AdminUser = { id: number | string; name?: string; email?: string; role?: string };
const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 24;

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await getAdminUsersRequest();
            if (!result?.success || !Array.isArray(result.data)) throw new Error(result?.message || "El servidor devolvió un formato inesperado.");
            setUsers(result.data);
        } catch (err: any) {
            setError(err?.message || "No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void loadUsers(); }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        const term = normalize(searchTerm.trim());
        return users.filter((user) => !term || [user.id, user.name, user.email, user.role].some((value) => normalize(value).includes(term)));
    }, [users, searchTerm]);
    const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
    useEffect(() => { setPage(1); }, [searchTerm]);

    return (
        <main className={styles.adminUsersPage}>
            <header className={styles.adminUsersHeader}>
                <div>
                    <span className={styles.adminUsersEyebrow}>Administración</span>
                    <h1>Usuarios registrados</h1>
                    <p>Consulta las cuentas registradas en la tienda.</p>
                </div>
                <label className={styles.adminUsersSearch}>
                    <span aria-hidden="true">⌕</span>
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por nombre, correo o ID…" aria-label="Buscar usuarios por nombre, correo o ID" />
                    {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Limpiar búsqueda">×</button>}
                </label>
            </header>
            <p className={styles.adminUsersSummary}>{filteredUsers.length} {filteredUsers.length === 1 ? "usuario" : "usuarios"}</p>
            {loading ? <div className={styles.adminUsersState}>Cargando usuarios…</div> : error ? (
                <div className={`${styles.adminUsersState} ${styles.adminUsersError}`} role="alert">{error}<button type="button" onClick={() => void loadUsers()}>Intentar de nuevo</button></div>
            ) : filteredUsers.length === 0 ? <div className={styles.adminUsersState}>No hay usuarios que coincidan con la búsqueda.</div> : (
                <>
                    <section className={styles.adminUsersGrid} aria-label="Usuarios">
                        {visibleUsers.map((user) => {
                            const name = user.name || "Usuario sin nombre";
                            const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
                            return <article className={styles.adminUserCard} key={String(user.id)}>
                                <span className={styles.adminUserAvatar} aria-hidden="true">{initials}</span>
                                <div className={styles.adminUserDetails}>
                                    <strong>{name}</strong>
                                    <span>{user.email || "Sin correo"}</span>
                                    <span className={styles.adminUserId}>ID: {user.id}</span>
                                </div>
                                <span className={styles.adminUserRole}>{user.role || "cliente"}</span>
                            </article>;
                        })}
                    </section>
                    {filteredUsers.length > pageSize && <nav className={styles.adminPagination} aria-label="Paginación de usuarios">
                        <span>Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredUsers.length)} de {filteredUsers.length}</span>
                        <div>
                            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Anterior</button>
                            <strong>Página {page} de {pageCount}</strong>
                            <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Siguiente</button>
                        </div>
                    </nav>}
                </>
            )}
        </main>
    );
}
