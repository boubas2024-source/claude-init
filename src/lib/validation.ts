import { z } from 'zod'

export const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().regex(/^(\+226|00226)?[0-9]{8}$/, 'Numéro de téléphone invalide (format Burkina)'),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmMotDePasse: z.string(),
  dateNaissance: z.string().optional(),
  lieuNaissance: z.string().optional(),
  nationalite: z.string().default('Burkinabè'),
  numIdentite: z.string().optional(),
  telephoneSecondaire: z.string().optional(),
  adresse: z.string().optional(),
  secteur: z.string().optional(),
  ville: z.string().optional(),
  province: z.string().optional(),
  profession: z.string().optional(),
  sourceFinancement: z.string().optional(),
}).refine((data) => data.motDePasse === data.confirmMotDePasse, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmMotDePasse'],
})

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
})

export const souscriptionSchema = z.object({
  produitId: z.string().min(1, 'Produit requis'),
  accepteCGV: z.boolean().refine((val) => val === true, 'Vous devez accepter les CGV'),
})

export const paiementSchema = z.object({
  souscriptionId: z.string().min(1, 'Souscription requise'),
  montant: z.number().positive('Le montant doit être positif'),
  modeReglement: z.enum(['ESPECES', 'CHEQUE', 'VIREMENT', 'ORANGE_MONEY', 'MOOV_MONEY']),
  referenceQuittance: z.string().optional(),
})

export const produitSchema = z.object({
  programmeId: z.string().min(1, 'Programme requis'),
  categorie: z.enum(['DJIGUI', 'DJIGUIYA', 'HAKILI', 'HAKILI_SIGUI']),
  reference: z.string().min(1, 'Référence requise'),
  surface: z.number().positive('La surface doit être positive'),
  niveaux: z.number().int().min(1),
  nbPieces: z.number().int().min(1),
  description: z.string().optional(),
  localisation: z.string().optional(),
  prixTotal: z.number().positive('Le prix doit être positif'),
  fraisSouscription: z.number().positive('Les frais doivent être positifs'),
  stockTotal: z.number().int().positive(),
  stockDisponible: z.number().int().min(0),
  delaiValiditeJours: z.number().int().positive().default(30),
})

export const programmeSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  description: z.string().optional(),
  ville: z.string().min(2, 'Ville requise'),
  secteur: z.string().optional(),
  zone: z.string().optional(),
  dateOuverture: z.string().optional(),
  dateCloture: z.string().optional(),
  statut: z.enum(['OUVERT', 'FERME', 'EN_COURS']).default('EN_COURS'),
})

export const utilisateurBOSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Mot de passe requis'),
  role: z.enum(['SUPER_ADMIN', 'RESPONSABLE_PROGRAMME', 'AGENT_ACCUEIL']),
  programmesAssignes: z.array(z.string()).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SouscriptionInput = z.infer<typeof souscriptionSchema>
export type PaiementInput = z.infer<typeof paiementSchema>
export type ProduitInput = z.infer<typeof produitSchema>
export type ProgrammeInput = z.infer<typeof programmeSchema>
export type UtilisateurBOInput = z.infer<typeof utilisateurBOSchema>
