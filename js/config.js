/* =====================================================================
   SITE SETTINGS — the only file you need to edit.
   =====================================================================

   1. USE_LOCAL_SAMPLE
      true  = the site shows the rows in data/sample-data.js (used by the Claude preview,
              which is not allowed to read Google).
      false = the site reads your Google Sheet using the links below. This is what the
              live site on GitHub uses (see js/config.live.js and DEPLOY.md).

   2. SHEET_URLS
      In Google Sheets: File > Share > Publish to web > choose a tab > choose
      "Comma-separated values (.csv)" > Publish. Copy the link and paste it
      between the quotes for that tab. Repeat for each tab.
      A link looks like this:
      https://docs.google.com/spreadsheets/d/e/<PUBLISH_ID>/pub?gid=<TAB_GID>&single=true&output=csv
*/
window.CONFIG = {
  USE_LOCAL_SAMPLE: false,

  SHEET_URLS: {
    About: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=148563132&single=true&output=csv',
    Projects: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=1183026755&single=true&output=csv',
    Articles: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=84644782&single=true&output=csv',
    Research: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=411551971&single=true&output=csv',
    Certificates: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=771820499&single=true&output=csv',
    Experience: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=31657386&single=true&output=csv',
    Skills: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=1255811957&single=true&output=csv',
    Testimonials: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=727165092&single=true&output=csv',
    Gallery: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKFjqXjWGj0iNFoZgJjZn4poByoC3xEOxD5twkg5fwikY2FenYXD_1YChMNcWybA/pub?gid=469329136&single=true&output=csv'
  },

  // Contact form endpoint from Formspree, e.g. 'https://formspree.io/f/xxxxxxx' (see DEPLOY.md step 6).
  // Leave empty until then: the form will say it is not switched on yet.
  CONTACT_FORM_URL: '',

  // Your portrait on the About page, moving with the visitor's mouse.
  //   mode: 'photo'   = your cut-out photo (transparent background) tilts in 3D toward the cursor.
  //                     Put the file in assets/ and set photo below. A .png with the same name is used if the .webp fails.
  //   mode: 'frames'  = 10-12 of your own cut-out photos turning your head, e.g. frames: ['assets/face/01.webp', ... ]
  //                     (first = turned to the viewer's left, middle = straight ahead, last = turned to the right)
  //   mode: 'video'   = your own head-turn video, e.g. video: 'assets/face.mp4'
  //   mode: 'avatar'  = the illustrated avatar drawn in code (below). Nothing to upload.
  //   mode: ''        = off (a plain silhouette shows instead)
  //   move: false     = the portrait stays still (no tilting or turning). true = it follows the mouse.
  //   The same photo is also used on the Home page.
  HEAD_TURN: {
    mode: 'photo',
    move: false,
    photo: 'assets/me.webp',
    video: '',
    frames: []
  },

  // The avatar's look. Colours are #rrggbb. Change them to match you, then reload.
  AVATAR: {
    skin: '#D9A27A',    // skin tone
    hair: '#1F1612',    // hair and eyebrows
    eyes: '#4A2E1F',    // iris colour
    blazer: '#25406B',  // jacket
    tie: '#C9A24B',     // tie
    glasses: false      // true = round dark glasses
  }
};
