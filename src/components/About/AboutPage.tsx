import styles from './About.module.css';
import { FaStore, FaClock, FaMapMarkerAlt, FaCheckCircle, FaHeart } from "react-icons/fa";

export default function AboutPage() {
    return (
        <div className={styles.aboutContainer}>
            {/* Sección de Presentación / Header */}
            <section className={styles.heroSection}>
                <h1 className={styles.title}>Sobre Glam Reebel</h1>
                <p className={styles.subtitle}>
                    En Glam Reebel creemos que el buen maquillaje no tiene que costar una fortuna.
                </p>
            </section>

            {/* Historia / Quiénes Somos */}
            <section className={styles.contentSection}>
                <div className={styles.textContent}>
                    <h2>¿Quiénes Somos?</h2>
                    <p>
                        Somos una tienda multimarca que reúne en un solo lugar las mejores marcas de maquillaje colombiano. 
                        Todo lo que ves aquí es <strong>100% original</strong>: somos distribuidores oficiales de cada una de nuestras marcas.
                    </p>
                    <p>
                        Escogemos productos que aguantan tu vida real: la oficina, la universidad, el bus, el calor, la rumba 
                        y lo que te traiga el día. Si buscas la misma vibra de las marcas de lujo sin dejar la quincena en el intento, 
                        estás en el lugar correcto.
                    </p>
                </div>
            </section>

            {/* Tarjetas de Beneficios / Esencia */}
            <section className={styles.valuesSection}>
                <div className={styles.card}>
                    <div className={styles.cardIcon}><FaCheckCircle /></div>
                    <h3>100% Original</h3>
                    <p>Distribuidores oficiales de las mejores marcas de maquillaje colombiano, garantizando calidad y respaldo.</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}><FaHeart /></div>
                    <h3>Para tu vida real</h3>
                    <p>Maquillaje pensado para resistir el ritmo del día a día, el clima y tus mejores momentos sin complicarte.</p>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon}><FaStore /></div>
                    <h3>Asesoría Cercana</h3>
                    <p>¿No sabes cuál es tu tono ideal? Tranqui, linda: para eso estamos, para guiarte en cada elección.</p>
                </div>
            </section>

            {/* Sección de Ubicación y Tienda Física */}
            <section className={styles.storeSection}>
                <div className={styles.storeCard}>
                    <h2>Visítanos en Bogotá</h2>
                    <p className={styles.storeDesc}>Pásate por nuestra tienda o pide online con envíos seguros a todo el país.</p>
                    
                    <div className={styles.storeInfoGrid}>
                        <div className={styles.infoItem}>
                            <FaMapMarkerAlt className={styles.storeIcon} />
                            <span>Cra 114 No. 152B - 34, Bogotá</span>
                        </div>
                        <div className={styles.infoItem}>
                            <FaClock className={styles.storeIcon} />
                            <span>Lunes a domingo, 11:00 a.m. a 8:00 p.m.</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}