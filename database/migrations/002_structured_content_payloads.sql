ALTER TABLE clubs
  ADD COLUMN content_data JSON NULL;

ALTER TABLE achievements
  ADD COLUMN content_data JSON NULL;

ALTER TABLE performance_stats
  MODIFY COLUMN label_ar VARCHAR(150) NULL,
  MODIFY COLUMN label_en VARCHAR(150) NULL,
  MODIFY COLUMN value VARCHAR(100) NULL,
  ADD COLUMN content_data JSON NULL;

ALTER TABLE videos
  ADD COLUMN content_data JSON NULL;
