-- Add a playable song link (Spotify or YouTube) per post.
ALTER TABLE posts ADD COLUMN song_url TEXT;
