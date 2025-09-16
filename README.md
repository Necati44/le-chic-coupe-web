# Le Chic Coupé — Site Démo (Next.js App Router)

Un **vrai site** côté client pour la démo Bloc 3 : accueil, services, réservation, profil, et **mini back-office** (dispos + rdv).  
Pensé pour se brancher sur ton **API NestJS** avec **Firebase Auth**.

## Contenu
- Pages publiques : Accueil (services), Réservation (assistant 3 étapes)
- Espace client : Connexion, Profil (édition nom/téléphone), Mes rendez-vous
- Back-office (léger) : Dispos *bulk upsert*, Liste RDV du salon
- Thème : **bleu clair** (cohérent PPT Bloc 1)
- Auth : **Firebase** (email/pwd + Google) ; bouton "Use Auth Emulator" dans la nav

## Installation rapide

1) Dépendances (si pas déjà) :
```bash
npm i firebase
```

2) Copie **app/**, **components/**, **lib/** dans ton projet Next.js (App Router).  
Si tu as déjà un layout/globals.css, merge-les (les variables du thème sont en tête).

3) Variables d'environnement (`.env.local`) :
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=XXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=XXXX.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=le-chic-coupe
NEXT_PUBLIC_FIREBASE_APP_ID=1:XXXX:web:YYYY
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXX   # optionnel
```

4) Lance
```bash
npm run dev
```

5) URLs
- `/` Accueil + services
- `/book` Réservation guidée
- `/signin` Connexion
- `/profile` Mon profil + mes rendez-vous
- `/admin` Mini back-office (nécessite rôle staff/owner via `/me`)

## Hypothèses d'API (adaptables dans le code)
- `GET /services` → `[ { id, name, durationMinutes, price, description } ]`
- `GET /staff` → `[ { id, name, role } ]`
- `GET /staff-availabilities?staffId=...` → `[ { weekday: 'MON'|'TUE'|..., start: '09:00', end: '12:00' } ]`
- `GET /appointments?me=1` → rdv de l'utilisateur connecté
- `GET /appointments?staffId=...&date=YYYY-MM-DD` → rdv du staff sur le jour (pour bloquer les créneaux)
- `POST /appointments` → crée un RDV
- `GET /me` → `{ uid, name, email, phone, role: 'owner'|'staff'|'customer' }`
- `PUT /me` → mise à jour profil
- `POST /staff-availabilities/bulk-upsert` → admin/staff

> Si tes endpoints diffèrent, adapte rapidement dans `components/*` (chercher `ENDPOINT:`).

Bonnes démos ✂️
