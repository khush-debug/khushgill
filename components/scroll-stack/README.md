# 3D Scroll Stacking Component

Independent component for physical card stacking with top-tab pinning, accelerated scaling, and 3D void perspective fly-away.

## Files
- `scroll-stack.js` — Standalone JavaScript physics controller.
- `scroll-stack.css` — Dedicated styles for perspective container, void target, and cards.

## How It Works
1. **Physical Card Stacking**: As you scroll through the `#work` section, each `.scroll-stack-card` pins in the viewport at `$ = (window.innerHeight - card.offsetHeight) / 2` with an incremental `18px` tab offset (`itemStackDistance`).
2. **Accelerated Scaling**: Pinned cards compress gently (`baseScale: 0.92`) as subsequent cards layer on top.
3. **3D Void Perspective Fly-Away**: Once the final card finishes stacking (`m > ne`), the `#void-container` translates back along the Z-axis (`translate3d(0, 0, -3000px)`) and scales down toward infinity while fading gracefully.
4. **Resilience & Dual Drivers**: Uses both native `window.scrollY` and `Lenis` hooks so trackpads, scrollbar drags, mobile swipes, and wheel scrolls all update smoothly without frame dropping or desync.

## Physics Parameters (`scroll-stack.js`)
```javascript
const DEFAULT_CONFIG = {
  itemDistance: 100,        // Spacing between cards in normal flow before stack
  itemScale: 0.015,         // Scale step per card layer
  itemStackDistance: 18,    // Visible top tab height per card
  stackPosition: 0.08,      // Viewport pinning position ratio
  scaleEndPosition: 0.05,   // Scaling compression reference
  baseScale: 0.92,          // Scale factor of bottom pinned card
  perspective: 1500,        // 3D CSS perspective (px)
  flyAwayDistance: 3000     // 3D Z fly-away travel (px)
};
```

## Adding or Editing Cards
Cards must have the `.scroll-stack-card` class and reside inside `#void-container` within `#scroll-stack-inner`:
```html
<div id="scroll-stack-inner" class="scroll-stack-inner">
  <div id="void-container" class="void-container">
    <div class="scroll-stack-card">Card 1</div>
    <div class="scroll-stack-card">Card 2</div>
  </div>
  <div id="scroll-stack-end" class="scroll-stack-end"></div>
</div>
```
