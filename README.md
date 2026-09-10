# Neural Hustle

The professional website of **Rouane Mounssif — Software Engineer / AI Integration Engineer**.

AI integrations, backend systems, automation, developer products, and selected engineering work.

[Website](https://neuralhustleacademy.com/) · [Redesign report](docs/REDESIGN_REPORT.md) · [Gumroad and polish report](docs/POLISH_REPORT.md) · [Profile, CV and attachment report](docs/PROFILE_CV_REPORT.md)

## Architecture

Production remains static HTML, CSS, and vanilla JavaScript on GitHub Pages. There is no application framework or client-side catalog fetch. The site uses the official tsParticles Stars browser bundles (pinned to 4.4.0) only for the decorative global atmosphere.

| Owner | Responsibility |
| --- | --- |
| index.html | Page, SEO, profile state machine, navigation, themes, contact and D-ID |
| styles.css | Established design system and profile geometry |
| studio.css | Refined hierarchy and responsive product/work components |
| assets/css/neural-atmosphere.css | Global atmosphere layering, theme art direction and static fallback |
| assets/js/neural-atmosphere.js | tsParticles lifecycle, theme sync, pointer parallax and motion safeguards |
| assets/images/rouane-mounssif.webp | Canonical compact and expanded profile portrait |
| assets/documents/Rouane-Mounssif-CV.pdf | Public CV; preserve this URL when updating it |
| assets/js/contact-attachments.js | Optional attachment type and size feedback |
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

The development-only /__qa route offers 1920, 1366, 820, 390, and 320 CSS-pixel iframe viewports, plus 200% text sizing and a 400px short-height preset. It is not a production route. GitHub Pages continues serving the committed root files without a Vite build.

Before publishing: check catalog output, themes, navigation, profile closing/focus, disclosures, contact validation, atmosphere continuity and overflow.

## Compatibility

FormSubmit, Upwork, LinkedIn, both YouTube channels, the shared-element profile animation, D-ID configuration, favicon, social image, and canonical domain are preserved. Vanta/Three.js were removed when the hero-only background was replaced by the global tsParticles atmosphere. The profile uses the supplied updated portrait. FormSubmit returns to the current domain.

The atmosphere is one fixed decorative layer from hero through footer. Dark mode uses a restrained cool-white/teal/purple star field; light mode uses a lower-contrast blue-gray/teal/lavender version. The layer does not receive pointer events, reduces work on compact viewports, pauses on hidden tabs and while the profile modal is open, and falls back to static CSS when reduced motion is requested or the CDN cannot load.

The old #courses and #portfolio anchors route to Products and Work. #projects opens the earlier-work disclosure. Historical course-app work remains separate from retired commercial promotions.

## Public CV and contact attachments

Replace only the public CV at `assets/documents/Rouane-Mounssif-CV.pdf` when updating it. Check its text, rendered pages, metadata and links for private contact information before committing it. The original private source CV does not belong in the public repository. Both profile and Contact actions point to this same file; View opens a new tab and Download uses the native download attribute.

The contact form uses FormSubmit's documented native multipart upload with one optional `attachment` field. The recipient, return URL and required text fields are unchanged. The browser permits PDF, DOC and DOCX, shows errors for unsupported types or files over 10,000,000 bytes, and offers Remove file. The native field remains usable without JavaScript; custom type/size validation needs JavaScript. File extensions and reported MIME types are browser checks, not server-side content inspection. FormSubmit documents a 10 MB total file limit. See [FormSubmit documentation](https://formsubmit.co/documentation).
