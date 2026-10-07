# Génère les pages statiques du site à partir des fragments de src/.
# Utilisation : python3 build.py
import os, sys
sys.path.insert(0, "src")
from parcours import parcours

r = lambda f: open("src/" + f, encoding="utf-8").read()
NAV = [("/", "Accueil"), ("/a-propos", "À propos"), ("/domaines", "Domaines"), ("/structures", "Structures"), ("/voyage", "Voyage")]

def page(path, title, desc, body, active, extra_css="", scripts=""):
    nav = "".join(f'<a href="{u}"{" class=\"active\"" if u == active else ""}>{t}</a>' for u, t in NAV)
    nav += f'<a href="/contact" class="nav-btn{" active" if active == "/contact" else ""}">Contact</a>'
    css = '<link rel="stylesheet" href="/css/style.css">' + "".join(f'<link rel="stylesheet" href="/css/{c}.css">' for c in extra_css.split() if c)
    html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://www.bigbluafrica.com/assets/{"albanie-affiche.webp" if "voyage" in path else "bigblu-logo.jpg"}">
<title>{title}</title>
{css}
</head>
<body>
<header class="header">
  <div class="container nav">
    <a href="/" class="brand"><img src="/assets/bigblu-logo.jpg" alt="BIGBLU AFRICA"></a>
    <button class="menu" aria-label="Menu">☰</button>
    <nav>{nav}</nav>
  </div>
</header>
<main>
{body}
</main>
<footer><div class="container footer"><div class="brand-text">BIGBLU <span>AFRICA</span></div><p>Concevoir • Connecter • Développer • Réaliser</p><p>© <span id="year"></span> BIGBLU AFRICA</p></div></footer>
<script src="/js/main.js"></script>
{scripts}
</body>
</html>
'''
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    open(path, "w", encoding="utf-8").write(html)

def head(k, t, x):
    return r("page-head.html").format(kicker=k, titre=t, texte=x)

apropos_teaser = r("apropos.html").replace('href="#mission"', 'href="/a-propos"').replace("Découvrir notre approche →", "En savoir plus sur BIGBLU AFRICA →")
FORMS = '<script type="module" src="/js/contact.js"></script>'
PARC = '<script type="module" src="/js/parcours.js"></script>'

page("index.html", "BIGBLU AFRICA — Concevoir • Connecter • Développer • Réaliser",
     "BIGBLU AFRICA — Concevoir, connecter, développer et réaliser des opportunités d'affaires en Afrique.",
     r("accueil.html") + apropos_teaser + r("home-voyage.html") + r("mission.html") + r("partenaires.html"), "/", "voyages")
page("a-propos.html", "À propos — BIGBLU AFRICA", "Qui est BIGBLU AFRICA : identité, approche et équipe dirigeante.",
     head("À PROPOS", "Qui sommes-nous ?", "Une société ivoirienne de conception, de développement et de réalisation de projets.")
     + r("apropos.html").replace('<a class="link" href="#mission">Découvrir notre approche →</a>', "") + r("mission.html") + r("equipe.html"), "/a-propos")
page("domaines.html", "Nos domaines — BIGBLU AFRICA", "Les domaines d'intervention de BIGBLU AFRICA.",
     head("NOS DOMAINES", "Une approche multisectorielle.", "Des pôles complémentaires pour accompagner les opportunités et les projets.") + r("domaines.html"), "/domaines")
page("structures.html", "Nos structures — BIGBLU AFRICA", "VISION@AFRICA et BIGBLU PHARMA PASS, les pôles spécialisés de BIGBLU AFRICA.",
     head("NOS STRUCTURES", "Des pôles spécialisés.", "Des filiales et activités dédiées à l'intermédiation, au voyage et à la santé.") + r("structures.html"), "/structures")
page("voyage/index.html", "Voyage — Cap sur l'Albanie | VISION@FRICA", "Travail et football en Albanie avec VISION@FRICA : choisissez votre programme et laissez-vous guider.",
     r("v-hero.html") + r("v-entree.html"), "/voyage", "voyages")
page("contact.html", "Contact — BIGBLU AFRICA", "Contactez BIGBLU AFRICA ou soumettez votre projet.",
     head("CONTACT", "Parlons de votre projet.", "Écrivez-nous ou présentez votre projet à BIGBLU AFRICA.") + r("contact.html") + r("soumettre.html"), "/contact", "", FORMS)
page("voyage/albanie/travail.html", "Travail en Albanie — VISION@FRICA", "Travail en Albanie avec VISION@FRICA : recherche de contrat, procédure, documents et inscription en ligne.",
     parcours("travail"), "/voyage", "voyages parcours", PARC)
page("voyage/albanie/football.html", "Football en Albanie — VISION@FRICA", "Centre de formation de football en Albanie : avantages, procédure, documents et inscription en ligne.",
     parcours("football"), "/voyage", "voyages parcours", PARC)
print("Pages générées.")
