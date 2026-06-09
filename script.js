function scrollToPayment() {
    document.getElementById('payment').scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Scroll animations cu parallax
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Animații speciale pentru diferite elemente
                if (entry.target.classList.contains('hero')) {
                    animateHeroElements(entry.target);
                }
                if (entry.target.classList.contains('stats')) {
                    animateStats(entry.target);
                }
                if (entry.target.classList.contains('lectii-grid')) {
                    animateLectii(entry.target);
                }
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('section, .lectii-grid, .testimonials-grid, .pricing-grid').forEach(element => {
        observer.observe(element);
    });

    // Parallax effect la scroll
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
    });
});

function animateHeroElements(heroSection) {
    const content = heroSection.querySelector('.hero-content');
    const image = heroSection.querySelector('.hero-image');

    if (content) {
        content.style.animation = 'slideInLeft 0.8s ease-out';
    }
    if (image) {
        image.style.animation = 'slideInRight 0.8s ease-out 0.2s both';
    }
}

function animateStats(statsSection) {
    const cards = statsSection.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
    });

    // Count up animation pentru numere
    const numbers = statsSection.querySelectorAll('.stat-number');
    numbers.forEach(num => {
        if (num.textContent !== '∞') {
            const finalValue = num.textContent;
            const numericValue = parseInt(finalValue.replace(/\D/g, ''));
            countUp(num, numericValue);
        }
    });
}

function animateLectii(lectiiGrid) {
    const cards = lectiiGrid.querySelectorAll('.lectie-card');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.05}s both`;
    });
}

function countUp(element, target) {
    let current = 0;
    const increment = target / 30;
    const originalText = element.textContent;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = originalText;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (originalText.includes('+') ? '+' : '');
        }
    }, 30);
}

// ===== SCROLL ANIMATIONS =====
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

// Animate all cards on scroll
document.querySelectorAll('.problem-card, .feature, .lectie-card, .testimonial-card, .pricing-card, .faq-item, .stat-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`;
    observer.observe(el);
});

// ===== IMAGE CLICK ANIMATIONS =====
document.querySelectorAll('.problem-image').forEach(img => {
    img.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: rgba(0, 208, 132, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: rippleEffect 0.8s ease-out;
            pointer-events: none;
        `;

        this.parentElement.style.position = 'relative';
        this.parentElement.appendChild(ripple);

        setTimeout(() => ripple.remove(), 800);

        // Zoom effect
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 300);
    });
});

// ===== BUTTON ANIMATIONS =====
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-cta, .btn-checkout').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            top: ${y}px;
            left: ${x}px;
            animation: ripplePulse 0.6s ease-out;
            pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// ===== PARALLAX EFFECT =====
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Hero parallax
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrollY * 0.3}px)`;
    }

    // Cards subtle parallax
    document.querySelectorAll('.problem-card').forEach((card, index) => {
        card.style.transform = `translateY(${scrollY * 0.02 * (index % 2 ? 1 : -1)}px)`;
    });
});
