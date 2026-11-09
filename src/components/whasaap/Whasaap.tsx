import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton() {
  const phone = "573138949104"; // Reemplaza con tu número
  const message = "¡Hola! Quisiera más información sobre los productos de Glam Reebel.";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "25px",
        right: "25px",
        backgroundColor: "#ff1867", // Color rosado de tu marca
        color: "#ffffff",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 6px 15px rgba(255, 24, 103, 0.4)",
        zIndex: 9999,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.backgroundColor = "#e01869"; // Rosado un poco más oscuro al pasar el mouse
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.backgroundColor = "#ff1867";
      }}
      title="¡Escríbenos por WhatsApp!"
    >
      <FaWhatsapp size={35} />
    </a>
  );
}

export default WhatsAppButton;