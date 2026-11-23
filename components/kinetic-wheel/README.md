# Kinetic Wheel Component

Independent component for the sweeping circular arc kinetic typography that orbits through the viewport during 3D scroll stack fly-away.

## Files
- `kinetic-wheel.js` — Standalone controller managing rotation and lifecycle visibility.
- `kinetic-wheel.css` — Dedicated fixed positioning and SVG text styles.

## How It Works
1. **Orbit Motion**: Rotates smoothly from `180deg` (starting flat along the right horizon) up through the upper arc and down to `0deg` as the stacked cards fly back into the void.
2. **Strict Lifecycle Isolation**: Strictly hidden (`display: none; opacity: 0;`) whenever `m < stackComplete` or `I <= 0` or `I >= 1`. This prevents any text overlap onto the Hero, About, or lower sections.
3. **Decoupled Architecture**: Listens to `scroll-stack:progress` events emitted by the `ScrollStack` component. Can be edited, customized, or disabled without affecting the card stacking.

## Editing Arc Words
To change the words that sweep along the arc, edit the `<textPath>` elements inside `#kinetic-wheel` in `index.html`:
```html
<textPath href="#arc-path" startOffset="15%" text-anchor="middle">PURPOSE</textPath>
<textPath href="#arc-path" startOffset="39%" text-anchor="middle">EXPERIENCE</textPath>
<textPath href="#arc-path" startOffset="65%" text-anchor="middle">CARE</textPath>
```
Adjust `startOffset` percentages to balance spacing along the SVG arc path.
