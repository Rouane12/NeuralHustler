# Neural Hustle — Gumroad connection and visual polish

Prepared 10 September 2026. Follow-up to the approved redesign at `aaec3f11cc516c940a1ede4755bbd9fa3c674715`, in [PR #29](https://github.com/Rouane12/NeuralHustler/pull/29). The existing GitHub Pages architecture and page hierarchy remain in place. This change is prepared for review; it has not been merged or deployed.

1. **Gumroad configuration.** NeuralStack's `gumroad_url` in [content/catalog.json](../content/catalog.json) is now `https://rouanemounssif.gumroad.com/l/neuralstack`. The catalog remains the source of truth. The static product HTML is regenerated with `scripts/render_catalog.py`.

2. **Purchase CTA.** “Ask about NeuralStack” becomes **Get NeuralStack**, with `target="_blank"` and `rel="noopener noreferrer"`. The note reads “Product details and checkout on Gumroad.” The temporary NeuralStack contact label is removed from its record. Hero, navigation, footer, and Featured Work discovery links still lead to the local Products section. There is one generated purchase link, with no independently maintained copies in unrelated components.

3. **Visual polish.** The purple and teal body gradients now have bounded dimensions, removing the broad navy wash and abrupt transition below the hero. Technology tags increase from 13px to 14px. Product and work cards gain a subtle focus border; workshop and creative links give matching keyboard feedback. Disclosure hover feedback uses the existing teal accent. Services retain their quieter button treatment during hover and focus.

4. **Products.** The product copy gets more horizontal room, smaller padding, and tighter action/disclosure spacing. The desktop card measured about 550px high after refinement, compared with roughly 600px in the reviewed baseline. The mobile visual panel has a smaller minimum height and shorter internal gaps. The typographic product treatment, positioning, and native details disclosure remain. No price, modules, reviews, sales figures, license terms, or guarantees were added. Future products can still use optional covers, prices, and a contact fallback when no purchase URL is configured.

5. **Featured Work.** Neural Critic remains the large, full-width operating-publication case study. Wardrobe and FlowForge now end with their contact action after the technical details, giving each card a clear reading order. Their headings have a little more separation from the descriptions. Wardrobe remains client work; FlowForge remains an ongoing personal engineering project. NeuralStack remains a compact product-engineering reference. Private repository links remain absent.

6. **Section rhythm.** The primary section padding maximum decreases from 96px to 80px. Experience, credentials, and creative work use 64px desktop section padding and smaller headings, while mobile retains its 48px section rhythm. This makes the lower page quieter without removing its structure. The reviewed progression remains Intro → What I Build → Products → Featured Work → Services → Experience / Earlier Work → Education / Certifications → Creative → Contact. Open capability columns, the product split panel, the featured case study, historical rows, and compact credentials provide variation without a new card system.

7. **Dark and light themes.** Both themes were visually inspected in the browser, with special attention to Products, Featured Work, and Services. Product surfaces, borders, muted copy, technology tags, purple/teal accents, and buttons remain legible and distinct in both. Theme persistence was confirmed by switching to light and reloading. Space Grotesk and the established palette remain unchanged.

8. **Responsive verification.** All five requested CSS viewport widths were checked in both themes at 100% and 200% root text size: 20 combinations. DOM geometry showed no horizontal overflow or off-screen visible page elements after the fix below. Visual checks covered the desktop, tablet, and mobile hero; product stacking, tags and CTA; work cards; and lower-page transitions. A real issue at 1366px with 200% text pushed the theme button out of view; allowing navigation links to wrap fixes it. The development-only review frame was also centered correctly when showing a viewport wider than the browser window.

9. **Regression checks.** Browser checks exercised mobile menu opening and automatic closing after navigation, product disclosure opening and keyboard closing, the visible focus outline, profile hover expansion and reverse return to its 130px slot, backdrop/scroll-lock state, keyboard opening, Tab focus containment, Escape focus restoration, and the close button. The `#courses` and `#portfolio` aliases reached Products and Work; `#projects` opened the earlier-work disclosure. Contact required-field feedback appeared in the browser, an invalid email was rejected by native validation, and test input was cleared. No message was sent. Catalog validation and whitespace checks passed; IDs and internal anchors are valid, new-window links have the required rel attributes, and there are no private repository links. All HTML outside the two catalog regions, including the six script blocks, FormSubmit configuration, profile markup, canonical URL, social metadata and D-ID configuration, is unchanged from the approved baseline. No first-party console errors were found in the checked session.

10. **Deliberate non-changes and verification limits.** The strong hero copy, portrait placement, navigation hierarchy, project claims, content architecture, native disclosures, production dependencies, and hosting remain unchanged because the approved baseline already serves the intended story. No new decorative artwork, embed, pricing tier, animation system, or commercial claims were introduced. Reduced-motion CSS and JavaScript guards were inspected and retained; OS-level reduced-motion emulation and physical touch hardware were not exercised. Vanta's scripts and guarded initializer are unchanged, but no Vanta canvas was present in this browser session, so the static hero fallback was visually verified instead of animation playback. D-ID widget markup was present; no voice/chat session was started. Gumroad checkout and FormSubmit delivery were not executed.

## Responsive measurements

The scrollbar occupies 15px of each iframe viewport. In every row, the document scroll width equaled its available content width in both themes and at both text sizes. Visible page-element bounds were checked separately so overflow clipping could not hide an off-screen control.

| CSS viewport | Content / scroll width | Dark 100% / 200% | Light 100% / 200% |
| --- | --- | --- | --- |
| 1920px | 1905px | Pass / Pass | Pass / Pass |
| 1366px | 1351px | Pass / Pass | Pass / Pass |
| 820px | 805px | Pass / Pass | Pass / Pass |
| 390px | 375px | Pass / Pass | Pass / Pass |
| 320px | 305px | Pass / Pass | Pass / Pass |

The 200% check enlarged the root text from 16px to 32px through the existing development review control. It was a text-enlargement check, not an OS display-scaling or physical-device test. The expanded product disclosure also remained within the 320px viewport at 200% text.

## Outbound link audit

Public HTTP checks were performed on the actual destinations extracted from the generated page. HTTP success verifies reachability, not every operation inside the destination service.

| Destination | Result |
| --- | --- |
| [NeuralStack on Gumroad](https://rouanemounssif.gumroad.com/l/neuralstack) | HTTP 200; canonical URL retained |
| [Neural Critic](https://www.neuralcritic.net/) | HTTP 200 |
| [Neural Critic GitHub](https://github.com/Rouane12/NeuralCritic) | HTTP 200 |
| [Upwork profile](https://www.upwork.com/freelancers/~014f1c5a4da976d3ac) | HTTP 403 for the automated request; existing destination preserved, availability not confirmed |
| [LinkedIn](https://linkedin.com/in/rouane-mounssif-538171243) | HTTP 200 |
| [NeuralFC](https://www.youtube.com/@NeuralFC) | HTTP 200 after normal www redirect |
| [Ainimal](https://www.youtube.com/@AinimalAI) | HTTP 200 after normal www redirect |
| Email / contact | Existing mailto address, FormSubmit endpoint, required fields, and current-domain return URL preserved |

## Updated rendered previews

These are browser captures of the implemented page, not mockups. Full-page capture timed out, so the complete desktop preview was assembled from consecutive rendered screenshots. The clean contact capture was aligned to the same scale, and the full Featured Work section was cropped from the assembled page. The other previews were captured directly. All six final files were visually inspected.

| Preview | Image |
| --- | --- |
| Full desktop dark | [desktop-dark.jpg](polish/desktop-dark.jpg) |
| Hero | [hero-dark.jpg](polish/hero-dark.jpg) |
| NeuralStack Products | [products-dark.jpg](polish/products-dark.jpg) |
| Complete Featured Work | [featured-work-dark.jpg](polish/featured-work-dark.jpg) |
| Light mode | [products-light.jpg](polish/products-light.jpg) |
| Mobile, 390px | [mobile-dark.jpg](polish/mobile-dark.jpg) |
