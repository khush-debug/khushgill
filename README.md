# Khushman Gill — Portfolio

A high-performance, dark-mode portfolio built with obsidian aesthetics, tactile physical macOS folder interactions, kinetic typography, and fluid responsive design.

Inspired by modern executive developer and strategist portfolios.

## 🚀 Live Demo & Projects

- **Flagship Project:** [Lally Computers](https://lallycomputers.vercel.app/)
- **GitHub:** [@khush-debug](https://github.com/khush-debug)

## 🛠️ Stack & Architecture

- **Frontend:** Semantic HTML5, Custom CSS with Tailwind CSS CDN for fluid utilities
- **Typography:** Plus Jakarta Sans & JetBrains Mono (Google Fonts)
- **Visuals & Art:** Custom hand-drawn crowd illustration SVG, vector iconography, and studio portrait card
- **Interactivity:**
  - Dynamic kinetic headline scrambler (`< BUSINESS STRATEGIST />`, `< CREATIVE TECHNOLOGIST />`, etc.)
  - Interactive macOS physical folder case study cards with paper pull-out physics
  - 3D perspective mouse tilt on portrait card
  - 1-click photo customizer with instant `localStorage` persistence
  - Web Audio API haptic click synthesizer with mute toggle
  - Bezier curved experience timeline with glowing milestone nodes
  - 1-click email copy with animated toast notifications
  - Ambient mouse spotlight tracking

## 📁 Directory Structure

```text
Khushman-Gill/
├── index.html              # Main webpage structure & semantic layout
├── css/
│   └── style.css           # Obsidian theme, folder physics, bezier curves
├── js/
│   └── main.js             # Kinetic text, 3D tilt, modal controller, audio synth
├── assets/
│   ├── crowd.svg           # Custom crowd vector illustration for footer
│   ├── avatar-placeholder.svg # Studio monochrome editorial portrait
│   └── favicon.svg         # Modern KG monogram favicon
└── README.md
```

## ⚡ Quick Start / Local Preview

Open `index.html` in any modern web browser, or launch a quick local preview server using Python:

```bash
# From inside this directory:
python3 -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

## 🚢 Deploy to Vercel in 1 Click

To deploy this portfolio live to Vercel:

```bash
# Push to GitHub:
git add .
git commit -m "feat: portfolio release"
git push origin main
```
Then connect your repository `khush-debug/khushgill` on [vercel.com](https://vercel.com) for instant global deployment.
