---
name: Aureum Grooming
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#d0cdcd'
  on-tertiary: '#303030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  margin-mobile: 20px
  gutter-mobile: 16px
---

## Brand & Style
The brand personality is rooted in modern luxury and professional craftsmanship. It targets a discerning clientele that values precision, heritage, and a high-end grooming experience. The design system leverages a **Modern Corporate** style infused with **Minimalist** and **Glassmorphic** elements to create a sleek, exclusive digital environment.

The emotional response should be one of confidence, calm, and prestige. By using a dark, high-contrast palette with metallic accents, the UI mimics the atmosphere of a premium barbershop—dimmed lighting, leather seating, and brass fixtures. The interface prioritizes clarity and ease of use, ensuring that the luxury experience begins the moment a client opens the app.

## Colors
The color palette is designed for deep immersion and focus. 
- **Primary (Gold/Brass):** Reserved for high-priority actions, interactive states, and branding elements. It should be used sparingly to maintain its impact.
- **Surface (Dark Gray):** Used for cards, containers, and elevated surfaces to differentiate from the background.
- **Background (Deep Charcoal/Black):** Provides a high-contrast canvas that allows gold accents and typography to pop.
- **Text:** Pure white (#FFFFFF) for high readability on dark backgrounds, with medium gray (#A0A0A0) for secondary metadata.

## Typography
The typography system uses a pairing of **Montserrat** for headlines to convey strength and architectural precision, and **Inter** for body text to ensure maximum legibility and a systematic, clean feel.

- **Headlines:** Use Montserrat Bold or SemiBold. Tighten letter spacing slightly for a more modern, premium look.
- **Body:** Use Inter for all functional text. Maintain a generous line height (1.5x) to prevent the dark theme from feeling cramped.
- **Labels:** Use uppercase for small labels and buttons to create a structured, "catalog" aesthetic reminiscent of high-end product packaging.

## Layout & Spacing
This design system utilizes a **8px grid rhythm** to ensure mathematical consistency. The layout is optimized for mobile-first interaction with a focus on generous touch targets and vertical breathing room.

- **Grid Model:** A 4-column fluid grid for mobile.
- **Margins:** Standard side margins are 20px to provide a premium, airy feel.
- **Full-Screen Layouts:** Hero sections and booking flows should utilize the full width of the viewport, using high-quality photography as backdrops.
- **Bottom Sticky Bars:** Primary actions (e.g., "Book Now") are always anchored to the bottom of the viewport with a subtle glassmorphic background blur to maintain context.

## Elevation & Depth
In this dark-themed design system, depth is communicated through **Tonal Layering** and **Subtle Glassmorphism** rather than heavy shadows.

- **Z-0 (Background):** #121212.
- **Z-1 (Cards/Surface):** #1E1E1E. Provides the base for content groups.
- **Z-2 (Modals/Overlays):** #2A2A2A with a 1px border of #FFFFFF (10% opacity) to define edges.
- **Glass Effects:** Bottom navigation bars and sticky headers use a background blur (20px) with a semi-transparent fill of the Surface color (#1E1E1E at 80% opacity).
- **Accents:** Gold elements (#D4AF37) should appear to sit "on top" of the interface, occasionally using a very soft, diffused outer glow of the same color (15% opacity) to simulate the sheen of metal.

## Shapes
The shape language balances modern cleanliness with approachable luxury. 
- **Standard Radius:** 0.5rem (8px) is the default for buttons, input fields, and cards.
- **Large Components:** Elements like featured promo cards or bottom sheets use 1.5rem (24px) for the top corners to create a soft, high-end "containment" feel.
- **Buttons:** Use the standard 8px radius for a structured look, or full pill-shape for chips and tags.

## Components
- **Buttons:** Large, high-visibility touch targets (minimum 56px height). Primary buttons are solid Gold (#D4AF37) with black text. Secondary buttons use a gold outline (2px) with white text.
- **Progress Bars:** Thin, elegant lines. The track is dark gray (#2A2A2A), and the progress indicator is solid Gold. Use these for booking steps and loyalty point tracking.
- **Lists:** Clean rows with 16px vertical padding. Use thin dividers (#FFFFFF at 5% opacity).
- **Input Fields:** Dark gray fills with a 1px border that turns Gold on focus. Labels should sit above the field in Inter SemiBold (Label-sm).
- **Cards:** Used for barber profiles and service selections. Cards should feature a subtle 1px border to separate them from the #121212 background.
- **Sticky Bottom Bar:** A persistent 80px container at the base of the screen for "Book" or "Confirm" actions, featuring a backdrop blur effect.
- **Status Chips:** Small pill-shaped tags for "Available" (Green/low-opacity) or "Premium Service" (Gold/low-opacity).