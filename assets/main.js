/* OPTA-S Océan Indien — interactions (menu, cookies, formulaires) */
(function () {
  var EMAIL = 'phenri.hamburger@opta-s.fr';

  /* ────────────────────────────────────────────────────────────
     CLÉ D'ENVOI DES FORMULAIRES (Web3Forms — gratuit, sans serveur)
     1. Allez sur https://web3forms.com  →  saisissez l'adresse
        phenri.hamburger@opta-s.fr  →  recevez une « Access Key ».
     2. Collez cette clé ci-dessous entre les guillemets.
     Tant que la clé est vide, les formulaires basculent
     automatiquement sur l'envoi par e-mail pré-rempli (mailto).
     ──────────────────────────────────────────────────────────── */
  var WEB3FORMS_KEY = "d1be2688-c987-4c9e-9272-cd91ab750486";

  // --- Menu mobile ---
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    });
  }

  // --- Bandeau cookies ---
  var KEY = 'optas_oi_cookie_consent';
  var banner = document.getElementById('cookie-banner');
  if (banner) {
    var choix = null;
    try { choix = localStorage.getItem(KEY); } catch (e) {}
    if (!choix) banner.classList.add('show');
    function enregistrer(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      banner.classList.remove('show');
    }
    var ba = document.getElementById('cookie-accept');
    var br = document.getElementById('cookie-refuse');
    if (ba) ba.addEventListener('click', function () { enregistrer('accept'); });
    if (br) br.addEventListener('click', function () { enregistrer('refuse'); });
    document.querySelectorAll('.rouvrir-cookies').forEach(function (el) {
      el.addEventListener('click', function (ev) { ev.preventDefault(); banner.classList.add('show'); });
    });
  }

  // --- Année dynamique ---
  document.querySelectorAll('.annee').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  function confirmer(form, texte, ok) {
    var note = form.querySelector('.form-confirm');
    if (!note) {
      note = document.createElement('p');
      note.className = 'form-confirm';
      note.setAttribute('role', 'status');
      form.appendChild(note);
    }
    note.style.cssText = 'margin-top:12px;font-weight:600;font-size:.95rem;color:' + (ok ? '#1a7f37' : '#b3261e');
    note.textContent = texte;
  }
  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }
  function aClef() { return WEB3FORMS_KEY && WEB3FORMS_KEY.length > 10; }

  // Anti-spam : champ piège injecté (rempli uniquement par les robots)
  function ajouterHoneypot(form) {
    if (form.querySelector('[name="botcheck"]')) return;
    var hp = document.createElement('input');
    hp.type = 'checkbox'; hp.name = 'botcheck'; hp.tabIndex = -1;
    hp.setAttribute('autocomplete', 'off');
    hp.style.cssText = 'position:absolute;left:-9999px;opacity:0;height:0;width:0';
    form.appendChild(hp);
  }

  // Envoi via Web3Forms (POST JSON) — repli mailto si pas de clé
  function envoyer(form, data, sujet, corpsMailto, okText) {
    if (!aClef()) {
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(sujet) +
        '&body=' + encodeURIComponent(corpsMailto);
      confirmer(form, 'Votre messagerie va s’ouvrir avec votre demande pré-remplie. Si rien ne se passe, écrivez-nous à ' + EMAIL + '.', true);
      return;
    }
    data.access_key = WEB3FORMS_KEY;
    data.subject = sujet;
    data.from_name = 'Site OPTA-S Océan Indien';
    var btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.dataset.lbl = btn.textContent; btn.textContent = 'Envoi…'; }
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res.success) {
        form.reset();
        confirmer(form, 'Merci, votre message a bien été envoyé. Nous revenons vers vous rapidement.', true);
      } else {
        confirmer(form, 'Une erreur est survenue. Écrivez-nous directement à ' + EMAIL + '.', false);
      }
    }).catch(function () {
      confirmer(form, 'Envoi impossible pour le moment. Écrivez-nous à ' + EMAIL + '.', false);
    }).finally(function () {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.lbl || 'Envoyer'; }
    });
  }

  // --- Boutons « S'inscrire » du catalogue : transmettre la formation ---
  document.querySelectorAll('.prod').forEach(function (prod) {
    var titre = prod.querySelector('h3');
    var lien = prod.querySelector('.prod-foot a.btn');
    if (titre && lien) lien.setAttribute('href', 'contact.html?formation=' + encodeURIComponent(titre.textContent.trim()));
  });

  // --- Pré-remplissage du message si formation passée en paramètre ---
  var formation = new URLSearchParams(window.location.search).get('formation');
  if (formation) {
    var msg = document.getElementById('message');
    if (msg && !msg.value) {
      msg.value = 'Bonjour,\n\nJe souhaite être recontacté(e) au sujet de la formation : « ' + formation + ' ».\n\nMerci.';
    }
  }

  // --- Formulaire de contact ---
  var contact = document.getElementById('contact-form');
  if (contact) {
    ajouterHoneypot(contact);
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contact.checkValidity()) { contact.reportValidity(); return; }
      if (val(contact, 'botcheck')) return; // robot
      var nom = val(contact, 'nom'), org = val(contact, 'organisme'),
          mail = val(contact, 'email'), tel = val(contact, 'tel'), message = val(contact, 'message');
      var corps = 'Nom : ' + nom + '\nOrganisme : ' + org + '\nE-mail : ' + mail +
                  '\nTéléphone : ' + tel + '\n\nMessage :\n' + message + '\n';
      envoyer(contact,
        { nom: nom, organisme: org, email: mail, telephone: tel, message: message },
        'Demande via le site — ' + (nom || 'contact'), corps);
    });
  }

  // --- Formulaires newsletter ---
  document.querySelectorAll('#newsletter-form').forEach(function (nl) {
    ajouterHoneypot(nl);
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!nl.checkValidity()) { nl.reportValidity(); return; }
      if (val(nl, 'botcheck')) return;
      var mail = val(nl, 'email');
      envoyer(nl, { email: mail, type: 'Inscription newsletter' },
        'Inscription à la newsletter',
        'Je souhaite m’inscrire à la newsletter avec l’adresse : ' + mail);
    });
  });
})();
