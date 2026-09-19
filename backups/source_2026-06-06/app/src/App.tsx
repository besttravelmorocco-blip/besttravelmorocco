import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import TailorMade from './pages/TailorMade';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#15151a] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white mt-6 text-lg font-light tracking-wider">Best of Morocco</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:slug" element={<TourDetail />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:slug" element={<DestinationDetail />} />
            <Route path="/tailor-made" element={<TailorMade />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking/:tourId" element={<Booking />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
