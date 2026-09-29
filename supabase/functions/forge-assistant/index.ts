import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Assistant-Questions-Remaining",
  "Cache-Control": "no-store",
};

const supportedLanguages = ["fr", "en", "es", "it"] as const;
type Language = (typeof supportedLanguages)[number];
type LocalizedText = Record<Language, string>;

const faqEntries: { questions: LocalizedText; answers: LocalizedText }[] = [
  {
    questions: {
      fr: "Que puis-je faire dans Forge ?",
      en: "What can I do in Forge?",
      es: "¿Qué puedo hacer en Forge?",
      it: "Cosa posso fare con Forge?",
    },
    answers: {
      fr: "Forge te permet de créer et suivre tes séances, gérer ta bibliothèque d’exercices, consulter ton historique et tes statistiques de progression, voir des exemples de menus et, si ton profil est éligible, suivre ton cycle. Il n’y a pas de messagerie entre utilisateurs.",
      en: "Forge lets you create and track workouts, manage your exercise library, review your history and progress statistics, view sample meal plans, and track your cycle if your profile is eligible. There is no messaging between users.",
      es: "Forge te permite crear y seguir entrenamientos, gestionar tu biblioteca de ejercicios, consultar tu historial y tus estadísticas de progreso, ver ejemplos de menús y, si tu perfil cumple los requisitos, hacer seguimiento de tu ciclo. No hay mensajería entre usuarios.",
      it: "Forge ti permette di creare e seguire gli allenamenti, gestire la tua raccolta di esercizi, consultare lo storico e le statistiche dei progressi, vedere esempi di menu e, se il tuo profilo è idoneo, monitorare il ciclo. Non è disponibile una messaggistica tra utenti.",
    },
  },
  {
    questions: {
      fr: "Comment créer une séance ?",
      en: "How do I create a workout?",
      es: "¿Cómo creo un entrenamiento?",
      it: "Come creo un allenamento?",
    },
    answers: {
      fr: "Ouvre la page Entraînement, saisis un nom de séance puis démarre-la. Tu peux ensuite ajouter des exercices, enregistrer tes séries, poids et répétitions, puis terminer la séance.",
      en: "Open the Workout page, enter a workout name, then start it. You can add exercises, record sets, weights and repetitions, and finish the workout.",
      es: "Abre la página Entrenamiento, escribe un nombre para la sesión y ponla en marcha. Después puedes añadir ejercicios, registrar series, pesos y repeticiones, y finalizarla.",
      it: "Apri la pagina Allenamento, inserisci il nome della sessione e avviala. Poi puoi aggiungere esercizi, registrare serie, pesi e ripetizioni e terminare la sessione.",
    },
  },
  {
    questions: {
      fr: "Comment suivre ma progression ?",
      en: "How can I track my progress?",
      es: "¿Cómo puedo seguir mi progreso?",
      it: "Come posso seguire i miei progressi?",
    },
    answers: {
      fr: "Ouvre la page Progression pour consulter tes statistiques d’entraînement, l’évolution des poids et tes records personnels. Tu peux aussi y supprimer les séances antérieures à la semaine dernière.",
      en: "Open the Progress page to review your workout statistics, weight progress and personal records. You can also delete workouts older than last week there.",
      es: "Abre la página Progreso para consultar tus estadísticas de entrenamiento, la evolución de los pesos y tus récords personales. También puedes eliminar allí los entrenamientos anteriores a la semana pasada.",
      it: "Apri la pagina Progressi per consultare le statistiche degli allenamenti, l’andamento dei pesi e i record personali. Da lì puoi anche eliminare gli allenamenti precedenti alla settimana scorsa.",
    },
  },
  {
    questions: {
      fr: "À quoi sert la page Objectifs ?",
      en: "What is the Goals page for?",
      es: "¿Para qué sirve la página Objetivos?",
      it: "A cosa serve la pagina Obiettivi?",
    },
    answers: {
      fr: "La page Objectifs propose deux exemples de menus sur sept jours : prise de masse et sèche. Ce sont des exemples généraux, pas des plans personnalisés ni des conseils médicaux.",
      en: "The Goals page offers two sample seven-day meal plans: muscle gain and cutting. They are general examples, not personalized plans or medical advice.",
      es: "La página Objetivos ofrece dos ejemplos de menús de siete días: ganancia muscular y definición. Son ejemplos generales, no planes personalizados ni consejos médicos.",
      it: "La pagina Obiettivi propone due esempi di menu di sette giorni: aumento della massa muscolare e definizione. Sono esempi generali, non piani personalizzati né consigli medici.",
    },
  },
  {
    questions: {
      fr: "Comment fonctionne le suivi du cycle ?",
      en: "How does cycle tracking work?",
      es: "¿Cómo funciona el seguimiento del ciclo?",
      it: "Come funziona il monitoraggio del ciclo?",
    },
    answers: {
      fr: "Les profils indiqués comme féminins peuvent enregistrer les dates de leur cycle et consulter des estimations. La page Cycle apparaît uniquement pour ces profils ; ses estimations sont indicatives et ne remplacent pas un avis médical.",
      en: "Profiles marked as female can record cycle dates and view estimates. The Cycle page is shown only for those profiles; estimates are for guidance and are not medical advice.",
      es: "Los perfiles indicados como femeninos pueden registrar las fechas del ciclo y consultar estimaciones. La página Ciclo solo aparece para esos perfiles; las estimaciones son orientativas y no sustituyen el consejo médico.",
      it: "I profili indicati come femminili possono registrare le date del ciclo e consultare stime. La pagina Ciclo appare solo per questi profili; le stime sono indicative e non sostituiscono un parere medico.",
    },
  },
  {
    questions: {
      fr: "Comment ajouter un exercice ?",
      en: "How do I add an exercise?",
      es: "¿Cómo añado un ejercicio?",
      it: "Come aggiungo un esercizio?",
    },
    answers: {
      fr: "Ouvre la page Mes exercices, sélectionne Ajouter un exercice, renseigne son nom et son groupe musculaire, puis enregistre.",
      en: "Open the My Exercises page, select Add exercise, enter its name and muscle group, then save.",
      es: "Abre la página Mis ejercicios, selecciona Añadir ejercicio, introduce el nombre y el grupo muscular, y guarda.",
      it: "Apri la pagina I miei esercizi, seleziona Aggiungi esercizio, inserisci il nome e il gruppo muscolare, poi salva.",
    },
  },
  {
    questions: {
      fr: "Où retrouver mes séances terminées ?",
      en: "Where can I find my completed workouts?",
      es: "¿Dónde puedo encontrar mis entrenamientos terminados?",
      it: "Dove trovo i miei allenamenti completati?",
    },
    answers: {
      fr: "Ouvre la page Historique pour voir tes séances terminées. Sélectionne une séance pour consulter ses exercices, ses séries et son volume total.",
      en: "Open the History page to see your completed workouts. Select one to review its exercises, sets and total volume.",
      es: "Abre la página Historial para ver tus entrenamientos terminados. Selecciona uno para consultar sus ejercicios, series y volumen total.",
      it: "Apri la pagina Cronologia per vedere gli allenamenti completati. Selezionane uno per consultare esercizi, serie e volume totale.",
    },
  },
  {
    questions: {
      fr: "Puis-je envoyer un message à un membre de Forge ?",
      en: "Can I message another Forge member?",
      es: "¿Puedo enviar un mensaje a otro miembro de Forge?",
      it: "Posso inviare un messaggio a un altro membro di Forge?",
    },
    answers: {
      fr: "Non. Forge ne propose pas de messagerie pour contacter d’autres utilisateurs.",
      en: "No. Forge does not provide messaging to contact other users.",
      es: "No. Forge no ofrece mensajería para contactar con otros usuarios.",
      it: "No. Forge non offre una messaggistica per contattare altri utenti.",
    },
  },
];

