import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./Home.module.css";

const slidesData = [


   {
    id: 3,
    image: "/images/BANNER (2).png", 
     link: "/products/291",
  },
  {
    id: 1,
    image: "/images/banner EnvioActualizado.png", 
    link: "/catalog",
    buttonText: "Comprar ahora", 
    buttonClass: styles.buyButton,
  },


    {
     id: 2,
    image: "/images/BANNER 1 SIN BOTON (1).png",
    isScrollLink: true,
    targetId: "top-sales",
  },
 
];

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slidesData.length - 1 : prev - 1));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 9000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div 
      className={styles.carouselContainer}
      onMouseEnter={() => {}} 
      onMouseLeave={() => {}}
    >
      {slidesData.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${index === currentSlide ? styles.active : ""}`}
        >
          {/* Si el slide tiene botón definido (Slide 2) */}
          {slide.buttonText ? (
            <>
              <img src={slide.image} alt="Banner promocional" className={styles.productImage} />
              <Link to={slide.link!} className={slide.buttonClass}>
                {slide.buttonText}
              </Link>
            </>
          ) : slide.isScrollLink ? (
            /* Si es el banner que hace scroll a una sección (Slide 1) */
              <div
        className={styles.discoverSlide}
        onClick={() => scrollToSection(slide.targetId!)}
    >
        <img
            src={slide.image}
            alt="Lip Gloss Bonita Ani-K - 3 tonos disponibles"
            className={styles.productImage}
        />

        <Link
            to="/products/83"
            className={styles.discoverButton}
            onClick={(event) => event.stopPropagation()}
        >
            DESCÚBRELO YA
        </Link>
    </div>
          ) : (
            /* Si es un banner con enlace normal en toda la imagen (Slide 3) */
            <Link to={slide.link!} style={{ display: "block", width: "100%", height: "100%" }}>
              <img src={slide.image} alt="Banner promocional" className={styles.productImage} />
            </Link>
          )}
        </div>
      ))}

      <button className={`${styles.arrow} ${styles.prev}`} onClick={prevSlide} aria-label="Anterior">
        <FaChevronLeft />
      </button>
      <button className={`${styles.arrow} ${styles.next}`} onClick={nextSlide} aria-label="Siguiente">
        <FaChevronRight />
      </button>

      <div className={styles.slideCounter}>
        {currentSlide + 1} / {slidesData.length}
      </div>
    </div>
  );
}

export default HomePage;