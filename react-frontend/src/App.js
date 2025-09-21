import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import './styles/main.css';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import LiveTracking from './pages/LiveTracking';
import RoutesPage from './pages/Routes';
import Services from './pages/Services';
import Contact from './pages/Contact';
import LanguageTest from './pages/LanguageTest';

function App() {
  const { i18n } = useTranslation();

  // Update document direction for RTL languages
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  return (
    <div className="App">
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live-tracking" element={<LiveTracking />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/language-test" element={<LanguageTest />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
