type CatalogueImageKind = "products" | "categories";

type ProductImageInput = {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  brand?: string | null;
  unit?: string | null;
};

type CategoryImageInput = {
  id: string;
  name: string;
  icon?: string | null;
};

const palettes = [
  ["#ff4b2b", "#ff9f6e", "#fff3ed"],
  ["#188f54", "#8de0b4", "#effaf3"],
  ["#2563eb", "#93c5fd", "#eef5ff"],
  ["#7c3aed", "#c4b5fd", "#f5f0ff"],
  ["#d97706", "#fbd38d", "#fff7e8"],
  ["#0f172a", "#94a3b8", "#f8fafc"],
  ["#db2777", "#f9a8d4", "#fff1f8"],
  ["#0891b2", "#67e8f9", "#ecfeff"]
];

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickPalette(seed: string) {
  return palettes[hashText(seed) % palettes.length];
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function initials(name: string) {
  const words = name
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "BS";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
}

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1)}.` : value;
}

export function catalogueImagePath(kind: CatalogueImageKind, id: string) {
  return `/api/catalogue/images/${kind}/${encodeURIComponent(id)}.svg`;
}

export function renderProductImage(product: ProductImageInput) {
  const [primary, secondary, background] = pickPalette(`${product.categoryId}:${product.id}`);
  const title = escapeXml(truncate(product.name, 30));
  const brand = product.brand ? escapeXml(truncate(product.brand, 22)) : "Bazaar Setu";
  const unit = product.unit ? escapeXml(truncate(product.unit, 18)) : "Catalogue item";
  const category = escapeXml(truncate(product.categoryName ?? product.categoryId.replaceAll("-", " "), 24));
  const letters = escapeXml(initials(product.name));
  const ariaLabel = escapeXml(`${product.name} product image`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${ariaLabel}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${background}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#111827" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="84" fill="url(#bg)"/>
  <circle cx="410" cy="92" r="78" fill="${secondary}" opacity="0.25"/>
  <circle cx="82" cy="420" r="96" fill="${primary}" opacity="0.12"/>
  <rect x="78" y="76" width="356" height="292" rx="56" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="110" y="108" width="292" height="188" rx="44" fill="url(#tile)"/>
  <path d="M142 242 C170 168 214 152 254 216 C288 160 354 162 386 242" fill="none" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
  <circle cx="254" cy="164" r="24" fill="#ffffff" opacity="0.92"/>
  <text x="256" y="250" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="800" fill="#ffffff">${letters}</text>
  <text x="256" y="333" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="#111827">${title}</text>
  <text x="256" y="383" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="${primary}">${unit}</text>
  <rect x="94" y="410" width="324" height="54" rx="27" fill="#ffffff" opacity="0.95"/>
  <text x="256" y="445" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#475569">${brand} - ${category}</text>
</svg>`;
}

export function renderCategoryImage(category: CategoryImageInput) {
  const [primary, secondary, background] = pickPalette(category.id);
  const title = escapeXml(truncate(category.name, 28));
  const icon = escapeXml(initials(category.icon ?? category.name));
  const ariaLabel = escapeXml(`${category.name} category image`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="320" viewBox="0 0 512 320" role="img" aria-label="${ariaLabel}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="320" rx="52" fill="${background}"/>
  <rect x="32" y="32" width="448" height="256" rx="44" fill="url(#bg)"/>
  <circle cx="410" cy="76" r="72" fill="#ffffff" opacity="0.18"/>
  <circle cx="86" cy="250" r="92" fill="#ffffff" opacity="0.16"/>
  <text x="256" y="148" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="900" fill="#ffffff">${icon}</text>
  <text x="256" y="218" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#ffffff">${title}</text>
  <text x="256" y="254" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#ffffff" opacity="0.85">Bazaar Setu catalogue</text>
</svg>`;
}
