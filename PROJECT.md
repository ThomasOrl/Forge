
## Fonctionnalités livrées

Authentification (inscription, connexion et réinitialisation du mot de passe), isolation des
données utilisateur via Supabase RLS, dashboard avec statistiques, création et suivi de
séances, bibliothèque d'exercices, historique détaillé, progression avec graphiques, profil,
objectifs et assistant Forge AI. L'interface est disponible en français, anglais, espagnol et
italien, avec un thème clair/sombre et une navigation responsive. La page `/preview` présente
une démonstration sans compte avec des données fictives.

## Configuration locale

1. Copier `.env.example` vers `.env`.
2. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` depuis les paramètres API du
   projet Supabase.
3. Installer les dépendances avec `npm install`, puis lancer `npm run dev`.

La clé `anon`/publishable est destinée au client et ne remplace pas les politiques RLS. Ne
jamais placer une clé `service_role` ou un secret serveur dans une variable `VITE_*`.
