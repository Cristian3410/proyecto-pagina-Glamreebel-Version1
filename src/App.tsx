import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar/NavBarPage";
import Footer from "./components/Footer/FooterPage.tsx"; 
import MainContent from "./components/MainContent";
import Products from "./components/products/Products";
import Catalog from "./components/Catalog/CatalogPage";
import CartPage from "./components/Cart/CartPage"; 
import AccesPage from "./components/Access/AccessPage";
import CheckoutPage from "./components/Checkout/CheckoutPage";
import CheckoutSuccessPage from "./components/paySucces/CheckoutSuccessPage";
import CheckoutFailurePage from "./components/paySucces/CheckoutFailurePage";
import CheckoutPendingPage from "./components/paySucces/CheckoutPendingPage";
import OrdersPage from "./components/Orders/OrdersPage";
import AdminOrdersPage from "./components/admin/AdminOrdersPage.tsx"; 
import AdminInventoryPage from "./components/admin/AdminInventaryPage.tsx";
import AdminUsersPage from "./components/admin/AdminUsersPage";
import { AdminRoute } from "./components/admin/protectetRouter.tsx"; 
import WhatsAppButton from "./components/whasaap/Whasaap.tsx";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import ScrollToTop from "./components/StopScroll.tsx";
import AboutPage from "./components/About/AboutPage.tsx";
import PreguntasFrecuentes from "../../mi-proyecto/src/components/Preguntas/Preguntas.tsx"

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <InventoryProvider>
          <BrowserRouter>
            <ScrollToTop />
            <NavBar onOpenLogin={() => setIsLoginOpen(true)} />
            
            <AccesPage 
              isOpen={isLoginOpen} 
              onClose={() => setIsLoginOpen(false)} 
            />

            <Routes>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/checkout/failure" element={<CheckoutFailurePage />} />
              <Route path="/checkout/pending" element={<CheckoutPendingPage />} />
              <Route 
                path="/" 
                element={
                  <MainContent 
                    isLoginOpen={isLoginOpen} 
                    onCloseLogin={() => setIsLoginOpen(false)} 
                  />
                } 
              />
              <Route path="/quienes-somos" element={<AboutPage />} />
              <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes/>}/>
              <Route path="/products/:id" element={<Products />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/brand/:brandName" element={<Catalog />} />
              <Route path="/category/:categoryName" element={<Catalog />} />
              
              {/* ---> RUTA NUEVA PARA EL BUSCADOR <--- */}
              <Route path="/search" element={<Catalog />} />

              <Route path="/cart" element={<CartPage onOpenLogin={() => setIsLoginOpen(true)} />} />
              <Route path="/mis-pedidos" element={<OrdersPage />} />

              {/* Rutas protegidas para el panel de administración */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/inventory" element={<AdminInventoryPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>
            </Routes>

            {/* Botón flotante global de WhatsApp */}
            <WhatsAppButton />

            {/* El Footer global */}
            <Footer />
          </BrowserRouter>
        </InventoryProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;