
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
    FaSearch,
    FaUser,
    FaArrowLeft,
    FaCheckCircle,
} from "react-icons/fa";

import { BsBag } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { IoMdMenu } from "react-icons/io";

import styles from "./NavBar.module.css";

import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useInventory } from "../../contexts/InventoryContext";

interface NavBarProps {
    onOpenLogin: () => void;
}

interface ProductSearchItem {
    id: number | string;
    name?: string;
    brand?: string;
    category?: string;
    price?: number | string;
    image?: string | string[];
    images?: string[];
}

/* ============================================
   FORMATEAR PRECIOS
============================================ */

const parseDisplayPrice = (priceInput: unknown): number => {
    let numericValue = 0;

    if (typeof priceInput === "number") {
        numericValue = priceInput;
    } else if (typeof priceInput === "string") {
        numericValue = Number(priceInput.replace(/[^0-9]/g, ""));
    }

    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    if (numericValue >= 100000 && numericValue % 100 === 0) {
        numericValue /= 100;
    }

    return numericValue;
};

/* ============================================
   OBTENER PRIMERA IMAGEN
============================================ */

const getProductImage = (product: ProductSearchItem): string => {
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0] || "";
    }

    if (Array.isArray(product.image) && product.image.length > 0) {
        return product.image[0] || "";
    }

    if (typeof product.image === "string") {
        return product.image;
    }

    return "";
};

/* ============================================
   COMPONENTE NAVBAR
============================================ */

