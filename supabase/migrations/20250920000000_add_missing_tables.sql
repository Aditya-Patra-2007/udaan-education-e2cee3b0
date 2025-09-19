-- Create missing tables for the educational platform

-- Create matchmaking queue table
CREATE TABLE public.matchmaking_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('comprehension', 'spellbee')),
  skill_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE(player_id, game_mode)
);

-- Create reading passages table
CREATE TABLE public.reading_passages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  subject TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create comprehension questions table
CREATE TABLE public.comprehension_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 1 AND 4),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create spelling words table
CREATE TABLE public.spelling_words (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  subject_category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security for new tables
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprehension_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spelling_words ENABLE ROW LEVEL SECURITY;

-- Matchmaking queue policies
CREATE POLICY "Users can view all queue entries" ON public.matchmaking_queue FOR SELECT USING (true);
CREATE POLICY "Users can manage their own queue entries" ON public.matchmaking_queue FOR ALL USING (auth.uid() = player_id);

-- Reading passages policies (read-only for users)
CREATE POLICY "Users can view active reading passages" ON public.reading_passages FOR SELECT USING (is_active = true);

-- Comprehension questions policies (read-only for users)
CREATE POLICY "Users can view comprehension questions" ON public.comprehension_questions FOR SELECT USING (true);

-- Spelling words policies (read-only for users)
CREATE POLICY "Users can view active spelling words" ON public.spelling_words FOR SELECT USING (is_active = true);

-- Insert sample data for reading passages
INSERT INTO public.reading_passages (title, content, difficulty_level, subject, grade_level) VALUES
('The Solar System', 'The solar system consists of the Sun and everything that orbits around it, including planets, moons, asteroids, and comets. There are eight planets in our solar system: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. The Sun is a star that provides light and heat to all the planets. Earth is the third planet from the Sun and the only known planet that supports life.', 'easy', 'Science', 3),
('The Water Cycle', 'The water cycle is the continuous movement of water on, above, and below the surface of Earth. Water evaporates from oceans, lakes, and rivers due to heat from the Sun. This water vapor rises into the atmosphere where it cools and condenses to form clouds. When the water droplets in clouds become too heavy, they fall as precipitation - rain, snow, or hail. This precipitation collects in bodies of water and the cycle begins again.', 'medium', 'Science', 4),
('Ancient Egypt', 'Ancient Egypt was one of the greatest civilizations in human history. It flourished along the Nile River for over 3,000 years. The ancient Egyptians built magnificent pyramids as tombs for their pharaohs. They also developed hieroglyphics, a system of writing using pictures and symbols. The Nile River was crucial to Egyptian civilization because it provided water for drinking, farming, and transportation. Every year, the Nile would flood, leaving behind rich, fertile soil perfect for growing crops.', 'hard', 'History', 6);

-- Insert sample comprehension questions
INSERT INTO public.comprehension_questions (passage_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
((SELECT id FROM public.reading_passages WHERE title = 'The Solar System'), 'How many planets are in our solar system?', 'Seven', 'Eight', 'Nine', 'Ten', 2, 'There are eight planets in our solar system as stated in the passage.'),
((SELECT id FROM public.reading_passages WHERE title = 'The Solar System'), 'What is the Sun?', 'A planet', 'A moon', 'A star', 'An asteroid', 3, 'The passage states that the Sun is a star that provides light and heat.'),
((SELECT id FROM public.reading_passages WHERE title = 'The Water Cycle'), 'What causes water to evaporate?', 'Wind', 'Heat from the Sun', 'Cold temperatures', 'Gravity', 2, 'The passage mentions that water evaporates due to heat from the Sun.'),
((SELECT id FROM public.reading_passages WHERE title = 'The Water Cycle'), 'What happens when water vapor cools in the atmosphere?', 'It falls as rain', 'It condenses to form clouds', 'It evaporates', 'It freezes immediately', 2, 'The passage explains that water vapor cools and condenses to form clouds.'),
((SELECT id FROM public.reading_passages WHERE title = 'Ancient Egypt'), 'How long did Ancient Egyptian civilization flourish?', 'Over 1,000 years', 'Over 2,000 years', 'Over 3,000 years', 'Over 4,000 years', 3, 'The passage states that Ancient Egypt flourished for over 3,000 years.'),
((SELECT id FROM public.reading_passages WHERE title = 'Ancient Egypt'), 'Why was the Nile River crucial to Egyptian civilization?', 'It was deep', 'It provided water for drinking, farming, and transportation', 'It was the longest river', 'It connected to the ocean', 2, 'The passage explains the Nile provided water for drinking, farming, and transportation.');

-- Insert sample spelling words
INSERT INTO public.spelling_words (word, definition, difficulty_level, subject_category) VALUES
('butterfly', 'A flying insect with colorful wings', 'easy', 'Science'),
('elephant', 'A large gray mammal with a trunk', 'easy', 'Science'),
('rainbow', 'Colorful arc in the sky after rain', 'easy', 'Science'),
('telescope', 'An instrument used to see distant objects', 'medium', 'Science'),
('democracy', 'A form of government by the people', 'medium', 'Social Studies'),
('ecosystem', 'A community of living and non-living things', 'medium', 'Science'),
('photosynthesis', 'The process plants use to make food from sunlight', 'hard', 'Science'),
('archaeology', 'The study of ancient human artifacts', 'hard', 'Social Studies'),
('metamorphosis', 'The process of transformation in animals', 'hard', 'Science');