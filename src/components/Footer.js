import React, { useEffect, useRef, useState } from 'react';
import './Footer.css';

const footerSections = [
  {
    label: 'Program',
    links: [
      { title: 'Despre program', href: '#program' },
      { title: 'Lectii', href: '#lectii' },
      { title: 'Transformari', href: '#transformari' },
      { title: 'Tarife', href: '#tarife' }
    ]
  },
  {
    label: 'Informatii',
    links: [
      { title: 'Intrebari frecvente', href: '#faq' },
      { title: 'Contul meu', href: '/account' },
      { title: 'Contact', href: 'mailto:fiifitonline@gmail.com' }
    ]
  },
  {
    label: 'Contact',
    links: [
      {
        title: 'fiifitonline@gmail.com',
        href: 'mailto:fiifitonline@gmail.com',
        icon: 'fa-envelope'
      },
      {
        title: 'Sheridan, WY 82801',
        href: 'https://maps.google.com/?q=30+N+Gould+St+Sheridan+WY+82801',
        icon: 'fa-location-dot',
        external: true
      }
    ]
  }
];

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/fiifitonline/',
    icon: 'fa-instagram',
    className: 'instagram'
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/fiifitonline/',
    icon: 'fa-facebook-f',
    className: 'facebook'
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/37300000000',
    icon: 'fa-whatsapp',
    className: 'whatsapp'
  },
  {
    label: 'Telegram',
    href: 'https://t.me/fiifitonline',
    icon: 'fa-telegram',
    className: 'telegram'
  }
];

export function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className={`footer ${isVisible ? 'is-visible' : ''}`}>
      <div className="footer-glow" aria-hidden="true"></div>
      <div className="footer-highlight" aria-hidden="true"></div>

      <div className="footer-layout">
        <div className="footer-brand footer-animate" style={{ '--footer-delay': '0s' }}>
          <a className="footer-logo" href="#home" aria-label="FiiFit.online">
            <span className="footer-logo-mark">
              <i className="fas fa-heart-pulse" aria-hidden="true"></i>
            </span>
            FiiFit.online
          </a>
          <p>
            Program online de slabire sanatoasa, cu educatie, miscare si suport real.
          </p>
          <p className="footer-mission">
            Pentru ca fiecare femeie sa se simta confortabil si puternica in corpul ei.
          </p>
          <p className="footer-copyright">
            © {new Date().getFullYear()} Club FiiFit Online.<br />
            Toate drepturile rezervate.
          </p>
        </div>

        <div className="footer-links">
          {footerSections.map((section, index) => (
            <div
              className="footer-column footer-animate"
              style={{ '--footer-delay': `${0.1 + index * 0.1}s` }}
              key={section.label}
            >
              <h3>{section.label}</h3>
              <ul>
                {section.links.map((link) => (
                  <li key={link.title}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer' : undefined}
                    >
                      {link.icon && <i className={`fas ${link.icon}`} aria-hidden="true"></i>}
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-legal footer-animate" style={{ '--footer-delay': '0.4s' }}>
        <span>
          <i className="fas fa-lock" aria-hidden="true"></i>
          FiiFit Club Online LLC
        </span>
        <div className="footer-socials" aria-label="Social media">
          {socialLinks.map((link) => (
            <a
              className={`footer-social ${link.className}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              key={link.label}
            >
              <span className="footer-social-icon">
                <i className={`fab ${link.icon}`} aria-hidden="true"></i>
              </span>
              <span className="footer-social-label">{link.label}</span>
            </a>
          ))}
        </div>
        <span>EIN: 37-2077501</span>
      </div>
    </footer>
  );
}
