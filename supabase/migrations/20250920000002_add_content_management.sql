-- Content management tables for educational content
CREATE TABLE public.reading_passages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  subject TEXT NOT NULL,
  grade_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (id)
);

CREATE TABLE public.comprehension_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE public.spelling_words (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  pronunciation TEXT,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  grade_level INTEGER,
  subject_category TEXT DEFAULT 'general',
  example_sentence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.reading_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprehension_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spelling_words ENABLE ROW LEVEL SECURITY;

-- Policies for reading passages
CREATE POLICY "Anyone can view active passages" ON public.reading_passages FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create passages" ON public.reading_passages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own passages" ON public.reading_passages FOR UPDATE USING (auth.uid() = created_by);

-- Policies for comprehension questions
CREATE POLICY "Anyone can view questions for active passages" ON public.comprehension_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.reading_passages WHERE id = passage_id AND is_active = true)
);
CREATE POLICY "Authenticated users can create questions" ON public.comprehension_questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for spelling words
CREATE POLICY "Anyone can view active spelling words" ON public.spelling_words FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create spelling words" ON public.spelling_words FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Triggers for timestamps
CREATE TRIGGER update_reading_passages_updated_at
  BEFORE UPDATE ON public.reading_passages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comprehension_questions_updated_at
  BEFORE UPDATE ON public.comprehension_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spelling_words_updated_at
  BEFORE UPDATE ON public.spelling_words
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample reading passage and questions
INSERT INTO public.reading_passages (title, content, difficulty_level, subject, grade_level) VALUES
('Artificial Intelligence: The Future of Technology', 
'The concept of artificial intelligence has fascinated humanity for decades. From science fiction novels to modern technological breakthroughs, AI represents our desire to create machines that can think, learn, and problem-solve like humans.

Early AI research began in the 1950s with scientists like Alan Turing, who proposed the famous "Turing Test" as a way to measure machine intelligence. This test challenges a machine to engage in conversations indistinguishable from those of a human being.

Today, AI technologies power everything from search engines and recommendation systems to autonomous vehicles and medical diagnosis tools. Machine learning, a subset of AI, enables computers to learn from data without being explicitly programmed for every task. Deep learning, which uses neural networks inspired by the human brain, has led to remarkable advances in image recognition, natural language processing, and game playing.

However, the rapid advancement of AI also raises important questions about ethics, job displacement, and the future of human-machine interaction. As AI becomes more sophisticated, society must carefully consider how to harness its benefits while addressing potential risks and ensuring it serves humanity''s best interests.',
'medium', 'Technology', 8);

-- Get the passage ID for inserting questions
WITH passage AS (SELECT id FROM public.reading_passages WHERE title = 'Artificial Intelligence: The Future of Technology')
INSERT INTO public.comprehension_questions (passage_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
((SELECT id FROM passage), 'Who proposed the famous test to measure machine intelligence?', 'Isaac Newton', 'Alan Turing', 'Albert Einstein', 'Charles Darwin', 1, 'Alan Turing proposed the Turing Test in the 1950s as a way to measure machine intelligence.'),
((SELECT id FROM passage), 'What does machine learning enable computers to do?', 'Only follow pre-programmed instructions', 'Learn from data without explicit programming', 'Replace all human workers', 'Think exactly like humans', 1, 'Machine learning enables computers to learn from data without being explicitly programmed for every task.'),
((SELECT id FROM passage), 'What is deep learning inspired by?', 'Computer circuits', 'The human brain', 'Ocean waves', 'Mathematical equations', 1, 'Deep learning uses neural networks inspired by the human brain.'),
((SELECT id FROM passage), 'What concerns are mentioned about AI advancement?', 'Only technical limitations', 'Ethics, job displacement, and human-machine interaction', 'Only cost considerations', 'Only speed of development', 1, 'The passage mentions concerns about ethics, job displacement, and the future of human-machine interaction.'),
((SELECT id FROM passage), 'When did early AI research begin?', '1940s', '1950s', '1960s', '1970s', 1, 'According to the passage, early AI research began in the 1950s.');

-- Insert sample spelling words
INSERT INTO public.spelling_words (word, definition, pronunciation, difficulty_level, grade_level, example_sentence) VALUES
('necessary', 'Required to be done, achieved, or present; needed; essential.', 'NES-uh-ser-ee', 'medium', 6, 'It is necessary to study hard to pass the exam.'),
('mathematics', 'The abstract science of number, quantity, and space.', 'math-uh-MAT-iks', 'easy', 4, 'She excels in mathematics and enjoys solving complex problems.'),
('rhythm', 'A strong, regular, repeated pattern of movement or sound.', 'RITH-uhm', 'hard', 7, 'The drummer kept a steady rhythm throughout the song.'),
('entrepreneur', 'A person who organizes and operates a business.', 'ahn-truh-pruh-NUR', 'hard', 9, 'The young entrepreneur started her own tech company.'),
('beautiful', 'Pleasing the senses or mind aesthetically.', 'BYOO-tuh-fuhl', 'easy', 3, 'The sunset over the mountains was beautiful.'),
('definitely', 'Without doubt; certainly.', 'DEF-uh-nit-lee', 'medium', 6, 'I will definitely attend the school play tonight.'),
('conscientious', 'Wishing to do what is right, especially in work or duty.', 'kon-shee-EN-shuhs', 'hard', 10, 'She is a conscientious student who always completes her homework.'),
('immediately', 'At once; instantly.', 'ih-MEE-dee-it-lee', 'medium', 5, 'Please come to the office immediately.'),
('environment', 'The surroundings or conditions in which a person, animal, or plant lives.', 'en-VY-ruhn-muhnt', 'medium', 6, 'We must protect our environment for future generations.'),
('pronunciation', 'The way in which a word is pronounced.', 'pruh-nuhn-see-AY-shuhn', 'hard', 8, 'The teacher helped students with the pronunciation of difficult words.');