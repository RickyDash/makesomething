export type FormationWarmupStep = {
  lesson: string;
  prompt: string;
  options: string[];
  answer: number;
  note: string;
  noteWrong: string;
};

export const formationWarmups: FormationWarmupStep[] = [
  {
    lesson:
      "First rule of the race: answers are final. The moment you tap an option it locks in — no changing your mind, no second tap.",
    prompt: "So once you tap an answer, can you change it?",
    options: [
      "Yes — any time before the lap ends",
      "No — it locks the moment you tap",
      "Yes — but only once",
    ],
    answer: 1,
    note: "Exactly — one tap and it’s locked. Make your first call count.",
    noteWrong:
      "Answers can’t be changed — one tap and it’s locked, here and in the race.",
  },
  {
    lesson:
      "The race is 6 quiz questions long, and each question counts as one lap — 6 questions, 6 laps. Every correct answer moves you up the field, and your answers decide where you finish.",
    prompt: "How many laps is the 6-question race?",
    options: ["60 laps", "As many as you like", "6 laps — one lap per question"],
    answer: 2,
    note: "That’s it — six questions, six laps, and every right answer gains you places.",
    noteWrong: "Each question is one lap, so the 6-question race is 6 laps.",
  },
  {
    lesson:
      "Halfway through the race you’ll make a pit stop: a quick timed challenge where you tap the 4 tyres in the right order, as fast as you can. The clock runs the whole time you’re stopped.",
    prompt: "What happens at the halfway pit stop?",
    options: [
      "Answer a bonus question",
      "Tap the 4 tyres in order, against the clock",
      "Nothing — it happens automatically",
    ],
    answer: 1,
    note: "You’ve got it — four tyres, right order, quick hands. See you at halfway.",
    noteWrong:
      "The pit stop is hands-on — you tap the 4 tyres in order, racing the clock.",
  },
];

// The V1 skin renders all copy lowercase; derive it so the two skins can never drift.
export const formationWarmupsV1: FormationWarmupStep[] = formationWarmups.map(
  (step) => ({
    ...step,
    lesson: step.lesson.toLowerCase(),
    prompt: step.prompt.toLowerCase(),
    options: step.options.map((option) => option.toLowerCase()),
    note: step.note.toLowerCase(),
    noteWrong: step.noteWrong.toLowerCase(),
  }),
);
