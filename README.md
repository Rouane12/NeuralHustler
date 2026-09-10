# Neural Hustle

The professional website of **Rouane Mounssif — Software Engineer / AI Integration Engineer**.

AI integrations, backend systems, automation, developer products, and selected engineering work.

[Website](https://neuralhustleacademy.com/) · [Redesign report](docs/REDESIGN_REPORT.md) · [Gumroad and polish report](docs/POLISH_REPORT.md)

## Architecture

Production remains static HTML, CSS, and vanilla JavaScript on GitHub Pages. There is no new production dependency, application framework, or client-side catalog fetch.

| Owner | Responsibility |
| --- | --- |
| index.html | Page, SEO, profile state machine, navigation, themes, contact, Vanta and D-ID |
| styles.css | Established design system and profile geometry |
| studio.css | Refined hierarchy and responsive product/work components |
| content/catalog.json | Product and work records |
| scripts/render_catalog.py | Validates and escapes records; renders static catalog HTML |
| vite.config.mjs | Development-only preview and responsive review controls |
| CNAME | Existing custom domain |

## Updating content

Edit content/catalog.json, then run:

~~~sh
python3 scripts/render_catalog.py
python3 scripts/render_catalog.py --check
~~~

Commit the JSON and generated index.html together. On Windows, use python if that is the installed command. Only the two named catalog marker regions are replaced.

Products support a stable ID, name, positioning, description, technology tags, details, optional cover, optional price, and verified Gumroad URL.

NeuralStack's official Gumroad destination is configured once in its `gumroad_url` field. Regeneration creates **Get NeuralStack**, opening the product page in a new tab with `noopener noreferrer`. Hero and Featured Work discovery links still lead to the local product section. `price_label` and `cover` remain null; add them only when verified. Future products without a purchase URL can use a contact fallback.

A cover object requires src, alt, width, and height. The image must exist inside the repository. Without one, the product uses a typographic treatment. The renderer rejects missing covers, duplicate IDs, unsafe destinations, and prices without a purchase link.

Work layouts are featured, supporting, and reference. Neural Critic has public website/GitHub links. FlowForge and Wardrobe use contact links because their repositories are private.

## Preview

Node is only needed for preview. Run npm ci, then npm run dev. In ChatGPT Work, use the supervised preview.

The development-only /__qa route offers 1920, 1366, 820, 390, and 320 CSS-pixel iframe viewports, plus 200% text sizing. It is not a production route. GitHub Pages continues serving the committed root files without a Vite build.

Before publishing: check catalog output, themes, navigation, profile closing/focus, disclosures, contact validation, and overflow.

## Compatibility

FormSubmit, Upwork, LinkedIn, both YouTube channels, the portrait, profile animation, D-ID configuration, Vanta/Three.js, favicon, social image, and canonical domain are preserved. FormSubmit now returns to the current domain.

The old #courses and #portfolio anchors route to Products and Work. #projects opens the earlier-work disclosure. Historical course-app work remains separate from retired commercial promotions.
