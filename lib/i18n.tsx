'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Lang = 'en' | 'es' | 'de';

type Dict = Record<string, string>;
type Translations = Record<Lang, Dict>;

export const translations: Translations = {
  en: {
    // Nav
    'nav.welcome': 'Welcome',
    'nav.rsvp': 'RSVP',
    'nav.updates': 'Updates',
    'nav.day': 'The Day',
    'nav.gallery': 'Gallery',
    'nav.upload': 'Photos',

    // Hero
    'hero.welcome': "We're getting married!",
    'hero.dateLocation': '25 September 2026 · Salou, Tarragona',
    'hero.date': 'Friday, 25 September 2026',
    'hero.time': 'Arrival 13:30 · Ceremony 14:00',
    'hero.place': 'INFINITUM Beach Club · Salou, Tarragona · Spain',
    'hero.countdownTitle': 'Until we say "I do"',
    'hero.scrollHint': 'Scroll for details',
    'countdown.days': 'Days',
    'countdown.hours': 'Hours',
    'countdown.minutes': 'Min',
    'countdown.seconds': 'Sec',

    // Welcome / Intro
    'welcome.title': 'Welcome to our wedding!',
    'welcome.headline': 'We’re getting married 💍',
    'welcome.body':
      'We couldn’t be happier and are so excited to share this special moment with you. We’ve created this website so you can be part of our journey to the big day and find all the important information. We’ll also ask for some details that will help us organise everything with love.',
    'welcome.cta': 'Don’t forget to RSVP and pick your menu below!',
    'welcome.signoff': 'Thank you for being part of all this. See you very soon 🥹🫶🏻',

    // RSVP
    'rsvp.title': 'Will you join us?',
    'rsvp.subtitle':
      'To confirm your attendance, just enter your name and let us know if you’ll be joining us. While you’re here, please pick your main course too.',
    'rsvp.firstName': 'First name',
    'rsvp.lastName': 'Last name',
    'rsvp.attendance': 'Will you attend?',
    'rsvp.attending': 'Yes, I’ll be there',
    'rsvp.notAttending': 'Sadly, I can’t',
    'rsvp.meal': 'Main course',
    'rsvp.meat': 'Meat',
    'rsvp.fish': 'Fish',
    'rsvp.vegetarian': 'Vegetarian',
    'rsvp.dietary': 'Allergies / dietary needs',
    'rsvp.dietaryHelp':
      'Allergies, intolerances, vegetarian or vegan? Tell us so we can take care of every detail 💖',
    'rsvp.dietaryPlaceholder': 'e.g. vegetarian, lactose intolerance…',
    'rsvp.message': 'Leave us a message (optional)',
    'rsvp.messagePlaceholder': 'A few words for us 🥰',
    'rsvp.submit': 'Send RSVP',
    'rsvp.sending': 'Sending…',
    'rsvp.thanks': 'Thank you!',
    'rsvp.thanksAttending': 'We can’t wait to celebrate with you.',
    'rsvp.thanksDeclined': 'We’ll miss you — thank you for letting us know.',
    'rsvp.edit': 'Edit my RSVP',
    'rsvp.errorRequired': 'Please fill in your name and choices.',
    'rsvp.errorSend': 'Something went wrong. Please try again.',
    'rsvp.skip': 'Maybe later',
    'rsvp.openButton': 'Open RSVP form',
    'rsvp.guestN': 'Guest {n}',
    'rsvp.youLabel': 'You',
    'rsvp.addGuest': '+ Add another guest',
    'rsvp.removeGuest': 'Remove',
    'rsvp.guestNote': 'Add a partner, child, or anyone you’re replying for.',
    'rsvp.partySummary': 'Party of {n}',

    // Updates / Blog
    'updates.title': 'Wedding Blog',
    'updates.headline': 'Heads up ⚠️',
    'updates.body':
      'We recommend keeping an eye on this section, as we’ll be sharing the latest updates on the wedding planning here. As the big day approaches, you’ll find all the updated information here, including the time and location of the Thursday pre-wedding (relaxed plan — beach-hut xiringuito), should you wish to join us and spend some time with us and other guests. We will also share the recommended arrival time for Friday, the wedding day, so everything runs smoothly.',
    'updates.beachTitle': 'Thursday pre-wedding Meet & Greet 🏖️',
    'updates.beachWhen': 'Thursday, 24 September 2026 — relaxed afternoon',
    'updates.beachWhere': 'Exact Beach Hut / xiringuito to follow',
    'updates.beachBody':
      'Before the big day we’d love to get together for a laid-back welcome at a beach-bar (xiringuito) — drinks, snacks, sand between your toes (self service). Come say hi, meet other guests and warm up for the main event on Friday. Dress code is whatever you want, just wear something White! We’ll post the exact bar and arrival time here as soon as it’s pinned down.',
    'updates.timelineTitle': 'Wedding day timeline',
    'updates.timelineBody':
      'Here we’ll share a rough timeline of the big day, so you can be part of every moment with us. All the details will be coming soon 🥳',
    'day.tbaBadge': 'Coming soon',
    'day.tbaNote': 'The timeline is not locked in yet — we’ll reveal the full schedule closer to the day.',

    // Info / venue / gifts / questions
    'info.title': 'Practical Info',
    'info.venueLabel': 'Venue',
    'info.venue': 'Salou, Tarragona — Costa Daurada, Spain',
    'info.dateLabel': 'Date',
    'info.date': 'Friday, 25 September 2026',
    'info.preWedding':
      'Thursday pre-wedding: a relaxed beach-bar (xiringuito) get-together — details to follow on the blog.',

    'gifts.title': 'Gifts',
    'gifts.body':
      'Your presence is the most important gift to us. If you’d like to help us keep dreaming, travelling and dancing together, you can do so here:',
    'gifts.holder': 'Mónica Herrero Vargas',
    'gifts.iban': 'IBAN: ES10 0081 0169 3600 0658 5164',
    'gifts.copy': 'Copy IBAN',
    'gifts.copied': 'Copied!',
    'gifts.thanks': 'Thank you so much from ❤️',

    'questions.title': 'Any questions?',
    'questions.body':
      'If you have any questions we’re happy to help — reach out anytime and we’ll get back to you as soon as we can 😇',

    // Itinerary
    'day.title': 'The Day',
    'day.subtitle': '25 September 2026 · Salou, Spain',
    'day.note': 'A rough timeline for the big day — full details coming soon 🥳',
    'day.e1.title': 'Guest Arrival',
    'day.e1.desc': 'Welcome drinks and finding your seat.',
    'day.e2.title': 'Ceremony',
    'day.e2.desc': 'The moment we say "I do" — bring tissues.',
    'day.e3.title': 'Cocktail Hour',
    'day.e3.desc': 'Drinks and canapés while we sneak off for photos.',
    'day.e4.title': 'Dinner',
    'day.e4.desc': 'Sit-down dinner, speeches and toasts.',
    'day.e5.title': 'First Dance & Party',
    'day.e5.desc': 'Hit the dance floor — this is where the magic happens.',
    'day.e6.title': 'Late Night Snacks',
    'day.e6.desc': 'Because dancing works up an appetite.',

    // Upload
    'upload.title': 'Share Your Photos',
    'upload.subtitle':
      'On the night, your photos go straight to our album — no sign-in needed.',
    'upload.nameLabel': 'Your name',
    'upload.optional': '(optional)',
    'upload.namePlaceholder': 'e.g. Sarah & Tom',
    'upload.success': 'Photos uploaded!',
    'upload.successDesc': 'Thank you for sharing your memories.',
    'upload.error': 'Something went wrong',
    'upload.errorDesc': 'Please try again — or send them to us directly.',
    'upload.counted': 'You’ve shared {n} photo today',
    'upload.countedPlural': 'You’ve shared {n} photos today',

    // Gallery
    'gallery.title': 'Photo Gallery',
    'gallery.subtitle': 'A few moments together',
    'gallery.subtitleStandalone': 'Moments from our journey together',
    'gallery.viewAll': 'View All Photos',
    'gallery.viewAllLong': 'View All Photos on Google Drive',
    'gallery.view': 'View',
    'gallery.noSignin': 'Opens Google Drive — no sign-in needed',
    'gallery.live': 'Live · updates as guests upload',
    'gallery.empty': 'No photos yet — be the first to upload!',
    'gallery.loading': 'Loading photos…',

    // Upload page (standalone)
    'upload.subtitleStandalone':
      'Help us capture every moment! Upload your photos from the celebration and they’ll go straight to our shared album.',
    'upload.tipsTitle': 'Tips',
    'upload.tip1': 'You can upload multiple photos at once',
    'upload.tip2': 'Photos go straight to our Google Drive album',
    'upload.tip3': 'No sign-in required!',

    // Itinerary page (standalone)
    'day.venueDetails': 'Venue Details',
    'day.venueLocation': 'Salou, Tarragona, Spain',
    'day.venueSoon': 'Full venue details coming soon',
    'day.timesNote':
      'Times are approximate and may shift slightly on the day. Just go with the flow and enjoy!',

    // Footer
    'footer.tag': 'Made with love for our wedding day',
  },
  es: {
    'nav.welcome': 'Bienvenidos',
    'nav.rsvp': 'Confirmar',
    'nav.updates': 'Novedades',
    'nav.day': 'El Día',
    'nav.gallery': 'Galería',
    'nav.upload': 'Fotos',

    'hero.welcome': '¡Nos casamos!',
    'hero.dateLocation': '25 de septiembre de 2026 · Salou, Tarragona',
    'hero.date': 'Viernes, 25 de septiembre de 2026',
    'hero.time': 'Llegada 13:30 · Ceremonia 14:00',
    'hero.place': 'INFINITUM Beach Club · Salou, Tarragona · España',
    'hero.countdownTitle': 'Hasta el «sí, quiero»',
    'hero.scrollHint': 'Desliza para ver más',
    'countdown.days': 'Días',
    'countdown.hours': 'Horas',
    'countdown.minutes': 'Min',
    'countdown.seconds': 'Seg',

    'welcome.title': '¡Bienvenidos a nuestra boda!',
    'welcome.headline': '¡Nos casamos 💍',
    'welcome.body':
      'Estamos inmensamente felices y deseando compartir este momento tan especial contigo. Hemos creado esta web para que puedas acompañarnos en el camino hasta el gran día y encontrar toda la información importante. También te pediremos algunos detalles que nos ayudarán a organizarlo todo con mucho cariño.',
    'welcome.cta': '¡No te olvides de confirmar y elegir tu menú aquí abajo!',
    'welcome.signoff': 'Gracias por formar parte de todo ésto. Nos vemos muy prontito 🥹🫶🏻',

    'rsvp.title': '¿Nos acompañas?',
    'rsvp.subtitle':
      'Para confirmar tu asistencia, solo tienes que escribir tu nombre y decirnos si vendrás. De paso, elige también tu plato principal.',
    'rsvp.firstName': 'Nombre',
    'rsvp.lastName': 'Apellido',
    'rsvp.attendance': '¿Asistirás?',
    'rsvp.attending': 'Sí, allí estaré',
    'rsvp.notAttending': 'Lamentablemente no puedo',
    'rsvp.meal': 'Plato principal',
    'rsvp.meat': 'Carne',
    'rsvp.fish': 'Pescado',
    'rsvp.vegetarian': 'Vegetariano',
    'rsvp.dietary': 'Alergias / dieta especial',
    'rsvp.dietaryHelp':
      '¿Alergias, intolerancias, vegetariano o vegano? Cuéntanoslo y cuidaremos cada detalle 💖',
    'rsvp.dietaryPlaceholder': 'p. ej. vegetariano, intolerancia a la lactosa…',
    'rsvp.message': 'Déjanos un mensaje (opcional)',
    'rsvp.messagePlaceholder': 'Unas palabras para nosotros 🥰',
    'rsvp.submit': 'Enviar confirmación',
    'rsvp.sending': 'Enviando…',
    'rsvp.thanks': '¡Gracias!',
    'rsvp.thanksAttending': '¡Qué ganas de celebrarlo contigo!',
    'rsvp.thanksDeclined': 'Te echaremos de menos — gracias por avisarnos.',
    'rsvp.edit': 'Editar mi respuesta',
    'rsvp.errorRequired': 'Completa tu nombre y selecciones, por favor.',
    'rsvp.errorSend': 'Algo salió mal. Inténtalo de nuevo.',
    'rsvp.skip': 'Quizá más tarde',
    'rsvp.openButton': 'Abrir formulario',
    'rsvp.guestN': 'Invitado/a {n}',
    'rsvp.youLabel': 'Tú',
    'rsvp.addGuest': '+ Añadir otro invitado',
    'rsvp.removeGuest': 'Quitar',
    'rsvp.guestNote': 'Añade a tu pareja, hijos o quien responda contigo.',
    'rsvp.partySummary': 'Grupo de {n}',

    'updates.title': 'Blog de boda',
    'updates.headline': '¡Atención ⚠️!',
    'updates.body':
      'Te recomendamos no perder de vista esta sección, ya que aquí iremos compartiendo las últimas novedades sobre la organización de la boda. A medida que se acerque el gran día, encontrarás aquí toda la información actualizada, incluyendo la hora y el lugar de la pre-boda del jueves (plan relax — xiringuito en la playa), por si te apetece pasarte y compartir un rato con nosotros y otros invitados. También indicaremos la hora a la que deberás llegar el viernes, día de la boda, para que todo fluya perfectamente.',
    'updates.beachTitle': 'Meet & Greet pre-boda del jueves 🏖️',
    'updates.beachWhen': 'Jueves, 24 de septiembre de 2026 — tarde tranquila',
    'updates.beachWhere': 'Confirmaremos el chiringuito / Beach Hut exacto',
    'updates.beachBody':
      'Antes del gran día nos encantaría reunirnos en un encuentro relajado en un chiringuito de playa: bebida, picoteo y arena entre los dedos (self service). Pasaos a saludar, conoced a otros invitados e id calentando motores para el viernes. Como código de vestimenta, lo que queráis… ¡siempre que lleve algo BLANCO! Publicaremos aquí el bar exacto y la hora de llegada en cuanto lo cerremos.',
    'updates.timelineTitle': 'Timeline del día',
    'updates.timelineBody':
      'Aquí compartiremos un breve resumen del timeline del gran día, para que puedas acompañarnos en cada momento. Pronto tendrás todos los detalles 🥳',
    'day.tbaBadge': 'Próximamente',
    'day.tbaNote':
      'El timeline aún no está cerrado — desvelaremos los horarios definitivos más cerca del día.',

    'info.title': 'Información práctica',
    'info.venueLabel': 'Lugar',
    'info.venue': 'Salou, Tarragona — Costa Daurada, España',
    'info.dateLabel': 'Fecha',
    'info.date': 'Viernes, 25 de septiembre de 2026',
    'info.preWedding':
      'Pre-boda del jueves: plan relax en un xiringuito de playa — detalles próximamente en el blog.',

    'gifts.title': 'Regalo',
    'gifts.body':
      'Vuestra presencia es lo más importante. Si queréis ayudarnos a seguir soñando, viajando y bailando juntos, podéis hacerlo aquí:',
    'gifts.holder': 'Mónica Herrero Vargas',
    'gifts.iban': 'IBAN: ES10 0081 0169 3600 0658 5164',
    'gifts.copy': 'Copiar IBAN',
    'gifts.copied': '¡Copiado!',
    'gifts.thanks': 'Muchas gracias de ❤️',

    'questions.title': '¿Alguna pregunta?',
    'questions.body':
      'Si tenéis cualquier duda estaremos encantados de ayudaros. Podéis escribirnos en cualquier momento y os responderemos lo antes posible 😇',

    'day.title': 'El Día',
    'day.subtitle': '25 de septiembre de 2026 · Salou, España',
    'day.note': 'Un resumen del gran día — pronto todos los detalles 🥳',
    'day.e1.title': 'Llegada de invitados',
    'day.e1.desc': 'Bebida de bienvenida y a buscar vuestro sitio.',
    'day.e2.title': 'Ceremonia',
    'day.e2.desc': 'El momento del «sí, quiero» — traed pañuelos.',
    'day.e3.title': 'Cóctel',
    'day.e3.desc': 'Bebidas y canapés mientras nos hacemos las fotos.',
    'day.e4.title': 'Cena',
    'day.e4.desc': 'Cena sentados, discursos y brindis.',
    'day.e5.title': 'Primer baile y fiesta',
    'day.e5.desc': 'A la pista de baile — aquí ocurre la magia.',
    'day.e6.title': 'Recena',
    'day.e6.desc': 'Porque bailar abre el apetito.',

    'upload.title': 'Comparte tus fotos',
    'upload.subtitle':
      'Esa noche, tus fotos van directas a nuestro álbum — sin registrarte.',
    'upload.nameLabel': 'Tu nombre',
    'upload.optional': '(opcional)',
    'upload.namePlaceholder': 'p. ej. Sara y Tomás',
    'upload.success': '¡Fotos subidas!',
    'upload.successDesc': 'Gracias por compartir vuestros recuerdos.',
    'upload.error': 'Algo salió mal',
    'upload.errorDesc': 'Inténtalo de nuevo — o envíanoslas directamente.',
    'upload.counted': 'Has compartido {n} foto hoy',
    'upload.countedPlural': 'Has compartido {n} fotos hoy',

    'gallery.title': 'Galería de fotos',
    'gallery.subtitle': 'Algunos momentos juntos',
    'gallery.subtitleStandalone': 'Momentos de nuestro camino juntos',
    'gallery.viewAll': 'Ver todas las fotos',
    'gallery.viewAllLong': 'Ver todas las fotos en Google Drive',
    'gallery.view': 'Ver',
    'gallery.noSignin': 'Abre Google Drive — sin registro',
    'gallery.live': 'En directo · se actualiza con cada subida',
    'gallery.empty': 'Aún no hay fotos — ¡sé el primero en subir!',
    'gallery.loading': 'Cargando fotos…',

    'upload.subtitleStandalone':
      '¡Ayúdanos a capturar cada momento! Sube tus fotos de la celebración y aparecerán directamente en nuestro álbum compartido.',
    'upload.tipsTitle': 'Consejos',
    'upload.tip1': 'Puedes subir varias fotos a la vez',
    'upload.tip2': 'Las fotos van directas a nuestro álbum de Google Drive',
    'upload.tip3': '¡Sin registro!',

    'day.venueDetails': 'Detalles del lugar',
    'day.venueLocation': 'Salou, Tarragona, España',
    'day.venueSoon': 'Próximamente todos los detalles del lugar',
    'day.timesNote':
      'Los horarios son aproximados y pueden variar ligeramente el día de la boda. Relájate y disfruta.',

    'footer.tag': 'Hecho con amor para nuestro día',
  },
  de: {
    // Nav
    'nav.welcome': 'Willkommen',
    'nav.rsvp': 'Zusagen',
    'nav.updates': 'Neuigkeiten',
    'nav.day': 'Der Tag',
    'nav.gallery': 'Galerie',
    'nav.upload': 'Fotos',

    // Hero
    'hero.welcome': 'Wir heiraten!',
    'hero.dateLocation': '25. September 2026 · Salou, Tarragona',
    'hero.date': 'Freitag, 25. September 2026',
    'hero.time': 'Ankunft 13:30 · Trauung 14:00',
    'hero.place': 'INFINITUM Beach Club · Salou, Tarragona · Spanien',
    'hero.countdownTitle': 'Bis zum „Ja-Wort“',
    'hero.scrollHint': 'Weiterscrollen für Details',
    'countdown.days': 'Tage',
    'countdown.hours': 'Std',
    'countdown.minutes': 'Min',
    'countdown.seconds': 'Sek',

    // Welcome / Intro
    'welcome.title': 'Willkommen zu unserer Hochzeit!',
    'welcome.headline': 'Wir heiraten 💍',
    'welcome.body':
      'Wir könnten nicht glücklicher sein und freuen uns riesig, diesen besonderen Moment mit euch zu teilen. Wir haben diese Website gestaltet, damit ihr uns auf dem Weg zum großen Tag begleiten und alle wichtigen Infos finden könnt. Außerdem fragen wir nach ein paar Details, die uns helfen, alles mit Liebe zu organisieren.',
    'welcome.cta': 'Vergesst nicht, unten zuzusagen und euer Menü auszuwählen!',
    'welcome.signoff': 'Danke, dass ihr Teil davon seid. Bis ganz bald 🥹🫶🏻',

    // RSVP
    'rsvp.title': 'Seid ihr dabei?',
    'rsvp.subtitle':
      'Um eure Teilnahme zu bestätigen, gebt einfach euren Namen an und sagt uns, ob ihr kommt. Wenn ihr schon dabei seid, wählt bitte auch euer Hauptgericht.',
    'rsvp.firstName': 'Vorname',
    'rsvp.lastName': 'Nachname',
    'rsvp.attendance': 'Wirst du dabei sein?',
    'rsvp.attending': 'Ja, ich bin dabei',
    'rsvp.notAttending': 'Leider kann ich nicht',
    'rsvp.meal': 'Hauptgericht',
    'rsvp.meat': 'Fleisch',
    'rsvp.fish': 'Fisch',
    'rsvp.vegetarian': 'Vegetarisch',
    'rsvp.dietary': 'Allergien / besondere Ernährung',
    'rsvp.dietaryHelp':
      'Allergien, Unverträglichkeiten, vegetarisch oder vegan? Schreibt es uns — wir kümmern uns um jedes Detail 💖',
    'rsvp.dietaryPlaceholder': 'z. B. vegetarisch, laktoseintolerant…',
    'rsvp.message': 'Hinterlasst uns eine Nachricht (optional)',
    'rsvp.messagePlaceholder': 'Ein paar Worte für uns 🥰',
    'rsvp.submit': 'Zusage absenden',
    'rsvp.sending': 'Wird gesendet…',
    'rsvp.thanks': 'Danke!',
    'rsvp.thanksAttending': 'Wir freuen uns riesig, mit euch zu feiern!',
    'rsvp.thanksDeclined': 'Wir werden euch vermissen — danke für die Rückmeldung.',
    'rsvp.edit': 'Antwort bearbeiten',
    'rsvp.errorRequired': 'Bitte Namen eingeben und Auswahl treffen.',
    'rsvp.errorSend': 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    'rsvp.skip': 'Vielleicht später',
    'rsvp.openButton': 'Formular öffnen',
    'rsvp.guestN': 'Gast {n}',
    'rsvp.youLabel': 'Du',
    'rsvp.addGuest': '+ Weiteren Gast hinzufügen',
    'rsvp.removeGuest': 'Entfernen',
    'rsvp.guestNote': 'Fügt euren Partner, Kinder oder Begleitung hinzu.',
    'rsvp.partySummary': 'Gruppe von {n}',

    // Updates
    'updates.title': 'Hochzeits-Blog',
    'updates.headline': 'Achtung ⚠️!',
    'updates.body':
      'Wir empfehlen, diesen Bereich im Auge zu behalten — hier teilen wir die neuesten Updates rund um die Organisation der Hochzeit. Je näher der große Tag rückt, desto mehr Infos findet ihr hier, inklusive Uhrzeit und Ort des Vorabend-Treffens am Donnerstag (entspannt — Strandbar) und der Ankunftszeit am Freitag, damit alles reibungslos läuft.',
    'updates.beachTitle': 'Donnerstags Meet & Greet vor der Hochzeit 🏖️',
    'updates.beachWhen': 'Donnerstag, 24. September 2026 — entspannter Nachmittag',
    'updates.beachWhere': 'Den genauen Chiringuito / Beach Hut bestätigen wir noch',
    'updates.beachBody':
      'Vor dem großen Tag möchten wir uns gerne ganz entspannt in einer Strandbar treffen: Drinks, Snacks und Sand zwischen den Zehen (Selbstbedienung). Kommt vorbei, lernt die anderen Gäste kennen und stimmt euch auf den Freitag ein. Dresscode: tragt was ihr wollt … solange etwas WEISSES dabei ist! Wir posten hier den genauen Ort und die Uhrzeit, sobald es feststeht.',
    'updates.timelineTitle': 'Tagesablauf',
    'updates.timelineBody':
      'Hier teilen wir bald eine kurze Übersicht des Tagesablaufs, damit ihr uns durch jeden Moment begleiten könnt. Die Details folgen bald 🥳',
    'day.tbaBadge': 'Demnächst',
    'day.tbaNote':
      'Der Tagesablauf steht noch nicht endgültig fest — die finalen Zeiten verraten wir näher am großen Tag.',

    // Practical info
    'info.title': 'Wichtige Infos',
    'info.venueLabel': 'Ort',
    'info.venue': 'Salou, Tarragona — Costa Daurada, Spanien',
    'info.dateLabel': 'Datum',
    'info.date': 'Freitag, 25. September 2026',
    'info.preWedding':
      'Donnerstags-Vorhochzeit: entspannter Nachmittag in einer Strandbar — Details folgen bald im Blog.',

    // Gifts
    'gifts.title': 'Geschenk',
    'gifts.body':
      'Eure Anwesenheit bedeutet uns am meisten. Wenn ihr uns helfen wollt, weiter zu träumen, zu reisen und zu tanzen, könnt ihr das hier tun:',
    'gifts.holder': 'Mónica Herrero Vargas',
    'gifts.iban': 'IBAN: ES10 0081 0169 3600 0658 5164',
    'gifts.copy': 'IBAN kopieren',
    'gifts.copied': 'Kopiert!',
    'gifts.thanks': 'Vielen Dank von ❤️',

    // Questions
    'questions.title': 'Noch Fragen?',
    'questions.body':
      'Wenn ihr Fragen habt, helfen wir gerne weiter. Schreibt uns jederzeit und wir antworten so schnell wie möglich 😇',

    // The Day
    'day.title': 'Der Tag',
    'day.subtitle': '25. September 2026 · Salou, Spanien',
    'day.note': 'Eine Übersicht des großen Tages — Details folgen bald 🥳',
    'day.e1.title': 'Ankunft der Gäste',
    'day.e1.desc': 'Begrüßungsgetränk und Plätze suchen.',
    'day.e2.title': 'Trauung',
    'day.e2.desc': 'Der „Ja“-Moment — Taschentücher mitbringen.',
    'day.e3.title': 'Sektempfang',
    'day.e3.desc': 'Drinks und Häppchen, während wir Fotos machen.',
    'day.e4.title': 'Abendessen',
    'day.e4.desc': 'Sitzendes Dinner, Reden und Anstoßen.',
    'day.e5.title': 'Eröffnungstanz & Party',
    'day.e5.desc': 'Auf die Tanzfläche — hier passiert die Magie.',
    'day.e6.title': 'Mitternachtssnack',
    'day.e6.desc': 'Tanzen macht hungrig.',

    // Upload (homepage)
    'upload.title': 'Teilt eure Fotos',
    'upload.subtitle':
      'Eure Fotos landen direkt in unserem Album — ohne Anmeldung.',
    'upload.nameLabel': 'Dein Name',
    'upload.optional': '(optional)',
    'upload.namePlaceholder': 'z. B. Sarah & Tom',
    'upload.success': 'Fotos hochgeladen!',
    'upload.successDesc': 'Danke, dass ihr eure Erinnerungen teilt.',
    'upload.error': 'Etwas ist schiefgelaufen',
    'upload.errorDesc': 'Bitte erneut versuchen — oder schickt sie uns direkt.',
    'upload.counted': 'Du hast heute {n} Foto geteilt',
    'upload.countedPlural': 'Du hast heute {n} Fotos geteilt',

    // Gallery
    'gallery.title': 'Fotogalerie',
    'gallery.subtitle': 'Ein paar Momente zusammen',
    'gallery.subtitleStandalone': 'Momente von unserem gemeinsamen Weg',
    'gallery.viewAll': 'Alle Fotos ansehen',
    'gallery.viewAllLong': 'Alle Fotos auf Google Drive ansehen',
    'gallery.view': 'Ansehen',
    'gallery.noSignin': 'Öffnet Google Drive — keine Anmeldung nötig',
    'gallery.live': 'Live · aktualisiert sich mit jedem Upload',
    'gallery.empty': 'Noch keine Fotos — sei der/die Erste beim Upload!',
    'gallery.loading': 'Fotos werden geladen…',

    // Upload page (standalone)
    'upload.subtitleStandalone':
      'Hilf uns, jeden Moment festzuhalten! Lade deine Fotos von der Feier hoch — sie landen direkt in unserem geteilten Album.',
    'upload.tipsTitle': 'Tipps',
    'upload.tip1': 'Du kannst mehrere Fotos auf einmal hochladen',
    'upload.tip2': 'Fotos gehen direkt in unser Google-Drive-Album',
    'upload.tip3': 'Keine Anmeldung nötig!',

    // Itinerary page (standalone)
    'day.venueDetails': 'Veranstaltungsort',
    'day.venueLocation': 'Salou, Tarragona, Spanien',
    'day.venueSoon': 'Vollständige Details zum Ort folgen bald',
    'day.timesNote':
      'Die Zeiten sind ungefähr und können sich am Tag leicht verschieben. Lasst euch einfach treiben und genießt!',

    // Footer
    'footer.tag': 'Mit Liebe für unseren Hochzeitstag gemacht',
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'mm-wedding-lang';

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es' || stored === 'de') return stored;
  } catch {
    /* ignore */
  }
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of langs) {
    if (l?.toLowerCase().startsWith('es')) return 'es';
    if (l?.toLowerCase().startsWith('de')) return 'de';
    if (l?.toLowerCase().startsWith('en')) return 'en';
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
