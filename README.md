# Rahul Saxena · e-portfolio (Stages 1–5: foundation, Home, Projects, detail page, About, moving portrait, Contact and launch)

Plain HTML, CSS and JavaScript. No build step. Open `index.html` in a browser, or host the folder on GitHub Pages. **To go live, follow `DEPLOY.md`.**

## What each file does

| File | What it does |
|---|---|
| `index.html` | Home page: intro, featured work, research-calls ticker, latest work, one section per kind of work (Research, Models, Dashboards, Articles, Other; empty kinds hide), About teaser, then a full disclaimer (academic work, not investment advice) above the footer |
| `projects.html`, `project.html` | All work, and one page per item |
| `about.html` | About page: opens with a scroll scene (your big name behind your photo; as you scroll, the photo docks to the left and the headline appears), then your story, experience, education, skills, certificates and testimonials on the right (one column on phones). See "About page scroll design" below |
| `gallery.html` | Gallery page: a big photo slideshow at the top (slides from left to right every few seconds; left/right arrow buttons; pauses on hover and has a Pause button), then filters and photos and clips grouped by event (newest first), with a larger view and Previous/Next |
| `contact.html` | Contact page: your details and a message form |
| `404.html` | Shown by GitHub Pages for addresses that don't exist |
| `DEPLOY.md` | Step-by-step guide to putting the site online |
| `robots.txt` | Lets search engines visit every page |
| `.nojekyll` | Empty file that tells GitHub Pages to serve the files exactly as they are |
| `css/styles.css` | All styling. Colours (dark and light theme), fonts and corner sizes are at the top in one block |
| `js/config.js` | **The only file you edit.** Sheet links, the `USE_LOCAL_SAMPLE` switch, form, portrait mode and avatar look. On GitHub it must say `USE_LOCAL_SAMPLE: false` (the copy in `portfolio-site.zip` does) |
| `js/sheet.js` | Loads the sheet (live, or the saved copy for the preview), reads CSV, and small helpers |
| `js/ui.js` | Adds the header, footer and phone menu to every page |
| `js/background.js` | The animated candlestick skyline behind the Home page |
| `js/home.js` | Fills the Home page from the sheet |
| `js/projects.js` | Projects page: filter chips, search, sort, "Show more", shareable links like `projects.html?type=research&q=pharma` |
| `js/project.js` | Detail page (`project.html?type=...&id=...`): facts, call block, link buttons, sections and "More work" |
| `js/about.js` | Runs the About scroll scene and fills the page from the About, Experience, Skills, Certificates and Testimonials tabs. Education comes from Experience rows with Type = Education. Sections with no rows hide themselves |
| `js/gallery.js` | Fills the Gallery page from the Gallery tab |
| `js/contact.js` | Contact page: details from the About tab, form checks, sending, success and error messages |
| `js/avatar.js` | Draws an illustrated avatar. Not used by any page at the moment (kept in case you want it back) |
| `js/face.js` | The old "turn my head with the mouse" portrait. Not used by any page at the moment (kept in case you want it back) |
| `data/sample-data.js` | A saved copy of your sheet, used only by the Claude preview (which cannot read Google). The live site ignores it |
| `assets/me.webp`, `assets/me.png` | Your portrait, cut out with a transparent background (the `.png` is a backup for very old browsers) |

## Switch to your live Google Sheet

Your nine published links are already in `js/config.js` (in `portfolio-site.zip`), with `USE_LOCAL_SAMPLE: false`. To add or change a link yourself:

1. Open the sheet in Google Sheets.
2. File > Share > **Publish to web**. Pick one tab, choose **Comma-separated values (.csv)**, click **Publish**, and copy the link.
3. Paste it between the quotes for that tab in `js/config.js` on GitHub.
4. Make sure `USE_LOCAL_SAMPLE` is `false` there.
   The same file holds `CONTACT_FORM_URL`, your free form endpoint (for example `https://formspree.io/f/xxxxxxx`). While it is empty, the Contact form tells visitors it is not switched on yet and offers their email app instead. See `DEPLOY.md` step 6.
5. Reload the site. Changes in the sheet show up within about 5 minutes (Google caches the published file, and the site caches it for 5 minutes per browser tab).

## Colours and the light/dark switch

The site has two themes: **dark** ("Ink and Steel": deep navy with a steel-blue accent) and **light** ("Paper": soft white with a deep blue accent). The sun/moon button in the header switches between them on every page, and the visitor's choice is remembered on their device. Visitors who never press it get the theme their phone or computer is set to.

Green, amber and red are only used for Buy, Hold and Sell. To change a colour, edit the values at the top of `css/styles.css` (the dark theme first, then the light theme, which is listed twice with the same values).

## Adding photos and clips to the Gallery

Add one row per photo or clip to the **Gallery** tab of your sheet:

| Column | What to put |
|---|---|
| Title | A short name, e.g. "Presenting our valuation" |
| Event | The event's name. Rows with the same Event are shown together; the newest event comes first |
| Date | `yyyy-mm-dd` |
| Type | `Photo` or `Video` |
| Media Link | A Google Drive link (shared as "Anyone with the link"), a YouTube link, or a file in `assets/` |
| Thumbnail Link | Optional: a cover picture for a clip |
| Caption | Optional: one line about the moment |
| Show | `Yes` to show it |

