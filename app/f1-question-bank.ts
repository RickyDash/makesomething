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
    "prompt": "What does DRS stand for in Formula 1?",
    "correct": "Drag reduction system",
    "distractors": [
      "Driver response strategy",
      "Downforce recovery setup",
      "Dynamic racing sequence"
    ],
    "fact": "DRS opens a flap in the rear wing to reduce drag and boost straight-line speed.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "What color flag signals immediate race stoppage?",
    "correct": "Red",
    "distractors": [
      "Blue",
      "Yellow",
      "Black"
    ],
    "fact": "A red flag stops the session and sends everyone back to pit lane.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "What does the chequered flag mean?",
    "correct": "Race finished",
    "distractors": [
      "Session suspended",
      "Safety car deployed",
      "Mandatory pit stop"
    ],
    "fact": "The chequered flag marks the end of the race session.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "Who takes pole position for Sunday's race?",
    "correct": "The fastest driver in Q3",
    "distractors": [
      "The championship leader",
      "The previous race winner",
      "The sprint race winner"
    ],
    "fact": "Pole rewards Saturday's single fastest lap — though grid penalties can still shuffle who actually lines up first on Sunday.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "What is the main purpose of the safety car?",
    "correct": "Neutralize race pace for safety",
    "distractors": [
      "To lead cars back to the pit lane",
      "To signal the end of the session",
      "To test the circuit before the race"
    ],
    "fact": "The safety car slows and bunches the field so marshals can work safely.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "Under a virtual safety car, what must drivers do?",
    "correct": "Follow a reduced delta pace",
    "distractors": [
      "Slow down only in yellow-flag sectors",
      "Line up behind the safety car",
      "Pit at the end of that lap"
    ],
    "fact": "Under VSC, drivers follow a minimum delta time instead of racing flat out.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "What does a blue flag usually indicate?",
    "correct": "Faster car is lapping you",
    "distractors": [
      "A penalty is being investigated",
      "The pit lane is closed",
      "A slower car is just ahead"
    ],
    "fact": "Blue flags warn a slower car that a faster one is approaching to lap.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "What does a black flag mean?",
    "correct": "Car is disqualified and must return",
    "distractors": [
      "A warning for driving standards",
      "The car must serve a stop-go penalty",
      "The race is suspended"
    ],
    "beginnerDistractors": [
      "The race is canceled",
      "The safety car is ending",
      "The track is slippery ahead"
    ],
    "fact": "The black flag means instant disqualification — F1's rarest and most final signal, shown only a handful of times in the modern era.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "What does a yellow flag mean for drivers?",
    "correct": "Danger ahead, no overtaking",
    "distractors": [
      "The race is finished",
      "A mandatory pit stop is due",
      "The track is clear again"
    ],
    "fact": "Yellow flag means caution and no overtaking in that zone.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "Which tyre is designed for damp conditions without standing water?",
    "correct": "Intermediate",
    "distractors": [
      "Soft",
      "Hard",
      "Medium"
    ],
    "fact": "Intermediates are made for a damp track and light spray conditions.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "Which tyre is designed for heavy rain and standing water?",
    "correct": "Full wet",
    "distractors": [
      "Soft",
      "Medium",
      "Hard"
    ],
    "fact": "A full wet tyre can shift around 85 litres of water per second at speed — yet modern full wets mostly appear behind the safety car, because spray blinds the drivers long before grip runs out.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "What is a chicane?",
    "correct": "A quick left-right or right-left sequence",
    "distractors": [
      "A long straight",
      "A hairpin bend",
      "A banked corner"
    ],
    "fact": "A chicane is a rapid change of direction added to slow cars down.",
    "category": "circuits",
    "tier": "beginner"
  },
  {
    "prompt": "What is slipstreaming in F1?",
    "correct": "Using reduced drag behind another car",
    "distractors": [
      "Braking late to defend a position",
      "Coasting to save fuel",
      "Running extra downforce for the corners"
    ],
    "fact": "A car behind can gain speed by sitting in lower-pressure air.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "What is an out lap?",
    "correct": "Lap leaving pits to start a run",
    "distractors": [
      "The final lap of the race",
      "A lap under the safety car",
      "A practice-start lap"
    ],
    "fact": "An out lap starts when a car exits the pit lane before a timed push lap.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "What is an in lap?",
    "correct": "Lap returning to the pit lane",
    "distractors": [
      "The lap before lights out",
      "The first lap of a stint",
      "The formation lap"
    ],
    "fact": "An in lap is the lap where the driver comes back to pits.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "What does downforce mainly help with?",
    "correct": "Cornering grip",
    "distractors": [
      "Top speed on the straights",
      "Fuel efficiency",
      "Tyre warm-up"
    ],
    "fact": "More downforce improves corner speed but usually increases drag.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "When is DRS typically enabled in a race?",
    "correct": "When a driver is within one second at detection",
    "distractors": [
      "Anytime in sector 1",
      "Only on the final lap",
      "Only in wet races"
    ],
    "fact": "DRS is usually available if the chasing car is within one second at the detection point.",
    "category": "racecraft & feel",
    "tier": "regular"
  },
  {
    "prompt": "Roughly how long is a standard grand prix race distance?",
    "correct": "About 305 km",
    "distractors": [
      "About 220 km",
      "About 150 km",
      "About 500 km"
    ],
    "fact": "Race lengths are set as the fewest full laps that pass 305 km, which is why lap counts differ so much between circuits.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "Which race is the classic exception to the ~305 km distance rule?",
    "correct": "Monaco Grand Prix",
    "distractors": [
      "British Grand Prix",
      "Italian Grand Prix",
      "Japanese Grand Prix"
    ],
    "fact": "The streets are so slow that a full-length race would blow past the time limit, so Monaco runs to its own reduced distance of roughly 260 km.",
    "category": "race weekend",
    "tier": "regular"
  },
  {
    "prompt": "Which company has been F1's sole tyre supplier since 2011?",
    "correct": "Pirelli",
    "distractors": [
      "Michelin",
      "Bridgestone",
      "Goodyear"
    ],
    "fact": "Pirelli has supplied every team since 2011, and beat a rival Bridgestone bid to keep the contract through at least 2027.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "Which era began in 2014 in Formula 1?",
    "correct": "Turbo-hybrid power unit era",
    "distractors": [
      "V10 return era",
      "Ground effect ban era",
      "Manual gearbox era"
    ],
    "fact": "The 1.6-litre V6 turbo-hybrid formula arrived in 2014 and ran through 2025, before the 2026 rules overhaul.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2007?",
    "correct": "Kimi Raikkonen",
    "distractors": [
      "Lewis Hamilton",
      "Fernando Alonso",
      "Felipe Massa"
    ],
    "beginnerDistractors": [
      "Michael Schumacher",
      "Jenson Button",
      "Nico Rosberg"
    ],
    "fact": "Räikkönen took the 2007 title by one point in his first Ferrari season, winning the Brazil finale from third in the standings — Hamilton and Alonso finished level, just behind.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2008?",
    "correct": "Lewis Hamilton",
    "distractors": [
      "Felipe Massa",
      "Robert Kubica",
      "Kimi Raikkonen"
    ],
    "beginnerDistractors": [
      "Fernando Alonso",
      "Sebastian Vettel",
      "Max Verstappen"
    ],
    "fact": "Hamilton passed Timo Glock's dry-tyred Toyota on the rain-hit final lap in Brazil to grab P5 — snatching the title from race-winner Massa by a single point.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2010?",
    "correct": "Sebastian Vettel",
    "distractors": [
      "Fernando Alonso",
      "Mark Webber",
      "Lewis Hamilton"
    ],
    "beginnerDistractors": [
      "Lewis Hamilton",
      "Michael Schumacher",
      "Jenson Button"
    ],
    "fact": "Four drivers could still win at the Abu Dhabi finale; Vettel took it aged 23 — the youngest champion ever — without leading the standings until that day.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2016?",
    "correct": "Nico Rosberg",
    "distractors": [
      "Lewis Hamilton",
      "Daniel Ricciardo",
      "Sebastian Vettel"
    ],
    "beginnerDistractors": [
      "Fernando Alonso",
      "Jenson Button",
      "Michael Schumacher"
    ],
    "fact": "Rosberg beat teammate Hamilton by five points — then announced his retirement five days later.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2024?",
    "correct": "Max Verstappen",
    "distractors": [
      "Lando Norris",
      "Charles Leclerc",
      "Oscar Piastri"
    ],
    "beginnerDistractors": [
      "Lewis Hamilton",
      "Fernando Alonso",
      "Sebastian Vettel"
    ],
    "fact": "Verstappen made it four titles in a row even as his car lost its edge — a mid-season run of around ten races without a win — sealing the crown with two rounds to spare.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "In which country is the Monza circuit?",
    "correct": "Italy",
    "distractors": [
      "France",
      "Spain",
      "Austria"
    ],
    "beginnerDistractors": [
      "Belgium",
      "United Arab Emirates",
      "Japan"
    ],
    "fact": "Monza opened in 1922 — built in about 110 days — and is the oldest purpose-built circuit still hosting a grand prix.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which country hosts the Spa-Francorchamps Grand Prix circuit?",
    "correct": "Belgium",
    "distractors": [
      "France",
      "Netherlands",
      "Luxembourg"
    ],
    "beginnerDistractors": [
      "United Kingdom",
      "United States",
      "Bahrain"
    ],
    "fact": "Spa's Ardennes microclimate is so fickle it can rain on one part of the lap while the rest stays dry.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which country hosts the Suzuka Grand Prix circuit?",
    "correct": "Japan",
    "distractors": [
      "China",
      "South Korea",
      "Malaysia"
    ],
    "beginnerDistractors": [
      "Brazil",
      "Spain",
      "Saudi Arabia"
    ],
    "fact": "Suzuka's layout was drawn by Dutch designer John Hugenholtz — the same name that marks Zandvoort's steepest banked corner.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which country hosts the Interlagos Grand Prix circuit?",
    "correct": "Brazil",
    "distractors": [
      "Argentina",
      "Mexico",
      "Portugal"
    ],
    "beginnerDistractors": [
      "United Arab Emirates",
      "Bahrain",
      "Japan"
    ],
    "fact": "Interlagos runs anticlockwise — one of the few circuits that turn mostly left, which drivers' necks feel by half distance.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which country hosts the Zandvoort Grand Prix circuit?",
    "correct": "Netherlands",
    "distractors": [
      "Belgium",
      "Germany",
      "Denmark"
    ],
    "beginnerDistractors": [
      "Hungary",
      "Mexico",
      "Spain"
    ],
    "fact": "Zandvoort's final corner is banked at 18 degrees — double the banking of Indianapolis — so cars sweep onto the straight at full throttle.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which country hosts the Marina Bay Grand Prix circuit?",
    "correct": "Singapore",
    "distractors": [
      "Malaysia",
      "Thailand",
      "Indonesia"
    ],
    "beginnerDistractors": [
      "Azerbaijan",
      "Germany",
      "United Kingdom"
    ],
    "fact": "Marina Bay staged F1's first night race in 2008 under about 1,600 floodlights — and still runs entirely after dark.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which F1 team is nicknamed the Prancing Horse?",
    "correct": "Ferrari",
    "distractors": [
      "McLaren",
      "Williams",
      "Sauber"
    ],
    "fact": "The Prancing Horse is Ferrari's iconic symbol.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "Which team is often called the Silver Arrows in modern F1?",
    "correct": "Mercedes",
    "distractors": [
      "Red Bull",
      "Aston Martin",
      "Alpine"
    ],
    "fact": "Silver Arrows is the classic nickname for Mercedes motorsport.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "Which team is strongly associated with papaya orange?",
    "correct": "McLaren",
    "distractors": [
      "Ferrari",
      "Williams",
      "Haas"
    ],
    "fact": "Papaya orange is McLaren's signature modern race color.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "The tifosi are famously passionate fans of which team?",
    "correct": "Ferrari",
    "distractors": [
      "Mercedes",
      "Red Bull",
      "Alpine"
    ],
    "fact": "Tifosi is the traditional name for Ferrari's fan base.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "In 2021, what controversial event decided the championship on the final lap at Abu Dhabi?",
    "correct": "A late safety car restart",
    "distractors": [
      "A red flag restart",
      "A penalty for Max Verstappen",
      "A mechanical failure for Hamilton"
    ],
    "fact": "Race control let only the five lapped cars between the leaders unlap themselves, setting up a one-lap shootout that decided the title — the FIA later called it human error.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "At which 2021 race did Lando Norris lose his first win by staying out on slicks as rain fell?",
    "correct": "The Russian GP at Sochi",
    "distractors": [
      "The Turkish GP",
      "The Belgian GP",
      "The Hungarian GP"
    ],
    "fact": "Norris led late from his first pole; the rain came, he gambled on slicks, and Lewis Hamilton swept past to take his 100th grand prix win.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "What did Sebastian Vettel do after winning the 2013 Indian GP to celebrate his 4th title?",
    "correct": "Did doughnuts on the straight",
    "distractors": [
      "Sprinted to the crowd",
      "Threw his steering wheel",
      "Climbed a fence"
    ],
    "fact": "The stewards reprimanded Vettel and fined Red Bull 25,000 euros — officially for skipping parc ferme, not for the smoke show itself.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "At Canada 2019, which driver was given a controversial 5-second penalty while leading, costing them the win?",
    "correct": "Vettel",
    "distractors": [
      "Leclerc",
      "Bottas",
      "Ricciardo"
    ],
    "fact": "Vettel crossed the line first but a 5-second penalty for an unsafe rejoin gave Hamilton the win, sparking huge controversy.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "Which team principal shouted 'no Michael, no no Michael, that was so not right!' on the radio at Abu Dhabi 2021?",
    "correct": "Toto Wolff",
    "distractors": [
      "Christian Horner",
      "Guenther Steiner",
      "Helmut Marko"
    ],
    "fact": "Toto Wolff's plea to race director Michael Masi drew the equally famous reply: 'Toto, it's called a motor race, okay?'",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "Which circuit is known as the 'Temple of Speed'?",
    "correct": "Monza",
    "distractors": [
      "Silverstone",
      "Spa",
      "Baku"
    ],
    "fact": "Monza's low-downforce, high-speed layout earned it the legendary nickname.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "What is 'porpoising' that plagued teams in 2022?",
    "correct": "Car bouncing violently at high speed",
    "distractors": [
      "Excessive tyre wear",
      "Engine overheating",
      "Gearbox vibrations"
    ],
    "fact": "The 2022 ground effect cars caused violent vertical oscillations on straights as downforce rapidly stalled and reattached.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "Which driver famously said 'Leave me alone, I know what I'm doing' during a race?",
    "correct": "Kimi Raikkonen",
    "distractors": [
      "Fernando Alonso",
      "Lewis Hamilton",
      "Max Verstappen"
    ],
    "fact": "The 2012 Abu Dhabi radio went straight onto commemorative Lotus t-shirts — Räikkönen won the race, naturally.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "'Multi 21, Seb' was a famous team order controversy involving which team?",
    "correct": "Red Bull",
    "distractors": [
      "Ferrari",
      "Mercedes",
      "McLaren"
    ],
    "fact": "Vettel ignored the 'Multi 21' team order and overtook Webber to win the 2013 Malaysian GP, causing a massive rift.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "What is the 'Halo' device on modern F1 cars designed to protect against?",
    "correct": "Head impacts from debris",
    "distractors": [
      "Rain spray",
      "Engine fires",
      "Tyre blowouts"
    ],
    "fact": "The titanium hoop above the cockpit arrived in 2018 to widespread grumbling — and has been credited with saving several drivers since.",
    "category": "rules & flags",
    "tier": "beginner"
  },
  {
    "prompt": "Which driver walked away from a fiery 67g crash at Bahrain 2020?",
    "correct": "Romain Grosjean",
    "distractors": [
      "Pierre Gasly",
      "Lance Stroll",
      "Carlos Sainz"
    ],
    "fact": "Grosjean's car split the barrier and caught fire; he climbed out after about 28 seconds in the flames, and credits the halo with saving his life.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "If it starts raining mid-race, who makes the call to switch to wet tyres?",
    "correct": "The driver and their team",
    "distractors": [
      "The FIA race director",
      "The team principal alone",
      "The tyre supplier"
    ],
    "fact": "Tyre strategy including weather calls is entirely the team's decision — getting the timing right can make or break a race.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "What does 'Box box box' mean on F1 team radio?",
    "correct": "Come into the pits this lap",
    "distractors": [
      "Retire the car",
      "Penalty incoming",
      "Push for fastest lap"
    ],
    "fact": "'Box' comes from the German word for pit stop area and is repeated three times for clarity over radio.",
    "category": "iconic moments",
    "tier": "beginner"
  },
  {
    "prompt": "Which driver held the record for most race wins before Hamilton broke it?",
    "correct": "Michael Schumacher",
    "distractors": [
      "Ayrton Senna",
      "Alain Prost",
      "Sebastian Vettel"
    ],
    "fact": "Schumacher's 91 wins stood as the record from 2006 until Hamilton passed it at Portugal in 2020 — 14 years later.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Which corner at Spa-Francorchamps is one of the most famous in all of motorsport?",
    "correct": "Eau Rouge / Raidillon",
    "distractors": [
      "La Source",
      "Bus Stop chicane",
      "Pouhon"
    ],
    "fact": "The high-speed uphill left-right-left through Eau Rouge and Raidillon is a legendary test of commitment.",
    "category": "circuits",
    "tier": "regular"
  },
  {
    "prompt": "Which team did Fernando Alonso return to in 2021 after two years away from F1?",
    "correct": "Alpine",
    "distractors": [
      "Ferrari",
      "McLaren",
      "Aston Martin"
    ],
    "fact": "Alonso returned to the renamed Alpine team (formerly Renault) in 2021, continuing his remarkable F1 longevity.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "What is 'the undercut' referring to when commentators say 'they've pulled off the undercut'?",
    "correct": "Overtaking by pitting earlier and using fresh tyre pace",
    "distractors": [
      "Diving up the inside at a chicane",
      "Blocking a car on a straight",
      "Running wide to gain an advantage"
    ],
    "fact": "A successful undercut means your out-lap on fresh tyres was fast enough to jump ahead of someone who stayed out.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "Which F1 track features a tunnel that drivers blast through at over 150mph?",
    "correct": "Monaco",
    "distractors": [
      "Singapore",
      "Baku",
      "Jeddah"
    ],
    "fact": "The tunnel under the Fairmont hotel is taken flat out at around 260 km/h — the dark-light-dark flicker is one of F1's strangest sensations.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which driver is nicknamed 'the honey badger'?",
    "correct": "Daniel Ricciardo",
    "distractors": [
      "Lando Norris",
      "Pierre Gasly",
      "Sergio Perez"
    ],
    "fact": "Ricciardo chose the honey badger for its deceptive aggression — all smiles, then fearless late-braking overtakes.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "What does ERS stand for in a modern F1 power unit?",
    "correct": "Energy recovery system",
    "distractors": [
      "Electronic race stabilizer",
      "Engine rev sync",
      "Exhaust recirculation setup"
    ],
    "fact": "Through 2025 the ERS harvested energy from two sources — braking and the exhaust turbo; the exhaust half vanishes under the 2026 rules.",
    "category": "teams & culture",
    "tier": "regular"
  },
  {
    "prompt": "Which legendary commentator was known for the catchphrase 'And it's go go go!'?",
    "correct": "Murray Walker",
    "distractors": [
      "Martin Brundle",
      "David Croft",
      "James Hunt"
    ],
    "fact": "Murray Walker's breathless, excitable commentary defined F1 broadcasting for decades.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "What does a driver mean when they report 'understeer' to their engineer?",
    "correct": "The front doesn't turn enough into the corner",
    "distractors": [
      "The car turns more than expected",
      "The brakes are locking up",
      "The throttle response feels lazy"
    ],
    "fact": "Understeer means the car pushes wide — the front tyres lose grip before the rears.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "What is 'dirty air'?",
    "correct": "Turbulence that reduces the following car's downforce",
    "distractors": [
      "Hot air from the car ahead's cooling",
      "Gusty wind on the main straight",
      "Spray kicked up in wet conditions"
    ],
    "fact": "It is the turbulent wake off the car ahead. It strips downforce from the car behind, which is why drivers hate following closely and why the 2022 rules set out to reduce it.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "What is a 'shoey' that Ricciardo made famous on F1 podiums?",
    "correct": "Drinking champagne from a racing boot",
    "distractors": [
      "A victory dance",
      "Throwing shoes into the crowd",
      "Signing a shoe for a fan"
    ],
    "fact": "Ricciardo's shoey became one of the most iconic podium traditions, with even other drivers and celebrities joining in.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "What does 'graining' look like on an F1 tyre?",
    "correct": "Torn rubber balling up and sticking back onto the tyre's surface",
    "distractors": [
      "Visible cracks in the sidewall",
      "The tyre turning white",
      "Smoke pouring from the contact patch"
    ],
    "fact": "Graining strikes a cold, sliding tyre as its own torn surface regrips unevenly — unlike blistering, it can heal once the tyre warms up.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "What is the 'parc ferme' period in an F1 weekend?",
    "correct": "A lockdown on car changes between qualifying and race",
    "distractors": [
      "The cooldown window after the race ends",
      "The mandatory rest period for drivers overnight",
      "The pre-race media obligations window"
    ],
    "fact": "Parc ferme prevents teams from making major setup changes once qualifying ends, ensuring the car you qualified is the car you race.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "How are repeated track-limits violations usually punished during a race?",
    "correct": "A black-and-white warning flag, then a time penalty",
    "distractors": [
      "Immediate disqualification",
      "A grid penalty at the next race",
      "Nothing — track limits only matter in qualifying"
    ],
    "fact": "Under the FIA's current guidelines each offence deletes the lap time, strike three brings the warning flag, and strike four normally costs five seconds. (As of 2025)",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "Which driver was nicknamed 'The Iceman'?",
    "correct": "Kimi Raikkonen",
    "distractors": [
      "Mika Hakkinen",
      "Nico Rosberg",
      "Valtteri Bottas"
    ],
    "fact": "Räikkönen's flat monotone delivery and total refusal to celebrate made the nickname inevitable.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "What was special about the 2021 Spa-Francorchamps Grand Prix?",
    "correct": "It lasted only a few laps behind the safety car due to rain",
    "distractors": [
      "It was the longest race in F1 history",
      "Three drivers were disqualified",
      "It was canceled entirely"
    ],
    "fact": "Under the rules as they stood in 2021, half points were awarded for a handful of laps behind the safety car — the outcry rewrote the points rules.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "What does 'oversteer' feel like to a driver?",
    "correct": "The rear steps out and the car wants to spin",
    "distractors": [
      "The brakes lock under pressure",
      "The steering goes heavy",
      "The car bogs down out of the corners"
    ],
    "fact": "Oversteer happens when the rear tyres lose grip before the fronts, rotating the car more than the driver intended.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "Which team has won the most Constructors' Championships in F1 history?",
    "correct": "Ferrari",
    "distractors": [
      "Williams",
      "McLaren",
      "Mercedes"
    ],
    "fact": "Ferrari's 16 constructors' crowns lead the field, and their most recent came all the way back in 2008 — yet no rival has ever got closer than six titles behind. (As of 2025)",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Who is the youngest ever F1 race winner?",
    "correct": "Max Verstappen",
    "distractors": [
      "Sebastian Vettel",
      "Charles Leclerc",
      "Fernando Alonso"
    ],
    "fact": "Verstappen won the 2016 Spanish GP aged 18 years and 228 days, on his very first start for Red Bull after a mid-season promotion.",
    "category": "champions & records",
    "tier": "regular"
  },
  {
    "prompt": "What does a driver mean when they say the car feels 'on rails'?",
    "correct": "It has perfect grip and balance",
    "distractors": [
      "It's understeering badly",
      "It's stuck in a low gear",
      "It's bottoming out on the straights"
    ],
    "fact": "When a car feels 'on rails', the driver has total confidence in the grip level through every corner.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "Why do F1 drivers weave side to side on the formation lap?",
    "correct": "To warm up their tyres",
    "distractors": [
      "To save fuel before the start",
      "To cool the engine",
      "To check DRS is working"
    ],
    "fact": "Weaving generates lateral friction that heats the tyre surface, crucial for grip at the standing start.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "What is a 'power unit' in modern F1?",
    "correct": "The engine plus its turbo and hybrid systems",
    "distractors": [
      "Just the combustion engine",
      "The gearbox and driveshafts",
      "The battery pack and its cooling"
    ],
    "fact": "Through 2025 the package combined a V6 turbo with two energy-recovery motors — well over a thousand horsepower all in.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "What did Lewis Hamilton do immediately after crossing the line to win his 7th title in Turkey 2020?",
    "correct": "Screamed on the radio and cried in the car",
    "distractors": [
      "Did donuts",
      "Jumped out of the car",
      "Sprayed his team with champagne"
    ],
    "fact": "Hamilton sobbed through the radio after nearly 50 laps on a single set of intermediates — title number seven, sealed from P6 on a soaked track.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "What is the 'DRS train' that commentators complain about?",
    "correct": "A queue of cars each within a second of the next, so DRS cancels out",
    "distractors": [
      "A run of laps with DRS disabled",
      "Cars saving their DRS use for the final stint",
      "A DRS failure affecting several cars at once"
    ],
    "fact": "In a DRS train nobody can overtake because the car ahead also has DRS from the car in front of them.",
    "category": "racecraft & feel",
    "tier": "regular"
  },
  {
    "prompt": "What is 'sandbagging' in the context of F1 practice sessions?",
    "correct": "Deliberately hiding true pace to mislead rivals",
    "distractors": [
      "Running heavy fuel to test race pace",
      "Aborting laps to save tyres",
      "Hiding a new upgrade under covers in the garage"
    ],
    "fact": "Teams often sandbag in practice to avoid showing their real performance until qualifying or the race.",
    "category": "teams & culture",
    "tier": "regular"
  },
  {
    "prompt": "Which car number is the reigning world champion entitled to run?",
    "correct": "1",
    "distractors": [
      "0",
      "99",
      "10"
    ],
    "fact": "Only the reigning champion may carry it — the number sat unused from 2015 until the 2021 champion revived it, and it changed hands again for 2026.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "What is a safety car restart often called by fans?",
    "correct": "A rolling restart",
    "distractors": [
      "A standing restart",
      "A formation restart",
      "A launch restart"
    ],
    "fact": "After a safety car period, the leader controls the restart pace and the field goes green at racing speed — no standing start.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "What does 'flat out' mean in F1 driver language?",
    "correct": "Driving at maximum speed without lifting",
    "distractors": [
      "The tyres are completely worn",
      "The car is bottoming out on the track",
      "Running on fumes"
    ],
    "fact": "Taking a corner 'flat out' means the driver keeps full throttle through it — a sign of extreme downforce and bravery.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "What does it mean when a driver is told 'You are on the delta' by their engineer?",
    "correct": "They're matching the required target lap time",
    "distractors": [
      "They need to speed up immediately",
      "They've been given a penalty",
      "They're running low on fuel"
    ],
    "fact": "The delta is a reference pace — staying 'on the delta' means the driver is hitting their time targets, crucial under safety car or VSC.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "Why do teams put tyre blankets on the wheels before a pit stop?",
    "correct": "To keep the tyres at optimal temperature",
    "distractors": [
      "To hide the tyre compound from rivals",
      "To protect them from debris",
      "To prevent sun damage to the rubber"
    ],
    "fact": "Blankets warm slick tyres to a regulated 70°C; a plan to ban them outright was scrapped in 2023 after driver pushback.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "What are the 'marbles' that drivers try to avoid on track?",
    "correct": "Small balls of rubber shed from tyres that litter the track surface",
    "distractors": [
      "Loose gravel from the run-off",
      "Rain droplets on the racing line",
      "Debris from broken front wings"
    ],
    "fact": "Marbles collect off the racing line and are extremely slippery — running over them can cause a car to snap sideways.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "What does 'Lights out and away we go' signal?",
    "correct": "The race start",
    "distractors": [
      "The end of a safety car period",
      "Qualifying has begun",
      "Pit lane is open"
    ],
    "fact": "Five red lights illuminate one by one, then all go out simultaneously — that's the signal to race.",
    "category": "race weekend",
    "tier": "beginner"
  },
  {
    "prompt": "Why is overtaking considered nearly impossible at Monaco?",
    "correct": "The street circuit is too narrow for side-by-side racing",
    "distractors": [
      "DRS is banned there",
      "The cars run too much downforce",
      "There's no straight long enough"
    ],
    "fact": "Monaco's tight barriers and narrow streets mean qualifying position is often more important than race pace.",
    "category": "circuits",
    "tier": "beginner"
  },
  {
    "prompt": "What is the 'racing line' and why do drivers follow it?",
    "correct": "The fastest path through a corner, using the full width of the track",
    "distractors": [
      "The white line marking the edge of the track",
      "The pit lane entry line",
      "A painted guide on the asphalt"
    ],
    "fact": "The racing line maximizes corner speed by taking the widest arc possible, which is why the track surface is most rubbered-in on that line.",
    "category": "racecraft & feel",
    "tier": "beginner"
  },
  {
    "prompt": "What is 'the overcut'?",
    "correct": "Staying out longer than a rival and gaining by pitting later",
    "distractors": [
      "Pitting first to jump a rival on fresh tyres",
      "Double-stacking both cars in one stop",
      "Short-filling fuel for a light final stint"
    ],
    "fact": "The overcut works when fresh tyres take laps to switch on, or when the rival hits traffic — the mirror image of the undercut.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "In a dry race, what tyre rule must every driver follow?",
    "correct": "Use at least two different slick compounds",
    "distractors": [
      "Make at least two pit stops",
      "Start on the tyres they qualified on",
      "End the race on the softest compound"
    ],
    "fact": "The mandatory compound change is what forces at least one pit stop — in a wet race the rule doesn't apply at all.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "Why is pitting under a safety car called a 'cheap' stop?",
    "correct": "The field slows, so a stop costs fewer positions than at racing speed",
    "distractors": [
      "Pit crews charge less during neutralisations",
      "The pit-lane speed limit is lifted",
      "Tyres fitted under safety car are free of wear rules"
    ],
    "fact": "With the pack crawling, the usual 20-odd seconds of pit loss can shrink to around half — which is why a safety car flips every strategy on the pit wall.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "What is 'double-stacking' in the pits?",
    "correct": "Both of a team's cars pitting on the same lap, one queued behind the other",
    "distractors": [
      "Fitting two new tyre sets in a single stop",
      "Two crews servicing one car at once",
      "Pitting on consecutive laps to split strategies"
    ],
    "fact": "The second car loses seconds waiting for the first to clear the box — teams accept it when a safety car makes the double stop worth the risk.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "In Pirelli's compound naming, what does a higher C-number mean?",
    "correct": "A softer, faster, shorter-lived tyre",
    "distractors": [
      "A harder, more durable tyre",
      "A tyre for heavier rain",
      "A compound reserved for street circuits"
    ],
    "fact": "The scale runs from the hardest C1 upward (C1-C5 in 2026); Pirelli nominates three steps of it for each race weekend.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "Roughly how much total race time does a normal green-flag pit stop cost?",
    "correct": "About 20 to 25 seconds",
    "distractors": [
      "About 3 seconds",
      "About 8 to 10 seconds",
      "About a full minute"
    ],
    "fact": "The stop itself takes under three seconds — the rest is the drive through the speed-limited pit lane, which varies by circuit.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "What's the basic trade-off between soft and hard tyre compounds?",
    "correct": "Softs grip better but wear out faster",
    "distractors": [
      "Softs last longer but are slower",
      "Hards only work in the rain",
      "Softs are only allowed in qualifying"
    ],
    "fact": "That trade-off is the heart of race strategy: sprint on softs and stop more, or hold out on hards and stop less.",
    "category": "strategy & tyres",
    "tier": "beginner"
  },
  {
    "prompt": "Why do teams switch from full wets to intermediates as a track dries?",
    "correct": "Inters are much faster once standing water is gone",
    "distractors": [
      "Full wets are limited to a set number of laps",
      "The rules require it once the safety car pits",
      "Inters warm up slower and last longer"
    ],
    "fact": "Full wets move the most water but overheat on a drying line — the crossover call is one of racing's hardest judgement calls.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "What is tyre 'blistering'?",
    "correct": "Overheating from within, breaking the surface open in patches",
    "distractors": [
      "Rubber pellets tearing off a sliding surface",
      "The tyre losing pressure through the rim",
      "Flat spots from locked brakes"
    ],
    "fact": "Blistering starts inside an overheated tyre and cannot be driven off — unlike graining, slowing down won't heal it.",
    "category": "strategy & tyres",
    "tier": "regular"
  },
  {
    "prompt": "How many times may a driver change direction to defend their position?",
    "correct": "Once",
    "distractors": [
      "Twice",
      "As often as they like",
      "Never — blocking is banned outright"
    ],
    "fact": "The one-move rule: a single defensive move is fair game, but weaving or moving under braking invites the stewards' attention.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "What happens during a 'lock-up'?",
    "correct": "A wheel stops turning under braking and skids",
    "distractors": [
      "The gearbox jams in one gear",
      "The steering column locks mid-corner",
      "The DRS flap sticks open"
    ],
    "fact": "A locked front tyre grinds a flat spot that vibrates for the rest of the stint — sometimes badly enough to force an extra pit stop.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "What does the black flag with an orange disc tell a driver?",
    "correct": "Their car has a mechanical problem — return to the pits",
    "distractors": [
      "They are being investigated for a penalty",
      "They must let the leader lap them",
      "Their pit box is blocked"
    ],
    "fact": "Nicknamed the 'meatball' flag, it forces a pit visit for repairs — loose bodywork is the classic trigger.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "What penalty comes with using more power unit parts than the season allowance?",
    "correct": "A grid penalty",
    "distractors": [
      "A points deduction",
      "A pit-lane drive-through",
      "A fine for the team"
    ],
    "fact": "Each driver gets a fixed pool of engines, turbos, and hybrid parts for the season — fit one too many and you start further back.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "How does F1 qualifying whittle the field down?",
    "correct": "The slowest cars are knocked out in Q1 and Q2, then Q3 decides pole",
    "distractors": [
      "One long session where every lap counts",
      "A knockout bracket of head-to-head laps",
      "The championship order sets the grid"
    ],
    "fact": "Knockout qualifying arrived in 2006: the slowest cars drop in Q1 and Q2 before a final shootout settles the grid.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "What is a sprint weekend?",
    "correct": "A weekend with an extra short race that awards its own points",
    "distractors": [
      "A weekend with two full grands prix",
      "A shortened race distance for street circuits",
      "A test weekend with no championship points"
    ],
    "fact": "Sprints run to roughly 100 km — about a third of a grand prix — and both the 2025 and 2026 calendars carry six of them.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "Who won the 2025 F1 drivers' championship?",
    "correct": "Lando Norris",
    "distractors": [
      "Max Verstappen",
      "Oscar Piastri",
      "George Russell"
    ],
    "beginnerDistractors": [
      "Lewis Hamilton",
      "Sebastian Vettel",
      "Fernando Alonso"
    ],
    "fact": "Norris pipped Verstappen by two points at the Abu Dhabi decider — McLaren's first drivers' champion in seventeen years.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Which team won the 2024 constructors' championship — its first since 1998?",
    "correct": "McLaren",
    "distractors": [
      "Red Bull",
      "Ferrari",
      "Mercedes"
    ],
    "fact": "McLaren edged Ferrari by 14 points at the final round, ending a 26-year drought stretching back to the Häkkinen era.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Which city joined the calendar in 2023 with a Saturday night race past its casinos?",
    "correct": "Las Vegas",
    "distractors": [
      "Miami",
      "Madrid",
      "Doha"
    ],
    "fact": "The grand prix runs down the Strip itself — F1's splashiest arrival since the short-lived Caesars Palace race of the early 1980s.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which team did Lewis Hamilton join for the 2025 season?",
    "correct": "Ferrari",
    "distractors": [
      "Aston Martin",
      "McLaren",
      "Red Bull"
    ],
    "beginnerDistractors": [
      "Williams",
      "Alpine",
      "Haas"
    ],
    "fact": "Hamilton ended twelve seasons with Mercedes — the team of six of his titles — for the seat every driver dreams about.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "Who made a shock Ferrari debut at the 2024 Saudi Arabian GP, aged 18, when Carlos Sainz needed surgery?",
    "correct": "Oliver Bearman",
    "distractors": [
      "Andrea Kimi Antonelli",
      "Franco Colapinto",
      "Liam Lawson"
    ],
    "fact": "Bearman got the call overnight, qualified 11th and raced to P7 at Jeddah — the youngest driver ever to race for Ferrari.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "Who took over Lewis Hamilton's Mercedes seat in 2025?",
    "correct": "Andrea Kimi Antonelli",
    "distractors": [
      "George Russell",
      "Oliver Bearman",
      "Esteban Ocon"
    ],
    "fact": "Mercedes promoted the teenage Italian straight from Formula 2 — a bet on the next generation rather than a proven name.",
    "category": "teams & culture",
    "tier": "regular"
  },
  {
    "prompt": "How many of 2023's 22 races did Max Verstappen win?",
    "correct": "19",
    "distractors": [
      "15",
      "12",
      "22"
    ],
    "fact": "Nineteen wins — an 86% strike rate including ten in a row — remains the most dominant single season in F1 history. (As of 2025)",
    "category": "champions & records",
    "tier": "regular"
  },
  {
    "prompt": "What happened to the bonus point for fastest lap in 2025?",
    "correct": "It was abolished",
    "distractors": [
      "It was doubled",
      "It was extended to the top five",
      "It moved to the sprint race only"
    ],
    "fact": "The bonus ran from 2019 to 2024 — after a backmarker pitted late at Singapore 2024 purely to Strip the point from a title contender, the rule was scrapped.",
    "category": "rules & flags",
    "tier": "regular"
  },
  {
    "prompt": "What major change headlines the 2026 engine regulations?",
    "correct": "Electrical power rises to roughly half the total output",
    "distractors": [
      "A return to V10 engines",
      "A single spec engine for all teams",
      "Turbochargers are banned"
    ],
    "fact": "The 2026 power units run 100% sustainable fuel and swap DRS for movable-wing 'straight mode' — the biggest rules shake-up in decades.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "Which American giant joins the F1 grid as a new team in 2026?",
    "correct": "Cadillac",
    "distractors": [
      "Ford",
      "Chevrolet",
      "Tesla"
    ],
    "fact": "Cadillac becomes the eleventh team; the same season, Audi arrives by taking over Sauber — the grid's biggest reshuffle in decades.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "Which is the longest circuit on the current F1 calendar?",
    "correct": "Spa-Francorchamps",
    "distractors": [
      "Silverstone",
      "Suzuka",
      "Jeddah"
    ],
    "fact": "At 7.004 km Spa is the only current lap over seven kilometres — the next-longest laps are a full 800 metres shorter.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which is the shortest lap on the current F1 calendar?",
    "correct": "Monaco",
    "distractors": [
      "Zandvoort",
      "Hungaroring",
      "Marina Bay"
    ],
    "fact": "At 3.3 km, Monaco's lap is more than 800 metres shorter than any other on the calendar.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which grand prix is run at the highest altitude?",
    "correct": "Mexico City",
    "distractors": [
      "São Paulo",
      "Austin",
      "Barcelona"
    ],
    "fact": "At about 2,285 m the air is roughly a quarter thinner, so maximum-downforce wings behave like skinny low-drag ones.",
    "category": "circuits",
    "tier": "regular"
  },
  {
    "prompt": "Which circuit is the only one on the calendar that crosses over itself?",
    "correct": "Suzuka",
    "distractors": [
      "Silverstone",
      "Interlagos",
      "Circuit of the Americas"
    ],
    "fact": "Suzuka's figure-of-eight sends the back section over the front on a bridge — unique in the world championship.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "Which circuit has the longest full-throttle stretch on the calendar?",
    "correct": "Baku",
    "distractors": [
      "Monza",
      "Las Vegas",
      "Jeddah"
    ],
    "fact": "The blast to turn 1 runs about 2.2 km flat out — while the same lap pinches to 7.6 metres at the old castle, the calendar's narrowest point.",
    "category": "circuits",
    "tier": "regular"
  },
  {
    "prompt": "Who shares the record of seven F1 drivers' championships?",
    "correct": "Michael Schumacher and Lewis Hamilton",
    "distractors": [
      "Michael Schumacher and Ayrton Senna",
      "Lewis Hamilton and Max Verstappen",
      "Michael Schumacher and Juan Manuel Fangio"
    ],
    "beginnerDistractors": [
      "Michael Schumacher and Ayrton Senna",
      "Lewis Hamilton and Fernando Alonso",
      "Sebastian Vettel and Lewis Hamilton"
    ],
    "fact": "The sevenths came in 2004 and 2020 — before that, Fangio's five titles had stood as the benchmark for almost half a century. (As of 2025)",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "Who holds the record for most F1 pole positions?",
    "correct": "Lewis Hamilton",
    "distractors": [
      "Michael Schumacher",
      "Ayrton Senna",
      "Max Verstappen"
    ],
    "fact": "Hamilton's 104 poles include F1's first-ever 100th, sealed at Barcelona in 2021 by 0.036 seconds. (As of 2025)",
    "category": "champions & records",
    "tier": "regular"
  },
  {
    "prompt": "Which driver screamed 'GP2 engine! GP2!' over the radio at Suzuka in 2015?",
    "correct": "Fernando Alonso",
    "distractors": [
      "Sebastian Vettel",
      "Jenson Button",
      "Kimi Raikkonen"
    ],
    "fact": "At Honda's home race, Alonso compared his McLaren-Honda's power to F1's feeder series — the partnership never lived it down.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "Which team boss was fined for calling a steward 'stupid' and 'idiotic' over the radio at Sochi 2019?",
    "correct": "Guenther Steiner",
    "distractors": [
      "Christian Horner",
      "Toto Wolff",
      "Franz Tost"
    ],
    "fact": "The FIA charged Haas's Steiner 7,500 euros for causing 'moral injury' to the steward — the rare radio rant that came with an invoice.",
    "category": "iconic moments",
    "tier": "regular"
  },
  {
    "prompt": "What is the fastest F1 pit stop on record?",
    "correct": "Under 2 seconds for all four wheels",
    "distractors": [
      "About 4 seconds",
      "About 6 seconds",
      "Just over 10 seconds"
    ],
    "fact": "McLaren hold the Guinness-certified record: 1.80 seconds at the 2023 Qatar GP, beating Red Bull's 1.82 from Brazil 2019.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "How do drivers drink during a two-hour race?",
    "correct": "Through a tube inside the helmet",
    "distractors": [
      "They stop at the pit wall for bottles",
      "They don't — drinking is banned",
      "A hydration pack in the seat sprays automatically"
    ],
    "fact": "A drinks bag in the car pumps fluid up a tube to the helmet — in hot races drivers can still lose several kilos of sweat.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "What do engineers watch on 'telemetry' during a race?",
    "correct": "Live data streamed from the car's sensors",
    "distractors": [
      "TV broadcast replays",
      "The rival teams' radio channels",
      "Weather satellite feeds only"
    ],
    "fact": "Hundreds of sensors stream speed, temperatures, and driver inputs in real time — engineers often spot a problem before the driver feels it.",
    "category": "teams & culture",
    "tier": "beginner"
  },
  {
    "prompt": "What does 'P1' mean over team radio?",
    "correct": "First position",
    "distractors": [
      "One pit stop remaining",
      "Engine mode one",
      "Practice session one"
    ],
    "fact": "Positions are just 'p' plus a number — the same shorthand gives us 'P10' for tenth and the dreaded 'P Last'.",
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
