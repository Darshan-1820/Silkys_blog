// ─────────────────────────────────────────────────────────────────────────
//  PER-CLIENT CONFIG — the whole visual identity + brand lives here.
//  To launch a NEW client: change the values below, swap /public/og-default.png,
//  set up their D1 + R2, deploy. No other code changes needed.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  brand: {
    name: 'moonlit',
    mark: '✷', // little glyph after the name
    tagline: 'stories, scribbled',
    description: 'short stories, incidents & reflections — scribbled by hand, read by lamplight.',
    author: 'Silky',
    footerLine: 'written by hand · read by lamplight',
    credit: 'Darshan', // studio credit in the footer
    year: '2026',
  },

  // Colours map to CSS variables. Think: pink = PRIMARY accent, blue = SECONDARY accent.
  colors: {
    day: {
      paper: '#EEE9DB', ink: '#181622', inkSoft: '#4a4654',
      pink: '#E5147B', pinkDeep: '#B30E5F', blue: '#2222C9', blueDeep: '#16168f',
      card: '#FBF8EE', tape: 'rgba(244,224,120,.55)',
    },
    night: {
      paper: '#1C1A22', ink: '#E8E3D6', inkSoft: '#A8A2B0',
      pink: '#EF85AE', pinkDeep: '#F0A0BF', blue: '#A6ABF0', blueDeep: '#BBBFF6',
      card: '#272430', tape: 'rgba(244,224,120,.18)',
    },
  },

  fonts: {
    marker: '"Caveat", cursive',       // handwritten headings
    hand: '"Gloria Hallelujah", cursive', // little labels
    sticker: '"Anton", sans-serif',    // stickers / all-caps
    body: '"Courier Prime", monospace', // body text
    grotesk: '"Space Grotesk", sans-serif',
    googleUrl:
      'https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@500;600;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Gloria+Hallelujah&family=Space+Grotesk:wght@400;500;700&display=swap',
  },

  nav: [
    { label: 'Stories', href: '/#wall' },
    { label: 'Incidents', href: '/#wall' },
    { label: 'Late nights', href: '/#wall' },
    { label: 'About', href: '/#sub' },
  ],

  // Turn whole features on/off per client.
  features: {
    nightMode: true,
    fireflies: true,
    newsletter: true,
  },

  seo: {
    locale: 'en_US',
    themeColor: '#EEE9DB',
    ogImage: '/og-default.png',
  },
};
