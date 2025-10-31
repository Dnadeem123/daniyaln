# 📘 WordPress Integration Guide - Boolean Algebra Calculator

This guide will help you embed the Boolean Algebra Calculator into your WordPress website **without any coding experience**.

---

## 🎯 Overview

You have **THREE methods** to integrate this calculator into WordPress:

1. **Method 1: Direct Embed** (Recommended - Easiest)
2. **Method 2: Using a Snippet Plugin** (Most Professional)
3. **Method 3: External Hosting with iFrame** (Simplest Updates)

---

## ✅ Method 1: Direct Embed (Recommended for Beginners)

### What You Need:
- WordPress admin access
- The calculator files (index.html, app.js, styles.css)

### Step-by-Step Instructions:

#### **Step 1: Upload the JavaScript and CSS Files**

1. **Log into your WordPress Dashboard**
2. Go to **Media → Add New**
3. **Upload these two files:**
   - `app.js`
   - `styles.css`
4. After uploading, **click on each file** and **copy the URL**
   - Example URLs:
     - CSS: `https://yoursite.com/wp-content/uploads/2025/10/styles.css`
     - JS: `https://yoursite.com/wp-content/uploads/2025/10/app.js`

📝 **Save these URLs somewhere** - you'll need them in Step 3!

---

#### **Step 2: Create a New Page**

1. Go to **Pages → Add New**
2. Give it a title like "Boolean Algebra Calculator"
3. **Add a Custom HTML block:**
   - Click the **`+`** button
   - Search for **"Custom HTML"**
   - Click to add it

---

#### **Step 3: Paste the HTML Code**

