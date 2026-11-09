import { useEffect, useState, type MouseEvent } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import styles from "./Catalog.module.css"; 
import { useInventory } from "../../contexts/InventoryContext";

const brandLogos: Record<string, string> = {
  "bloomshell": "/images/logomarca1.png",
  "ruby-rose": "/images/logomarca5.png",
  "trendy": "/images/logomarca6.png",
  "kevin": "/images/logomarca3.png",
  "engol": "/images/logomarca2.png",
  "ani-k-makeup": "/images/ani-k.png",
  "atenea": "/images/atenea.png"
};

const PAGE_SIZE = 24;

// Función idéntica a la de Products para formatear el precio correctamente
const parseDisplayPrice = (priceInput: any) => {
  let numericValue = 0;
  if (typeof priceInput === "number") {
    numericValue = priceInput;
  } else if (typeof priceInput === "string") {
    numericValue = Number(priceInput.replace(/[^0-9]/g, ""));
  }
  if (numericValue >= 100000 && numericValue % 100 === 0) {
    numericValue = numericValue / 100;
  }
  return numericValue;
};

export default function Catalog(){
  const { brandName, categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q"); // Captura el parámetro ?q= de la URL
  
  const { inventory } = useInventory();
  
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string | number, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const handleNextImage = (e: MouseEvent<HTMLButtonElement>, prodId: string | number, imagesLength: number) => {
    e.preventDefault(); 
    e.stopPropagation();
    setCurrentImageIndexes(prev => {
      const currentIndex = prev[prodId] || 0;
      const nextIndex = (currentIndex + 1) % imagesLength;
      return { ...prev, [prodId]: nextIndex };
    });
  };

  const handlePrevImage = (e: MouseEvent<HTMLButtonElement>, prodId: string | number, imagesLength: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndexes(prev => {
      const currentIndex = prev[prodId] || 0;
      const prevIndex = (currentIndex - 1 + imagesLength) % imagesLength;
      return { ...prev, [prodId]: prevIndex };
    });
  };

  // Lógica de filtrado mejorada (Marca, Categoría o Búsqueda general)
  const filtered = inventory.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(query);
      const categoryMatch = p.category?.toLowerCase().includes(query);
      const brandMatch = p.brand?.toLowerCase().includes(query);
      return nameMatch || categoryMatch || brandMatch;
    }
    if (brandName && p.brand){
      const formattedBrand = p.brand.toLowerCase();
      const searchBrand = brandName.toLowerCase();
      return formattedBrand.includes(searchBrand);
    }
    if (categoryName && p.category){
      return p.category.toLowerCase().includes(categoryName.toLowerCase());
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [brandName, categoryName, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, pageCount);
  const pageProducts = filtered.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE
  );

  return(
    <div className={styles.container}>
      <div className={styles.titles}>
        <h1>
          {brandName && brandLogos[brandName.toLowerCase()] ? (
            <img 
              src={brandLogos[brandName.toLowerCase()]} 
              alt={brandName} 
              className={styles.titleBrandLogo} 
            />
          ) : (
            searchQuery 
              ? `Resultados para: "${searchQuery}"` 
              : (brandName ? ` ${brandName} ` : (categoryName ? `${categoryName}` : "TODOS LOS PRODUCTOS"))
          )}
        </h1>
        <p>{searchQuery ? `Se encontraron ${filtered.length} productos` : `EXPLORA NUESTRA SECCIÓN EXCLUSIVA · ${filtered.length} productos`}</p>
      </div>
       
       {filtered.length === 0 ? (
        <p className={styles.noProducts}>No hay productos disponibles en esta sección.</p>
       ):(
        <>
        <div className={styles.grid}>
          {pageProducts.map((prod, productIndex) => {
            const imagesList = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.image];
            const currentIndex = currentImageIndexes[prod.id] || 0;
            const activeImage = imagesList[currentIndex];

            // Precio formateado igual que en la vista de detalle (Products)
            const formattedPrice = parseDisplayPrice(prod.price);

            // Validar si está agotado (stock global en 0 o suma de stock de colores en 0)
            const hasColors = prod.colors && Array.isArray(prod.colors) && prod.colors.length > 0;
            const totalStock = hasColors 
              ? prod.colors.reduce((acc: number, c: any) => acc + (Number(c.stock) || 0), 0)
              : (Number(prod.stock) || 0);
            
            const isOutOfStock = totalStock <= 0;

            return(
              <div key={prod.id} className={styles.CardContainer} style={{ position: "relative" }}>
                
                {/* Etiqueta de Agotado */}
                {isOutOfStock && (
                  <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#e11d48",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    zIndex: 2,
                    letterSpacing: "0.5px"
                  }}>
                    AGOTADO
                  </div>
                )}

                <div className={styles.CardImgWrapper}>
                  <Link to={`/products/${prod.id}`} className={styles.cardLinkImg}>
                    <div className={styles.CardImg}>
                      <img 
                        src={activeImage} 
                        alt={prod.name} 
                        className={styles.imagenBox} 
                        loading={productIndex < 4 ? "eager" : "lazy"}
                        decoding="async"
                        width={400}
                        height={400}
                        style={{ opacity: isOutOfStock ? 0.6 : 1 }}
                      />
                    </div>
                  </Link>

                  {imagesList.length > 1 && (
                    <>
                      <button 
                        type="button"
                        className={styles.prevArrow} 
                        onClick={(e) => handlePrevImage(e, prod.id, imagesList.length)}
                        aria-label="Anterior imagen"
                      >
                        &#10094;
                      </button>
                      <button 
                        type="button"
                        className={styles.nextArrow} 
                        onClick={(e) => handleNextImage(e, prod.id, imagesList.length)}
                        aria-label="Siguiente imagen"
                      >
                        &#10095;
                      </button>

                      <div className={styles.dotsContainer}>
                        {imagesList.map((_: String, idx:number) => (
                          <span 
                            key={idx} 
                            className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ""}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Link to={`/products/${prod.id}`} className={styles.cardLinkText}>
                  <div className={styles.textContainer}>
                    <p className={styles.productBrand}>{prod.brand}</p>
                    <p className={styles.productName}>{prod.name}</p>
                    
                    {hasColors && (
                      <p style={{ 
                        fontSize: "12px", 
                        color: "#db2777", 
                        fontWeight: "600", 
                        margin: "6px 0",
                        textAlign: "center" 
                      }}>
                        {prod.colors.length > 1 ? "Variedad de tonos disponibles" : "Con tonos disponibles"}
                      </p>
                    )}

                    <p className={styles.productPrice}>${formattedPrice.toLocaleString()} COP</p>
                  </div>
                </Link>

              </div>
            )
          })}
        </div>

        {filtered.length > PAGE_SIZE && (
          <nav className={styles.pagination} aria-label="Paginación del catálogo">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={visiblePage === 1}
              aria-label="Página anterior"
            >
              Anterior
            </button>
            <span aria-live="polite">
              Página {visiblePage} de {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              disabled={visiblePage === pageCount}
              aria-label="Página siguiente"
            >
              Siguiente
            </button>
          </nav>
        )}
        </>
       )}
    </div>
  );
}