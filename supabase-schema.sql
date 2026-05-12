-- ============================================
-- L'Académie Moderne — Supabase Schema
-- Run this entirely in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT, email TEXT, niveau_estime TEXT DEFAULT 'A2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- MODULES
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titre TEXT NOT NULL, description TEXT,
  categorie TEXT CHECK (categorie IN ('Grammaire', 'Vocabulaire', 'Culture', 'Méthodologie')) NOT NULL,
  chapitre TEXT, duree_minutes INTEGER DEFAULT 15, contenu JSONB, ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_MODULE_PROGRESS
CREATE TABLE IF NOT EXISTS user_module_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  statut TEXT CHECK (statut IN ('non_commence','en_cours','complete')) DEFAULT 'non_commence',
  score INTEGER, completed_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- SOUMISSIONS
CREATE TABLE IF NOT EXISTS soumissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  titre TEXT, prompt_texte TEXT, texte_soumis TEXT NOT NULL, mot_count INTEGER,
  statut TEXT CHECK (statut IN ('brouillon','soumis','corrige')) DEFAULT 'brouillon',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CORRECTIONS
CREATE TABLE IF NOT EXISTS corrections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  soumission_id UUID REFERENCES soumissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  note_globale NUMERIC(4,1), note_max NUMERIC(4,1) DEFAULT 15,
  niveau_cefr TEXT, erreurs JSONB DEFAULT '[]',
  resume_feedback TEXT, texte_annote TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXERCICES
CREATE TABLE IF NOT EXISTS exercices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  categorie TEXT CHECK (categorie IN ('syntaxe','grammaire','orthographe','vocabulaire')) NOT NULL,
  phrase TEXT NOT NULL, mots JSONB NOT NULL, mot_erreur_index INTEGER,
  explication TEXT, correction TEXT, ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_EXERCICE_RESULTS
CREATE TABLE IF NOT EXISTS user_exercice_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercice_id UUID REFERENCES exercices(id) ON DELETE CASCADE NOT NULL,
  reponse_correcte BOOLEAN NOT NULL, temps_reponse_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONVERSATIONS_COACH
CREATE TABLE IF NOT EXISTS conversations_coach (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sujet TEXT NOT NULL, messages JSONB DEFAULT '[]',
  statut TEXT CHECK (statut IN ('en_cours','termine')) DEFAULT 'en_cours',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMPETENCES
CREATE TABLE IF NOT EXISTS competences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lexique INTEGER DEFAULT 50, syntaxe INTEGER DEFAULT 50, cohesion INTEGER DEFAULT 50,
  orthographe INTEGER DEFAULT 50, comprehension INTEGER DEFAULT 50, fluidite INTEGER DEFAULT 50,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE soumissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercice_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations_coach ENABLE ROW LEVEL SECURITY;
ALTER TABLE competences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own progress" ON user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_module_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Modules are publicly readable" ON modules FOR SELECT USING (true);
CREATE POLICY "Users can view own soumissions" ON soumissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own soumissions" ON soumissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own soumissions" ON soumissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own corrections" ON corrections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own corrections" ON corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Exercices are publicly readable" ON exercices FOR SELECT USING (true);
CREATE POLICY "Users can view own results" ON user_exercice_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON user_exercice_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own conversations" ON conversations_coach FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations_coach FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations_coach FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own competences" ON competences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own competences" ON competences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own competences" ON competences FOR UPDATE USING (auth.uid() = user_id);

-- SEED — Modules
INSERT INTO modules (titre, description, categorie, chapitre, duree_minutes, ordre) VALUES
  ('L''Accord du Participe Passé', 'Maîtrisez les règles d''accord avec être et avoir.', 'Grammaire', 'Chapitre I', 15, 1),
  ('Le Subjonctif Présent', 'Obligations, doutes et émotions au subjonctif.', 'Grammaire', 'Chapitre II', 20, 2),
  ('Les Pronoms Relatifs', 'Qui, que, dont, où : relier les idées avec fluidité.', 'Grammaire', 'Chapitre III', 12, 3),
  ('La Concordance des Temps', 'Aligner correctement les temps dans des phrases complexes.', 'Grammaire', 'Chapitre IV', 25, 4),
  ('Le Conditionnel', 'Hypothèse, politesse et souhait.', 'Grammaire', 'Chapitre V', 18, 5),
  ('Vocabulaire des Institutions', 'Termes essentiels sur la vie civique française.', 'Vocabulaire', 'Chapitre I', 20, 1),
  ('Connecteurs Logiques', 'Articuler vos idées avec précision.', 'Vocabulaire', 'Chapitre II', 15, 2),
  ('La République Française', 'Histoire, valeurs et institutions de la France.', 'Culture', 'Chapitre I', 30, 1),
  ('Vivre en France', 'Codes sociaux, coutumes et vie quotidienne.', 'Culture', 'Chapitre II', 25, 2),
  ('Méthodologie Expression Écrite', 'Structure et techniques pour l''expression écrite du TEF.', 'Méthodologie', 'Chapitre I', 20, 1);

-- SEED — Exercices
INSERT INTO exercices (categorie, phrase, mots, mot_erreur_index, explication, correction, ordre) VALUES
  ('syntaxe', 'Bien qu''il soit fatigué, il a décider de continuer.', '["Bien","qu''il","soit","fatigué,","il","a","décider","de","continuer."]', 6, 'Après un auxiliaire, le verbe doit être au participe passé. La forme correcte est « décidé ».', 'décidé', 1),
  ('grammaire', 'Elle est allé au marché ce matin avec ses amis.', '["Elle","est","allé","au","marché","ce","matin","avec","ses","amis."]', 2, 'Le participe passé s''accorde avec le sujet féminin avec l''auxiliaire être. On écrit « allée ».', 'allée', 2),
  ('orthographe', 'Il y avait beaucoups de monde dans la salle.', '["Il","y","avait","beaucoups","de","monde","dans","la","salle."]', 3, '« Beaucoup » est un adverbe invariable, il ne prend jamais de ''s'' final.', 'beaucoup', 3),
  ('grammaire', 'Je me souviens du jour où j''ai rencontré tu.', '["Je","me","souviens","du","jour","où","j''ai","rencontré","tu."]', 8, 'Après un verbe transitif, on utilise le pronom tonique « toi » et non le pronom sujet « tu ».', 'toi', 4),
  ('orthographe', 'Les étudiants ce sont retrouvés devant la bibliothèque.', '["Les","étudiants","ce","sont","retrouvés","devant","la","bibliothèque."]', 2, 'Il faut utiliser le pronom réfléchi « se » (pas le démonstratif « ce »). Verbe pronominal : « se sont retrouvés ».', 'se', 5),
  ('syntaxe', 'Depuis qu''il habite en France, il s''est fait beaucoup des amis.', '["Depuis","qu''il","habite","en","France,","il","s''est","fait","beaucoup","des","amis."]', 9, 'L''expression correcte est « beaucoup d''amis » et non « beaucoup des amis ». L''article partitif ne s''utilise pas ici.', 'd''amis.', 6);
