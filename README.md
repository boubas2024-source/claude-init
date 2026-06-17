# IMAZ — Plateforme Numérique de Souscription

**GIE HORONYA / IMAZ — L'Immobilier de A à Z — Burkina Faso**

Plateforme web de gestion des souscriptions aux offres immobilières IMAZ,
développée conformément au cahier des charges `CDC-IMAZ-PLAT-NUM-2026-V1.0`.

> ⚠️ **Aucun paiement n'est effectué en ligne.** Les frais de souscription
> sont exclusivement encaissés à l'agence physique. La plateforme assure
> l'enregistrement, le suivi et la validation administrative des dossiers.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | API Routes Next.js + Prisma ORM |
| Base de données | PostgreSQL |
| Authentification | JWT (jose) + bcrypt + 2FA (speakeasy) |
| Génération PDF | pdfmake (reçus + QR code) |
| Graphiques | Recharts |
| Validation | React Hook Form + Zod |
| Email / SMS | Nodemailer + Faso SMS (stub) |

## Charte graphique IMAZ

- **Bleu marine** `#1A3A5C` (primaire)
- **Rouille** `#C0392B` (accent)
- **Or** `#D4A017` (highlights)

## Catégories de produits

- **DJIGUI** — Unités d'Habitation Populaire (UHP)
- **DJIGUIYA** — Appartements F3/F4
- **HAKILI** — Villas standard R+1
- **HAKILI SIGUI** — Villas prestige

## Modules

### Espace Client
- Inscription avec upload CNI/CNIB + vérification OTP
- Catalogue filtrable par programme / catégorie / disponibilité
- Tunnel de souscription en 5 étapes
- Génération automatique du reçu PDF (QR code, infos client + produit)
- Tableau de bord personnel (souscriptions, statuts, reçus)

### Back-office Promoteur
- Tableau de bord KPIs (commerciaux + financiers, graphiques)
- Liste des souscripteurs avec filtres et export Excel/CSV
- Module guichet : validation des paiements physiques
- Gestion du catalogue (CRUD programmes / produits / stocks)
- Rapports et statistiques
- Gestion des utilisateurs et des rôles
- 3 rôles : `SUPER_ADMIN` / `RESPONSABLE_PROGRAMME` / `AGENT_ACCUEIL`

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local (DATABASE_URL, JWT_SECRET, SMTP, etc.)

# 3. Initialiser la base de données
npx prisma migrate dev
npm run db:seed

# 4. Lancer en développement
npm run dev
```

L'application est disponible sur http://localhost:3000

## Comptes de démonstration (après seed)

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| Super Admin (back-office) | `admin@imaz.bf` | `Admin2024!` |

## Scripts disponibles

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — serveur de production
- `npm run db:migrate` — migrations Prisma
- `npm run db:seed` — données de démonstration
- `npm run db:studio` — interface Prisma Studio

---

*Référence CDC : CDC-IMAZ-PLAT-NUM-2026-V1.0 — GIE HORONYA / IMAZ — Confidentiel*
