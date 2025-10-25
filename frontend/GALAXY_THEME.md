# Galaxy Theme Documentation

## Overview

The AstraFund frontend now features a stunning, performant galaxy-themed UI with animated stars, nebula clouds, and a glassmorphism navbar.

## Components

### GalaxyBackground

**Location:** `src/components/common/GalaxyBackground/`

A high-performance background component featuring:

#### **Canvas Stars** (200 animated stars)
- Realistic star movement from right to left
- Individual twinkle effects using sine waves
- Radial gradient glow for authentic starlight
- Multiple sizes and speeds for depth perception
- Optimized using `requestAnimationFrame`

#### **Nebula Clouds** (3 animated nebulas)
- CSS-based nebula clouds with different colors:
  - Purple (#8A2BE2 family)
  - Blue (#0096FF family)
  - Pink (#FF1493 family)
- Floating animation with 60s duration
- Heavily blurred (80px) for realistic effect
- Low opacity (0.15) for subtlety

#### **Gradient Background**
- Deep space gradient: Dark purple → Deep blue → Black
- Radial gradient from top
- Subtle pulsing animation (20s cycle)

### Performance Optimizations

```css
/* GPU acceleration */
backface-visibility: hidden;
perspective: 1000px;
will-change: transform;

/* Efficient animations */
animation: float 60s ease-in-out infinite;
```

#### Key Optimizations:
1. **Canvas over CSS** for star animations (better for hundreds of elements)
2. **RequestAnimationFrame** for smooth 60fps animations
3. **GPU-accelerated transforms** for nebula movement
4. **Minimal repaints** - stars drawn once per frame
5. **Fixed positioning** - background doesn't reflow

### Header (Glassmorphism Design)

**Location:** `src/components/layout/Header/`

Modern glassmorphism navbar featuring:

#### Design Elements:
- **Backdrop blur** (20px) for frosted glass effect
- **Semi-transparent background** (rgba(10, 5, 22, 0.75))
- **Gradient borders** using CSS masks
- **Animated logo** with floating and rotation
- **Gradient SVG icon** with purple-blue gradient
- **Glowing hover effects** on navigation items

#### Navigation Features:
- Smooth slide-down animation on mount
- Hover effects with glow and lift
- User avatar with gradient background
- Icon + text layout
- Responsive design (hides text on mobile)

## Color Palette

```css
Primary Purple:    #8b5cf6  /* Cosmic Purple */
Secondary Blue:    #3b82f6  /* Nebula Blue */
Accent Light:      #a78bfa  /* Light Purple */
Background:        #0a0516  /* Deep Space */
Success Green:     #10b981
Warning Yellow:    #f59e0b
Error Red:         #ef4444
```

## Visual Effects

### Glows
```css
--glow-purple: 0 0 20px rgba(139, 92, 246, 0.5);
--glow-blue: 0 0 20px rgba(59, 130, 246, 0.5);
--glow-accent: 0 0 30px rgba(167, 139, 250, 0.6);
```

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
```

## Typography

- **Display Font:** Space Mono (monospace, for headings)
- **Body Font:** Inter (sans-serif, for content)
- **Text Color:** rgba(255, 255, 255, 0.9)
- **Secondary Text:** rgba(167, 139, 250, 0.8)

## Component Styling Guidelines

### Cards
```css
.card {
  background: rgba(10, 5, 22, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(139, 92, 246, 0.05);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(139, 92, 246, 0.5);
}
```

### Buttons
```css
.btn-primary {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.8), 
    rgba(59, 130, 246, 0.8)
  );
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(139, 92, 246, 0.5);
}
```

### Inputs
```css
.form-input {
  background: rgba(10, 5, 22, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.form-input:focus {
  box-shadow: 
    0 0 0 3px rgba(139, 92, 246, 0.2),
    0 0 20px rgba(139, 92, 246, 0.5);
}
```

## Scrollbar Customization

Custom galaxy-themed scrollbar:
```css
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8b5cf6, #3b82f6);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}
```

## Animation Examples

### Float Animation (Logo, Nebulas)
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}
```

### Slide Down (Header)
```css
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Star Twinkle (Canvas)
```javascript
star.twinklePhase += star.twinkleSpeed;
const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
```

## Responsive Design

### Breakpoints
- **Desktop:** > 768px (full navigation text)
- **Mobile:** ≤ 768px (icons only)

### Mobile Optimizations
```css
@media (max-width: 768px) {
  /* Hide nav text, show icons only */
  .navLink span:last-child {
    display: none;
  }
  
  /* Reduce logo size */
  .logoIcon {
    width: 36px;
    height: 36px;
  }
}
```

## Browser Support

- **Modern browsers** with backdrop-filter support
- **Fallback** for older browsers (no blur, solid background)
- **Hardware acceleration** for animations
- **RequestAnimationFrame** for smooth canvas rendering

## Performance Metrics

### Expected Performance:
- **60 FPS** star animations
- **GPU-accelerated** CSS transforms
- **Low memory** usage (~200 star objects)
- **Efficient repaints** (canvas-based)

### Optimization Tips:
1. Stars use canvas (not DOM elements)
2. Nebulas use CSS transforms (GPU-accelerated)
3. Backdrop-filter applied sparingly
4. Will-change hints for animated elements
5. RequestAnimationFrame for smooth rendering

## Customization

### Adjust Star Count
```typescript
// In GalaxyBackground.tsx
const starCount = 200; // Change to 100-500
```

### Adjust Star Speed
```typescript
speed: Math.random() * 0.3 + 0.1, // Slower: 0.1 + 0.05
```

### Change Nebula Colors
```css
/* In GalaxyBackground.module.css */
.nebula1 {
  background: radial-gradient(
    circle, 
    rgba(YOUR_COLOR_HERE, 0.4) 0%, 
    transparent 70%
  );
}
```

### Adjust Blur Intensity
```css
.header {
  backdrop-filter: blur(20px); /* Change 20px */
}
```

## Accessibility

- High contrast text (white on dark)
- Reduced motion support can be added:

```css
@media (prefers-reduced-motion: reduce) {
  .nebula1, .nebula2, .nebula3 {
    animation: none;
  }
}
```

## Future Enhancements

Potential additions:
- Shooting stars (occasional meteors)
- Mouse parallax effect
- Dynamic star generation based on screen size
- Constellation patterns
- Planet/moon elements
- Aurora borealis effect
- More nebula variation

