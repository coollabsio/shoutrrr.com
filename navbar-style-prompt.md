# Navbar Style Specification

Update the coolify.io header/navigation to match the following style. This is a sticky, semi-transparent navbar with backdrop blur.

## Key Design Properties

### Container (`<nav>`)
- `position: sticky; top: 0; z-index: 50`
- Background: page base color at 80% opacity (e.g. `rgba(16, 16, 16, 0.8)`)
- `backdrop-filter: blur(12px)` for frosted glass effect
- Bottom border: 1px solid, subtle gray at 50% opacity (e.g. `rgba(36, 36, 36, 0.5)`)

### Inner wrapper
- Max width constrained (e.g. `max-width: 72rem`), centered with auto margins
- Horizontal padding: `1rem`
- Flexbox: `display: flex; align-items: center; justify-content: space-between`
- Fixed height: `4rem` (64px)

### Logo (left side)
- Text-based logo, no image
- `font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; color: #fff`

### Nav links (right side, desktop only)
- Hidden on mobile (`display: none` below `768px`), flex row on desktop
- `gap: 0.25rem` between links
- Each link:
  - `color: #fff; font-size: 1rem`
  - `padding: 0.5rem 0.75rem; border-radius: 0.25rem`
  - `display: flex; align-items: center; gap: 0.5rem`
  - Hover: background changes to a slightly lighter surface color (e.g. `#202020`)
  - `transition: background-color 0.15s ease`
- Each link has an **icon** to the left of the text:
  - Icon size: `1.25rem` (20px) square
  - Icon color: accent yellow `#FCD34D` (distinct from the white text)
  - Icons are inline SVGs using `stroke="currentColor"` with `stroke-width="1.5"` and `fill="none"` (Heroicons outline style)

### Mobile hamburger button (right side, mobile only)
- Visible only below `768px`
- `padding: 0.5rem; border-radius: 0.25rem`
- Hover: same lighter surface background
- Icon: 3-line hamburger, `1.5rem` (24px), white

### Mobile menu (dropdown)
- Hidden by default, toggled via JS `classList.toggle('hidden')`
- Positioned below the nav, with horizontal margin matching page padding
- `background: #242424; border-radius: 0.25rem; padding: 0.5rem`
- Flex column layout, `gap: 0.25rem`
- Links styled same as desktop but `font-size: 0.875rem`
- Same yellow icon + white text pattern
- Closes automatically when any anchor link is clicked

## Behavior
- Stays fixed at top on scroll (sticky)
- Page content scrolls underneath with the blur effect visible
- Mobile menu toggled by hamburger button click
- Anchor links in mobile menu auto-close the menu after click

## Summary
The key differentiator of this style is: **sticky + semi-transparent background + backdrop blur + subtle bottom border + yellow accent icons next to white link text**. This creates a modern frosted-glass header that blends with the dark page while remaining legible.
