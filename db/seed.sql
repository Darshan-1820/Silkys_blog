-- Sample content so the design has something to render locally.
INSERT OR IGNORE INTO posts (slug, title, section, excerpt, body_html, song, doodle, featured, status, published_at)
VALUES
('moonlit-nights', 'moonlit nights, strangely empty',
 'diary', 'a note written at 2am when the house was too quiet and the moon too loud.',
 '<p>The moon was doing that thing again — hanging low and pretending it wasn''t watching. I made tea I didn''t drink.</p><p>Some nights are just for sitting with the quiet. This was one of them.</p>',
 'TV Girl — Blue Hair', 'moon', 1, 'published', datetime('now')),
('the-corner-shop', 'the man at the corner shop',
 'incident', 'he never remembers my name but always remembers my order. today that felt like enough.',
 '<p>Two rupees short and he waved it off like it was nothing. Maybe it was. Maybe it wasn''t.</p>',
 '', 'star', 0, 'published', datetime('now', '-2 days'));
