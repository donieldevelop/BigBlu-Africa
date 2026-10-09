// Messages WhatsApp prêts à copier (réponse humaine, en attendant le chatbot).
// Les [crochets] sont à remplacer par les informations de la personne.

const BUREAU = `📍 Bureau : Cocody Angré CNPS
📞 +225 27 35 99 72 50`;

const PROCEDURE = (titre, depart) => `🇦🇱 *PROCÉDURE — ${titre}*

*1️⃣ Ouverture du dossier : 200 000 FCFA*
Inscription et ouverture de votre dossier, procédure de visa incluse. Ces frais ne sont pas remboursables.

*2️⃣ Dépôt en séquestre : 1 500 000 FCFA*
Vous déposez cette somme chez votre notaire, en compte séquestre. L'argent n'est versé à personne : il reste bloqué chez le notaire et montre que vous êtes solvable. Il n'est libéré qu'à l'obtention de votre visa ; sans visa, il vous est rendu. Dès le dépôt, nous lançons la procédure de visa.

*3️⃣ Obtention du visa*
Votre visa est obtenu en *un mois maximum*.

*4️⃣ Solde : 1 000 000 FCFA*
À l'obtention du visa, vous réglez le solde. Le visa vous est remis une fois le solde payé.

*5️⃣ Départ* ✈️
${depart}

📌 *EN RÉSUMÉ*
*200 000 FCFA* → Ouverture du dossier (visa inclus)
*1 500 000 FCFA* → Séquestre chez votre notaire
*1 000 000 FCFA* → Solde à l'obtention du visa

Honoraires totaux : *2 500 000 FCFA*, négociables dans certains cas.
✈️ Billet d'avion : à la charge du client.

Êtes-vous prêt(e) à payer l'ouverture du dossier (200 000 FCFA) ?
Répondez *OUI* ou *PAS POUR LE MOMENT*.`;

const CONFIRMATION = `✅ Merci [Nom], votre inscription est bien enregistrée.

Un conseiller VISION@FRICA vous appellera selon les disponibilités que vous nous avez indiquées pour fixer votre rendez-vous au bureau.

${BUREAU}

Pensez à préparer vos documents. À très bientôt !`;