const unsupportedAnswers: LocalizedText = {
  fr: "Je réponds uniquement aux huit questions proposées. Choisis une suggestion affichée dans l’assistant.",
  en: "I can only answer the eight questions provided. Choose one of the suggestions shown in the assistant.",
  es: "Solo puedo responder a las ocho preguntas disponibles. Elige una de las sugerencias del asistente.",
  it: "Posso rispondere solo alle otto domande disponibili. Scegli uno dei suggerimenti mostrati nell’assistente.",
};

function jsonResponse(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function textEventResponse(content: string, questionsRemaining?: number) {
  const events = `data: ${JSON.stringify({ response: content })}\n\ndata: [DONE]\n\n`;
  const headers: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "text/event-stream; charset=utf-8",
  };

  if (questionsRemaining !== undefined) {
    headers["X-Assistant-Questions-Remaining"] = String(questionsRemaining);
  }

  return new Response(events, { status: 200, headers });
}

function getDefaultKey(legacyVariable: string, keySetVariable: string) {
  const legacyKey = Deno.env.get(legacyVariable);
  if (legacyKey) return legacyKey;

  try {
    const keySet = JSON.parse(Deno.env.get(keySetVariable) ?? "{}");
    return keySet.default ?? null;
  } catch {
    return null;
  }
}

function normalizeQuestion(question: string) {
  return question
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && supportedLanguages.includes(value as Language);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  const accessToken = request.headers
    .get("Authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!accessToken) return jsonResponse(401, { error: "unauthorized" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = getDefaultKey(
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEYS",
  );
  if (!supabaseUrl || !publishableKey) {
    return jsonResponse(500, { error: "server_configuration_error" });
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser(accessToken);
  if (authError || !user) return jsonResponse(401, { error: "unauthorized" });

  let payload: { message?: unknown; language?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: "invalid_request" });
  }

  if (
    typeof payload.message !== "string" ||
    !payload.message.trim() ||
    payload.message.length > 1000
  ) {
    return jsonResponse(400, { error: "invalid_message" });
  }

  const language: Language = isLanguage(payload.language) ? payload.language : "fr";
  const normalizedQuestion = normalizeQuestion(payload.message);
  const faqEntry = faqEntries.find(
    ({ questions }) => normalizeQuestion(questions[language]) === normalizedQuestion,
  );

  if (!faqEntry) {
    return textEventResponse(unsupportedAnswers[language]);
  }

  const { data: questionsRemaining, error: quotaError } = await userClient.rpc(
    "consume_assistant_question",
  );
  if (quotaError) {
    console.error("forge-assistant: daily quota check failed", quotaError.message);
    return jsonResponse(503, { error: "quota_check_unavailable" });
  }
  if (typeof questionsRemaining !== "number" || questionsRemaining < 0) {
    return jsonResponse(429, { error: "daily_quota_reached" });
  }

  return textEventResponse(faqEntry.answers[language], questionsRemaining);
});
