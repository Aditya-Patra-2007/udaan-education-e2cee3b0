import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  difficulty_level: string;
  subject: string;
  grade_level: number;
  created_at: string;
  questions?: ComprehensionQuestion[];
}

export interface ComprehensionQuestion {
  id: string;
  passage_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number;
  explanation?: string;
}

export interface SpellingWord {
  id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  difficulty_level: string;
  grade_level?: number;
  subject_category: string;
  example_sentence?: string;
}

export const useContent = () => {
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [spellingWords, setSpellingWords] = useState<SpellingWord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch reading passages with questions
  const fetchPassages = async (difficulty?: string, subject?: string) => {
    try {
      let query = supabase
        .from('reading_passages')
        .select(`
          *,
          questions:comprehension_questions(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }
      if (subject) {
        query = query.eq('subject', subject);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPassages(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching passages:', error);
      return [];
    }
  };

  // Fetch spelling words
  const fetchSpellingWords = async (difficulty?: string, category?: string) => {
    try {
      let query = supabase
        .from('spelling_words')
        .select('*')
        .eq('is_active', true)
        .order('word', { ascending: true });

      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }
      if (category) {
        query = query.eq('subject_category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      setSpellingWords(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching spelling words:', error);
      return [];
    }
  };

  // Get random passage for comprehension battle
  const getRandomPassage = async (difficulty?: string): Promise<ReadingPassage | null> => {
    try {
      const availablePassages = await fetchPassages(difficulty);
      if (availablePassages.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * availablePassages.length);
      return availablePassages[randomIndex];
    } catch (error) {
      console.error('Error getting random passage:', error);
      return null;
    }
  };

  // Get random spelling words for spelling bee
  const getRandomSpellingWords = async (
    count: number = 8, 
    difficulty?: string
  ): Promise<SpellingWord[]> => {
    try {
      const availableWords = await fetchSpellingWords(difficulty);
      if (availableWords.length === 0) return [];

      // Shuffle and take requested count
      const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    } catch (error) {
      console.error('Error getting random spelling words:', error);
      return [];
    }
  };

  // Get questions for a specific passage
  const getQuestionsForPassage = async (passageId: string): Promise<ComprehensionQuestion[]> => {
    try {
      const { data, error } = await supabase
        .from('comprehension_questions')
        .select('*')
        .eq('passage_id', passageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  };

  // Add new reading passage (admin/content creator function)
  const addPassage = async (passage: Omit<ReadingPassage, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reading_passages')
        .insert(passage)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh passages list
      await fetchPassages();
      return data;
    } catch (error) {
      console.error('Error adding passage:', error);
      throw error;
    }
  };

  // Add new spelling word (admin/content creator function)
  const addSpellingWord = async (word: Omit<SpellingWord, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('spelling_words')
        .insert(word)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh spelling words list
      await fetchSpellingWords();
      return data;
    } catch (error) {
      console.error('Error adding spelling word:', error);
      throw error;
    }
  };

  // Add questions to a passage
  const addQuestionsToPassage = async (
    passageId: string, 
    questions: Omit<ComprehensionQuestion, 'id' | 'passage_id'>[]
  ) => {
    try {
      const questionsWithPassageId = questions.map(q => ({
        ...q,
        passage_id: passageId,
      }));

      const { data, error } = await supabase
        .from('comprehension_questions')
        .insert(questionsWithPassageId)
        .select();

      if (error) throw error;
      
      // Refresh passages to include new questions
      await fetchPassages();
      return data;
    } catch (error) {
      console.error('Error adding questions:', error);
      throw error;
    }
  };

  // Get content statistics
  const getContentStats = async () => {
    try {
      const [passagesResult, wordsResult, questionsResult] = await Promise.all([
        supabase.from('reading_passages').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('spelling_words').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('comprehension_questions').select('id', { count: 'exact' }),
      ]);

      return {
        totalPassages: passagesResult.count || 0,
        totalSpellingWords: wordsResult.count || 0,
        totalQuestions: questionsResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching content stats:', error);
      return {
        totalPassages: 0,
        totalSpellingWords: 0,
        totalQuestions: 0,
      };
    }
  };

  // Load initial content
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      await Promise.all([
        fetchPassages(),
        fetchSpellingWords(),
      ]);
      setLoading(false);
    };

    loadContent();
  }, []);

  return {
    passages,
    spellingWords,
    loading,
    fetchPassages,
    fetchSpellingWords,
    getRandomPassage,
    getRandomSpellingWords,
    getQuestionsForPassage,
    addPassage,
    addSpellingWord,
    addQuestionsToPassage,
    getContentStats,
  };
};