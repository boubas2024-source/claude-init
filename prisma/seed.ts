import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addDays, subDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean up
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.paiement.deleteMany()
  await prisma.souscription.deleteMany()
  await prisma.produit.deleteMany()
  await prisma.programme.deleteMany()
  await prisma.utilisateurBO.deleteMany()
  await prisma.client.deleteMany()

  console.log('✅ Database cleaned')

  // Create programmes
  const boromo = await prisma.programme.create({
    data: {
      nom: 'Boromo II',
      description: 'Programme de logements populaires dans la zone de Boromo. 3 000 unités d\'habitation populaire pour les familles burkinabè.',
      ville: 'Boromo',
      secteur: 'Zone Boromo',
      zone: 'Zone périurbaine',
      dateOuverture: new Date('2024-01-15'),
      statut: 'OUVERT',
    },
  })

  const secteur18 = await prisma.programme.create({
    data: {
      nom: 'Secteur 18',
      description: 'Logements collectifs modernes au cœur de Ouagadougou. Idéal pour les familles urbaines cherchant confort et accessibilité.',
      ville: 'Ouagadougou',
      secteur: 'Secteur 18',
      zone: 'Zone urbaine',
      dateOuverture: new Date('2023-09-01'),
      statut: 'EN_COURS',
    },
  })

  const secteur19 = await prisma.programme.create({
    data: {
      nom: 'Secteur 19 Kodeni',
      description: 'Résidentiel mixte de qualité à Bobo-Dioulasso. Villas et appartements dans un cadre verdoyant.',
      ville: 'Bobo-Dioulasso',
      secteur: 'Secteur 19',
      zone: 'Kodeni',
      dateOuverture: new Date('2024-03-01'),
      statut: 'EN_COURS',
    },
  })

  console.log('✅ Programmes created')

  // Create products
  const produits = await Promise.all([
    // Boromo II - DJIGUI
    prisma.produit.create({
      data: {
        programmeId: boromo.id,
        categorie: 'DJIGUI',
        reference: 'BOR-DJ-001',
        surface: 45,
        niveaux: 1,
        nbPieces: 2,
        description: 'Unité d\'habitation populaire de 45m², idéale pour les jeunes ménages. Comprend salon, cuisine, chambre, salle de bain.',
        localisation: 'Zone A, Lot 15',
        prixTotal: 7500000,
        fraisSouscription: 50000,
        stockTotal: 200,
        stockDisponible: 185,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 30,
      },
    }),
    // Boromo II - DJIGUIYA
    prisma.produit.create({
      data: {
        programmeId: boromo.id,
        categorie: 'DJIGUIYA',
        reference: 'BOR-DJY-001',
        surface: 75,
        niveaux: 1,
        nbPieces: 3,
        description: 'Appartement F3 spacieux avec balcon, parking inclus. Idéal pour famille de 4-5 personnes.',
        localisation: 'Zone B, Bâtiment 3',
        prixTotal: 18000000,
        fraisSouscription: 100000,
        stockTotal: 80,
        stockDisponible: 72,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 30,
      },
    }),
    // Boromo II - DJIGUIYA F4
    prisma.produit.create({
      data: {
        programmeId: boromo.id,
        categorie: 'DJIGUIYA',
        reference: 'BOR-DJY-002',
        surface: 95,
        niveaux: 1,
        nbPieces: 4,
        description: 'Appartement F4 avec double balcon et grand salon. Finitions soignées.',
        localisation: 'Zone B, Bâtiment 5',
        prixTotal: 22000000,
        fraisSouscription: 150000,
        stockTotal: 40,
        stockDisponible: 35,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 30,
      },
    }),
    // Secteur 18 - DJIGUI
    prisma.produit.create({
      data: {
        programmeId: secteur18.id,
        categorie: 'DJIGUI',
        reference: 'S18-DJ-001',
        surface: 50,
        niveaux: 1,
        nbPieces: 2,
        description: 'Unité populaire en plein cœur de Ouagadougou, proche des commodités.',
        localisation: 'Secteur 18, Bloc A',
        prixTotal: 9000000,
        fraisSouscription: 75000,
        stockTotal: 120,
        stockDisponible: 98,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 30,
      },
    }),
    // Secteur 18 - HAKILI
    prisma.produit.create({
      data: {
        programmeId: secteur18.id,
        categorie: 'HAKILI',
        reference: 'S18-HAK-001',
        surface: 120,
        niveaux: 2,
        nbPieces: 4,
        description: 'Villa standard R+1 avec jardin de 200m², garage pour 2 véhicules, 4 chambres.',
        localisation: 'Secteur 18, Résidence des Bougainvilliers',
        prixTotal: 45000000,
        fraisSouscription: 250000,
        stockTotal: 25,
        stockDisponible: 18,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 45,
      },
    }),
    // Secteur 18 - HAKILI SIGUI
    prisma.produit.create({
      data: {
        programmeId: secteur18.id,
        categorie: 'HAKILI_SIGUI',
        reference: 'S18-HKS-001',
        surface: 200,
        niveaux: 2,
        nbPieces: 5,
        description: 'Villa prestige haut de gamme, finitions premium, piscine, jardin paysager 400m², domotique intégrée.',
        localisation: 'Secteur 18, Villa Prestige Zone VIP',
        prixTotal: 120000000,
        fraisSouscription: 500000,
        stockTotal: 10,
        stockDisponible: 6,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 60,
      },
    }),
    // Secteur 19 - DJIGUIYA
    prisma.produit.create({
      data: {
        programmeId: secteur19.id,
        categorie: 'DJIGUIYA',
        reference: 'S19-DJY-001',
        surface: 80,
        niveaux: 1,
        nbPieces: 3,
        description: 'Appartement F3 moderne à Bobo-Dioulasso, cadre verdoyant, proche universités.',
        localisation: 'Kodeni, Résidence Verte',
        prixTotal: 16000000,
        fraisSouscription: 100000,
        stockTotal: 60,
        stockDisponible: 54,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 30,
      },
    }),
    // Secteur 19 - HAKILI
    prisma.produit.create({
      data: {
        programmeId: secteur19.id,
        categorie: 'HAKILI',
        reference: 'S19-HAK-001',
        surface: 140,
        niveaux: 2,
        nbPieces: 5,
        description: 'Villa standard R+1 dans la zone résidentielle de Kodeni, grand terrain de 300m².',
        localisation: 'Kodeni, Secteur Résidentiel',
        prixTotal: 55000000,
        fraisSouscription: 300000,
        stockTotal: 15,
        stockDisponible: 12,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 45,
      },
    }),
    // Secteur 19 - HAKILI SIGUI
    prisma.produit.create({
      data: {
        programmeId: secteur19.id,
        categorie: 'HAKILI_SIGUI',
        reference: 'S19-HKS-001',
        surface: 250,
        niveaux: 2,
        nbPieces: 6,
        description: 'Villa prestige à Bobo-Dioulasso, vue panoramique, terrasse, salle de sport privée.',
        localisation: 'Kodeni Heights, Zone Prestige',
        prixTotal: 150000000,
        fraisSouscription: 750000,
        stockTotal: 5,
        stockDisponible: 3,
        statut: 'DISPONIBLE',
        delaiValiditeJours: 60,
      },
    }),
  ])

  console.log('✅ Products created')

  // Create BO users
  const adminPassword = await bcrypt.hash('Admin2024!', 12)
  const agentPassword = await bcrypt.hash('Agent2024!', 12)

  const admin = await prisma.utilisateurBO.create({
    data: {
      nom: 'Administrateur IMAZ',
      email: 'admin@imaz.bf',
      motDePasse: adminPassword,
      role: 'SUPER_ADMIN',
      programmesAssignes: [],
      twoFactorEnabled: false,
    },
  })

  const responsable = await prisma.utilisateurBO.create({
    data: {
      nom: 'Responsable Secteur 18',
      email: 'responsable@imaz.bf',
      motDePasse: agentPassword,
      role: 'RESPONSABLE_PROGRAMME',
      programmesAssignes: [secteur18.id],
      twoFactorEnabled: false,
    },
  })

  const agent = await prisma.utilisateurBO.create({
    data: {
      nom: 'Agent Accueil Ouaga',
      email: 'agent@imaz.bf',
      motDePasse: agentPassword,
      role: 'AGENT_ACCUEIL',
      programmesAssignes: [],
      twoFactorEnabled: false,
    },
  })

  console.log('✅ BO Users created')
  console.log('   admin@imaz.bf / Admin2024!')
  console.log('   responsable@imaz.bf / Agent2024!')
  console.log('   agent@imaz.bf / Agent2024!')

  // Create sample clients
  const clientPassword = await bcrypt.hash('Client2024!', 12)

  const client1 = await prisma.client.create({
    data: {
      nom: 'TRAORÉ',
      prenom: 'Amadou',
      email: 'amadou.traore@example.com',
      telephone: '70000001',
      motDePasse: clientPassword,
      nationalite: 'Burkinabè',
      numIdentite: 'B12345678',
      ville: 'Ouagadougou',
      secteur: 'Secteur 15',
      profession: 'Ingénieur informatique',
      dateNaissance: new Date('1985-03-15'),
      lieuNaissance: 'Ouagadougou',
    },
  })

  const client2 = await prisma.client.create({
    data: {
      nom: 'OUÉDRAOGO',
      prenom: 'Fatimata',
      email: 'fatimata.ouedraogo@example.com',
      telephone: '76000002',
      motDePasse: clientPassword,
      nationalite: 'Burkinabè',
      ville: 'Bobo-Dioulasso',
      profession: 'Médecin',
      dateNaissance: new Date('1990-07-22'),
      lieuNaissance: 'Bobo-Dioulasso',
    },
  })

  const client3 = await prisma.client.create({
    data: {
      nom: 'KABORÉ',
      prenom: 'Inoussa',
      email: 'inoussa.kabore@example.com',
      telephone: '65000003',
      motDePasse: clientPassword,
      nationalite: 'Burkinabè',
      ville: 'Ouagadougou',
      profession: 'Commerçant',
    },
  })

  console.log('✅ Clients created')
  console.log('   amadou.traore@example.com / Client2024!')

  // Create sample subscriptions
  const souscription1 = await prisma.souscription.create({
    data: {
      clientId: client1.id,
      produitId: produits[4].id, // S18-HAK-001
      programmeId: secteur18.id,
      numRecu: 'IMA-20240301-0001',
      statut: 'VALIDEE',
      dateExpiration: addDays(new Date(), 60),
    },
  })

  // Payment for souscription 1
  await prisma.paiement.create({
    data: {
      souscriptionId: souscription1.id,
      montant: 250000,
      modeReglement: 'ESPECES',
      referenceQuittance: 'QUI-2024-001',
      agentValideurId: agent.id,
    },
  })

  const souscription2 = await prisma.souscription.create({
    data: {
      clientId: client2.id,
      produitId: produits[7].id, // S19-HAK-001
      programmeId: secteur19.id,
      numRecu: 'IMA-20240315-0002',
      statut: 'EN_ATTENTE',
      dateExpiration: addDays(new Date(), 15),
    },
  })

  const souscription3 = await prisma.souscription.create({
    data: {
      clientId: client3.id,
      produitId: produits[1].id, // BOR-DJY-001
      programmeId: boromo.id,
      numRecu: 'IMA-20240220-0003',
      statut: 'EXPIREE',
      dateExpiration: subDays(new Date(), 5),
    },
  })

  const souscription4 = await prisma.souscription.create({
    data: {
      clientId: client1.id,
      produitId: produits[3].id, // S18-DJ-001
      programmeId: secteur18.id,
      numRecu: 'IMA-20240401-0004',
      statut: 'EN_ATTENTE',
      dateExpiration: addDays(new Date(), 20),
    },
  })

  console.log('✅ Subscriptions created')

  // Create notifications
  await prisma.notification.create({
    data: {
      souscriptionId: souscription1.id,
      type: 'SOUSCRIPTION_CONFIRMEE',
      canal: 'EMAIL',
      contenu: 'Votre souscription a été confirmée. N° IMA-20240301-0001',
      statutEnvoi: 'ENVOYE',
      dateEnvoi: new Date(),
    },
  })

  await prisma.notification.create({
    data: {
      souscriptionId: souscription1.id,
      type: 'PAIEMENT_RECU',
      canal: 'SMS',
      contenu: 'Paiement de 250 000 FCFA reçu pour le dossier IMA-20240301-0001.',
      statutEnvoi: 'ENVOYE',
      dateEnvoi: new Date(),
    },
  })

  await prisma.notification.create({
    data: {
      souscriptionId: souscription2.id,
      type: 'SOUSCRIPTION_CONFIRMEE',
      canal: 'EMAIL',
      contenu: 'Votre souscription est enregistrée. Rendez-vous en agence pour payer.',
      statutEnvoi: 'ENVOYE',
      dateEnvoi: new Date(),
    },
  })

  await prisma.notification.create({
    data: {
      souscriptionId: souscription2.id,
      type: 'RAPPEL_PAIEMENT',
      canal: 'SMS',
      contenu: 'Rappel: Votre dossier expire dans 15 jours. Passez en agence IMAZ.',
      statutEnvoi: 'ENVOYE',
      dateEnvoi: new Date(),
    },
  })

  console.log('✅ Notifications created')

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      utilisateurId: admin.id,
      action: 'BO_LOGIN',
      details: { email: 'admin@imaz.bf' },
      ip: '127.0.0.1',
    },
  })

  await prisma.auditLog.create({
    data: {
      utilisateurId: agent.id,
      action: 'PAIEMENT_CREATED',
      details: { souscriptionId: souscription1.id, montant: 250000 },
      ip: '192.168.1.10',
    },
  })

  console.log('✅ Audit logs created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Test credentials:')
  console.log('   Back-office Admin: admin@imaz.bf / Admin2024!')
  console.log('   Responsable: responsable@imaz.bf / Agent2024!')
  console.log('   Agent: agent@imaz.bf / Agent2024!')
  console.log('   Client: amadou.traore@example.com / Client2024!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
