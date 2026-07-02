-- Default homepage: reproduces the current look as editable sections.
INSERT INTO sections (type, heading, subhead, design, data, sort_order, status) VALUES
('featured', '', 'featured · this week', 'hero',
 '{"mode":"auto","song":"TV Girl — Blue Hair","songUrl":"https://www.youtube.com/watch?v=YQHsXMglC9A","lyrics":["moonlit nights","strangely empty","no answer"]}',
 10, 'published'),
('story_wall', 'the wall', '', 'wall', '{}', 20, 'published'),
('quote', '', '', 'quote',
 '{"quote":"If I was the moon, would you still look for the stars?","by":"from the margins of an old notebook"}',
 30, 'published');
