-- ============================================
-- CORRECTIF : Trigger handle_new_user
-- Coller dans Supabase SQL Editor et exécuter
-- ============================================

-- 1. Supprimer l'ancien trigger et la fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Recréer la fonction avec gestion d'erreur robuste
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, niveau_estime)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    'A2'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Ne pas bloquer la création du compte si le profil échoue
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Vérification : voir les profils existants
SELECT id, full_name, email FROM public.profiles LIMIT 5;
