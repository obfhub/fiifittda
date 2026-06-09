# Ghid Contribuție - FiiFit Online 🟢

Mulțumim că vrei să contribui la FiiFit Online! Urmează acești pași pentru a contribui efectiv.

## 📋 Reguli de Contribuție

### 1. Fork Repository-ul
```bash
# Pe GitHub, click "Fork" button
git clone https://github.com/YOUR_USERNAME/fiifit-online.git
cd fiifit-online
```

### 2. Creează o Branch
```bash
git checkout -b feature/descriere-feature
# Sau pentru bug fix:
git checkout -b fix/descriere-bug
```

### 3. Fă Modificări
- Editează fișierele necesare
- Testează local
- Asigură-te că totul funcționează

### 4. Commit cu Mesaj Clar
```bash
git add .
git commit -m "Add: descriere clara a schimbarii"
# Exemple:
# git commit -m "Add: new podcast section"
# git commit -m "Fix: image responsiveness on mobile"
# git commit -m "Update: colors to new green theme"
```

### 5. Push to Your Fork
```bash
git push origin feature/descriere-feature
```

### 6. Creează Pull Request
- Pe GitHub, click "Compare & pull request"
- Descrie ce ai schimbat
- Așteptă review

## 🎯 Tipuri de Contribuții

### ✨ Noi Features
- Noi secțiuni
- Noi pagini
- Noi funcționalități
- Îmbunătățiri animații

### 🐛 Bug Fixes
- Probleme de responsivitate
- Erori JavaScript
- Probleme CSS
- Linkuri rupte

### 📝 Documentație
- Îmbunătățiri README
- Noi ghiduri
- Clarificări cod

### 🎨 Design Improvements
- Noi culori
- Îmbunătățiri UI
- Optimizări layout
- Noi icons

## 📐 Standarde Cod

### HTML
```html
<!-- Semantic HTML5 -->
<section id="unique-id" class="section-class">
  <div class="container">
    <!-- Content -->
  </div>
</section>
```

### CSS
```css
/* Use CSS variables for colors */
color: var(--primary);
background: var(--dark-bg);

/* Use existing spacing */
margin: 20px;
padding: 30px;

/* Use transitions for animations */
transition: var(--transition);
```

### JavaScript
```javascript
// Vanilla JS - no frameworks
// Use const/let, not var
const element = document.getElementById('id');

// Use descriptive names
function animateCardOnScroll() {
  // ...
}

// Add comments for complex logic
```

## 🔍 Înainte de Pull Request

- [ ] Testezi local și merge
- [ ] Nu ai break-uri în browser console
- [ ] Responsive pe mobile
- [ ] Animații smooth
- [ ] Spelling check
- [ ] Commit messages sunt clare

## 📱 Testing Checklist

### Desktop
- [ ] Chrome / Firefox / Safari
- [ ] Full width looks good
- [ ] No horizontal scroll
- [ ] Animations smooth

### Mobile
- [ ] iPhone / Android
- [ ] Touch interactions work
- [ ] Text readable
- [ ] Images load properly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Links have focus states
- [ ] Colors have enough contrast
- [ ] Icons have alt text

## 🎨 Culori & Design System

### Culori Principale
- Primary: `#00D084` (Verde deschis)
- Primary Dark: `#00A565` (Verde închis)
- Primary Light: `#33E0A1` (Verde light)
- Dark BG: `#0F0F0F`
- Cards: `#1F1F1F`

### Sizing
- Border radius: `12px` sau `16px`
- Padding: `20px`, `30px`, `40px`
- Margin: `20px`, `30px`, `50px`, `80px`
- Line height: `1.7` sau `1.8`

## 📚 Resurse

- [Vanilla JS Best Practices](https://javascript.info/)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
- [Responsive Design](https://web.dev/responsive-web-design-basics/)
- [Web Accessibility](https://www.w3.org/WAI/)

## ❓ Întrebări?

Deschide o Issue cu tag `question` și vom răspunde!

---

**Mulțumim pentru contribuție! 💚**