Copy and paste the following code into the Custom HTML block:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="YOUR_CSS_URL_HERE" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
      mermaid.initialize({ startOnLoad: false });
    </script>
  </head>
  <body>
    <header class="app-header">
      <h1>Boolean Algebra Calculator</h1>
      <p>
        Enter a Boolean expression using operators like AND, OR, NOT, XOR, NAND,
        NOR. Up to 5 variables are supported.
      </p>
      <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.9;">
        ✨ Features: Truth Tables • K-Maps • Circuit Diagrams • SOP/POS/DNF/CNF • Step-by-Step Simplification
      </p>
    </header>

    <main class="app">
      <section class="input-panel">
        <label for="expression-input">Boolean Expression</label>
        <textarea
          id="expression-input"
          rows="3"
          placeholder="Example: (A AND B') OR (C XOR D)"
        ></textarea>
        <div class="input-hints">
          <strong>Tip:</strong> Supported symbols include AND/·/&amp;/·/*, OR/+/|, NOT/!/~/' (postfix),
          XOR/^/⊕, NAND, NOR.
          <br><strong>Examples:</strong> Try <code>A AND B</code>, <code>(A+B)·C</code>, <code>A' OR B</code>, or <code>A XOR B</code>
        </div>
        <div class="actions">
          <button id="evaluate-btn">Evaluate</button>
          <button id="clear-btn" class="ghost">Clear</button>
          <button id="example-btn" class="ghost">Load Example</button>
        </div>
        <div id="error-box" class="error-box" hidden></div>
      </section>

      <section class="results" id="results" hidden>
        <div class="result-card" id="summary-card">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div>
              <h3>Detected Variables</h3>
              <p id="detected-variables"></p>
            </div>
            <div>
              <h3>Expression (Normalized)</h3>
              <p id="normalized-expression"></p>
            </div>
          </div>
        </div>

        <div class="result-card" id="simplification-card">
          <h2>Expression Simplification</h2>
          <div class="simplified-forms">
            <div>
              <h3>Minimal SOP</h3>
              <p id="minimal-sop"></p>
            </div>
            <div>
              <h3>Minimal POS</h3>
              <p id="minimal-pos"></p>
            </div>
            <div>
              <h3>Canonical DNF</h3>
              <p id="canonical-dnf"></p>
            </div>
            <div>
              <h3>Canonical CNF</h3>
              <p id="canonical-cnf"></p>
            </div>
          </div>
          <details class="step-details" open>
            <summary>Step-by-step simplification</summary>
            <ol id="simplification-steps"></ol>
          </details>
        </div>

        <div class="result-card" id="truth-table-card">
          <h2>Truth Table</h2>
          <div class="table-wrapper">
            <table id="truth-table"></table>
          </div>
        </div>

        <div class="result-card" id="kmap-card">
          <h2>Karnaugh Map</h2>
          <div id="kmap-container"></div>
        </div>

        <div class="result-card" id="circuit-card">
          <h2>Logic Circuit Diagram</h2>
          <div id="circuit-diagram" class="circuit-diagram"></div>
        </div>

        <div class="result-card" id="export-card">
          <h2>Export Results</h2>
          <div class="actions">
            <button id="copy-results-btn" class="ghost">📋 Copy All Results</button>
            <button id="download-results-btn" class="ghost">⬇️ Download as Text</button>
          </div>
        </div>
      </section>
    </main>

    <script type="module" src="YOUR_JS_URL_HERE"></script>
  </body>
</html>
```

**IMPORTANT:** Replace these two lines:
- `YOUR_CSS_URL_HERE` with your actual CSS file URL from Step 1
- `YOUR_JS_URL_HERE` with your actual JS file URL from Step 1

---

#### **Step 4: Publish and Test**

1. Click **"Publish"** or **"Update"**
2. Click **"View Page"** to see your calculator
3. Test it by entering: `A AND B`

---

## 🔧 Method 2: Using a Snippet Plugin (Most Professional)

This method keeps your code organized and easier to maintain.

### Step-by-Step Instructions:

#### **Step 1: Install WPCode Plugin**

1. Go to **Plugins → Add New**
2. Search for **"WPCode"**
3. Click **"Install Now"**, then **"Activate"**

---

#### **Step 2: Add CSS Snippet**

1. Go to **Code Snippets → + Add Snippet**
2. Choose **"Add Your Custom Code"**
3. Name it: **"Boolean Calculator Styles"**
4. Set Code Type to: **"CSS Snippet"**
5. Copy and paste the **entire contents** of `styles.css`
6. Set to **"Run Everywhere"**
7. Toggle to **"Active"**
8. Click **"Save Snippet"**

---

#### **Step 3: Add JavaScript Snippet**

1. Go to **Code Snippets → + Add Snippet**
2. Choose **"Add Your Custom Code"**
3. Name it: **"Boolean Calculator Script"**
4. Set Code Type to: **"JavaScript Snippet"**
5. Copy and paste the **entire contents** of `app.js`
6. Set to **"Run Everywhere"**
7. Toggle to **"Active"**
8. Click **"Save Snippet"**

---

#### **Step 4: Create the Page**

1. Create a new page
2. Add a **Custom HTML block**
3. Paste only the **HTML body content** (the parts between `<body>` and `</body>` tags from index.html)
4. Publish!

✅ **Advantage:** CSS and JS load on every page automatically, calculator can be added anywhere.

---

## 🌐 Method 3: External Hosting with iFrame (Easiest Updates)

Best if you plan to use the calculator on multiple pages or want easy updates.

### Step-by-Step Instructions:

#### **Step 1: Host Your Calculator**

Choose one of these **FREE hosting options**:

**Option A: GitHub Pages (Free)**
1. Create a free GitHub account
2. Create a new repository
3. Upload your 3 files
4. Enable GitHub Pages in Settings
5. Your URL will be: `https://yourusername.github.io/repository-name/`

**Option B: Netlify (Free - Easiest)**
1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Drag and drop your `boolean-calculator` folder
4. You'll get a URL like: `https://your-calculator.netlify.app`

**Option C: Vercel (Free)**
1. Go to [vercel.com](https://vercel.com)
2. Sign up (free)
3. Import your files
4. Get a URL like: `https://your-calculator.vercel.app`

---

#### **Step 2: Embed in WordPress**

1. Create a new page in WordPress
2. Add a **Custom HTML block**
3. Paste this code:

```html
<iframe 
  src="YOUR_HOSTED_URL_HERE" 
  width="100%" 
  height="1800px" 
  frameborder="0"
  style="border: none; max-width: 100%;"
  title="Boolean Algebra Calculator"
></iframe>
```

4. Replace `YOUR_HOSTED_URL_HERE` with your actual URL
5. Publish!

✅ **Advantage:** Update once on the hosting platform, changes reflect everywhere automatically.

---

## 🎨 Customization Tips

### Change Colors

Edit the CSS file and modify these values:

```css
:root {
  --primary-color: #2563eb; /* Main blue color */
  --surface: #f6f7fb; /* Background color */
  --text-primary: #0f172a; /* Text color */
}
```

### Change Fonts

Replace the Google Fonts link in the HTML with your preferred font.

---

## 🔍 Troubleshooting

### Calculator doesn't appear
- Check that file URLs are correct
- Make sure JavaScript is enabled in your browser
- Check browser console for errors (F12 → Console tab)

### Buttons don't work
- Verify the `app.js` file uploaded correctly
- Check that the script URL in HTML matches the uploaded file

### Styling looks broken
- Verify the `styles.css` file uploaded correctly
- Check that the CSS URL in HTML matches the uploaded file
- Try clearing your browser cache (Ctrl+Shift+Delete)

### Mobile view issues
- The calculator is fully responsive by default
- If issues persist, check your WordPress theme isn't overriding styles

---

## 📊 Features Included

Your calculator includes ALL these features:

✅ **Expression Simplification** - Quine-McCluskey algorithm  
✅ **Truth Table Generation** - All input/output combinations  
✅ **Step-by-Step Solutions** - Shows which laws were applied  
✅ **Multiple Input Methods** - AND, OR, NOT, XOR, NAND, NOR  
✅ **Visual Logic Circuits** - Mermaid.js diagrams  
✅ **Karnaugh Maps** - For 1-5 variable expressions  
✅ **Different Forms** - SOP, POS, DNF, CNF  
✅ **Export Results** - Copy or download results  
✅ **Example Expressions** - Built-in examples  
✅ **Mobile Responsive** - Works on all devices  

---

## 💰 Costs

**Total Monthly Cost: $0**

- ✅ WordPress hosting (you already have this)
- ✅ WPCode plugin (free version is sufficient)
- ✅ External APIs (all free - Mermaid.js, Google Fonts)
- ✅ External hosting options (GitHub Pages, Netlify, Vercel all free)

---

## 🆘 Need Help?

### Common Questions:

**Q: Can multiple users use it at the same time?**  
A: Yes! Unlimited users. All calculations happen in each user's browser.

**Q: Do I need a database?**  
A: No! Everything runs client-side.

**Q: Will it slow down my website?**  
A: No! The calculator only loads on the page where you embed it.

**Q: Can I use it on multiple pages?**  
A: Yes! Use Method 2 (Snippet Plugin) or Method 3 (iFrame) for easiest management.

**Q: Is it SEO-friendly?**  
A: Yes! WordPress will index the page normally.

---

## 🚀 Next Steps

1. Choose your preferred integration method
2. Follow the step-by-step instructions
3. Test the calculator with example expressions
4. Customize colors/fonts if desired
5. Share the page with your users!

---

## 📝 Example Expressions to Test

Once your calculator is live, try these:

- `A AND B`
- `(A OR B) AND C`
- `A' + B · C`
- `(A XOR B) AND (C OR D')`
- `NOT(A AND B) OR C`
- `A NAND B`
- `(A + B) · (C + D')`

---

## ✨ You're All Set!

Your Boolean Algebra Calculator is now ready to use on your WordPress website. No backend required, no monthly API costs, and unlimited users can use it simultaneously!

**Good luck! 🎉**
