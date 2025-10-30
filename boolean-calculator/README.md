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

## Embedding in WordPress (No-Code Steps)

1. From your WordPress dashboard, create or edit the page where the tool should appear.
2. Add a **Custom HTML** block (Gutenberg) or use your preferred HTML-snippet plugin.
3. Copy the entire contents of `index.html` into the block. Make sure to also upload `styles.css` and `app.js` somewhere accessible:
   - Option A: Host `styles.css` and `app.js` in your theme or child-theme directory (e.g., `/wp-content/uploads/boolean-calculator/`) and adjust the `<link>`/`<script>` paths in the HTML.
   - Option B: Inline the CSS and JS directly into the HTML block (replace the `<link rel="stylesheet" href="styles.css" />` tag with a `<style>...</style>` block, and replace the `<script type="module" src="app.js"></script>` with a `<script type="module">...</script>` block containing the file contents).
4. Save/update the page and test the calculator on both desktop and mobile.

> **Tip:** If you prefer not to touch theme files, use a snippet manager such as **WPCode**. Create two snippets: one for the CSS (loaded in the header) and one for the JS (footer). Then drop the HTML markup, referencing the snippet-generated URLs.

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
