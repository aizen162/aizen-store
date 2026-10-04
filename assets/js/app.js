/* ============================================================
   AIZEN STORE — shared app logic
   Cart (localStorage), product/blog rendering, filters, checkout.
   ============================================================ */

/* ---------- CONFIG ----------
   PLACEHOLDER WhatsApp number: replace 920000000000 with your real
   WhatsApp Business number in international format WITHOUT the "+".
   Example for Pakistan: "923001234567"
------------------------------------------------------------ */
const CONFIG = {
  whatsappNumber: "923335017388", // <-- User's WhatsApp Business number (set 2026-10-03)
  currency: "$",
  freeShippingOver: 18,
  shippingFee: 0.9,
};

/* ---------------- helpers ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fmt = (n) => "$" + Number(n).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function stars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Could not load " + path);
  return res.json();
}

function toast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------------- cart ---------------- */
const Cart = {
  key: "aizen_cart_v1",
  items() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  save(items) { localStorage.setItem(this.key, JSON.stringify(items)); updateCartBadge(); },
  add(id, qty = 1) {
    const items = this.items();
    const line = items.find((i) => i.id === id);
    if (line) line.qty += qty; else items.push({ id, qty });
    this.save(items);
    toast("Added to cart 🛒");
  },
  setQty(id, qty) {
    let items = this.items();
    if (qty <= 0) items = items.filter((i) => i.id !== id);
    else { const l = items.find((i) => i.id === id); if (l) l.qty = qty; }
    this.save(items);
  },
  remove(id) { this.save(this.items().filter((i) => i.id !== id)); },
  clear() { this.save([]); },
  count() { return this.items().reduce((a, i) => a + i.qty, 0); },
};

function updateCartBadge() {
  $$(".cart-count").forEach((el) => { el.textContent = Cart.count(); });
}

/* ---------------- shared chrome ---------------- */
function initNav() {
  updateCartBadge();
  const burger = $(".hamburger");
  const links = $(".nav-links");
  if (burger && links) burger.addEventListener("click", () => links.classList.toggle("open"));
  const path = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

function initFakeForms() {
  $$("[data-fake-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const box = form.parentElement.querySelector(".success-box") || form.nextElementSibling;
      form.reset();
      if (box && box.classList.contains("success-box")) box.classList.add("show");
      else toast("Thanks! We'll be in touch soon. ✅");
    });
  });
}

/* ---------------- product cards ---------------- */
const CAT_LABELS = {
  digital: "Digital Product",
  courses: "Trading Course",
  "physical-trading": "Trading Gear",
  "physical-gym": "Gym Gear",
};

function productCard(p) {
  const badge = p.badge ? `<span class="badge">${esc(p.badge)}</span>` : "";
  const oldP = p.oldPrice ? `<span class="old-price">${fmt(p.oldPrice)}</span>` : "";
  return `
  <div class="card">
    <div class="card-img">
      <a href="product.html?id=${esc(p.id)}" aria-label="${esc(p.name)}">
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
      </a>${badge}
    </div>
    <div class="card-body">
      <span class="card-cat">${esc(CAT_LABELS[p.category] || p.category)}</span>
      <h3 class="card-title"><a href="product.html?id=${esc(p.id)}">${esc(p.name)}</a></h3>
      <div class="rating">${stars(p.rating)} <span class="rcount">${p.rating} (${p.reviews})</span></div>
      <div class="price-row"><span class="price">${fmt(p.price)}</span>${oldP}</div>
      <button class="btn btn-sm btn-block" data-add="${esc(p.id)}">Add to Cart</button>
    </div>
  </div>`;
}

function bindAddButtons(scope = document) {
  $$("[data-add]", scope).forEach((b) => {
    b.addEventListener("click", (e) => { e.preventDefault(); Cart.add(b.dataset.add, 1); });
  });
}

/* ---------------- blog cards ---------------- */
function postCard(p) {
  return `
  <div class="post-card">
    <div class="card-img">
      <a href="post.html?slug=${esc(p.slug)}"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></a>
    </div>
    <div class="card-body">
      <div class="post-meta"><span>${esc(p.category)}</span><span>•</span><span>${esc(p.date)}</span><span>•</span><span>${esc(p.readTime)} min read</span></div>
      <h3><a href="post.html?slug=${esc(p.slug)}">${esc(p.title)}</a></h3>
      <p class="ex">${esc(p.excerpt)}</p>
      <a class="read-more" href="post.html?slug=${esc(p.slug)}">Read Article →</a>
    </div>
  </div>`;
}

