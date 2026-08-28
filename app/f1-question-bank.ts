export type Question = {
  prompt: string;
  options: string[];
  answer: number;
  fact: string;
  event: string;
};

export type Difficulty = "beginner" | "regular";

export const CATEGORIES = [
  "circuits",
  "champions & records",
  "rules & flags",
  "strategy & tyres",
  "racecraft & feel",
  "iconic moments",
  "teams & culture",
  "race weekend",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type QuestionTier = "beginner" | "regular" | "both";

export type BankQuestion = {
  prompt: string;
  correct: string;
  distractors: string[];
  beginnerDistractors?: string[];
  fact: string;
  category: Category;
  tier: QuestionTier;
};

export const questionBank: BankQuestion[] = [
  {
    "prompt": "what does drs stand for in formula 1?",
    "correct": "drag reduction system",
    "distractors": [
      "driver response strategy",
      "downforce recovery setup",
      "dynamic racing sequence"
    ],
    "fact": "drs opens a flap in the rear wing to reduce drag and boost straight-line speed.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "what color flag signals immediate race stoppage?",
    "correct": "red",
    "distractors": [
      "blue",
      "yellow",
      "black"
    ],
    "fact": "a red flag stops the session and sends everyone back to pit lane.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "what does the chequered flag mean?",
    "correct": "race finished",
    "distractors": [
      "session suspended",
      "safety car deployed",
      "mandatory pit stop"
    ],
    "fact": "the chequered flag marks the end of the race session.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "who takes pole position for sunday's race?",
    "correct": "the fastest driver in q3",
    "distractors": [
      "the championship leader",
      "the previous race winner",
      "the sprint race winner"
    ],
    "fact": "pole rewards saturday's single fastest lap — though grid penalties can still shuffle who actually lines up first on sunday.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "what is the main purpose of the safety car?",
    "correct": "neutralize race pace for safety",
    "distractors": [
      "to lead cars back to the pit lane",
      "to signal the end of the session",
      "to test the circuit before the race"
    ],
    "fact": "the safety car slows and bunches the field so marshals can work safely.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "under a virtual safety car, what must drivers do?",
    "correct": "follow a reduced delta pace",
    "distractors": [
      "slow down only in yellow-flag sectors",
      "line up behind the safety car",
      "pit at the end of that lap"
    ],
    "fact": "under vsc, drivers follow a minimum delta time instead of racing flat out.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "what does a blue flag usually indicate?",
    "correct": "faster car is lapping you",
    "distractors": [
      "a penalty is being investigated",
      "the pit lane is closed",
      "a slower car is just ahead"
    ],
    "fact": "blue flags warn a slower car that a faster one is approaching to lap.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "what does a black flag mean?",
    "correct": "car is disqualified and must return",
    "distractors": [
      "a warning for driving standards",
      "the car must serve a stop-go penalty",
      "the race is suspended"
    ],
    "beginnerDistractors": [
      "the race is canceled",
      "the safety car is ending",
      "the track is slippery ahead"
    ],
    "fact": "the black flag means instant disqualification — f1's rarest and most final signal, shown only a handful of times in the modern era.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "what does a yellow flag mean for drivers?",
    "correct": "danger ahead, no overtaking",
    "distractors": [
      "the race is finished",
      "a mandatory pit stop is due",
      "the track is clear again"
    ],
    "fact": "yellow flag means caution and no overtaking in that zone.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "which tyre is designed for damp conditions without standing water?",
    "correct": "intermediate",
    "distractors": [
      "soft",
      "hard",
      "medium"
    ],
    "fact": "intermediates are made for a damp track and light spray conditions.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "which tyre is designed for heavy rain and standing water?",
    "correct": "full wet",
    "distractors": [
      "soft",
      "medium",
      "hard"
    ],
    "fact": "a full wet tyre can shift around 85 litres of water per second at speed — yet modern full wets mostly appear behind the safety car, because spray blinds the drivers long before grip runs out.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "what is a chicane?",
    "correct": "a quick left-right or right-left sequence",
    "distractors": [
      "a long straight",
      "a hairpin bend",
      "a banked corner"
    ],
    "fact": "a chicane is a rapid change of direction added to slow cars down.",
    "category": "circuits",
    "tier": "beginner"
  },
  {
    "prompt": "what is slipstreaming in f1?",
    "correct": "using reduced drag behind another car",
    "distractors": [
      "braking late to defend a position",
      "coasting to save fuel",
      "running extra downforce for the corners"
    ],
    "fact": "a car behind can gain speed by sitting in lower-pressure air.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what is an out lap?",
    "correct": "lap leaving pits to start a run",
    "distractors": [
      "the final lap of the race",
      "a lap under the safety car",
      "a practice-start lap"
    ],
    "fact": "an out lap starts when a car exits the pit lane before a timed push lap.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "what is an in lap?",
    "correct": "lap returning to the pit lane",
    "distractors": [
      "the lap before lights out",
      "the first lap of a stint",
      "the formation lap"
    ],
    "fact": "an in lap is the lap where the driver comes back to pits.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "what does downforce mainly help with?",
    "correct": "cornering grip",
    "distractors": [
      "top speed on the straights",
      "fuel efficiency",
      "tyre warm-up"
    ],
    "fact": "more downforce improves corner speed but usually increases drag.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "when is drs typically enabled in a race?",
    "correct": "when a driver is within one second at detection",
    "distractors": [
      "anytime in sector 1",
      "only on the final lap",
      "only in wet races"
    ],
    "fact": "drs is usually available if the chasing car is within one second at the detection point.",
    "category": "racecraft & feel",
    "tier": "regular"
  },
  {
    "prompt": "roughly how long is a standard grand prix race distance?",
    "correct": "about 305 km",
    "distractors": [
      "about 220 km",
      "about 150 km",
      "about 500 km"
    ],
    "fact": "race lengths are set as the fewest full laps that pass 305 km, which is why lap counts differ so much between circuits.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "which race is the classic exception to the ~305 km distance rule?",
    "correct": "monaco grand prix",
    "distractors": [
      "british grand prix",
      "italian grand prix",
      "japanese grand prix"
    ],
    "fact": "the streets are so slow that a full-length race would blow past the time limit, so monaco runs to its own reduced distance of roughly 260 km.",
    "category": "race weekend",
    "tier": "regular"
  },
  {
    "prompt": "which company has been f1's sole tyre supplier since 2011?",
    "correct": "pirelli",
    "distractors": [
      "michelin",
      "bridgestone",
      "goodyear"
    ],
    "fact": "pirelli has supplied every team since 2011, and beat a rival bridgestone bid to keep the contract through at least 2027.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "which era began in 2014 in formula 1?",
    "correct": "turbo-hybrid power unit era",
    "distractors": [
      "v10 return era",
      "ground effect ban era",
      "manual gearbox era"
    ],
    "fact": "the 1.6-litre v6 turbo-hybrid formula arrived in 2014 and ran through 2025, before the 2026 rules overhaul.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2007?",
    "correct": "kimi raikkonen",
    "distractors": [
      "lewis hamilton",
      "fernando alonso",
      "felipe massa"
    ],
    "beginnerDistractors": [
      "michael schumacher",
      "jenson button",
      "nico rosberg"
    ],
    "fact": "räikkönen took the 2007 title by one point in his first ferrari season, winning the brazil finale from third in the standings — hamilton and alonso finished level, just behind.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2008?",
    "correct": "lewis hamilton",
    "distractors": [
      "felipe massa",
      "robert kubica",
      "kimi raikkonen"
    ],
    "beginnerDistractors": [
      "fernando alonso",
      "sebastian vettel",
      "max verstappen"
    ],
    "fact": "hamilton passed timo glock's dry-tyred toyota on the rain-hit final lap in brazil to grab p5 — snatching the title from race-winner massa by a single point.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2010?",
    "correct": "sebastian vettel",
    "distractors": [
      "fernando alonso",
      "mark webber",
      "lewis hamilton"
    ],
    "beginnerDistractors": [
      "lewis hamilton",
      "michael schumacher",
      "jenson button"
    ],
    "fact": "four drivers could still win at the abu dhabi finale; vettel took it aged 23 — the youngest champion ever — without leading the standings until that day.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2016?",
    "correct": "nico rosberg",
    "distractors": [
      "lewis hamilton",
      "daniel ricciardo",
      "sebastian vettel"
    ],
    "beginnerDistractors": [
      "fernando alonso",
      "jenson button",
      "michael schumacher"
    ],
    "fact": "rosberg beat teammate hamilton by five points — then announced his retirement five days later.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2024?",
    "correct": "max verstappen",
    "distractors": [
      "lando norris",
      "charles leclerc",
      "oscar piastri"
    ],
    "beginnerDistractors": [
      "lewis hamilton",
      "fernando alonso",
      "sebastian vettel"
    ],
    "fact": "verstappen made it four titles in a row even as his car lost its edge — a mid-season run of around ten races without a win — sealing the crown with two rounds to spare.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the monza grand prix circuit?",
    "correct": "italy",
    "distractors": [
      "france",
      "spain",
      "austria"
    ],
    "beginnerDistractors": [
      "belgium",
      "united arab emirates",
      "japan"
    ],
    "fact": "monza opened in 1922 — built in about 110 days — and is the oldest purpose-built circuit still hosting a grand prix.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the spa-francorchamps grand prix circuit?",
    "correct": "belgium",
    "distractors": [
      "france",
      "netherlands",
      "luxembourg"
    ],
    "beginnerDistractors": [
      "united kingdom",
      "united states",
      "bahrain"
    ],
    "fact": "spa's ardennes microclimate is so fickle it can rain on one part of the lap while the rest stays dry.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the suzuka grand prix circuit?",
    "correct": "japan",
    "distractors": [
      "china",
      "south korea",
      "malaysia"
    ],
    "beginnerDistractors": [
      "brazil",
      "spain",
      "saudi arabia"
    ],
    "fact": "suzuka's layout was drawn by dutch designer john hugenholtz — the same name that marks zandvoort's steepest banked corner.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the interlagos grand prix circuit?",
    "correct": "brazil",
    "distractors": [
      "argentina",
      "mexico",
      "portugal"
    ],
    "beginnerDistractors": [
      "united arab emirates",
      "bahrain",
      "japan"
    ],
    "fact": "interlagos runs anticlockwise — one of the few circuits that turn mostly left, which drivers' necks feel by half distance.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the zandvoort grand prix circuit?",
    "correct": "netherlands",
    "distractors": [
      "belgium",
      "germany",
      "denmark"
    ],
    "beginnerDistractors": [
      "hungary",
      "mexico",
      "spain"
    ],
    "fact": "zandvoort's final corner is banked at 18 degrees — double the banking of indianapolis — so cars sweep onto the straight at full throttle.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the marina bay grand prix circuit?",
    "correct": "singapore",
    "distractors": [
      "malaysia",
      "thailand",
      "indonesia"
    ],
    "beginnerDistractors": [
      "azerbaijan",
      "germany",
      "united kingdom"
    ],
    "fact": "marina bay staged f1's first night race in 2008 under about 1,600 floodlights — and still runs entirely after dark.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which f1 team is nicknamed the prancing horse?",
    "correct": "ferrari",
    "distractors": [
      "mclaren",
      "williams",
      "sauber"
    ],
    "fact": "the prancing horse is ferrari's iconic symbol.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "which team is often called the silver arrows in modern f1?",
    "correct": "mercedes",
    "distractors": [
      "red bull",
      "aston martin",
      "alpine"
    ],
    "fact": "silver arrows is the classic nickname for mercedes motorsport.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "which team is strongly associated with papaya orange?",
    "correct": "mclaren",
    "distractors": [
      "ferrari",
      "williams",
      "haas"
    ],
    "fact": "papaya orange is mclaren's signature modern race color.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "the tifosi are famously passionate fans of which team?",
    "correct": "ferrari",
    "distractors": [
      "mercedes",
      "red bull",
      "alpine"
    ],
    "fact": "tifosi is the traditional name for ferrari's fan base.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "in 2021, what controversial event decided the championship on the final lap at abu dhabi?",
    "correct": "a late safety car restart",
    "distractors": [
      "a red flag restart",
      "a penalty for max verstappen",
      "a mechanical failure for hamilton"
    ],
    "fact": "race control let only the five lapped cars between the leaders unlap themselves, setting up a one-lap shootout that decided the title — the fia later called it human error.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "at which 2021 race did lando norris lose his first win by staying out on slicks as rain fell?",
    "correct": "the russian gp at sochi",
    "distractors": [
      "the turkish gp",
      "the belgian gp",
      "the hungarian gp"
    ],
    "fact": "norris led late from his first pole; the rain came, he gambled on slicks, and lewis hamilton swept past to take his 100th grand prix win.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "what did sebastian vettel do after winning the 2013 indian gp to celebrate his 4th title?",
    "correct": "did doughnuts on the straight",
    "distractors": [
      "sprinted to the crowd",
      "threw his steering wheel",
      "climbed a fence"
    ],
    "fact": "the stewards reprimanded vettel and fined red bull 25,000 euros — officially for skipping parc ferme, not for the smoke show itself.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "at canada 2019, which driver was given a controversial 5-second penalty while leading, costing them the win?",
    "correct": "vettel",
    "distractors": [
      "leclerc",
      "bottas",
      "ricciardo"
    ],
    "fact": "vettel crossed the line first but a 5-second penalty for an unsafe rejoin gave hamilton the win, sparking huge controversy.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "which team principal shouted 'no michael, no no michael, that was so not right!' on the radio at abu dhabi 2021?",
    "correct": "toto wolff",
    "distractors": [
      "christian horner",
      "guenther steiner",
      "helmut marko"
    ],
    "fact": "toto wolff's plea to race director michael masi drew the equally famous reply: 'toto, it's called a motor race, okay?'",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "which circuit is known as the 'temple of speed'?",
    "correct": "monza",
    "distractors": [
      "silverstone",
      "spa",
      "baku"
    ],
    "fact": "monza's low-downforce, high-speed layout earned it the legendary nickname.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "what is 'porpoising' that plagued teams in 2022?",
    "correct": "car bouncing violently at high speed",
    "distractors": [
      "excessive tyre wear",
      "engine overheating",
      "gearbox vibrations"
    ],
    "fact": "the 2022 ground effect cars caused violent vertical oscillations on straights as downforce rapidly stalled and reattached.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "which driver famously said 'leave me alone, i know what i'm doing' during a race?",
    "correct": "kimi raikkonen",
    "distractors": [
      "fernando alonso",
      "lewis hamilton",
      "max verstappen"
    ],
    "fact": "the 2012 abu dhabi radio went straight onto commemorative lotus t-shirts — räikkönen won the race, naturally.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "'multi 21, seb' was a famous team order controversy involving which team?",
    "correct": "red bull",
    "distractors": [
      "ferrari",
      "mercedes",
      "mclaren"
    ],
    "fact": "vettel ignored the 'multi 21' team order and overtook webber to win the 2013 malaysian gp, causing a massive rift.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "what is the 'halo' device on modern f1 cars designed to protect against?",
    "correct": "head impacts from debris",
    "distractors": [
      "rain spray",
      "engine fires",
      "tyre blowouts"
    ],
    "fact": "the titanium hoop above the cockpit arrived in 2018 to widespread grumbling — and has been credited with saving several drivers since.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "which driver walked away from a fiery 67g crash at bahrain 2020?",
    "correct": "romain grosjean",
    "distractors": [
      "pierre gasly",
      "lance stroll",
      "carlos sainz"
    ],
    "fact": "grosjean's car split the barrier and caught fire; he climbed out after about 28 seconds in the flames, and credits the halo with saving his life.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "if it starts raining mid-race, who makes the call to switch to wet tyres?",
    "correct": "the driver and their team",
    "distractors": [
      "the fia race director",
      "the team principal alone",
      "the tyre supplier"
    ],
    "fact": "tyre strategy including weather calls is entirely the team's decision — getting the timing right can make or break a race.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "what does 'box box box' mean on f1 team radio?",
    "correct": "come into the pits this lap",
    "distractors": [
      "retire the car",
      "penalty incoming",
      "push for fastest lap"
    ],
    "fact": "'box' comes from the german word for pit stop area and is repeated three times for clarity over radio.",
    "category": "iconic moments",
    "tier": "beginner"
  },
  {
    "prompt": "which driver held the record for most race wins before hamilton broke it?",
    "correct": "michael schumacher",
    "distractors": [
      "ayrton senna",
      "alain prost",
      "sebastian vettel"
    ],
    "fact": "schumacher's 91 wins stood as the record from 2006 until hamilton passed it at portugal in 2020 — 14 years later.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "which corner at spa-francorchamps is one of the most famous in all of motorsport?",
    "correct": "eau rouge / raidillon",
    "distractors": [
      "la source",
      "bus stop chicane",
      "pouhon"
    ],
    "fact": "the high-speed uphill left-right-left through eau rouge and raidillon is a legendary test of commitment.",
    "category": "circuits",
    "tier": "regular"
  },
  {
    "prompt": "which team did fernando alonso return to in 2021 after two years away from f1?",
    "correct": "alpine",
    "distractors": [
      "ferrari",
      "mclaren",
      "aston martin"
    ],
    "fact": "alonso returned to the renamed alpine team (formerly renault) in 2021, continuing his remarkable f1 longevity.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "what is 'the undercut' referring to when commentators say 'they've pulled off the undercut'?",
    "correct": "overtaking by pitting earlier and using fresh tyre pace",
    "distractors": [
      "diving up the inside at a chicane",
      "blocking a car on a straight",
      "running wide to gain an advantage"
    ],
    "fact": "a successful undercut means your out-lap on fresh tyres was fast enough to jump ahead of someone who stayed out.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "which f1 track features a tunnel that drivers blast through at over 150mph?",
    "correct": "monaco",
    "distractors": [
      "singapore",
      "baku",
      "jeddah"
    ],
    "fact": "the tunnel under the fairmont hotel is taken flat out at around 260 km/h — the dark-light-dark flicker is one of f1's strangest sensations.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which driver is nicknamed 'the honey badger'?",
    "correct": "daniel ricciardo",
    "distractors": [
      "lando norris",
      "pierre gasly",
      "sergio perez"
    ],
    "fact": "ricciardo chose the honey badger for its deceptive aggression — all smiles, then fearless late-braking overtakes.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "what does ers stand for in a modern f1 power unit?",
    "correct": "energy recovery system",
    "distractors": [
      "electronic race stabilizer",
      "engine rev sync",
      "exhaust recirculation setup"
    ],
    "fact": "through 2025 the ers harvested energy from two sources — braking and the exhaust turbo; the exhaust half vanishes under the 2026 rules.",
    "category": "teams & culture",
    "tier": "regular"
  },
  {
    "prompt": "which legendary commentator was known for the catchphrase 'and it's go go go!'?",
    "correct": "murray walker",
    "distractors": [
      "martin brundle",
      "david croft",
      "james hunt"
    ],
    "fact": "murray walker's breathless, excitable commentary defined f1 broadcasting for decades.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "what does a driver mean when they report 'understeer' to their engineer?",
    "correct": "the front doesn't turn enough into the corner",
    "distractors": [
      "the car turns more than expected",
      "the brakes are locking up",
      "the throttle response feels lazy"
    ],
    "fact": "understeer means the car pushes wide — the front tyres lose grip before the rears.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what is 'dirty air' and why do drivers hate following closely in it?",
    "correct": "turbulence that reduces the following car's downforce",
    "distractors": [
      "hot air from the car ahead's cooling",
      "gusty wind on the main straight",
      "spray kicked up in wet conditions"
    ],
    "fact": "dirty air causes the following car to lose grip in corners, which is why the 2022 rules aimed to reduce this effect.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what is a 'shoey' that ricciardo made famous on f1 podiums?",
    "correct": "drinking champagne from a racing boot",
    "distractors": [
      "a victory dance",
      "throwing shoes into the crowd",
      "signing a shoe for a fan"
    ],
    "fact": "ricciardo's shoey became one of the most iconic podium traditions, with even other drivers and celebrities joining in.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "what does 'graining' look like on an f1 tyre?",
    "correct": "torn rubber balling up and sticking back onto the tyre's surface",
    "distractors": [
      "visible cracks in the sidewall",
      "the tyre turning white",
      "smoke pouring from the contact patch"
    ],
    "fact": "graining strikes a cold, sliding tyre as its own torn surface regrips unevenly — unlike blistering, it can heal once the tyre warms up.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "what is the 'parc ferme' period in an f1 weekend?",
    "correct": "a lockdown on car changes between qualifying and race",
    "distractors": [
      "the cooldown window after the race ends",
      "the mandatory rest period for drivers overnight",
      "the pre-race media obligations window"
    ],
    "fact": "parc ferme prevents teams from making major setup changes once qualifying ends, ensuring the car you qualified is the car you race.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "how are repeated track-limits violations usually punished during a race?",
    "correct": "a black-and-white warning flag, then a time penalty",
    "distractors": [
      "immediate disqualification",
      "a grid penalty at the next race",
      "nothing — track limits only matter in qualifying"
    ],
    "fact": "under the fia's current guidelines each offence deletes the lap time, strike three brings the warning flag, and strike four normally costs five seconds. (as of 2025)",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "which driver was nicknamed 'the iceman'?",
    "correct": "kimi raikkonen",
    "distractors": [
      "mika hakkinen",
      "nico rosberg",
      "valtteri bottas"
    ],
    "fact": "räikkönen's flat monotone delivery and total refusal to celebrate made the nickname inevitable.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "what was special about the 2021 spa-francorchamps grand prix?",
    "correct": "it lasted only a few laps behind the safety car due to rain",
    "distractors": [
      "it was the longest race in f1 history",
      "three drivers were disqualified",
      "it was canceled entirely"
    ],
    "fact": "under the rules as they stood in 2021, half points were awarded for a handful of laps behind the safety car — the outcry rewrote the points rules.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "what does 'oversteer' feel like to a driver?",
    "correct": "the rear steps out and the car wants to spin",
    "distractors": [
      "the brakes lock under pressure",
      "the steering goes heavy",
      "the car bogs down out of the corners"
    ],
    "fact": "oversteer happens when the rear tyres lose grip before the fronts, rotating the car more than the driver intended.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "which team has won the most constructors' championships in f1 history?",
    "correct": "ferrari",
    "distractors": [
      "williams",
      "mclaren",
      "mercedes"
    ],
    "fact": "ferrari's 16 constructors' crowns lead the field, and their most recent came all the way back in 2008 — yet no rival has ever got closer than six titles behind. (as of 2025)",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who is the youngest ever f1 race winner?",
    "correct": "max verstappen",
    "distractors": [
      "sebastian vettel",
      "charles leclerc",
      "fernando alonso"
    ],
    "fact": "verstappen won the 2016 spanish gp aged 18 years and 228 days, on his very first start for red bull after a mid-season promotion.",
    "category": "champions & records",
    "tier": "regular"
  },
  {
    "prompt": "what does a driver mean when they say the car feels 'on rails'?",
    "correct": "it has perfect grip and balance",
    "distractors": [
      "it's understeering badly",
      "it's stuck in a low gear",
      "it's bottoming out on the straights"
    ],
    "fact": "when a car feels 'on rails', the driver has total confidence in the grip level through every corner.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "why do f1 drivers weave side to side on the formation lap?",
    "correct": "to warm up their tyres",
    "distractors": [
      "to save fuel before the start",
      "to cool the engine",
      "to check drs is working"
    ],
    "fact": "weaving generates lateral friction that heats the tyre surface, crucial for grip at the standing start.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "what is a 'power unit' in modern f1?",
    "correct": "the engine plus its turbo and hybrid systems",
    "distractors": [
      "just the combustion engine",
      "the gearbox and driveshafts",
      "the battery pack and its cooling"
    ],
    "fact": "through 2025 the package combined a v6 turbo with two energy-recovery motors — well over a thousand horsepower all in.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "what did lewis hamilton do immediately after crossing the line to win his 7th title in turkey 2020?",
    "correct": "screamed on the radio and cried in the car",
    "distractors": [
      "did donuts",
      "jumped out of the car",
      "sprayed his team with champagne"
    ],
    "fact": "hamilton sobbed through the radio after nearly 50 laps on a single set of intermediates — title number seven, sealed from p6 on a soaked track.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "what is the 'drs train' that commentators complain about?",
    "correct": "a queue of cars each within a second of the next, so drs cancels out",
    "distractors": [
      "a run of laps with drs disabled",
      "cars saving their drs use for the final stint",
      "a drs failure affecting several cars at once"
    ],
    "fact": "in a drs train nobody can overtake because the car ahead also has drs from the car in front of them.",
    "category": "racecraft & feel",
    "tier": "regular"
  },
  {
    "prompt": "what is 'sandbagging' in the context of f1 practice sessions?",
    "correct": "deliberately hiding true pace to mislead rivals",
    "distractors": [
      "running heavy fuel to test race pace",
      "aborting laps to save tyres",
      "hiding a new upgrade under covers in the garage"
    ],
    "fact": "teams often sandbag in practice to avoid showing their real performance until qualifying or the race.",
    "category": "teams & culture",
    "tier": "regular"
  },
  {
    "prompt": "which car number is the reigning world champion entitled to run?",
    "correct": "1",
    "distractors": [
      "0",
      "99",
      "10"
    ],
    "fact": "only the reigning champion may carry it — the number sat unused from 2015 until the 2021 champion revived it, and it changed hands again for 2026.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "what is a safety car restart often called by fans?",
    "correct": "a rolling restart",
    "distractors": [
      "a standing restart",
      "a formation restart",
      "a launch restart"
    ],
    "fact": "after a safety car period, the leader controls the restart pace and the field goes green at racing speed — no standing start.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "what does 'flat out' mean in f1 driver language?",
    "correct": "driving at maximum speed without lifting",
    "distractors": [
      "the tyres are completely worn",
      "the car is bottoming out on the track",
      "running on fumes"
    ],
    "fact": "taking a corner 'flat out' means the driver keeps full throttle through it — a sign of extreme downforce and bravery.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "what does it mean when a driver is told 'you are on the delta' by their engineer?",
    "correct": "they're matching the required target lap time",
    "distractors": [
      "they need to speed up immediately",
      "they've been given a penalty",
      "they're running low on fuel"
    ],
    "fact": "the delta is a reference pace — staying 'on the delta' means the driver is hitting their time targets, crucial under safety car or vsc.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "why do teams put tyre blankets on the wheels before a pit stop?",
    "correct": "to keep the tyres at optimal temperature",
    "distractors": [
      "to hide the tyre compound from rivals",
      "to protect them from debris",
      "to prevent sun damage to the rubber"
    ],
    "fact": "blankets warm slick tyres to a regulated 70°c; a plan to ban them outright was scrapped in 2023 after driver pushback.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "what are the 'marbles' that drivers try to avoid on track?",
    "correct": "small balls of rubber shed from tyres that litter the track surface",
    "distractors": [
      "loose gravel from the run-off",
      "rain droplets on the racing line",
      "debris from broken front wings"
    ],
    "fact": "marbles collect off the racing line and are extremely slippery — running over them can cause a car to snap sideways.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "what does 'lights out and away we go' signal?",
    "correct": "the race start",
    "distractors": [
      "the end of a safety car period",
      "qualifying has begun",
      "pit lane is open"
    ],
    "fact": "five red lights illuminate one by one, then all go out simultaneously — that's the signal to race.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "why is overtaking considered nearly impossible at monaco?",
    "correct": "the street circuit is too narrow for side-by-side racing",
    "distractors": [
      "drs is banned there",
      "the cars run too much downforce",
      "there's no straight long enough"
    ],
    "fact": "monaco's tight barriers and narrow streets mean qualifying position is often more important than race pace.",
    "category": "circuits",
    "tier": "beginner"
  },
  {
    "prompt": "what is the 'racing line' and why do drivers follow it?",
    "correct": "the fastest path through a corner, using the full width of the track",
    "distractors": [
      "the white line marking the edge of the track",
      "the pit lane entry line",
      "a painted guide on the asphalt"
    ],
    "fact": "the racing line maximizes corner speed by taking the widest arc possible, which is why the track surface is most rubbered-in on that line.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "what is 'the overcut'?",
    "correct": "staying out longer than a rival and gaining by pitting later",
    "distractors": [
      "pitting first to jump a rival on fresh tyres",
      "double-stacking both cars in one stop",
      "short-filling fuel for a light final stint"
    ],
    "fact": "the overcut works when fresh tyres take laps to switch on, or when the rival hits traffic — the mirror image of the undercut.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "in a dry race, what tyre rule must every driver follow?",
    "correct": "use at least two different slick compounds",
    "distractors": [
      "make at least two pit stops",
      "start on the tyres they qualified on",
      "end the race on the softest compound"
    ],
    "fact": "the mandatory compound change is what forces at least one pit stop — in a wet race the rule doesn't apply at all.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "why is pitting under a safety car called a 'cheap' stop?",
    "correct": "the field slows, so a stop costs fewer positions than at racing speed",
    "distractors": [
      "pit crews charge less during neutralisations",
      "the pit-lane speed limit is lifted",
      "tyres fitted under safety car are free of wear rules"
    ],
    "fact": "with the pack crawling, the usual 20-odd seconds of pit loss can shrink to around half — which is why a safety car flips every strategy on the pit wall.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "what is 'double-stacking' in the pits?",
    "correct": "both of a team's cars pitting on the same lap, one queued behind the other",
    "distractors": [
      "fitting two new tyre sets in a single stop",
      "two crews servicing one car at once",
      "pitting on consecutive laps to split strategies"
    ],
    "fact": "the second car loses seconds waiting for the first to clear the box — teams accept it when a safety car makes the double stop worth the risk.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "in pirelli's compound naming, what does a higher c-number mean?",
    "correct": "a softer, faster, shorter-lived tyre",
    "distractors": [
      "a harder, more durable tyre",
      "a tyre for heavier rain",
      "a compound reserved for street circuits"
    ],
    "fact": "the scale runs from the hardest c1 upward (c1-c5 in 2026); pirelli nominates three steps of it for each race weekend.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "roughly how much total race time does a normal green-flag pit stop cost?",
    "correct": "about 20 to 25 seconds",
    "distractors": [
      "about 3 seconds",
      "about 8 to 10 seconds",
      "about a full minute"
    ],
    "fact": "the stop itself takes under three seconds — the rest is the drive through the speed-limited pit lane, which varies by circuit.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "what's the basic trade-off between soft and hard tyre compounds?",
    "correct": "softs grip better but wear out faster",
    "distractors": [
      "softs last longer but are slower",
      "hards only work in the rain",
      "softs are only allowed in qualifying"
    ],
    "fact": "that trade-off is the heart of race strategy: sprint on softs and stop more, or hold out on hards and stop less.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "why do teams switch from full wets to intermediates as a track dries?",
    "correct": "inters are much faster once standing water is gone",
    "distractors": [
      "full wets are limited to a set number of laps",
      "the rules require it once the safety car pits",
      "inters warm up slower and last longer"
    ],
    "fact": "full wets move the most water but overheat on a drying line — the crossover call is one of racing's hardest judgement calls.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "what is tyre 'blistering'?",
    "correct": "overheating from within, breaking the surface open in patches",
    "distractors": [
      "rubber pellets tearing off a sliding surface",
      "the tyre losing pressure through the rim",
      "flat spots from locked brakes"
    ],
    "fact": "blistering starts inside an overheated tyre and cannot be driven off — unlike graining, slowing down won't heal it.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "how many times may a driver change direction to defend their position?",
    "correct": "once",
    "distractors": [
      "twice",
      "as often as they like",
      "never — blocking is banned outright"
    ],
    "fact": "the one-move rule: a single defensive move is fair game, but weaving or moving under braking invites the stewards' attention.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what happens during a 'lock-up'?",
    "correct": "a wheel stops turning under braking and skids",
    "distractors": [
      "the gearbox jams in one gear",
      "the steering column locks mid-corner",
      "the drs flap sticks open"
    ],
    "fact": "a locked front tyre grinds a flat spot that vibrates for the rest of the stint — sometimes badly enough to force an extra pit stop.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what does the black flag with an orange disc tell a driver?",
    "correct": "their car has a mechanical problem — return to the pits",
    "distractors": [
      "they are being investigated for a penalty",
      "they must let the leader lap them",
      "their pit box is blocked"
    ],
    "fact": "nicknamed the 'meatball' flag, it forces a pit visit for repairs — loose bodywork is the classic trigger.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "what penalty comes with using more power unit parts than the season allowance?",
    "correct": "a grid penalty",
    "distractors": [
      "a points deduction",
      "a pit-lane drive-through",
      "a fine for the team"
    ],
    "fact": "each driver gets a fixed pool of engines, turbos, and hybrid parts for the season — fit one too many and you start further back.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "how does f1 qualifying whittle the field down?",
    "correct": "the slowest cars are knocked out in q1 and q2, then q3 decides pole",
    "distractors": [
      "one long session where every lap counts",
      "a knockout bracket of head-to-head laps",
      "the championship order sets the grid"
    ],
    "fact": "knockout qualifying arrived in 2006: the slowest cars drop in q1 and q2 before a final shootout settles the grid.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "what is a sprint weekend?",
    "correct": "a weekend with an extra short race that awards its own points",
    "distractors": [
      "a weekend with two full grands prix",
      "a shortened race distance for street circuits",
      "a test weekend with no championship points"
    ],
    "fact": "sprints run to roughly 100 km — about a third of a grand prix — and both the 2025 and 2026 calendars carry six of them.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "who won the 2025 f1 drivers' championship?",
    "correct": "lando norris",
    "distractors": [
      "max verstappen",
      "oscar piastri",
      "george russell"
    ],
    "beginnerDistractors": [
      "lewis hamilton",
      "sebastian vettel",
      "fernando alonso"
    ],
    "fact": "norris pipped verstappen by two points at the abu dhabi decider — mclaren's first drivers' champion in seventeen years.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "which team won the 2024 constructors' championship — its first since 1998?",
    "correct": "mclaren",
    "distractors": [
      "red bull",
      "ferrari",
      "mercedes"
    ],
    "fact": "mclaren edged ferrari by 14 points at the final round, ending a 26-year drought stretching back to the häkkinen era.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "which city joined the calendar in 2023 with a saturday night race past its casinos?",
    "correct": "las vegas",
    "distractors": [
      "miami",
      "madrid",
      "doha"
    ],
    "fact": "the grand prix runs down the strip itself — f1's splashiest arrival since the short-lived caesars palace race of the early 1980s.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which team did lewis hamilton join for the 2025 season?",
    "correct": "ferrari",
    "distractors": [
      "aston martin",
      "mclaren",
      "red bull"
    ],
    "beginnerDistractors": [
      "williams",
      "alpine",
      "haas"
    ],
    "fact": "hamilton ended twelve seasons with mercedes — the team of six of his titles — for the seat every driver dreams about.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "who made a shock ferrari debut at the 2024 saudi arabian gp, aged 18, when carlos sainz needed surgery?",
    "correct": "oliver bearman",
    "distractors": [
      "andrea kimi antonelli",
      "franco colapinto",
      "liam lawson"
    ],
    "fact": "bearman got the call overnight, qualified 11th and raced to p7 at jeddah — the youngest driver ever to race for ferrari.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "who took over lewis hamilton's mercedes seat in 2025?",
    "correct": "andrea kimi antonelli",
    "distractors": [
      "george russell",
      "oliver bearman",
      "esteban ocon"
    ],
    "fact": "mercedes promoted the teenage italian straight from formula 2 — a bet on the next generation rather than a proven name.",
    "category": "teams & culture",
    "tier": "regular"
  },
  {
    "prompt": "how many of 2023's 22 races did max verstappen win?",
    "correct": "19",
    "distractors": [
      "15",
      "12",
      "22"
    ],
    "fact": "nineteen wins — an 86% strike rate including ten in a row — remains the most dominant single season in f1 history. (as of 2025)",
    "category": "champions & records",
    "tier": "regular"
  },
  {
    "prompt": "what happened to the bonus point for fastest lap in 2025?",
    "correct": "it was abolished",
    "distractors": [
      "it was doubled",
      "it was extended to the top five",
      "it moved to the sprint race only"
    ],
    "fact": "the bonus ran from 2019 to 2024 — after a backmarker pitted late at singapore 2024 purely to strip the point from a title contender, the rule was scrapped.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "what major change headlines the 2026 engine regulations?",
    "correct": "electrical power rises to roughly half the total output",
    "distractors": [
      "a return to v10 engines",
      "a single spec engine for all teams",
      "turbochargers are banned"
    ],
    "fact": "the 2026 power units run 100% sustainable fuel and swap drs for movable-wing 'straight mode' — the biggest rules shake-up in decades.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "which american giant joins the f1 grid as a new team in 2026?",
    "correct": "cadillac",
    "distractors": [
      "ford",
      "chevrolet",
      "tesla"
    ],
    "fact": "cadillac becomes the eleventh team; the same season, audi arrives by taking over sauber — the grid's biggest reshuffle in decades.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "which is the longest circuit on the current f1 calendar?",
    "correct": "spa-francorchamps",
    "distractors": [
      "silverstone",
      "suzuka",
      "jeddah"
    ],
    "fact": "at 7.004 km spa is the only current lap over seven kilometres — the next-longest laps are a full 800 metres shorter.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which is the shortest lap on the current f1 calendar?",
    "correct": "monaco",
    "distractors": [
      "zandvoort",
      "hungaroring",
      "marina bay"
    ],
    "fact": "at 3.3 km, monaco's lap is more than 800 metres shorter than any other on the calendar.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which grand prix is run at the highest altitude?",
    "correct": "mexico city",
    "distractors": [
      "são paulo",
      "austin",
      "barcelona"
    ],
    "fact": "at about 2,285 m the air is roughly a quarter thinner, so maximum-downforce wings behave like skinny low-drag ones.",
    "category": "circuits",
    "tier": "regular"
  },
  {
    "prompt": "which circuit is the only one on the calendar that crosses over itself?",
    "correct": "suzuka",
    "distractors": [
      "silverstone",
      "interlagos",
      "circuit of the americas"
    ],
    "fact": "suzuka's figure-of-eight sends the back section over the front on a bridge — unique in the world championship.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which circuit has the longest full-throttle stretch on the calendar?",
    "correct": "baku",
    "distractors": [
      "monza",
      "las vegas",
      "jeddah"
    ],
    "fact": "the blast to turn 1 runs about 2.2 km flat out — while the same lap pinches to 7.6 metres at the old castle, the calendar's narrowest point.",
    "category": "circuits",
    "tier": "regular"
  },
  {
    "prompt": "who shares the record of seven f1 drivers' championships?",
    "correct": "michael schumacher and lewis hamilton",
    "distractors": [
      "michael schumacher and ayrton senna",
      "lewis hamilton and max verstappen",
      "michael schumacher and juan manuel fangio"
    ],
    "beginnerDistractors": [
      "michael schumacher and ayrton senna",
      "lewis hamilton and fernando alonso",
      "sebastian vettel and lewis hamilton"
    ],
    "fact": "the sevenths came in 2004 and 2020 — before that, fangio's five titles had stood as the benchmark for almost half a century. (as of 2025)",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who holds the record for most f1 pole positions?",
    "correct": "lewis hamilton",
    "distractors": [
      "michael schumacher",
      "ayrton senna",
      "max verstappen"
    ],
    "fact": "hamilton's 104 poles include f1's first-ever 100th, sealed at barcelona in 2021 by 0.036 seconds. (as of 2025)",
    "category": "champions & records",
    "tier": "regular"
  },
  {
    "prompt": "which driver screamed 'gp2 engine! gp2!' over the radio at suzuka in 2015?",
    "correct": "fernando alonso",
    "distractors": [
      "sebastian vettel",
      "jenson button",
      "kimi raikkonen"
    ],
    "fact": "at honda's home race, alonso compared his mclaren-honda's power to f1's feeder series — the partnership never lived it down.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "which team boss was fined for calling a steward 'stupid' and 'idiotic' over the radio at sochi 2019?",
    "correct": "guenther steiner",
    "distractors": [
      "christian horner",
      "toto wolff",
      "franz tost"
    ],
    "fact": "the fia charged haas's steiner 7,500 euros for causing 'moral injury' to the steward — the rare radio rant that came with an invoice.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "what is the fastest f1 pit stop on record?",
    "correct": "under 2 seconds for all four wheels",
    "distractors": [
      "about 4 seconds",
      "about 6 seconds",
      "just over 10 seconds"
    ],
    "fact": "mclaren hold the guinness-certified record: 1.80 seconds at the 2023 qatar gp, beating red bull's 1.82 from brazil 2019.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "how do drivers drink during a two-hour race?",
    "correct": "through a tube inside the helmet",
    "distractors": [
      "they stop at the pit wall for bottles",
      "they don't — drinking is banned",
      "a hydration pack in the seat sprays automatically"
    ],
    "fact": "a drinks bag in the car pumps fluid up a tube to the helmet — in hot races drivers can still lose several kilos of sweat.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "what do engineers watch on 'telemetry' during a race?",
    "correct": "live data streamed from the car's sensors",
    "distractors": [
      "tv broadcast replays",
      "the rival teams' radio channels",
      "weather satellite feeds only"
    ],
    "fact": "hundreds of sensors stream speed, temperatures, and driver inputs in real time — engineers often spot a problem before the driver feels it.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "what does 'p1' mean over team radio?",
    "correct": "first position",
    "distractors": [
      "one pit stop remaining",
      "engine mode one",
      "practice session one"
    ],
    "fact": "positions are just 'p' plus a number — the same shorthand gives us 'p10' for tenth and the dreaded 'p last'.",
    "category": "race weekend",
    "tier": "beginner"
  }
];

export const LAPS_PER_WEEKEND = 6;

const getRandomIndex = (max: number) => Math.floor(Math.random() * max);

const shuffled = <T>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomIndex(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const CATEGORY_CAP_PER_WEEKEND = 2;

const toRuntimeQuestion = (bankQuestion: BankQuestion, difficulty: Difficulty): Question => {
  const distractors =
    difficulty === "beginner"
      ? (bankQuestion.beginnerDistractors ?? bankQuestion.distractors)
      : bankQuestion.distractors;
  const options = shuffled([bankQuestion.correct, ...distractors]);
  return {
    prompt: bankQuestion.prompt,
    options,
    answer: options.indexOf(bankQuestion.correct),
    fact: bankQuestion.fact,
    event: bankQuestion.category,
  };
};

export const getRandomWeekendQuestions = (difficulty: Difficulty = "beginner"): Question[] => {
  const pool = shuffled(
    questionBank.filter((q) => q.tier === "both" || q.tier === difficulty),
  );

  const picked: BankQuestion[] = [];
  const perCategory = new Map<Category, number>();
  for (const question of pool) {
    if (picked.length === LAPS_PER_WEEKEND) break;
    if ((perCategory.get(question.category) ?? 0) >= CATEGORY_CAP_PER_WEEKEND) continue;
    picked.push(question);
    perCategory.set(question.category, (perCategory.get(question.category) ?? 0) + 1);
  }
  for (const question of pool) {
    if (picked.length === LAPS_PER_WEEKEND) break;
    if (!picked.includes(question)) picked.push(question);
  }

  return picked.map((question) => toRuntimeQuestion(question, difficulty));
};

export const initialWeekendQuestions = getRandomWeekendQuestions("beginner");
