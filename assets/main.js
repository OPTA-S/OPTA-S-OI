/* OPTA-S Océan Indien — interactions (menu mobile, cookies, formulaires) */
(function () {
  var EMAIL = 'phenri.hamburger@opta-s.fr';

  // --- Menu mobile ---
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
    });
  }

  // --- Bandeau cookies (consentement) ---
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
    var a = document.getElementById('cookie-accept');
    var r = document.getElementById('cookie-refuse');
    if (a) a.addEventListener('click', function () { enregistrer('accept'); });
    if (r) r.addEventListener('click', function () { enregistrer('refuse'); });

    document.querySelectorAll('.rouvrir-cookies').forEach(function (el) {
      el.addEventListener('click', function (ev) { ev.preventDefault(); banner.classList.add('show'); });
    });
  }

  // --- Année dynamique ---
  document.querySelectorAll('.annee').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // --- Petit utilitaire : message de confirmation sous un formulaire ---
  function confirmer(form, texte) {
    var note = form.querySelector('.form-confirm');
    if (!note) {
      note = document.createElement('p');
      note.className = 'form-confirm';
      note.setAttribute('role', 'status');
      note.style.cssText = 'margin-top:12px;color:#1a7f37;font-weight:600;font-size:.95rem';
      form.appendChild(note);
    }
    note.textContent = texte;
  }

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  // --- Boutons « S'inscrire » du catalogue : transmettre la formation choisie ---
  document.querySelectorAll('.prod').forEach(function (prod) {
    var titre = prod.querySelector('h3');
    var lien = prod.querySelector('.prod-foot a.btn');
    if (titre && lien) {
      lien.setAttribute('href', 'contact.html?formation=' + encodeURIComponent(titre.textContent.trim()));
    }
  });

  // --- Page contact : pré-remplir le message si une formation est passée en paramètre ---
  var params = new URLSearchParams(window.location.search);
  var formation = params.get('formation');
  if (formation) {
    var msg = document.getElementById('message');
    if (msg && !msg.value) {
      msg.value = 'Bonjour,\n\nJe souhaite être recontacté(e) au sujet de la formation : « ' + formation + ' ».\n\nMerci.';
    }
  }

  // --- Formulaire de contact : envoi par e-mail (mailto, sans serveur) ---
  var contact = document.getElementById('contact-form');
  if (contact) {
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contact.checkValidity()) { contact.reportValidity(); return; }
      var nom = val(contact, 'nom');
      var org = val(contact, 'organisme');
      var mail = val(contact, 'email');
      var tel = val(contact, 'tel');
      var message = val(contact, 'message');
      var sujet = 'Demande via le site — ' + (nom || 'contact');
      var corps =
        'Nom : ' + nom + '\n' +
        'Organisme : ' + org + '\n' +
        'E-mail : ' + mail + '\n' +
        'Téléphone : ' + tel + '\n\n' +
        'Message :\n' + message + '\n';
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(sujet) +
        '&body=' + encodeURIComponent(corps);
      confirmer(contact, 'Votre logiciel de messagerie va s’ouvrir avec votre demande pré-remplie. Si rien ne se passe, écrivez-nous directement à ' + EMAIL + '.');
    });
  }

  // --- Formulaire newsletter : inscription par e-mail (mailto) ---
  document.querySelectorAll('#newsletter-form').forEach(function (nl) {
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!nl.checkValidity()) { nl.reportValidity(); return; }
      var mail = val(nl, 'email');
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent('Inscription à la newsletter') +
        '&body=' + encodeURIComponent('Je souhaite m’inscrire à la newsletter avec l’adresse : ' + mail);
      confirmer(nl, 'Merci ! Votre messagerie va s’ouvrir pour confirmer votre inscription.');
    });
  });
})();
