# Boolean Algebra Calculator Widget

This directory contains a self-contained HTML/CSS/JS widget that implements a full-featured Boolean algebra calculator suitable for embedding inside a WordPress page (or any CMS that accepts custom HTML).

## Features

- Enter Boolean expressions with support for `AND`, `OR`, `NOT`, `XOR`, `NAND`, `NOR`, postfix complements (`'`) and familiar symbols (`+`, `·`, `⊕`, `!`, `~`, etc.).
- Automatic variable detection (up to 5 unique variables).
- Truth table generation with all minterms/maxterms.
- Canonical forms: Sum of Products (SOP), Product of Sums (POS), Disjunctive Normal Form (DNF), Conjunctive Normal Form (CNF).
- Minimal forms via the Quine–McCluskey algorithm (with Petrick’s method for exact cover) and step-by-step narration of each merge and selection.
- Karnaugh maps for 1–5 variables (5-variable maps rendered as paired 4×4 panes).
- Visual logic circuit diagram rendered with Mermaid.js.
- Responsive layout designed to drop into WordPress Gutenberg “Custom HTML” blocks, Elementor HTML widgets, or plugins such as WPCode/Code Snippets.

## Quick Start (Local Preview)

1. Place the project folder on any static web server. The files are plain HTML with no build step required.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari) to interact with the calculator.

## 🚀 WordPress Integration

**See the complete [WORDPRESS-INTEGRATION-GUIDE.md](./WORDPRESS-INTEGRATION-GUIDE.md)** for detailed step-by-step instructions with three different integration methods:

1. **Method 1: Direct Embed** (Easiest for beginners)
2. **Method 2: Using WPCode Plugin** (Most professional)
3. **Method 3: External Hosting with iFrame** (Simplest updates)

### Quick Start (5 minutes):

1. Upload `app.js` and `styles.css` to WordPress Media Library
2. Copy the URLs
3. Create a new page with a Custom HTML block
4. Paste the HTML from `index.html` and update the file URLs
5. Publish!

**No backend required. No database needed. $0 monthly cost.** ✅

## Customisation Notes

- Colors and spacing are defined in `styles.css`. Modify the CSS variables and gradients to better match your site branding.
- The UI fonts load from Google Fonts (`Inter`). If you want to use a different font, replace the font import in the `<head>` and adjust the `font-family` declarations.
- Mermaid.js powers the circuit diagram. It is loaded from a CDN (`cdn.jsdelivr.net`). Ensure your WordPress security policy allows this domain. You can self-host Mermaid by downloading the file and updating the `<script>` tag if required.
- The calculator limits expressions to five distinct variables to keep truth tables and K-maps manageable. You can raise this limit inside `app.js`, but performance will degrade beyond 5 variables.

## Browser Compatibility

- The widget targets evergreen browsers (Chrome, Edge, Firefox, Safari). Internet Explorer is not supported.
- JavaScript must be enabled. No external APIs are used; all computation runs in-browser.

## File Overview

| File         | Purpose                                                                 |
|--------------|-------------------------------------------------------------------------|
| `index.html` | Markup scaffold and layout for the calculator UI.                       |
| `styles.css` | Visual styling, responsive layout, and component skins.                 |
| `app.js`     | Expression parsing, evaluation, simplification logic, and visualisation. |

## Support

- If you discover incorrect simplifications for edge-case expressions, verify syntax first (e.g., ensure consistent operator spelling). The parser recognises both word-based operators (`AND`) and symbolic ones (`+`, `·`, `!`).
- The tool logs intermediate simplification steps, making it easier to diagnose unexpected outputs.
- For advanced customisations (automatic data export, persistent storage, etc.), you can wrap the calculator in custom JavaScript without needing any backend services.

Enjoy building with Boolean logic!