Every photo (not clips) also appears in the big slideshow at the top of the page. Photos, and video files you put in `assets/` (`.mp4`), open in a larger view on the page. YouTube and Google Drive clips open in a new tab. Clips never play by themselves. Keep video files small (under about 10 MB each); for longer clips, upload to YouTube (it can be "Unlisted") and paste the link.

## Logo

The logo is ₹S on a rounded square in the accent colour. The letters are outlines of Manrope ExtraBold, so no font is needed to show it.

- **Header:** drawn in code in `js/ui.js` (`LOGO`), using the theme colours, so it switches with the light/dark button.
- **Files in `assets/`:** `favicon.svg` (browser tab; follows the visitor's light/dark setting), `favicon.ico` (16 and 32 px, older browsers), `apple-touch-icon.png` (iPhone home screen), `icon-192.png` and `icon-512.png` (Android and the web manifest; also good as a LinkedIn or Substack profile picture), `og-image.png` (the picture shown when your link is shared), `site.webmanifest`.
- **Every page's `<head>`** links these files.
- **⚠ Do this once you know your site address:** link previews (LinkedIn, WhatsApp, X) need the full address of the share picture. In each page's `<head>`, change `content="assets/og-image.png"` to `content="https://<your-address>/assets/og-image.png"`, for example `https://<username>.github.io/portfolio/assets/og-image.png`.

## How loading works

- **Repeat visits are instant.** Each visitor's browser keeps the last copy of your sheet (per tab, in `localStorage`). Pages draw from that copy straight away, then quietly fetch the sheet in the background and redraw only if something changed, keeping the visitor's scroll position, filters and any open photo.
- **First visits** show your name, headline, "Open to", buttons and photo at once (they are written into the pages), with soft grey placeholders where cards, numbers and photos will appear, so nothing jumps when they arrive.
- **The loader** (a large counting percentage) appears only if the sheet takes longer than about 0.4 s. It climbs while the sheet loads, finishes at 100% once the page has drawn, and fades. Visitors who turn off motion see a still "Loading…".
- **If Google doesn't answer within 12 seconds**, the loader goes away and the page shows "Content is loading slowly. Please refresh." A visitor who has been before keeps seeing their saved copy instead.
- If you rename or remove sheet columns, change `SAVE_VERSION` at the top of the loading section in `js/sheet.js` (for example `'v1'` to `'v2'`) so old saved copies are ignored.

## About tab fields

| Field | Where it shows |
|---|---|
| Name, Headline | Home hero and page titles |
| Positioning Statement, Bio | About > My story |
| Email, LinkedIn, Newsletter Link | About (beside the greeting), Contact page and the footer. A blank one simply hides |
| Location, Availability, Open To | Home ("Open to") and About > My story |
| Resume Link | Every **Download CV** button (a Google Drive link shared as "Anyone with the link") |
| Current Focus | About > More about me |
| Stat 1, Stat 2, Stat 3 | A quiet row of numbers on Home (under the buttons) and About. Write them as `12,000+ \| Combined following`: the number, a `\|`, then the label. Without a `\|` the whole value is shown as the number. Blank ones hide |

Your portrait comes from `HEAD_TURN.photo` in `js/config.js`, not from the sheet. Projects need no picture or role; Articles open straight on Substack (or whatever `Platform` says).

## Rules the site follows

- Only rows with `Show` = `Yes` appear. `Featured` = `Yes` puts an item in the Home highlights, ordered by `Rank` then newest. With fewer than three featured, the newest items fill the gaps.
- Dates can be `2026-10-26` (best), `26/10/2026` or `Oct 26, 2026`. A date the site can't read is left out and that item sorts last.
- If one tab can't be loaded, only its sections hide and a small note asks the visitor to refresh.
- The research ticker appears once there are at least 5 Research rows with `Show` = `Yes`.
- About values that start with "e.g." are treated as blank, so the default wording shows until you fill them in.
- Google Drive image links are converted automatically so they display as pictures.

## About page scroll design

The About page opens with a short scroll scene:

1. At the top, your cut-out photo stands large in the middle with a soft glow, and **RAHUL** and **SAXENA** sit behind it in huge, stretched letters that fade towards the bottom.
2. As the visitor scrolls, the names fade and drift apart. On computers and tablets (wider than 760px) the photo shrinks and moves to the left column, and stays there while everything else scrolls on the right. On phones the photo fades back and blurs slightly instead.
3. The headline types itself out on the right ("Student of the market." / "Always in session."), then the grey line and the shortcut pills appear. Repeat visitors, and visitors who turn off motion, see it at once.
4. Your sections follow. **My story** now also shows your three headline numbers.

Visitors who turn off motion get everything stacked and still: the names, the photo, the headline, then the sections.

**What you can change**
- **Headline wording (optional sheet rows):** add rows `Hero Line 1`, `Hero Line 2` and `Hero Subline` to the About tab. Without them the defaults show.
- **Photo:** it comes from `HEAD_TURN.photo` in `js/config.js` (now a still picture on About; the mouse "turn my head" effect is retired).
- **How long the scene lasts:** in `css/styles.css`, search for `--ab-scene`. `260vh` (computers) and `320vh` (phones) are the scroll distance; smaller numbers make the scene shorter.
- **How tall the names are:** in the same place, `--ab-sy` is the stretch: `3.2` on computers, `2.3` on phones. Use `1` for normal letters, or a smaller number such as `2.6` for less stretch.
- **When things happen:** in `js/about.js`, in the function `draw`, the pairs of numbers such as `seg(p, .22, .58)` say when an effect starts and ends (0 = top of the scene, 1 = its end).
