// Turn a Spotify or YouTube link into an embeddable player URL.
// Returns null if it's not a link we recognise (radio stays decorative).
export function songEmbed(url) {
  if (!url) return null;
  let u;
  try { u = new URL(url.trim()); } catch { return null; }
  const host = u.hostname.replace(/^www\./, '');

  // Spotify: /track/ID, /album/ID, /playlist/ID, /episode/ID
  if (host.endsWith('spotify.com')) {
    const parts = u.pathname.split('/').filter(Boolean);
    // handle locale prefixes like /intl-de/track/ID
    const ti = parts.findIndex((p) => ['track', 'album', 'playlist', 'episode', 'show'].includes(p));
    if (ti !== -1 && parts[ti + 1]) {
      const type = parts[ti];
      const id = parts[ti + 1].split('?')[0];
      return { kind: 'spotify', src: `https://open.spotify.com/embed/${type}/${id}`, height: type === 'track' || type === 'episode' ? 152 : 352 };
    }
    return null;
  }

  // YouTube: watch?v=ID, youtu.be/ID, /embed/ID, /shorts/ID
  if (host.endsWith('youtube.com') || host === 'youtu.be') {
    let id = '';
    if (host === 'youtu.be') id = u.pathname.slice(1);
    else if (u.searchParams.get('v')) id = u.searchParams.get('v');
    else {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts') id = parts[1] || '';
    }
    id = (id || '').split('&')[0];
    if (id) return { kind: 'youtube', src: `https://www.youtube.com/embed/${id}`, height: 152 };
    return null;
  }

  // Apple Music: any share link -> embed.music.apple.com (albums/playlists/songs)
  if (host.endsWith('music.apple.com')) {
    const embedHost = u.host.replace(/^www\./, '');
    const isPlaylist = u.pathname.includes('/playlist/') || u.pathname.includes('/album/');
    return { kind: 'apple', src: `https://embed.${embedHost}${u.pathname}${u.search}`, height: isPlaylist ? 450 : 175 };
  }

  return null;
}
