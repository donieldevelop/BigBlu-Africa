# Fragments des parcours Albanie (utilisés par build.py)
AVANTAGES = {
 "travail": ("💼","Poste disponible en Albanie","Ouvrier en usine",
   [("📄","Contrat d'un an renouvelable"),("🏠","Hébergement pris en charge"),("🍽️","Nourriture prise en charge"),
    ("🚌","Transport pris en charge"),("🏥","Assurance maladie"),("💶","Salaire à partir de <strong>600 €/mois</strong>")],
   "Ce poste vous intéresse-t-il ?","Oui, ce poste m'intéresse"),
 "football": ("⚽","Centre de formation en Albanie","Football en Albanie",
   [("🏠","Hébergement et nourriture pris en charge"),("⚽","Formation et progression footballistique"),
    ("🌍","Possibilité d'être promu par le centre de formation auprès de clubs européens, selon votre niveau et vos performances")],
   "Êtes-vous intéressé(e) par cette opportunité ?","Oui, je suis intéressé(e)"),
}
PROCEDURE = {
 "travail": [("Ouverture du dossier","50 000 FCFA","Nous ouvrons votre dossier et faisons la demande de votre contrat de travail."),
             ("Obtention du contrat de travail","","Une fois votre contrat de travail obtenu, nous passons à la procédure de visa."),
             ("Procédure de visa","150 000 FCFA","Le délai de traitement du visa est de 45 jours au plus."),
             ("Après l'obtention du visa","","Une fois votre visa obtenu, vous procédez au règlement de nos honoraires.")],
 "football": [("Ouverture du dossier","50 000 FCFA","Nous ouvrons votre dossier et lançons les démarches auprès du centre de formation."),
             ("Lettre du centre de formation","","Après réception de la lettre officielle du centre de formation, nous poursuivons la procédure."),
             ("Demande de visa","150 000 FCFA","Nous lançons la procédure d'obtention du visa. Délai de traitement : 45 jours au plus."),
             ("Après l'obtention du visa","","Une fois le visa obtenu, vous procédez au règlement de nos honoraires.")],
}
DOCS = {
 "travail": ["Passeport valide","Photo sur fond blanc","Visite médicale"],
 "football": ["Licence professionnelle","Passeport valide","Photo sur fond blanc","Extrait scanné","Copie du passeport à jour"],
}
SPECIFIQUE = {
 "travail": '<label class="full">Métier ou expérience professionnelle<input name="metier" maxlength="150" placeholder="Ex. soudeur, manutentionnaire, sans expérience…"></label>',
 "football": ('<label>Poste de jeu *<select name="poste" required><option value="">Choisir</option><option>Gardien</option><option>Défenseur</option><option>Milieu</option><option>Attaquant</option></select></label>'
              '<label>Licence professionnelle *<select name="licencePro" required><option value="">Choisir</option><option>Oui</option><option>Non</option></select></label>'
              '<label class="full">Club actuel ou dernier club<input name="clubActuel" maxlength="100"></label>'),
}

