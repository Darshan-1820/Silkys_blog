// The menu of section kinds Silky can add, with their design variants and
// starting data. Keep labels warm + non-technical.
export const SECTION_TYPES = {
  featured:   { label: 'featured story + radio', hint: 'a big hero up top with a playable song', designs: [['hero', 'hero']] },
  story_wall: { label: 'story wall', hint: 'a grid of your written pieces', designs: [['wall', 'the wall']] },
  books:      { label: "books i'm reading", hint: 'covers or a list of books', designs: [['covers', 'covers'], ['list', 'simple list']] },
  music:      { label: 'music / playlist', hint: 'top songs + an Apple/Spotify playlist', designs: [['cards', 'cards']] },
  gallery:    { label: 'art & photo wall', hint: 'a gallery of images with captions', designs: [['polaroid', 'polaroids'], ['strip', 'film strip']] },
  venting:    { label: 'venting / diary', hint: 'add short dated entries, each with a mood', designs: [['feed', 'feed']] },
  quote:      { label: 'a big quote', hint: 'one line, front and centre', designs: [['quote', 'quote']] },
};

export const TYPE_ORDER = ['featured', 'story_wall', 'books', 'music', 'gallery', 'venting', 'quote'];

// Default data + heading when a new section is created.
export function blankSection(type) {
  switch (type) {
    case 'featured':
      return { heading: '', subhead: 'featured · this week', design: 'hero',
        data: { mode: 'auto', postId: null, song: '', songUrl: '', lyrics: ['', '', ''] } };
    case 'story_wall':
      return { heading: 'the wall', subhead: '', design: 'wall', data: {} };
    case 'books':
      return { heading: "what i'm reading", subhead: '', design: 'covers', data: { items: [] } };
    case 'music':
      return { heading: 'on repeat', subhead: '', design: 'cards', data: { items: [], playlistUrl: '' } };
    case 'gallery':
      return { heading: 'a little gallery', subhead: '', design: 'polaroid', data: { items: [] } };
    case 'venting':
      return { heading: 'venting place', subhead: '', design: 'feed', data: { entries: [] } };
    case 'quote':
      return { heading: '', subhead: '', design: 'quote', data: { quote: '', by: '' } };
    default:
      return { heading: '', subhead: '', design: '', data: {} };
  }
}
