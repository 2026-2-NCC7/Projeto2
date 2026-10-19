# Implementation Plan: Update Frontend According to Figma Design

## Context

The user wants to update the frontend (React + Vite admin login/register interface) to match the Figma design at:
- **Figma URL**: https://www.figma.com/design/IrxLRT7xxR4HuImDxYvHjr/Ach.ai-telas?node-id=2028-1141&t=kNa5cxuiVLJqKwrb-4
- **File Key**: IrxLRT7xxR4HuImDxYvHjr
- **Node ID**: 2028-1141

## Current State

The frontend is a working React + Vite application with:
- Two-panel layout (brand panel + form panel)
- Login and registration pages
- Custom CSS with design tokens (orange #f97300, Space Grotesk + DM Sans fonts)
- Form validation and API integration
- Mobile-responsive design
- Located at: `c:\Users\Leo\.copilot\copilot-worktrees\Projeto2\leoonardoferreira-issue-4-pb01-login-do-administrador-bc7304\src\frontend`

Key files:
- `src/App.jsx` - Main app with routing
- `src/pages/LoginPage.jsx` - Login form
- `src/pages/RegisterPage.jsx` - Registration form
- `src/components/Brand.jsx` - Branding component
- `src/styles.css` - All styles with CSS custom properties
- `src/services/auth-api.js` - API integration

## Implementation Plan

- [ ] 1. **Access the Figma design and capture design specifications**
      
      Since the Figma MCP server is not currently connected, manually access the Figma URL in a browser (requires Figma account with access to the file). Export a screenshot of node 2028-1141 and document the design specifications including:
      - Layout structure (columns, spacing, alignment)
      - Typography (font families, sizes, weights, line heights)
      - Colors (primary, secondary, backgrounds, borders, text)
      - Component dimensions (widths, heights, padding, margins)
      - Interactive states (hover, focus, disabled, error, success)
      - Icons and assets that need to be exported
      - Responsive breakpoints and mobile behavior
      
      Save the screenshot to `c:\Users\Leo\.copilot\copilot-worktrees\Projeto2\leoonardoferreira-issue-4-pb01-login-do-administrador-bc7304\.agents\tasks\figma-design-reference.png` for visual reference.
      
      **Files**: Create `.agents/tasks/design-specs.md` documenting all design specifications
      
      **Verify**: Screenshot exists and design specifications are documented in detail

- [ ] 2. **Export and organize design assets from Figma**
      
      Export all required assets from Figma (logos, icons, images, illustrations) at appropriate resolutions (1x, 2x for retina). Place assets in `src/frontend/src/assets/` or `src/frontend/public/` depending on their usage:
      - Static assets that don't change → `public/`
      - Assets imported in components → `src/assets/`
      
      Ensure all assets are optimized (compressed SVGs, optimized PNGs/JPGs). Update `.gitkeep` files if directories are populated.
      
      **Files**: 
      - `src/frontend/src/assets/` (component-imported assets)
      - `src/frontend/public/` (static assets)
      
      **Verify**: Run `cd src/frontend && npm run build` and confirm all asset references resolve correctly

- [ ] 3. **Update CSS design tokens to match Figma design system**
      
      Update the CSS custom properties in `src/frontend/src/styles.css` to match the Figma design tokens. This includes:
      - Color palette (primary, secondary, success, error, neutral shades)
      - Typography scale (font sizes, weights, line heights, letter spacing)
      - Spacing scale (margins, paddings following 4px or 8px grid)
      - Border radius values
      - Shadow definitions
      - Transition/animation timing
      
      Preserve the existing token structure (`--orange`, `--ink`, `--muted`, etc.) but update values. Add new tokens if the Figma design introduces additional colors or scales. Keep backward compatibility with existing components.
      
      **Files**: `src/frontend/src/styles.css`
      
      **Verify**: Run `cd src/frontend && npm run dev` and visually inspect that existing pages still render correctly with updated tokens

- [ ] 4. **Update Brand component to match Figma branding**
      
      Modify `src/frontend/src/components/Brand.jsx` to match the Figma design specifications. This may include:
      - Different logo mark styling or replacing with an SVG asset
      - Updated typography for brand name
      - Different sizing or spacing
      - Possible addition of a logo image file
      
      Ensure the component works in both contexts: the brand panel (desktop) and mobile header. Maintain the `mobile` prop for conditional styling.
      
      **Files**: `src/frontend/src/components/Brand.jsx`, potentially `src/frontend/src/assets/logo.svg`
      
      **Verify**: Run `cd src/frontend && npm run dev`, check both desktop and mobile views of login page

- [ ] 5. **Update brand panel layout and content**
      
      Update the brand panel section in `src/frontend/src/App.jsx` to match Figma design:
      - Update eyebrow text, heading, and description if changed
      - Adjust layout spacing and sizing
      - Update background color/gradient if different
      - Modify or remove the decorative circle elements (::after pseudo-element)
      - Update footer status indicator styling if needed
      
      Update corresponding CSS classes in `styles.css`: `.brand-panel`, `.brand-copy`, `.brand-footer`, etc.
      
      **Files**: 
      - `src/frontend/src/App.jsx`
      - `src/frontend/src/styles.css`
      
      **Verify**: Run `cd src/frontend && npm run dev`, check brand panel matches Figma design exactly (spacing, typography, colors)

- [ ] 6. **Update LoginPage to match Figma design**
      
      Modify `src/frontend/src/pages/LoginPage.jsx` and related styles to match Figma specifications:
      - Form heading (eyebrow, title, description)
      - Input field styling (borders, padding, focus states, icons)
      - Label positioning and typography
      - Button styling (colors, hover states, disabled states, loading spinner)
      - Password toggle button placement and styling
      - Error message styling and positioning
      - Success panel styling
      - Spacing between form elements
      
      Update CSS classes in `styles.css`: `.form-heading`, `.input-wrap`, `.submit-button`, `.feedback`, `.success-panel`, etc.
      
      Ensure accessibility attributes (aria-labels, roles) are maintained and form validation logic is unchanged.
      
      **Files**: 
      - `src/frontend/src/pages/LoginPage.jsx`
      - `src/frontend/src/styles.css`
      
      **Verify**: Run `cd src/frontend && npm run dev`, test login flow with valid/invalid credentials, check visual match with Figma

- [ ] 7. **Update RegisterPage to match Figma design**
      
      Modify `src/frontend/src/pages/RegisterPage.jsx` and related styles to match Figma specifications:
      - Form heading section
      - All input fields (name, email, password, confirmation)
      - Form validation feedback styling
      - Submit button styling
      - Success page layout and messaging
      - "Back to login" button styling
      
      Apply the same design patterns from LoginPage updates. Maintain form validation logic and API integration.
      
      **Files**: 
      - `src/frontend/src/pages/RegisterPage.jsx`
      - `src/frontend/src/styles.css`
      
      **Verify**: Run `cd src/frontend && npm run dev`, navigate to register page (#register), test registration flow, check visual match with Figma

- [ ] 8. **Update mobile responsive behavior**
      
      Review and update the mobile media query styles in `src/frontend/src/styles.css` to match Figma mobile design specifications:
      - Mobile breakpoint (currently @media max-width: 800px)
      - Mobile layout (single column, hidden brand panel)
      - Mobile brand lockup placement and sizing
      - Mobile form panel padding and spacing
      - Touch target sizes (minimum 44x44px for interactive elements)
      
      Test responsive behavior at various viewport widths.
      
      **Files**: `src/frontend/src/styles.css`
      
      **Verify**: Run `cd src/frontend && npm run dev`, test in browser responsive mode at widths: 320px, 375px, 768px, 1024px, 1440px

- [ ] 9. **Update global styles and HTML metadata**
      
      Update `src/frontend/index.html` to match Figma design:
      - Update theme-color meta tag if brand color changed
      - Update title if different
      - Add any required meta tags
      
      Update global styles in `styles.css`:
      - Body background color
      - Default text color and font
      - Box-sizing and reset styles
      - Reduced motion preferences
      
      **Files**: 
      - `src/frontend/index.html`
      - `src/frontend/src/styles.css`
      
      **Verify**: Run `cd src/frontend && npm run dev`, inspect page metadata and global styling

- [ ] 10. **Cross-browser testing and visual QA**
      
      Perform comprehensive visual QA to ensure 1:1 parity with Figma design:
      - Side-by-side comparison with Figma screenshot
      - Test in Chrome, Firefox, Safari, Edge
      - Test all interactive states (hover, focus, active, disabled)
      - Test both login and register flows end-to-end
      - Test mobile responsive behavior on actual devices or emulators
      - Verify accessibility with keyboard navigation and screen reader
      - Check loading states and error states
      
      Document any intentional deviations from Figma design with rationale (e.g., accessibility improvements).
      
      **Files**: None (testing only)
      
      **Verify**: Run `cd src/frontend && npm run build` successfully, manual testing checklist complete

- [ ] 11. **Build production bundle and verify**
      
      Build the production bundle and verify all assets are correctly bundled:
      - Run production build
      - Check bundle size is reasonable (no massive asset bloat)
      - Preview production build locally
      - Verify all fonts load correctly
      - Verify all images and icons load correctly
      - Check console for errors or warnings
      
      **Files**: `src/frontend/dist/` (generated)
      
      **Verify**: Run `cd src/frontend && npm run build && npm run preview`, open http://localhost:4173 and test full application

## Verification Commands

- **Development server**: `cd src/frontend && npm run dev` → http://localhost:5173
- **Production build**: `cd src/frontend && npm run build`
- **Production preview**: `cd src/frontend && npm run preview` → http://localhost:4173
- **Backend API** (required for auth testing): `docker compose up --build --wait` from project root → http://localhost:3000

## Design System Considerations

The existing design uses:
- **Primary color**: #f97300 (orange)
- **Fonts**: Space Grotesk (headings), DM Sans (body)
- **Layout**: Two-column grid (minmax(360px, .9fr) + minmax(440px, 1.1fr))
- **Border radius**: 10-12px
- **Spacing**: Consistent use of clamp() for responsive sizing

When implementing Figma changes:
- Maintain the existing color token naming (`--orange`, `--ink`, `--muted`, etc.)
- Keep accessibility standards (WCAG AA contrast ratios, keyboard navigation)
- Preserve API integration and validation logic
- Maintain mobile-first responsive approach
- Use semantic HTML and ARIA attributes

## Notes

- The Figma design may include multiple variants or states - implement all visible states
- If Figma design includes new components not in the current implementation, create them in `src/frontend/src/components/`
- If design requires new dependencies (e.g., icon libraries), add them via `npm install` in the frontend directory
- Assets should be web-optimized (SVGs minified, images compressed, fonts subsetted if custom)
- The backend API expects specific request/response formats - do not change API integration without corresponding backend updates
