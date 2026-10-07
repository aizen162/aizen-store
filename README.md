# Aizen Store 🛍️

A complete static e-commerce + blog website — **no build step, no frameworks**.
Pure HTML, CSS and vanilla JavaScript. Deploy as-is on **GitHub Pages**, **Netlify**,
**Vercel**, or any static host.

Theme: **silver + purple**, inspired by Sōsuke Aizen (Bleach) — deep dark-purple
surfaces, violet glows, platinum text.

## 📁 Structure

```
aizen-store/
├── index.html        # Homepage (hero, categories, featured, blog preview, testimonials, newsletter)
├── shop.html         # Product listing with category filters + search
├── product.html      # Single product page (?id=p01)
├── cart.html         # Cart + checkout form + "Order via WhatsApp"
├── blog.html         # Blog listing
├── post.html         # Single blog post (?slug=...)
├── about.html / contact.html / privacy.html / terms.html / 404.html
├── sitemap.xml / robots.txt / ads.txt
└── assets/
    ├── css/style.css
    ├── js/app.js
    ├── products.json # Product catalog
    └── posts.json    # Blog posts
```

## 👀 Preview locally

```bash
cd aizen-store
python3 -m http.server 8000
# open http://localhost:8000
```

> `file://` won't work for the JSON fetches — you must serve over HTTP.

## ➕ How to add a product

Edit `assets/products.json` and add an object:

```json
{
  "id": "p17",
  "name": "My New Product",
  "slug": "my-new-product",
  "category": "digital",
  "price": 1999,
  "oldPrice": 2999,
  "rating": 4.8,
  "reviews": 12,
  "image": "https://picsum.photos/seed/my-new-product/800/600",
  "badge": "New",
  "description": "Short description…",
  "features": ["Feature one", "Feature two"]
}
```

Categories: `digital`, `courses`, `physical-trading`, `physical-gym`.
Omit `oldPrice` or set `badge` to `null` when not needed.

## ✍️ How to add a blog post

Edit `assets/posts.json` and add an object:

```json
{
  "slug": "my-new-post",
  "title": "Post Title",
  "excerpt": "One-line summary…",
  "date": "2026-10-05",
  "readTime": 6,
  "category": "Trading",
  "image": "https://picsum.photos/seed/my-new-post/800/600",
  "content": "<p>Full article HTML…</p><h2>Section…</h2>"
}
```

`content` is an HTML string — use `<p>`, `<h2>`, `<h3>`, `<ul>`, `<blockquote>`.

## 📲 How to change the WhatsApp number

Open `assets/js/app.js` — at the top:

```js
const CONFIG = {
  whatsappNumber: "920000000000", // <-- replace with your real number
  ...
};
```

Use international format **without** `+` (e.g. Pakistan: `"923001234567"`).
The cart checkout composes the order message and opens `wa.me/<number>`.

## 💰 AdSense monetization steps

1. Deploy the site to a **custom domain** (AdSense requires a live site).
2. Make sure the site has real content: products, the 6 blog posts, About,
   Contact, Privacy Policy and Terms pages are all included for this reason.
3. Apply at **https://www.google.com/adsense** and add your domain.
4. After approval, create ad units in your AdSense dashboard.
5. Paste each ad unit's code into the marked slots in the HTML:
   - `index.html` — `<!-- ADSENSE: ... (homepage, below blog preview) -->`
   - `blog.html` — `<!-- ADSENSE: ... (blog listing, below articles) -->`
   - `post.html` — rendered by JS in `assets/js/app.js` (`initPost`), two slots:
     below the title and at the end of the article.
6. Replace the placeholder in `ads.txt` with your real publisher line:
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
7. Keep publishing blog posts regularly — traffic is what earns.

## 🚀 Deploy

- **GitHub Pages:** push this folder to a repo → Settings → Pages → deploy from branch.
- **Netlify:** drag-and-drop the folder at app.netlify.com/drop, or connect the repo.
- Update the domain in `sitemap.xml` / `robots.txt` to your real domain.

## 🎨 Customizing the theme

All colors live in `:root` at the top of `assets/css/style.css`.
Change `--gold` (primary purple), `--bg`, `--text` etc. — the whole site follows.
<!-- deploy trigger -->
