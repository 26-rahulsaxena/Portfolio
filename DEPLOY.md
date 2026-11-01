# Launch guide: putting your portfolio online

Follow the steps in order. Each step says what you should see. Plan about an hour for steps 1-2.

## 1. Put the site online

Your sheet is already connected: the `js/config.js` inside `portfolio-site.zip` holds your nine published links and `USE_LOCAL_SAMPLE: false`.

1. **Unzip** `portfolio-site.zip` on your computer. You get a folder `portfolio-site` with `index.html`, `404.html`, `css`, `js`, `data`, `assets` and a few small files inside.
2. Go to [github.com](https://github.com) and sign in.
3. Click **+** (top right) > **New repository**. Name it `portfolio`, choose **Public**, tick **Add a README file**, click **Create repository**.
   *You see your new repository with one file, README.md.*
4. Click **Add file > Upload files**. Open the unzipped `portfolio-site` folder, select **everything inside it** (not the folder itself, and not the zip) and drag it onto the page. Then click **Commit changes**.
   - `index.html` must sit at the top of the repository, next to README.md, not inside a sub-folder.
   - Your computer may hide files whose names start with a dot, such as `.nojekyll`. If it is missing after uploading, click **Add file > Create new file**, type `.nojekyll` as the name, leave it empty and commit.
   - When GitHub asks to replace the existing `README.md`, say yes.
5. Click **Settings** (top of the repository) > **Pages** (left menu). Under **Build and deployment**, set **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, click **Save**.
6. Wait one to two minutes and refresh the Settings > Pages screen. A box appears: **"Your site is live at https://&lt;username&gt;.github.io/portfolio/"**. Open it.
   *You see your name, your three numbers, your two projects and your newest article under Featured work.* Click Home, Projects, a project, About, Gallery and Contact.
   *Not working?* If the page looks unstyled, the files went into a sub-folder (see Troubleshooting). If you see a 404, wait another minute.

## 2. Your Google Sheet

- The site reads the sheet each time someone opens it. A change in the sheet shows up within about five minutes (Google and the browser both keep a copy for a few minutes). Hard refresh to check sooner: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac).
- Only rows with `Show` = `Yes` appear. The yellow example rows stay hidden because their `Show` is `No`.
- If you add a new tab or "unpublish" one, publish it again: **File > Share > Publish to web**, choose the tab and **Comma-separated values (.csv)**, and paste the link into `js/config.js` on GitHub (pencil icon, then **Commit changes**).

## 3. Add your real content

- **Photo:** your portrait is `assets/me.webp` (set in `HEAD_TURN.photo` in `js/config.js`). To change it, upload a new cut-out to `assets/` with the same name.
- **CV:** a PDF on Drive (shared as Anyone with the link) or in `assets/`, then paste it into `Resume Link`.
- **About tab:** fill Headline, Open To, Positioning Statement, Bio, Email, LinkedIn, Newsletter Link, Stat 1-3 and the rest (see "About tab fields" in `README.md`). Replace the hint texts too (any value starting with "e.g." is treated as blank).
- **Your work:** add rows to Research, Projects and Articles with `Show` = `Yes`. Set `Featured` = `Yes` on your best three. **At least five Research rows** turn on the research ticker. Dates are best as `yyyy-mm-dd`.

## 4. Updating the site later

When a chat gives you changed files, upload only those (Add file > Upload files, into the same folder, then Commit). If one of them is `config.js`, make sure it says `USE_LOCAL_SAMPLE: false`: the copy used by the Claude preview says `true` and would make your site show the preview's saved copy of your sheet instead of the live one.

## 5. About page

The About page opens with a scroll scene using your photo from `assets/me.webp`. To change its headline, add the optional rows `Hero Line 1`, `Hero Line 2` and `Hero Subline` to the About tab (see "About page scroll design" in `README.md`).

## 6. Connect the contact form (free, no code)

1. Create a free account at [formspree.io](https://formspree.io) and create a new form.
2. Copy the form's endpoint. It looks like `https://formspree.io/f/xxxxxxx`.
3. Paste it between the quotes of `CONTACT_FORM_URL` in `js/config.js` and commit.
4. On your live site, send yourself a test message from the Contact page and check it arrives. Formspree may ask you to confirm your email address the first time; look for its email in your inbox (and spam folder).

Check the free plan limits on Formspree's site. No password or key goes into the code: the endpoint address is the only setting.

## 7. Adding new work later (the everyday routine)

1. Upload the file (PDF, Excel model, image) to Google Drive and share it as **Anyone with the link**.
2. Add one row to the right tab in your Google Sheet and paste the Drive link into the link column.
3. Set `Show` = `Yes` (and `Featured` = `Yes` to put it on Home).
4. Wait a few minutes and refresh your site.

## 8. Optional later

- **Custom domain:** you can buy a domain and point it at GitHub Pages (Settings > Pages > Custom domain). GitHub's help pages explain the steps; it is not needed to go live.
- **Share it:** add the link to your LinkedIn profile (Contact info > Website) and your CV.

## 9. Troubleshooting

| What you see | What to do |
|---|---|
| Page is blank, or "Content is loading slowly. Please refresh." | Check each link in `js/config.js` is a published **CSV** link and sits between quotes. Reload. |
| A project doesn't show | Check `Show` = `Yes`, the date is `yyyy-mm-dd`, it is in the right tab, and the tab names were not renamed. |
| A Drive image or file doesn't show | In Drive, set sharing to **Anyone with the link**. |
| Sheet changes don't appear | Wait five minutes, then hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on Mac). Make sure the link you pasted is the CSV one. |
| The form says "not switched on yet" | `CONTACT_FORM_URL` in `js/config.js` is empty. Do step 6. |
| Sheet changes never appear, even after 10 minutes | `USE_LOCAL_SAMPLE` is `true` in `js/config.js` (the preview copy was uploaded). On GitHub, open `js/config.js`, click the pencil, change `true` to `false`, commit. |
| Gallery photos are grey tiles | That Drive photo is not shared publicly. In Drive: right-click > Share > **Anyone with the link** (Viewer). |
| A section is missing (Experience, Skills, Certificates, Testimonials, the research ticker) | It has no rows with `Show` = `Yes` yet, so it hides on purpose. Add rows in that tab. The ticker needs five Research rows. |
| A page looks unstyled (plain text, no colours) | The files were uploaded inside a sub-folder. Move them so `index.html`, `css` and `js` sit at the top of the repository. |
| The 404 page looks unstyled for a long, deep wrong address | Nothing to do. It happens for addresses like `/portfolio/a/b` because the 404 page uses relative links; it is cosmetic. |

## 10. Pre-launch checklist

- [ ] Real tagline (Headline) and "Open To" in the About tab
- [ ] Photo shows on Home and About
- [ ] CV downloads from the header button
- [ ] Email, LinkedIn and Newsletter Link filled in the About tab
- [ ] At least five real Research rows (the ticker appears)
- [ ] The Gallery shows your own event photos
- [ ] A test message from the Contact form arrived
- [ ] Every page checked on your phone
