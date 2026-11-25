-- ============================================
-- AUDITORE - Supabase Database Schema
-- ============================================
-- Выполните этот SQL в Supabase SQL Editor
-- ============================================

-- Таблица учителей
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица песен
CREATE TABLE songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  cover_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  lyrics_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица учеников
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица результатов
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  gap_answers JSONB NOT NULL,
  translations JSONB NOT NULL,
  total_gaps INTEGER NOT NULL,
  correct_gaps INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица уникальных ссылок для учеников
CREATE TABLE class_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  link_code TEXT UNIQUE NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_songs_teacher ON songs(teacher_id);
CREATE INDEX idx_students_teacher ON students(teacher_id);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_song ON results(song_id);
CREATE INDEX idx_class_links_code ON class_links(link_code);

-- ============================================
-- Включаем Row Level Security (RLS)
-- ============================================

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Политики безопасности
-- ============================================

-- Учителя могут видеть только свои данные
CREATE POLICY "Teachers can view own data" ON teachers
  FOR SELECT USING (auth.uid() = id);

-- Учителя могут обновлять свои данные
CREATE POLICY "Teachers can update own data" ON teachers
  FOR UPDATE USING (auth.uid() = id);

-- Учителя могут управлять своими песнями
CREATE POLICY "Teachers can manage own songs" ON songs
  FOR ALL USING (teacher_id = auth.uid());

-- Учителя могут управлять своими учениками
CREATE POLICY "Teachers can manage own students" ON students
  FOR ALL USING (teacher_id = auth.uid());

-- Учителя могут видеть результаты своих учеников
CREATE POLICY "Teachers can view own results" ON results
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE teacher_id = auth.uid()
    )
  );

-- Учителя могут управлять своими ссылками
CREATE POLICY "Teachers can manage own links" ON class_links
  FOR ALL USING (teacher_id = auth.uid());

-- Публичный доступ для чтения ссылок (ученики)
CREATE POLICY "Anyone can read class links" ON class_links
  FOR SELECT USING (true);

-- Публичный доступ для чтения песен (ученики)
CREATE POLICY "Anyone can read songs" ON songs
  FOR SELECT USING (true);

-- Ученики могут добавлять результаты
CREATE POLICY "Students can insert results" ON results
  FOR INSERT WITH CHECK (true);

-- Ученики могут добавлять себя в таблицу students
CREATE POLICY "Students can insert themselves" ON students
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Функция для автоматического создания учителя
-- при регистрации через Supabase Auth
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teachers (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания учителя
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Готово! База данных настроена.
-- ============================================