function NavBar({ onOpenLogin }: NavBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Estados del buscador.
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const { cart } = useCart();

    const {
        isAuthenticated,
        user,
        logout,
    } = useAuth();

    const { inventory } = useInventory();

    const navigate = useNavigate();
    const location = useLocation();

    /* ============================================
       IDENTIFICACIÓN DEL USUARIO
    ============================================ */

    const userDisplayName = String(
        user?.nombre ||
        user?.email?.split("@")[0] ||
        "Cliente"
    ).trim();

    const firstName =
        userDisplayName.split(/\s+/)[0] || "Cliente";

    /* ============================================
       PERMISOS ADMINISTRATIVOS
    ============================================ */

    const isAdminUser =
        isAuthenticated &&
        (
            user?.role === "admin" ||
            user?.is_admin ||
            user?.email === "tu-correo-admin@gmail.com"
        );

    const isAdminRoute =
        location.pathname.startsWith("/admin") && isAdminUser;

    const isOrdersActive =
        location.pathname === "/admin/orders";

    const isInventoryActive =
        location.pathname === "/admin/inventory";

    const isUsersActive =
        location.pathname === "/admin/users";

    /* ============================================
       TOTAL DE PRODUCTOS EN EL CARRITO
    ============================================ */

    const totalItems = cart.reduce(
        (total, item) =>
            total + (Number(item.quantity) || 0),
        0
    );

    /* ============================================
       MENÚ MÓVIL
    ============================================ */

    const toggleMenu = () => {
        setIsOpen((previous) => !previous);
    };

    const closeMobileMenu = () => {
        setIsOpen(false);
    };

    /* ============================================
       PERFIL DE USUARIO
    ============================================ */

    const handleUserClick = () => {
        if (isAuthenticated) {
            setIsUserMenuOpen((previous) => !previous);
            setIsSearchOpen(false);
            setIsOpen(false);
        } else {
            onOpenLogin();
        }
    };

    /* ============================================
       BUSCADOR DE PRODUCTOS
    ============================================ */

    const filteredProducts: ProductSearchItem[] =
        searchQuery.trim() === ""
            ? []
            : inventory.filter((product: ProductSearchItem) => {
                  const query = searchQuery.trim().toLowerCase();

                  return (
                      product.name?.toLowerCase().includes(query) ||
                      product.category?.toLowerCase().includes(query) ||
                      product.brand?.toLowerCase().includes(query)
                  );
              });

    /* ============================================
       BUSCAR CON ENTER
    ============================================ */

    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (
            event.key === "Enter" &&
            searchQuery.trim() !== ""
        ) {
            event.preventDefault();

            const query = searchQuery.trim();

            setIsSearchOpen(false);
            setSearchQuery("");

            navigate(`/search?q=${encodeURIComponent(query)}`);
        }

        if (event.key === "Escape") {
            setIsSearchOpen(false);
        }
    };

    /* ============================================
       CERRAR DESPLEGABLES AL HACER CLIC FUERA
    ============================================ */

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                searchRef.current &&
                !searchRef.current.contains(target)
            ) {
                setIsSearchOpen(false);
            }

            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(target)
            ) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* ============================================
       CERRAR MENÚS AL CAMBIAR DE PÁGINA
    ============================================ */

    useEffect(() => {
        setIsOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
    }, [location.pathname]);

    /* ============================================
       CERRAR SESIÓN
    ============================================ */

    const handleLogout = () => {
        logout();

        setIsUserMenuOpen(false);
        setIsOpen(false);
        setIsSearchOpen(false);

        navigate("/");
    };

    /* ============================================
       RENDERIZADO
    ============================================ */

    return (
        <header className={styles.header}>

            {/* =====================================
                BARRA SUPERIOR
            ===================================== */}

            <div className={styles.topBar}>
                <span className={styles.topBarText}>
                    {isAdminRoute
                        ? "🔒 PANEL DE CONTROL ADMINISTRATIVO"
                        : "¡ENVIOS A TODA COLOMBIA!"}
                </span>
            </div>

            {/* =====================================
                NAVEGACIÓN PRINCIPAL
            ===================================== */}

            <div className={styles.mainNavContainer}>
                <div className={styles.navContent}>

                    {/* LOGO */}

                    <Link
                        to={isAdminRoute ? "/admin/orders" : "/"}
                        className={styles.logo}
                        aria-label="Glam Reebel - Inicio"
                    >
                        <img
                            src="/images/LOGO GLAM REEBEL PNG.png"
                            alt="Logo Glam Reebel"
                            className={styles.imgLogo}
                        />
                    </Link>

                    {/* =================================
                        MENÚ DE ESCRITORIO
                    ================================= */}

                    <nav
                        className={styles.desktopMenu}
                        aria-label={
                            isAdminRoute
                                ? "Navegación administrativa"
                                : "Navegación principal"
                        }
                    >
                        {isAdminRoute ? (
                            <>
                                {/* RESUMEN DE PEDIDOS */}

                                <Link
                                    to="/admin/orders"
                                    className={`${styles.adminNavButton} ${
                                        isOrdersActive
                                            ? styles.adminNavButtonActive
                                            : ""
                                    }`}
                                    aria-current={
                                        isOrdersActive
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    <span
                                        className={styles.adminNavIcon}
                                        aria-hidden="true"
                                    >
                                        📋
                                    </span>

                                    <span>Resumen de Pedidos</span>

                                    {isOrdersActive && (
                                        <span
                                            className={styles.adminActiveDot}
                                            aria-hidden="true"
                                        />
                                    )}
                                </Link>

                                {/* INVENTARIO */}

                                <Link
                                    to="/admin/inventory"
                                    className={`${styles.adminNavButton} ${
                                        isInventoryActive
                                            ? styles.adminNavButtonActive
                                            : ""
                                    }`}
                                    aria-current={
                                        isInventoryActive
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    <span
                                        className={styles.adminNavIcon}
                                        aria-hidden="true"
                                    >
                                        📦
                                    </span>

                                    <span>Inventario</span>

                                    {isInventoryActive && (
                                        <span
                                            className={styles.adminActiveDot}
                                            aria-hidden="true"
                                        />
                                    )}
                                </Link>

                                {/* USUARIOS */}
                                <Link
                                    to="/admin/users"
                                    className={`${styles.adminNavButton} ${isUsersActive ? styles.adminNavButtonActive : ""}`}
                                    aria-current={isUsersActive ? "page" : undefined}
                                >
                                    <span className={styles.adminNavIcon} aria-hidden="true">👥</span>
                                    <span>Usuarios</span>
                                    {isUsersActive && <span className={styles.adminActiveDot} aria-hidden="true" />}
                                </Link>
                                {/* VOLVER A LA TIENDA */}

                                <Link
                                    to="/"
                                    className={styles.adminStoreButton}
                                    title="Volver a la tienda"
                                >
                                    <FaArrowLeft size={13} />
                                    <span>Ver Tienda</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/">INICIO</Link>

                                <Link to="/brand/trendy">
                                    TRENDY
                                </Link>

                                <Link to="/brand/ruby-rose">
                                    RUBY ROSE
                                </Link>

                                <Link to="/brand/engol">
                                    ENGOL
                                </Link>

                                <Link to="/brand/kevin">
                                    KEVIN & COCO
                                </Link>

                                <Link to="/brand/bloomshell">
                                    BLOOMSHELL
                                </Link>

                                <Link to="/brand/Ani-K-Makeup">
                                    ANI K
                                </Link>

                                <Link to="/brand/atenea">
                                    ATENEA
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* =================================
                        ACCIONES A LA DERECHA
                    ================================= */}

                    <div className={styles.actions}>

                        {/* BUSCADOR Y CARRITO */}

                        {!isAdminRoute && (
                            <>
                                {/* BUSCADOR */}

                                <div
                                    className={styles.searchContainer}
                                    ref={searchRef}
                                >
                                    <button
                                        type="button"
                                        className={styles.iconButton}
                                        aria-label="Buscar productos"
                                        aria-expanded={isSearchOpen}
                                        onClick={() => {
                                            setIsSearchOpen(
                                                (previous) => !previous
                                            );

                                            setIsUserMenuOpen(false);
                                        }}
                                    >
                                        <FaSearch />
                                    </button>

                                    {isSearchOpen && (
                                        <div
                                            className={styles.searchDropdown}
                                        >
                                            <div
                                                className={
                                                    styles.searchInputWrapper
                                                }
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Busca sombras, labiales..."
                                                    value={searchQuery}
                                                    onChange={(event) =>
                                                        setSearchQuery(
                                                            event.target.value
                                                        )
                                                    }
                                                    onKeyDown={handleKeyDown}
                                                    autoFocus
                                                    className={
                                                        styles.searchInput
                                                    }
                                                    aria-label="Buscar productos por palabra clave"
                                                />

                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.clearSearch
                                                        }
                                                        aria-label="Limpiar búsqueda"
                                                        onClick={() =>
                                                            setSearchQuery("")
                                                        }
                                                    >
                                                        <IoClose />
                                                    </button>
                                                )}
                                            </div>

                                            {searchQuery.trim() !== "" && (
                                                <div
                                                    className={
                                                        styles.searchResultsList
                                                    }
                                                >
                                                    {filteredProducts.length > 0 ? (
                                                        filteredProducts.map(
                                                            (product) => {
                                                                const mainImg =
                                                                    getProductImage(
                                                                        product
                                                                    );

                                                                const formattedPrice =
                                                                    parseDisplayPrice(
                                                                        product.price
                                                                    );

                                                                return (
                                                                    <Link
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        to={`/products/${product.id}`}
                                                                        className={
                                                                            styles.searchResultItem
                                                                        }
                                                                        onClick={() => {
                                                                            setIsSearchOpen(false);
                                                                            setSearchQuery("");
                                                                        }}
                                                                    >
                                                                        {mainImg && (
                                                                            <img
                                                                                src={mainImg}
                                                                                alt={
                                                                                    product.name ||
                                                                                    "Producto"
                                                                                }
                                                                                className={
                                                                                    styles.searchResultImg
                                                                                }
                                                                            />
                                                                        )}

                                                                        <div
                                                                            className={
                                                                                styles.searchResultInfo
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    styles.searchResultName
                                                                                }
                                                                            >
                                                                                {
                                                                                    product.name
                                                                                }
                                                                            </span>

                                                                            <span
                                                                                className={
                                                                                    styles.searchResultPrice
                                                                                }
                                                                            >
                                                                                $
                                                                                {formattedPrice.toLocaleString(
                                                                                    "es-CO"
                                                                                )}{" "}
                                                                                COP
                                                                            </span>
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            }
                                                        )
                                                    ) : (
                                                        <p
                                                            className={
                                                                styles.noResults
                                                            }
                                                        >
                                                            No se encontraron
                                                            productos con esa
                                                            palabra clave.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* CARRITO */}

                                <Link
                                    to="/cart"
                                    className={styles.cartLink}
                                    aria-label={`Carrito de compras, ${totalItems} productos`}
                                >
                                    <BsBag />

                                    {totalItems > 0 && (
                                        <span className={styles.cartBadge}>
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {/* =================================
                            PERFIL DE USUARIO
                        ================================= */}

                        <div
                            className={styles.userMenuContainer}
                            ref={userMenuRef}
                        >
                            <button
                                type="button"
                                className={`${styles.iconButton} ${
                                    isAuthenticated
                                        ? `${styles.userActive} ${styles.userLoggedButton}`
                                        : ""
                                }`}
                                aria-label={
                                    isAuthenticated
                                        ? `Sesión iniciada como ${firstName}. Abrir mi cuenta`
                                        : "Iniciar sesión"
                                }
                                title={
                                    isAuthenticated
                                        ? `Sesión iniciada como ${firstName}`
                                        : "Iniciar sesión"
                                }
                                aria-expanded={isUserMenuOpen}
                                onClick={handleUserClick}
                            >
                                <FaUser />

                                {isAuthenticated && (
                                    <>
                                        <span
                                            className={styles.userLoggedText}
                                        >
                                            Hola, {firstName}
                                        </span>

                                        <span
                                            className={
                                                styles.userLoggedIndicator
                                            }
                                            aria-hidden="true"
                                        />
                                    </>
                                )}
                            </button>

                            {/* MENÚ DESPLEGABLE DEL USUARIO */}

                            {isAuthenticated && isUserMenuOpen && (
                                <div className={styles.dropdownMenu}>

                                    {/* CONFIRMACIÓN DE SESIÓN */}

                                    <div
                                        className={styles.dropdownHeader}
                                    >
                                        <span className={styles.loginStatus}>
                                            <FaCheckCircle />
                                            SESIÓN INICIADA
                                        </span>

                                        <span>Bienvenido(a)</span>

                                        <strong>
                                            {userDisplayName}
                                        </strong>
                                    </div>

                                    {isAdminRoute ? (
                                        <Link
                                            to="/"
                                            className={styles.dropdownItem}
                                            onClick={() =>
                                                setIsUserMenuOpen(false)
                                            }
                                        >
                                            🏠 Volver a la Tienda
                                        </Link>
                                    ) : (
                                        <>
                                            {/* MIS PEDIDOS */}

                                            <Link
                                                to="/mis-pedidos"
                                                className={styles.dropdownItem}
                                                onClick={() =>
                                                    setIsUserMenuOpen(false)
                                                }
                                            >
                                                📦 Mis Pedidos
                                            </Link>

                                            {/* PANEL ADMINISTRATIVO */}

                                            {isAdminUser && (
                                                <Link
                                                    to="/admin/orders"
                                                    className={styles.dropdownItem}
                                                    onClick={() =>
                                                        setIsUserMenuOpen(false)
                                                    }
                                                >
                                                    ⚙️ Panel de Administración
                                                </Link>
                                            )}
                                        </>
                                    )}

                                    {/* CERRAR SESIÓN */}

                                    <button
                                        type="button"
                                        className={styles.dropdownLogout}
                                        onClick={handleLogout}
                                    >
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* =================================
                            BOTÓN DEL MENÚ MÓVIL
                        ================================= */}

                        <button
                            type="button"
                            className={`${styles.iconButton} ${styles.menuButton}`}
                            onClick={toggleMenu}
                            aria-label={
                                isOpen
                                    ? "Cerrar menú"
                                    : "Abrir menú"
                            }
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <IoClose /> : <IoMdMenu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* =====================================
                MENÚ MÓVIL
            ===================================== */}

            {isOpen && (
                <nav
                    className={styles.mobileMenu}
                    aria-label={
                        isAdminRoute
                            ? "Menú administrativo móvil"
                            : "Menú de tienda móvil"
                    }
                >
                    {isAdminRoute ? (
                        <>
                            {/* RESUMEN DE PEDIDOS */}

                            <Link
                                to="/admin/orders"
                                className={`${styles.mobileAdminButton} ${
                                    isOrdersActive
                                        ? styles.mobileAdminButtonActive
                                        : ""
                                }`}
                                aria-current={
                                    isOrdersActive ? "page" : undefined
                                }
                                onClick={closeMobileMenu}
                            >
                                <span aria-hidden="true">📋</span>

                                <span>Resumen de Pedidos</span>

                                {isOrdersActive && (
                                    <span
                                        className={styles.mobileAdminCheck}
                                        aria-hidden="true"
                                    >
                                        ✓
                                    </span>
                                )}
                            </Link>

                            {/* INVENTARIO */}

                            <Link
                                to="/admin/inventory"
                                className={`${styles.mobileAdminButton} ${
                                    isInventoryActive
                                        ? styles.mobileAdminButtonActive
                                        : ""
                                }`}
                                aria-current={
                                    isInventoryActive
                                        ? "page"
                                        : undefined
                                }
                                onClick={closeMobileMenu}
                            >
                                <span aria-hidden="true">📦</span>

                                <span>Inventario</span>

                                {isInventoryActive && (
                                    <span
                                        className={styles.mobileAdminCheck}
                                        aria-hidden="true"
                                    >
                                        ✓
                                    </span>
                                )}
                            </Link>

                            {/* USUARIOS */}
                            <Link
                                to="/admin/users"
                                className={`${styles.mobileAdminButton} ${isUsersActive ? styles.mobileAdminButtonActive : ""}`}
                                aria-current={isUsersActive ? "page" : undefined}
                                onClick={closeMobileMenu}
                            >
                                <span aria-hidden="true">👥</span>
                                <span>Usuarios</span>
                                {isUsersActive && <span className={styles.mobileAdminCheck} aria-hidden="true">✓</span>}
                            </Link>
                            {/* VOLVER A LA TIENDA */}

                            <Link
                                to="/"
                                className={styles.mobileAdminStoreButton}
                                onClick={closeMobileMenu}
                            >
                                <FaArrowLeft size={14} />
                                <span>Volver a la Tienda</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" onClick={closeMobileMenu}>
                                INICIO
                            </Link>

                            <Link
                                to="/brand/trendy"
                                onClick={closeMobileMenu}
                            >
                                TRENDY
                            </Link>

                            <Link
                                to="/brand/ruby-rose"
                                onClick={closeMobileMenu}
                            >
                                RUBY ROSE
                            </Link>

                            <Link
                                to="/brand/engol"
                                onClick={closeMobileMenu}
                            >
                                ENGOL
                            </Link>

                            <Link
                                to="/brand/kevin"
                                onClick={closeMobileMenu}
                            >
                                KEVIN & COCO
                            </Link>

                            <Link
                                to="/brand/bloomshell"
                                onClick={closeMobileMenu}
                            >
                                BLOOMSHELL
                            </Link>

                            <Link
                                to="/brand/Ani-K-Makeup"
                                onClick={closeMobileMenu}
                            >
                                ANI K
                            </Link>

                            <Link
                                to="/brand/atenea"
                                onClick={closeMobileMenu}
                            >
                                ATENEA
                            </Link>

                            {isAdminUser && (
                                <Link
                                    to="/admin/orders"
                                    onClick={closeMobileMenu}
                                    style={{
                                        color: "#FF0057",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ⚙️ Panel de Administración
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            )}
        </header>
    );
}

export default NavBar;
