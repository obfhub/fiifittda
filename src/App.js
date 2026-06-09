import React, { useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Problems } from './components/Problems';
import { About } from './components/About';
import { Expert } from './components/Expert';
import { Lessons } from './components/Lessons';
import { MacroTracker } from './components/MacroTracker';
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
      threshold: 0.04,
      rootMargin: '0px 0px 180px 0px'
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

    const revealGroups = [
      { selector: '.problem-card, .feature, .pricing-card', duration: 0.42, distance: 24, stagger: 0.05, maxDelay: 0.18 },
      { selector: '.lectie-card', duration: 0.28, distance: 14, stagger: 0.018, maxDelay: 0.09 },
      { selector: '.faq-item', duration: 0.3, distance: 14, stagger: 0.03, maxDelay: 0.12 }
    ];

    revealGroups.forEach(({ selector, duration, distance, stagger, maxDelay }) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        const delay = Math.min(index * stagger, maxDelay);
        el.style.opacity = '0';
        el.style.transform = `translateY(${distance}px)`;
        el.style.transition = `opacity ${duration}s ease ${delay}s, transform ${duration}s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`;
        observer.observe(el);
      });
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
      <MacroTracker />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