/* ---------------- page initializers ---------------- */
async function initHome() {
  try {
    const products = await getJSON("assets/products.json");
    const featured = products.filter((p) => p.badge).concat(products.filter((p) => !p.badge)).slice(0, 8);
    const grid = $("#featured-grid");
    if (grid) { grid.innerHTML = featured.map(productCard).join(""); bindAddButtons(grid); }
    const posts = await getJSON("assets/posts.json");
    const bg = $("#blog-preview");
    if (bg) bg.innerHTML = posts.slice(0, 3).map(postCard).join("");
  } catch (e) { console.error(e); }
}

async function initShop() {
  try {
    const products = await getJSON("assets/products.json");
    const grid = $("#shop-grid");
    const count = $("#result-count");
    const search = $("#shop-search");
    const params = new URLSearchParams(location.search);
    let activeCat = params.get("cat") || "all";

    $$(".filter-btn").forEach((b) => {
      if (b.dataset.cat === activeCat) b.classList.add("active");
      b.addEventListener("click", () => {
        $$(".filter-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        activeCat = b.dataset.cat;
        render();
      });
    });

    function render() {
      const q = (search?.value || "").trim().toLowerCase();
      const list = products.filter((p) => {
        const okCat = activeCat === "all" || p.category === activeCat;
        const okQ = !q || (p.name + " " + p.description).toLowerCase().includes(q);
        return okCat && okQ;
      });
      count.textContent = `${list.length} product${list.length === 1 ? "" : "s"} found`;
      grid.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty-state"><div class="big">🔍</div><h3>No products found</h3><p>Try a different search or category.</p></div>`;
      bindAddButtons(grid);
    }
    search?.addEventListener("input", render);
    render();
  } catch (e) { console.error(e); }
}

async function initProduct() {
  const id = new URLSearchParams(location.search).get("id");
  try {
    const products = await getJSON("assets/products.json");
    const p = products.find((x) => x.id === id) || products[0];
    document.title = p.name + " — Aizen Store";
    const save = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const isDigital = p.category === "digital" || p.category === "courses";
    $("#product-detail").innerHTML = `
      <div class="pd">
        <div class="pd-img"><img src="${esc(p.image)}" alt="${esc(p.name)}"></div>
        <div class="pd-info">
          <span class="card-cat">${esc(CAT_LABELS[p.category] || p.category)}</span>
          <h1>${esc(p.name)}</h1>
          <div class="pd-rating"><span class="rating">${stars(p.rating)}</span><span>${p.rating} · ${p.reviews} reviews</span></div>
          <div class="pd-price"><span class="price">${fmt(p.price)}</span>${p.oldPrice ? `<span class="old-price">${fmt(p.oldPrice)}</span><span class="save-tag">SAVE ${save}%</span>` : ""}</div>
          <p class="pd-desc">${esc(p.description)}</p>
          ${p.previewVideo ? `<div class="preview-wrap"><h3>🎬 Free preview — Lesson 1</h3><div class="video-frame"><iframe src="${esc(p.previewVideo)}" allow="autoplay; encrypted-media" allowfullscreen loading="lazy" title="Free preview"></iframe></div></div>` : ""}
          <ul class="pd-features">${p.features.map((f) => { const locked = f.startsWith("🔒"); const t = locked ? f.replace(/^🔒\s*/, "") : f; return `<li class="${locked ? "locked" : ""}">${esc(t)}</li>`; }).join("")}</ul>
          ${isDigital
            ? `<div class="delivery-note">⚡ <b>Instant digital delivery</b> — download link + access details are shared with you on WhatsApp right after your order is confirmed.</div>`
            : `<div class="delivery-note">📦 <b>Cash on Delivery available</b> — ships across Pakistan in 3–5 working days. Shipping ${fmt(CONFIG.shippingFee)} · FREE on orders over ${fmt(CONFIG.freeShippingOver)}.</div>`}
          <div class="qty-row">
            <div class="qty"><button id="q-minus" aria-label="decrease">−</button><span id="q-val">1</span><button id="q-plus" aria-label="increase">+</button></div>
            <button class="btn" id="pd-add" style="flex:1">Add to Cart</button>
          </div>
          <div class="meta-list">
            <div><b>Category:</b> ${esc(CAT_LABELS[p.category] || p.category)}</div>
            <div><b>SKU:</b> AZ-${esc(p.id.toUpperCase())}</div>
            <div><b>Availability:</b> ✅ In stock</div>
          </div>
        </div>
      </div>`;
    let qty = 1;
    $("#q-plus").addEventListener("click", () => { qty++; $("#q-val").textContent = qty; });
    $("#q-minus").addEventListener("click", () => { if (qty > 1) qty--; $("#q-val").textContent = qty; });
    $("#pd-add").addEventListener("click", () => Cart.add(p.id, qty));

    const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    const rg = $("#related-grid");
    if (rg && related.length) { rg.innerHTML = related.map(productCard).join(""); bindAddButtons(rg); }
    else $("#related-wrap")?.remove();
  } catch (e) { console.error(e); }
}

async function initCart() {
  const wrap = $("#cart-wrap");
  if (!wrap) return;
  async function render() {
    const products = await getJSON("assets/products.json");
    const items = Cart.items()
      .map((i) => ({ ...i, p: products.find((x) => x.id === i.id) }))
      .filter((i) => i.p);
    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state"><div class="big">🛒</div><h2>Your cart is empty</h2><p style="margin:10px 0 24px">Looks like you haven't added anything yet.</p><a class="btn" href="shop.html">Browse Products</a></div>`;
      return;
    }
    const PHYSICAL_CATS = ["physical-trading", "physical-gym"];
    const hasPhysical = items.some((i) => PHYSICAL_CATS.includes(i.p.category));
    const subtotal = items.reduce((a, i) => a + i.p.price * i.qty, 0);
    const shipping = hasPhysical ? (subtotal >= CONFIG.freeShippingOver ? 0 : CONFIG.shippingFee) : 0;
    const total = subtotal + shipping;
    wrap.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${items.map((i) => `
        <div class="cart-item">
          <a href="product.html?id=${esc(i.p.id)}"><img src="${esc(i.p.image)}" alt="${esc(i.p.name)}"></a>
          <div>
            <div class="ci-name"><a href="product.html?id=${esc(i.p.id)}">${esc(i.p.name)}</a></div>
            <div class="ci-price">${fmt(i.p.price)} each</div>
          </div>
          <div class="ci-right">
            <div class="qty"><button data-dec="${esc(i.id)}">−</button><span>${i.qty}</span><button data-inc="${esc(i.id)}">+</button></div>
            <div style="font-weight:800">${fmt(i.p.price * i.qty)}</div>
            <button class="ci-remove" data-del="${esc(i.id)}">Remove</button>
          </div>
        </div>`).join("")}
      </div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="sum-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
        <div class="sum-row"><span>Shipping</span><span>${!hasPhysical ? "Digital ⚡" : shipping === 0 ? "FREE 🎉" : fmt(shipping)}</span></div>
        ${hasPhysical && shipping > 0 ? `<div class="free-ship">Add ${fmt(CONFIG.freeShippingOver - subtotal)} more to unlock <b>FREE shipping</b> 🚚</div>` : ""}
        <div class="sum-row total"><span>Total</span><span class="t-price">${fmt(total)}</span></div>
        <form class="checkout-form" id="checkout-form">
          <h4>Delivery Details</h4>
          <div class="field"><label>Full Name *</label><input name="name" required placeholder="e.g. Ali Raza"></div>
          <div class="field"><label>Phone / WhatsApp *</label><input name="phone" required placeholder="03XX XXXXXXX"></div>
          ${hasPhysical ? `
          <div class="field"><label>Address *</label><textarea name="address" rows="2" required placeholder="House, street, area"></textarea></div>
          <div class="field"><label>City *</label><input name="city" required placeholder="e.g. Lahore"></div>` : `
          <div class="delivery-note">⚡ <b>Digital delivery</b> — no shipping needed. Your download links and access details will be sent after your order is confirmed on WhatsApp.</div>`}
          <button type="submit" class="btn wa-btn btn-block" style="margin-top:6px">📲 Order via WhatsApp</button>
          <p class="form-note">${hasPhysical ? "You'll be redirected to WhatsApp with your order pre-written. Pay cash on delivery." : "You'll be redirected to WhatsApp with your order pre-written. Get instant access after confirmation."}</p>
        </form>
      </div>
    </div>`;
    $$("[data-inc]", wrap).forEach((b) => b.addEventListener("click", () => { const l = Cart.items().find((x) => x.id === b.dataset.inc); Cart.setQty(b.dataset.inc, (l?.qty || 0) + 1); render(); }));
    $$("[data-dec]", wrap).forEach((b) => b.addEventListener("click", () => { const l = Cart.items().find((x) => x.id === b.dataset.dec); Cart.setQty(b.dataset.dec, (l?.qty || 1) - 1); render(); }));
    $$("[data-del]", wrap).forEach((b) => b.addEventListener("click", () => { Cart.remove(b.dataset.del); render(); }));
    $("#checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const lines = items.map((i, n) => `${n + 1}. ${i.p.name} x${i.qty} — ${fmt(i.p.price * i.qty)}`);
      const shipLine = !hasPhysical ? "Digital (no shipping)" : shipping === 0 ? "FREE" : fmt(shipping);
      const addrLines = hasPhysical
        ? `📍 Address: ${fd.get("address")}\n🏙️ City: ${fd.get("city")}`
        : `📦 Delivery: Digital`;
      const msg =
`🛍️ *NEW ORDER — AIZEN STORE*
--------------------------
${lines.join("\n")}
--------------------------
Subtotal: ${fmt(subtotal)}
Shipping: ${shipLine}
*Total: ${fmt(total)}*

👤 Name: ${fd.get("name")}
📞 Phone: ${fd.get("phone")}
${addrLines}`;
      window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
      toast("Opening WhatsApp… send the message to confirm your order ✅");
    });
  }
  render();
}

async function initBlog() {
  try {
    const posts = await getJSON("assets/posts.json");
    const grid = $("#blog-grid");
    if (grid) grid.innerHTML = posts.map(postCard).join("");
  } catch (e) { console.error(e); }
}

async function initPost() {
  const slug = new URLSearchParams(location.search).get("slug");
  try {
    const posts = await getJSON("assets/posts.json");
    const p = posts.find((x) => x.slug === slug) || posts[0];
    document.title = p.title + " — Aizen Store Blog";
    $("#post-wrap").innerHTML = `
      <div class="post-meta" style="margin-bottom:6px"><span>${esc(p.category)}</span><span>•</span><span>${esc(p.date)}</span><span>•</span><span>${esc(p.readTime)} min read</span></div>
      <h1>${esc(p.title)}</h1>
      <div class="post-hero"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>
      <!-- ADSENSE: paste your AdSense ad unit code here (below post title) -->
      <div class="ad-slot"><span class="ad-label">Advertisement</span>Ad space — your AdSense unit will appear here.</div>
      <article class="post-content">${p.content}</article>
      <!-- ADSENSE: paste your AdSense ad unit code here (end of article) -->
      <div class="ad-slot"><span class="ad-label">Advertisement</span>Ad space — your AdSense unit will appear here.</div>
      <div class="post-share"><span>Share:</span>
        <a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}">Facebook</a>
        <a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(location.href)}">X / Twitter</a>
        <a class="btn btn-outline btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(p.title + " " + location.href)}">WhatsApp</a>
      </div>
      <div class="author-box">
        <div class="ava">A</div>
        <div><b>Aizen Store Team</b><p>We write practical guides on trading, fitness and building income online — no fluff, no hype.</p></div>
      </div>`;
    const others = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
    const rg = $("#related-posts");
    if (rg) rg.innerHTML = others.map(postCard).join("");
  } catch (e) { console.error(e); }
}

/* ---------------- boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initFakeForms();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  if (page === "cart") initCart();
  if (page === "blog") initBlog();
  if (page === "post") initPost();
});