def parcours(p):
    ico, small, titre, avs, question, oui = AVANTAGES[p]
    lis = "".join(f"<li><b>{e}</b>{t}</li>" for e, t in avs)
    steps = "".join(f'<li><span>{i+1}</span><div><h3>{t}</h3>{f"<p class=v-price>{prix}</p>" if prix else ""}<p>{d}</p></div></li>' for i, (t, prix, d) in enumerate(PROCEDURE[p]))
    docs = "".join(f"<li>{d}</li>" for d in DOCS[p])
    jours = "".join(f'<label class="chip"><input type="checkbox" name="joursAppel" value="{j}"><span>{j}</span></label>' for j in ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"])
    return f'''
<section class="p-wrap">
 <div class="container p-container">
  <div class="p-top"><a class="p-brand" href="/voyage">VISION@FRICA · Albanie</a><span class="p-count">Étape <b>1</b> / 4</span></div>
  <div class="p-bar"><span></span></div>
  <div class="parcours" data-programme="{p}">

   <div class="p-step" data-step="1">
     <div class="p-card {p}">
       <div class="v-prog-head"><span class="v-ico">{ico}</span><div><small>{small}</small><h2>{titre}</h2></div></div>
       <p class="p-intro">Découvrez les avantages de ce programme :</p>
       <ul class="v-list">{lis}</ul>
       <p class="p-q">{question}</p>
     </div>
     <div class="p-nav"><button class="btn p-back p-go" data-go="non" type="button">Non, merci</button><button class="btn v-red p-next" type="button">{oui} →</button></div>
   </div>

   <div class="p-step" data-step="2" hidden>
     <div class="p-card">
       <h2>La procédure à suivre</h2>
       <ol class="p-proc">{steps}</ol>
       <p class="v-note">✈️ Billet d'avion : à la charge du client.</p>
       <p class="p-q">Êtes-vous prêt(e) à payer l'ouverture du dossier (50 000 FCFA) pour lancer la procédure ?</p>
     </div>
     <div class="p-nav p-nav3"><button class="btn p-back" type="button">← Retour</button><button class="btn p-back p-go" data-go="plus_tard" type="button">Pas pour le moment</button><button class="btn v-red p-next" type="button">Oui, je suis prêt(e) →</button></div>
   </div>

   <div class="p-step" data-step="3" hidden>
     <div class="p-card">
       <h2>Conditions et documents</h2>
       <p class="v-cond">📌 Condition principale : disposer d'un passeport valide.</p>
       <h3 class="p-sub">📄 Documents à fournir</h3>
       <ul class="p-docs">{docs}</ul>
       <div class="p-office"><strong>📍 Bureau : Cocody Angré CNPS</strong><span>📞 <a href="tel:+2252735997250">+225 27 35 99 72 50</a></span><small>Les documents se déposent au bureau lors de votre rendez-vous. Rien à envoyer en ligne.</small></div>
     </div>
     <div class="p-nav"><button class="btn p-back" type="button">← Retour</button><button class="btn v-red p-next" type="button">Je m'inscris →</button></div>
   </div>

   <div class="p-step" data-step="4" hidden>
     <form class="v-form p-form">
       <h2>Votre inscription</h2>
       <p class="p-intro">Remplissez ce formulaire : un conseiller vous appellera selon vos disponibilités pour fixer votre rendez-vous au bureau.</p>
       <h3 class="p-sub">Vos informations</h3>
       <div class="v-grid">
        <label>Nom *<input name="nom" required maxlength="80" autocomplete="family-name"></label>
        <label>Prénoms *<input name="prenoms" required maxlength="120" autocomplete="given-name"></label>
        <label>Date de naissance *<input type="date" name="dateNaissance" required></label>
        <label>Sexe *<select name="sexe" required><option value="">Choisir</option><option>Homme</option><option>Femme</option></select></label>
        <label>Nationalité *<input name="nationalite" required maxlength="60" value="Ivoirienne"></label>
        <label>Ville / commune *<input name="ville" required maxlength="80" placeholder="Ex. Yopougon, Abidjan"></label>
        <label>Téléphone (WhatsApp) *<input type="tel" name="telephone" required minlength="8" maxlength="25" placeholder="Ex. 07 00 00 00 00" autocomplete="tel"></label>
        <label>Email <span class="opt">(facultatif)</span><input type="email" name="email" maxlength="120" autocomplete="email"></label>
        <label class="full">Avez-vous un passeport valide ? *<select name="passeport" required><option value="">Choisir</option><option>Oui</option><option>Non</option><option>En cours d'établissement</option></select></label>
        {SPECIFIQUE[p]}
       </div>
       <h3 class="p-sub">Vos disponibilités</h3>
       <div class="v-grid">
        <div class="full"><span class="lbl">Jours où l'on peut vous appeler * <span class="opt">(plusieurs choix possibles)</span></span><div class="chips">{jours}</div></div>
        <label>Heure préférée pour l'appel *<select name="creneau" required><option value="">Choisir</option><option>Matin (8h – 12h)</option><option>Après-midi (12h – 17h)</option><option>Soir (17h – 20h)</option><option>Peu importe</option></select></label>
        <label>Quand pouvez-vous passer au bureau ? *<select name="bureau" required><option value="">Choisir</option><option>Cette semaine</option><option>La semaine prochaine</option><option>À une date précise</option></select></label>
        <label class="bureau-date" hidden>Date souhaitée *<input type="date" name="bureauDate"></label>
        <label class="full">Message <span class="opt">(facultatif)</span><textarea name="message" rows="3" maxlength="300" placeholder="Une question, une précision…"></textarea></label>
       </div>
       <input class="hp" name="site_web" tabindex="-1" autocomplete="off" aria-hidden="true">
       <label class="v-consent"><input type="checkbox" required> J'ai pris connaissance de la procédure et des frais, et j'accepte que VISION@FRICA / BIGBLU AFRICA utilise ces informations pour me recontacter.</label>
       <div class="p-nav"><button class="btn p-back" type="button">← Retour</button><button type="submit" class="btn v-red">Envoyer mon inscription</button></div>
       <p class="message" aria-live="polite"></p>
     </form>
   </div>

   <div class="p-step p-merci" data-step="5" hidden>
     <div class="v-check">✓</div>
     <h2>Merci <span class="merci-nom"></span>, votre inscription est bien reçue !</h2>
     <p>Un conseiller VISION@FRICA vous appellera <strong>selon les disponibilités que vous avez indiquées</strong> pour fixer votre rendez-vous au bureau.</p>
     <p>📍 Bureau : <strong>Cocody Angré CNPS</strong> · 📞 <a href="tel:+2252735997250">+225 27 35 99 72 50</a></p>
     <p class="p-rappel">Pensez à préparer vos documents : {", ".join(d.lower() for d in DOCS[p])}.</p>
   </div>

   <div class="p-step" data-step="plus_tard" hidden>
     <form class="v-form p-short" data-kind="plus_tard">
       <h2>Pas de souci, on reste en contact !</h2>
       <p class="p-intro">Laissez vos coordonnées : un conseiller vous recontactera au moment qui vous convient pour lancer votre dossier.</p>
       <div class="v-grid">
        <label>Nom *<input name="nom" required maxlength="80"></label>
        <label>Prénoms *<input name="prenoms" required maxlength="120"></label>
        <label>Téléphone (WhatsApp) *<input type="tel" name="telephone" required minlength="8" maxlength="25" placeholder="Ex. 07 00 00 00 00"></label>
        <label>Quand pensez-vous être prêt(e) ? *<select name="quandPret" required><option value="">Choisir</option><option>Dans 2 semaines</option><option>Dans 1 mois</option><option>Dans 3 mois</option><option>Je ne sais pas encore</option></select></label>
       </div>
       <input class="hp" name="site_web" tabindex="-1" autocomplete="off" aria-hidden="true">
       <div class="p-nav"><button class="btn p-back p-go" data-go="2" type="button">← Retour</button><button type="submit" class="btn v-red">Être recontacté(e) plus tard</button></div>
       <p class="message" aria-live="polite"></p>
     </form>
   </div>

   <div class="p-step" data-step="non" hidden>
     <form class="v-form p-short" data-kind="non">
       <h2>Merci de votre intérêt pour VISION@FRICA.</h2>
       <p class="p-intro">Ce programme ne vous convient pas ? D'autres opportunités arrivent bientôt. Laissez votre numéro si vous souhaitez en être informé(e) — c'est facultatif.</p>
       <div class="v-grid">
        <label>Nom<input name="nom" maxlength="80"></label>
        <label>Téléphone (WhatsApp)<input type="tel" name="telephone" minlength="8" maxlength="25" placeholder="Ex. 07 00 00 00 00"></label>
       </div>
       <input class="hp" name="site_web" tabindex="-1" autocomplete="off" aria-hidden="true">
       <div class="p-nav"><a class="btn p-back" href="/voyage">Quitter</a><button type="submit" class="btn v-red">Me tenir informé(e)</button></div>
       <p class="message" aria-live="polite"></p>
     </form>
   </div>

   <div class="p-step p-merci" data-step="fin" hidden>
     <div class="v-check">✓</div>
     <h2 class="fin-titre">Merci, c'est bien noté !</h2>
     <p class="fin-texte"></p>
     <p><a class="btn v-navy" href="/voyage">Retour à la page Voyage</a></p>
   </div>
  </div>
 </div>
</section>'''
