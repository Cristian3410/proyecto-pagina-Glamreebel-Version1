import { FaInstagram } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import styles from "../Footer/Footer.module.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        
        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>SÍGUENOS EN</h3>
          <div className={styles.socialIcons}>
            <a 
              href="https://www.instagram.com/glamreebel" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIconLink} 
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://www.facebook.com/61586442024179" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIconLink} 
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://www.tiktok.com/@glamreebel"
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIconLink} 
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>HORARIOS</h3>
          <p className={styles.footerText}>Lunes a Domingo</p>
          <p className={styles.footerText}>de 9:00 am a 10:00 pm</p>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>CONÓCENOS</h3>
          <Link to="/quienes-somos" className={styles.footerLink}>Quienes somos</Link>
          <Link to="/preguntas-frecuentes" className={styles.footerLink}>Preguntas frecuentes</Link>
        </div>

        {/* Columna 4: Métodos de Pago */}
        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>METODOS DE PAGO</h3>
          <div className={styles.paymentMethodsGrid}>
            <div className={styles.paymentIconBox}>
              <img src="/images/visa logo final.png" alt="Visa" className={styles.paymentImg} />
            </div>
            <div className={styles.paymentIconBox}>
              <img src="/images/mastaer card final.png" alt="Mastercard" className={styles.masterIcon} />
            </div>
            <div className={styles.paymentIconBox}>
              <img src="/images/PayPal-Logo-final.png" alt="PayPal" className={styles.paipalIcon} />
            </div>
            <div className={styles.paymentIconBox}>
              <img src="/images/maestroFinal.png" alt="Maestro" className={styles.paymentImg} />
            </div>
            <div className={styles.paymentIconBox}>
              <img src="/images/visa electron.png" alt="Visa Electron" className={styles.visaElectron} />
            </div>
            <div className={styles.paymentIconBox}>
              <img src="/images/pngwing.com (1).png" alt="Transferencia" className={styles.transfere} />
            </div>
          </div>
        </div>

      </div>

      <div className={styles.footerLogoWrapper}>
        <img src="/logoEmpresa.png" alt="Glam Reebel Logo" className={styles.footerLogoImg} />
      </div>
    </footer>
  );
}

export default Footer;