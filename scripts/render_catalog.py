"""Render maintainable product/work records into crawler-readable static HTML.

Run: python3 scripts/render_catalog.py
CI / validation: python3 scripts/render_catalog.py --check
The website requires no Python, framework, or data fetch in the visitor's browser.
"""
import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def esc(value):
    return html.escape(str(value), quote=True)


def valid_url(value, *, gumroad=False):
    if not isinstance(value, str) or not value:
        raise ValueError("Links must be nonempty strings.")
    if value.startswith("#") and not gumroad:
        if not re.fullmatch(r"#[a-z][a-z0-9-]*", value):
            raise ValueError("Invalid internal link.")
        return value
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("External destinations must use HTTPS without credentials.")
    if gumroad and not (parsed.hostname == "gumroad.com" or parsed.hostname.endswith(".gumroad.com")):
        raise ValueError("The purchase destination must be a verified Gumroad URL.")
    return value


def link(item, *, button=False):
    url = valid_url(item["url"])
    external = ' target="_blank" rel="noopener noreferrer"' if not url.startswith("#") else ""
    style = "btn primary" if item.get("primary") else ("btn ghost" if button else "text-link")
    return f'<a class="{style}" href="{esc(url)}"{external}>{esc(item["label"])} <span aria-hidden="true">↗</span></a>'


def tags(items):
    return '<ul class="tech-tags" aria-label="Technologies">' + "".join(f"<li>{esc(t)}</li>" for t in items) + "</ul>"


def render_product(p):
    url = p.get("gumroad_url")
    if p.get("price_label") and not url:
        raise ValueError("A price requires a configured purchase destination.")
    if url:
        valid_url(url, gumroad=True)
        cta = link({"label": f'Get {p["name"]}', "url": url, "primary": True})
        note = "Product details and checkout on Gumroad."
    else:
        cta = link({"label": p.get("contact_label", f'Ask about {p["name"]}'), "url": "#contact", "primary": True})
        note = "Get in touch for pricing and availability."
    price = f'<p class="product-price">{esc(p["price_label"])}</p>' if p.get("price_label") else ""
    if p.get("cover"):
        cover = p["cover"]
        if not cover.get("alt"):
            raise ValueError("A product cover needs meaningful alt text.")
        path = (ROOT / cover["src"]).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            raise ValueError("A product cover must exist inside the repository.")
        visual = f'<img src="{esc(cover["src"])}" alt="{esc(cover["alt"])}" width="{int(cover["width"])}" height="{int(cover["height"])}" loading="lazy" />'
    else:
        # Typographic product treatment, not a fabricated product screenshot.
        visual = f'''<span class="product-edition">A Neural Hustle developer product</span>
          <span class="product-wordmark">{esc(p["name"])}</span>
          <span class="product-visual-category">{esc(p["category"])}</span>
          <div class="product-visual-footer"><span>Less repeated setup.</span><span>More building.</span></div>'''
    detail = "".join(f'<div><h4>{esc(d["title"])}</h4><p>{esc(d["text"])}</p></div>' for d in p["details"])
    return f'''<article class="product-feature fade-in-up" id="{esc(p["id"])}" aria-labelledby="{esc(p["id"])}-title">
        <div class="product-visual">{visual}</div>
        <div class="product-copy">
          <p class="label">{esc(p["category"])}</p>
          <h3 id="{esc(p["id"])}-title">{esc(p["name"])}</h3>
          <p class="product-positioning">{esc(p["positioning"])}</p>
          <p>{esc(p["description"])}</p>
          {tags(p["tags"])}
          {price}<div class="product-actions">{cta}</div>
          <p class="product-note">{esc(note)}</p>
          <details class="product-details"><summary>View product details</summary><div class="product-detail-list">{detail}</div></details>
        </div>
      </article>'''


def render_work(w):
    links = '<div class="work-links">' + "".join(link(l) for l in w["links"]) + "</div>"
    if w["layout"] == "reference":
        return f'''<article class="work-reference fade-in-up" id="{esc(w["id"])}"><div><p class="label">{esc(w["category"])}</p><h3>{esc(w["name"])}</h3></div><p>{esc(w["description"])}</p>{links}</article>'''
    title = f'<h3>{esc(w["name"])}</h3>'
    headline = f'<p class="work-headline">{esc(w["headline"])}</p>' if w.get("headline") else ""
    caps = "".join(f'<div><h4>{esc(c["title"])}</h4><p>{esc(c["text"])}</p></div>' for c in w["capabilities"])
    # Supporting work ends with its action, after the technical evidence.
    supporting = w["layout"] == "supporting"
    trailing_links = f'\n        {links}' if supporting else ''
    return f'''<article class="work-card work-{esc(w["layout"])} fade-in-up" id="{esc(w["id"])}">
        <div class="work-copy"><p class="label">{esc(w["category"])}</p>{title}{headline}<p>{esc(w["description"])}</p>{tags(w["tags"])}{'' if supporting else links}</div>
        <div class="work-capabilities">{caps}</div>{trailing_links}
      </article>'''


def render():
    data = json.loads((ROOT / "content/catalog.json").read_text())
    ids = [x["id"] for x in data["products"] + data["work"]]
    if len(ids) != len(set(ids)) or any(not re.fullmatch(r"[a-z][a-z0-9-]*", i) for i in ids):
        raise ValueError("Product and work IDs must be unique lowercase slugs.")
    if any(w["layout"] not in ("featured", "supporting", "reference") for w in data["work"]):
        raise ValueError("Unknown work layout.")
    blocks = {
        "products": '\n        <div class="product-list">\n' + "\n".join(render_product(p) for p in data["products"]) + "\n        </div>\n        ",
        "work": '\n        <div class="work-grid">\n' + "\n".join(render_work(w) for w in data["work"]) + "\n        </div>\n        ",
    }
    original = (ROOT / "index.html").read_text()
    output = original
    for name, block in blocks.items():
        start, end = f"<!-- catalog:{name}:start -->", f"<!-- catalog:{name}:end -->"
        if output.count(start) != 1 or output.count(end) != 1:
            raise ValueError(f"Expected one marker pair for {name}.")
        before, rest = output.split(start)
        _, after = rest.split(end)
        output = before + start + block + end + after
    return original, output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    before, after = render()
    if args.check:
        if before != after:
            raise SystemExit("Catalog HTML is stale. Run python3 scripts/render_catalog.py.")
        print("Product and work content is current.")
    else:
        (ROOT / "index.html").write_text(after)
        print("Rendered product and work content.")
