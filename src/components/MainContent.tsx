import HomePage from "./Home/HomePage.tsx"
import TopSales from "./TopSales/TopSales.tsx"
import CategoriesSection from "./Categories/CategoriesPage.tsx"
import NewsletterSection from "./Newsletter/NewsletterSection.tsx"
import AccesPage from "./Access/AccessPage.tsx"
import  MasVendidos  from "./masVendidos/MasVendidosPage.tsx"

interface MainContentProps{
    isLoginOpen: boolean;
    onCloseLogin: () => void;
}

function MainContent({isLoginOpen, onCloseLogin}: MainContentProps){

    return(
        <>
          <AccesPage isOpen={isLoginOpen} onClose={onCloseLogin} />
          <HomePage />
          <TopSales />
          <CategoriesSection />
          <MasVendidos />
          <NewsletterSection />
          {/* El Footer ya no va aquí porque ahora es global en App.tsx */}
        </>
    )
}

export default MainContent;