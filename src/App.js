import React, { useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Problems } from './components/Problems';
import { About } from './components/About';
import { Expert } from './components/Expert';
import { Lessons } from './components/Lessons';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { Signup } from './components/Signup';

function App() {
  const isSignupPage = window.location.pathname === '/checkout';

  useEffect(() => {
    if (isSignupPage) return undefined;

    // Initialize animations
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.problem-card, .feature, .lectie-card, .pricing-card, .faq-item').forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`;
      observer.observe(el);
    });

    // Parallax effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const hero = document.querySelector('.hero');
      if (hero) {
        hero.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSignupPage]);

  if (isSignupPage) {
    return <Signup />;
  }

  return (
    <div className="App">
      <Header />
      <Hero />
      <Problems />
      <About />
      <Expert />
      <Lessons />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