export const WA = [
  { id: "accueil", groupe: "1. Accueil", items: [
    { titre: "Message de bienvenue (dès qu'une personne écrit)", texte: `Bonjour et bienvenue chez VISION@FRICA ! 🇦🇱

Merci de nous avoir contactés suite à notre annonce sur les opportunités en Albanie.

Nous vous proposons deux possibilités :

*1️⃣ TRAVAIL EN ALBANIE*
*2️⃣ FOOTBALL EN ALBANIE*

Pour recevoir les informations correspondant à votre projet, répondez par *1* ou *2*.` },
  ]},

  { id: "travail", groupe: "2. Travail en Albanie (réponse « 1 »)", items: [
    { titre: "Étape 1 : les deux postes et les avantages", texte: `🇦🇱 *TRAVAIL EN ALBANIE*

Deux postes sont actuellement disponibles :

🏭 *Ouvrier en usine (Factory)*
🏨 *Hôtellerie (travail en hôtel)*

💶 Salaire : *800 € net par mois*

Pour les deux postes :
🏠 Hébergement pris en charge
🍽️ Nourriture prise en charge
🚌 Transport pris en charge
🏥 Assurance maladie

Quel poste vous intéresse ?
Répondez *USINE* ou *HÔTEL*.` },
    { titre: "Étape 2 : procédure et frais (après son choix de poste)", texte: PROCEDURE("TRAVAIL EN ALBANIE", "Vous partez en Albanie : hébergement, nourriture, transport et assurance maladie pris en charge, et vous commencez votre travail.") },
    { titre: "Étape 3 : documents et informations (s'il répond OUI)", texte: `🇦🇱 *TRAVAIL EN ALBANIE — CONDITIONS ET DOCUMENTS*

📌 Condition principale : passeport valide.

📄 Documents à fournir :
• Passeport valide
• Photo sur fond blanc
• Visite médicale

${BUREAU}

Pour enregistrer votre inscription, merci de m'envoyer :
1️⃣ Votre nom complet
2️⃣ Votre numéro WhatsApp
3️⃣ Avez-vous un passeport valide ? (Oui / Non / En cours)
4️⃣ Votre métier ou expérience (facultatif)
5️⃣ Les jours et l'heure où nous pouvons vous appeler
6️⃣ Quand pouvez-vous passer au bureau ? (cette semaine / la semaine prochaine / une date précise)` },
    { titre: "Étape 4 : confirmation (après ses réponses)", texte: CONFIRMATION },
  ]},

  { id: "football", groupe: "3. Football en Albanie (réponse « 2 »)", items: [
    { titre: "Étape 1 : le centre de formation", texte: `⚽ *FOOTBALL EN ALBANIE*

Intégrez un *centre de formation de football en Albanie* et bénéficiez de :

🏠 Hébergement et nourriture pris en charge
⚽ Formation et progression footballistique
🌍 Possibilité d'être promu par le centre de formation auprès de clubs européens, selon votre niveau et vos performances

Êtes-vous intéressé(e) par cette opportunité ?
Répondez *OUI* pour poursuivre.` },
    { titre: "Étape 2 : procédure et frais (s'il répond OUI)", texte: PROCEDURE("FOOTBALL EN ALBANIE", "Vous partez en Albanie : hébergement et nourriture pris en charge, et vous intégrez le centre de formation.") },
    { titre: "Étape 3 : documents et informations (s'il répond OUI)", texte: `⚽ *FOOTBALL EN ALBANIE — CONDITIONS ET DOCUMENTS*

📌 Condition principale : passeport valide.

📄 Documents à fournir :
• Licence professionnelle
• Passeport valide
• Photo sur fond blanc
• Extrait scanné
• Copie du passeport à jour

${BUREAU}

Pour enregistrer votre inscription, merci de m'envoyer :
1️⃣ Votre nom complet
2️⃣ Votre numéro WhatsApp
3️⃣ Avez-vous un passeport valide ? (Oui / Non / En cours)
4️⃣ Votre poste de jeu (gardien, défenseur, milieu, attaquant)
5️⃣ Avez-vous une licence professionnelle ? (Oui / Non)
6️⃣ Votre club actuel ou dernier club (facultatif)
7️⃣ Les jours et l'heure où nous pouvons vous appeler
8️⃣ Quand pouvez-vous passer au bureau ? (cette semaine / la semaine prochaine / une date précise)` },
    { titre: "Étape 4 : confirmation (après ses réponses)", texte: CONFIRMATION },
  ]},

  { id: "autres", groupe: "4. Réponses particulières", items: [
    { titre: "La personne répond « Pas pour le moment »", texte: `Pas de souci, on reste en contact ! 🙏

Pour que nous puissions vous recontacter au bon moment, merci de me donner :
1️⃣ Votre nom complet
2️⃣ Quand pensez-vous être prêt(e) ? (dans 2 semaines / dans 1 mois / dans 3 mois / je ne sais pas encore)

Nous reviendrons vers vous à ce moment-là.` },
    { titre: "La personne répond « Non » (pas intéressée)", texte: `Merci de votre intérêt pour VISION@FRICA. 🙏

D'autres opportunités arrivent bientôt. Si vous souhaitez en être informé(e), donnez-moi simplement votre nom complet et nous vous préviendrons.` },
    { titre: "Relance d'un prospect « plus tard »", texte: `Bonjour [Nom] 👋, c'est VISION@FRICA.

Vous aviez prévu d'ouvrir votre dossier pour l'Albanie à cette période. Êtes-vous prêt(e) à démarrer ?

Répondez *OUI* et je vous renvoie la procédure.` },
    { titre: "La personne demande si c'est sérieux / peur d'une arnaque", texte: `Votre prudence est normale, et nous la comprenons. 🙏

Voici comment nous travaillons :
📍 Nous avons un bureau : Cocody Angré CNPS, Abidjan. Vous pouvez venir nous rencontrer.
📞 Notre numéro officiel : +225 27 35 99 72 50
🔒 Pour le visa, vos 1 500 000 FCFA ne nous sont pas remis : ils sont déposés chez *votre notaire*, en compte séquestre, et ne sont libérés qu'à l'obtention de votre visa.

Vous pouvez aussi consulter notre site : www.bigbluafrica.com` },
  ]},
];
