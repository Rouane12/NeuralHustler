# Neural Hustle — portrait, public CV and optional attachments

Prepared 10 September 2026 from published `main` at `7d6dee5cee721889e8533d87000bd670a826ad53`. These are focused refinements of the approved site, prepared on `codex/profile-cv-attachments` for review. They have not been merged or deployed.

1. **New profile image.** `assets/images/rouane-mounssif.webp` is the supplied portrait resized to 640 × 960 and compressed as WebP: 57,890 bytes. No generative or stylistic editing was used. The single shared image serves the compact and expanded profile, with a circular CSS crop at `object-position: 50% 18%`. Its resolution exceeds the largest 132px avatar at 3× pixel density.

2. **Old profile asset.** `my image in portfo.webp` remains in the repository for compatibility and rollback, but the page no longer references it. The source portrait remains untouched.

3. **Public CV.** `assets/documents/Rouane-Mounssif-CV.pdf` is the stable public asset: one A4 page, 618,975 bytes. It retains the original French résumé layout and supported education, experience, certifications, technologies, languages and professional title. Chrome's PDF viewer successfully opened this exact asset from the profile's View action.

4. **Privacy edits.** The personal phone number and neighborhood-level address were removed from the PDF content, not merely covered. The contact area now contains the professional email and “Casablanca, Morocco.” The document container was rebuilt without the original metadata or structure tree, with professional metadata added. Extracted text and decoded PDF objects were checked for the removed strings; no attachments or forms remain. All other source text was verified as retained. The QR code was decoded and confirmed to point to the approved LinkedIn profile. Email and LinkedIn are clickable. The private uploaded PDF was hash-checked as unchanged and is excluded from the repository.

5. **View CV locations.** The expanded profile, beneath the biography and specialty tags; and Contact, beside the existing Email Rouane action. Both use normal anchors with `target="_blank"`, `rel="noopener noreferrer"`, and a label announcing the PDF and new tab. There is no embedded PDF panel or new major section.

6. **Download CV locations.** The same two locations provide a distinct Download CV anchor with `download="Rouane-Mounssif-CV.pdf"`, pointing to the same public asset. The same-origin URL and attributes were verified. The cloud browser's download-event monitor timed out, so completed file saving through this control was not confirmed in this environment; no JavaScript download workaround was introduced.

7. **Contact upload implementation.** The existing POST form now uses `enctype="multipart/form-data"` and one optional native file input named `attachment`. A styled native file-selection button, label, Optional text, help text, visible focus treatment, inline errors and Remove file control support it. `assets/js/contact-attachments.js` validates selection with native custom validity and accessible feedback. Selecting a file does not send it or display a fake upload state. The native form sends only when the visitor submits.

8. **Supported formats.** PDF, DOC and DOCX are listed by extension and MIME type in `accept`. Browser validation rejects unsupported extensions and mismatched reported MIME types. Empty or generic MIME values are allowed for supported extensions because some systems do not identify document MIME types. Long filenames truncate within the native input, with the full selected name available in its title.

9. **FormSubmit requirements.** Official documentation confirms native uploads with a multipart POST and an `attachment` field, with a 10 MB total file limit. The client conservatively enforces 10,000,000 bytes for the single optional file. The recipient, `_captcha`, current-domain `_next`, and required Name, Email and message fields are unchanged. No backend replacement, account change or new dependency is needed. Source: [FormSubmit documentation](https://formsubmit.co/documentation), checked 10 September 2026.

10. **Dark and light themes.** Both themes were checked for the portrait, CV controls, file input, helper text, filename containment and focus states. The new light-theme CV and file-input borders were strengthened after visual review. Existing Space Grotesk typography, purple/teal palette and commercial CTA hierarchy remain.

11. **Responsive verification.** The page, expanded profile and selected long filename were measured at all five requested widths in both themes at 100% and 200% root text: 20 combinations per surface. There was no horizontal overflow in the new controls, the page or the modal after correction. The mobile profile header stacks to prevent the name from becoming a narrow column at enlarged text. The added details have no fixed internal height cap; the outer modal scrolls. At 320 × 400 with 200% text in both themes, Tab brought View CV into view and Shift+Tab returned to the visible Close control. Measurements are in [verification.json](profile-cv/verification.json).

12. **Profile regression verification.** Browser checks covered hover opening and recovery, click opening, keyboard opening, reverse close, the close button, Escape, backdrop dismissal, scroll-lock cleanup, focus restoration, forward/reverse Tab cycling, and reachability of both CV links. The original shared-element animation and timing remain. A geometry-based pointer check fixes an observed reopening race when the pointer overlaps the compact card after closing. Hidden and closing details are inert. Reduced-motion guards and coarse-pointer history handling were inspected and retained; physical touch and OS-level reduced-motion emulation were not exercised.

13. **Contact regression verification.** Required-field feedback appeared for the empty form. Filled text-only fields passed native form validation with no file. A selected public PDF passed; a harmless fixture with an executable extension and a file over 10 MB were rejected with the expected visible messages. Remove file cleared selection and errors. Long filenames remained contained at all requested sizes and themes. Ten isolated checks of the actual validation script covered optional selection, PDF/DOC/DOCX, uppercase extensions, empty/generic/mismatched MIME values, executable extensions and the exact size boundary. Test text and files were cleared. No contact message or attachment was submitted. Script syntax, catalog freshness and whitespace checks passed; no first-party browser console errors were found.

14. **Limits and unchanged scope.** Email delivery, provider-side failure pages, attachment scanning and production file delivery after deployment were not exercised. The documented FormSubmit integration supports the requested normal workflow, but browser file filters are not a server-side security boundary or content scanner. Custom validation requires JavaScript; the optional native input remains available without it. Download saving remains subject to the browser and the verification limitation in point 6. Vanta could not create a WebGL context in the cloud browser, and D-ID logged network errors; their source and configuration were unchanged, and the fallback presentation was reviewed. No D-ID conversation or microphone session was initiated. Product/work content, hero copy, navigation, experience, education, creative work, catalog and Gumroad configuration remain unchanged.

## Responsive results

Each Pass covers dark/light and 100%/200% text. The 200% check enlarges root text from 16px to 32px; it is not a physical-device or OS display-scaling test. Expanded profiles retain vertical scrolling when content exceeds the viewport.

| CSS viewport | Page content / scroll width | Page and Contact | Expanded profile bounds | Long filename containment |
| --- | --- | --- | --- | --- |
| 1920px | 1905 / 1905 | Pass | Pass | Pass |
| 1366px | 1351 / 1351 | Pass | Pass | Pass |
| 820px | 805 / 805 | Pass | Pass | Pass |
| 390px | 375 / 375 | Pass | Pass | Pass |
| 320px | 305 / 305 | Pass | Pass | Pass |

## Rendered screenshots

These are browser captures of the implementation. The mobile capture is cropped to the actual 390px review viewport. The upload capture shows a locally selected test PDF with a deliberately long filename; it was not submitted.

| Requested view | Screenshot |
| --- | --- |
| Desktop hero with the new portrait | [hero-dark.jpg](profile-cv/hero-dark.jpg) |
| Expanded profile | [expanded-dark.jpg](profile-cv/expanded-dark.jpg) |
| Contact with CV actions | [contact-dark.jpg](profile-cv/contact-dark.jpg) |
| Contact form with upload field | [upload-dark.jpg](profile-cv/upload-dark.jpg) |
| Light mode | [contact-light.jpg](profile-cv/contact-light.jpg) |
| Mobile | [mobile-profile-light.jpg](profile-cv/mobile-profile-light.jpg) |
