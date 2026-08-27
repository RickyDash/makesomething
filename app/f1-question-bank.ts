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
    "tier": "both"
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
    "tier": "both"
  },
  {
    "prompt": "in qualifying, who starts p1 on race day?",
    "correct": "fastest q3 driver",
    "distractors": [
      "last year champion",
      "fastest pit crew",
      "sprint winner"
    ],
    "fact": "pole position goes to the fastest driver in q3.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "what does parc ferme limit after qualifying?",
    "correct": "major car setup changes",
    "distractors": [
      "radio messages",
      "pit stop practice",
      "tyre blankets"
    ],
    "fact": "parc ferme rules lock most setup changes between qualifying and race start.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "what is the main purpose of the safety car?",
    "correct": "neutralize race pace for safety",
    "distractors": [
      "increase race speed",
      "start rain procedures",
      "award half points"
    ],
    "fact": "the safety car slows and bunches the field so marshals can work safely.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "under a virtual safety car, what must drivers do?",
    "correct": "follow a reduced delta pace",
    "distractors": [
      "pit immediately",
      "switch to wet tyres",
      "line up on the grid"
    ],
    "fact": "under vsc, drivers follow a minimum delta time instead of racing flat out.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "what does a blue flag usually indicate?",
    "correct": "faster car is lapping you",
    "distractors": [
      "rain expected",
      "session suspended",
      "pit lane closed"
    ],
    "fact": "blue flags warn a slower car that a faster one is approaching to lap.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "what does a black flag mean?",
    "correct": "car is disqualified and must return",
    "distractors": [
      "race canceled",
      "safety car ending",
      "driver wins pole"
    ],
    "fact": "a black flag means disqualification from the session.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "what does a yellow flag mean for drivers?",
    "correct": "danger ahead, no overtaking",
    "distractors": [
      "full speed racing",
      "mandatory pit stop",
      "race finished"
    ],
    "fact": "yellow flag means caution and no overtaking in that zone.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "which tyre is designed for damp conditions without standing water?",
    "correct": "intermediate",
    "distractors": [
      "soft",
      "full wet",
      "hard"
    ],
    "fact": "intermediates are made for a damp track and light spray conditions.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "which tyre is designed for heavy rain and standing water?",
    "correct": "full wet",
    "distractors": [
      "intermediate",
      "hard",
      "medium"
    ],
    "fact": "full wet tyres clear much more water than intermediates.",
    "category": "strategy & tyres",
    "tier": "both"
  },
  {
    "prompt": "what is a chicane?",
    "correct": "a quick left-right or right-left sequence",
    "distractors": [
      "a long straight",
      "a pit lane tool",
      "a wet tyre type"
    ],
    "fact": "a chicane is a rapid change of direction added to slow cars down.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "what is slipstreaming in f1?",
    "correct": "using reduced drag behind another car",
    "distractors": [
      "driving through pit lane",
      "locking brakes into a corner",
      "saving fuel under safety car"
    ],
    "fact": "a car behind can gain speed by sitting in lower-pressure air.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what is a delta time under safety procedures?",
    "correct": "minimum reference pace drivers must respect",
    "distractors": [
      "pit stop target",
      "gap to championship leader",
      "time of day for sunset"
    ],
    "fact": "the delta is a target lap pace used to keep speeds controlled.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "what is an out lap?",
    "correct": "lap leaving pits to start a run",
    "distractors": [
      "lap returning to pits",
      "final race lap",
      "lap under red flag"
    ],
    "fact": "an out lap starts when a car exits the pit lane before a timed push lap.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "what is an in lap?",
    "correct": "lap returning to the pit lane",
    "distractors": [
      "lap before lights out",
      "lap under drs",
      "formation lap"
    ],
    "fact": "an in lap is the lap where the driver comes back to pits.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "what does downforce mainly help with?",
    "correct": "cornering grip",
    "distractors": [
      "top speed on straights",
      "radio quality",
      "fuel flow"
    ],
    "fact": "more downforce improves corner speed but usually increases drag.",
    "category": "racecraft & feel",
    "tier": "both"
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
    "tier": "both"
  },
  {
    "prompt": "roughly how long is a full grand prix race distance (except monaco)?",
    "correct": "about 305 km",
    "distractors": [
      "about 220 km",
      "about 150 km",
      "about 500 km"
    ],
    "fact": "f1 races are set to about 305 km, with monaco as the classic exception.",
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
    "fact": "monaco is run at a shorter total distance than most f1 races.",
    "category": "race weekend",
    "tier": "both"
  },
  {
    "prompt": "which company supplies f1 tyres in the current era?",
    "correct": "pirelli",
    "distractors": [
      "michelin",
      "bridgestone",
      "goodyear"
    ],
    "fact": "pirelli is the current official tyre supplier in formula 1.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "which era began in 2014 in formula 1?",
    "correct": "turbo-hybrid power unit era",
    "distractors": [
      "v10 return era",
      "ground effect ban era",
      "manual gearbox era"
    ],
    "fact": "2014 introduced the current turbo-hybrid power unit regulations.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2002?",
    "correct": "michael schumacher",
    "distractors": [
      "lewis hamilton",
      "nico rosberg",
      "fernando alonso"
    ],
    "fact": "michael schumacher won the drivers' title in 2002.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2004?",
    "correct": "michael schumacher",
    "distractors": [
      "sebastian vettel",
      "fernando alonso",
      "lewis hamilton"
    ],
    "fact": "michael schumacher won the drivers' title in 2004.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2005?",
    "correct": "fernando alonso",
    "distractors": [
      "nico rosberg",
      "kimi raikkonen",
      "jenson button"
    ],
    "fact": "fernando alonso won the drivers' title in 2005.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2006?",
    "correct": "fernando alonso",
    "distractors": [
      "max verstappen",
      "lewis hamilton",
      "sebastian vettel"
    ],
    "fact": "fernando alonso won the drivers' title in 2006.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2007?",
    "correct": "kimi raikkonen",
    "distractors": [
      "michael schumacher",
      "jenson button",
      "nico rosberg"
    ],
    "fact": "kimi raikkonen won the drivers' title in 2007.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2008?",
    "correct": "lewis hamilton",
    "distractors": [
      "fernando alonso",
      "sebastian vettel",
      "max verstappen"
    ],
    "fact": "lewis hamilton won the drivers' title in 2008.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2009?",
    "correct": "jenson button",
    "distractors": [
      "kimi raikkonen",
      "nico rosberg",
      "michael schumacher"
    ],
    "fact": "jenson button won the drivers' title in 2009.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2010?",
    "correct": "sebastian vettel",
    "distractors": [
      "lewis hamilton",
      "max verstappen",
      "fernando alonso"
    ],
    "fact": "sebastian vettel won the drivers' title in 2010.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2011?",
    "correct": "sebastian vettel",
    "distractors": [
      "jenson button",
      "michael schumacher",
      "kimi raikkonen"
    ],
    "fact": "sebastian vettel won the drivers' title in 2011.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2014?",
    "correct": "lewis hamilton",
    "distractors": [
      "michael schumacher",
      "jenson button",
      "nico rosberg"
    ],
    "fact": "lewis hamilton won the drivers' title in 2014.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2015?",
    "correct": "lewis hamilton",
    "distractors": [
      "fernando alonso",
      "sebastian vettel",
      "max verstappen"
    ],
    "fact": "lewis hamilton won the drivers' title in 2015.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2016?",
    "correct": "nico rosberg",
    "distractors": [
      "kimi raikkonen",
      "sebastian vettel",
      "michael schumacher"
    ],
    "fact": "nico rosberg won the drivers' title in 2016.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2022?",
    "correct": "max verstappen",
    "distractors": [
      "fernando alonso",
      "jenson button",
      "nico rosberg"
    ],
    "fact": "max verstappen won the drivers' title in 2022.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2024?",
    "correct": "max verstappen",
    "distractors": [
      "lewis hamilton",
      "nico rosberg",
      "fernando alonso"
    ],
    "fact": "max verstappen won the drivers' title in 2024.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the monza grand prix circuit?",
    "correct": "italy",
    "distractors": [
      "belgium",
      "united arab emirates",
      "saudi arabia"
    ],
    "fact": "monza is located in italy.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the spa-francorchamps grand prix circuit?",
    "correct": "belgium",
    "distractors": [
      "united kingdom",
      "united states",
      "bahrain"
    ],
    "fact": "spa-francorchamps is located in belgium.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the suzuka grand prix circuit?",
    "correct": "japan",
    "distractors": [
      "brazil",
      "saudi arabia",
      "spain"
    ],
    "fact": "suzuka is located in japan.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the interlagos grand prix circuit?",
    "correct": "brazil",
    "distractors": [
      "united arab emirates",
      "bahrain",
      "monaco"
    ],
    "fact": "interlagos is located in brazil.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the yas marina grand prix circuit?",
    "correct": "united arab emirates",
    "distractors": [
      "united states",
      "canada",
      "netherlands"
    ],
    "fact": "yas marina is located in united arab emirates.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the albert park grand prix circuit?",
    "correct": "australia",
    "distractors": [
      "saudi arabia",
      "monaco",
      "austria"
    ],
    "fact": "albert park is located in australia.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the circuit gilles villeneuve grand prix circuit?",
    "correct": "canada",
    "distractors": [
      "spain",
      "austria",
      "mexico"
    ],
    "fact": "circuit gilles villeneuve is located in canada.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the zandvoort grand prix circuit?",
    "correct": "netherlands",
    "distractors": [
      "hungary",
      "mexico",
      "germany"
    ],
    "fact": "zandvoort is located in netherlands.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the red bull ring grand prix circuit?",
    "correct": "austria",
    "distractors": [
      "singapore",
      "china",
      "belgium"
    ],
    "fact": "red bull ring is located in austria.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the marina bay grand prix circuit?",
    "correct": "singapore",
    "distractors": [
      "azerbaijan",
      "germany",
      "united kingdom"
    ],
    "fact": "marina bay is located in singapore.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the imola grand prix circuit?",
    "correct": "italy",
    "distractors": [
      "mexico",
      "belgium",
      "brazil"
    ],
    "fact": "imola is located in italy.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the baku city circuit grand prix circuit?",
    "correct": "azerbaijan",
    "distractors": [
      "qatar",
      "belgium",
      "brazil"
    ],
    "fact": "baku city circuit is located in azerbaijan.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the autodromo hermanos rodriguez grand prix circuit?",
    "correct": "mexico",
    "distractors": [
      "china",
      "united kingdom",
      "united arab emirates"
    ],
    "fact": "autodromo hermanos rodriguez is located in mexico.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the losail international circuit grand prix circuit?",
    "correct": "qatar",
    "distractors": [
      "germany",
      "japan",
      "united states"
    ],
    "fact": "losail international circuit is located in qatar.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "which country hosts the nurburgring grand prix circuit?",
    "correct": "germany",
    "distractors": [
      "japan",
      "australia",
      "canada"
    ],
    "fact": "nurburgring is located in germany.",
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
    "tier": "both"
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
    "tier": "both"
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
    "fact": "a controversial late safety car and restart allowed verstappen to overtake hamilton on the final lap to win the 2021 title.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "what did lando norris famously lose in russia 2021 by staying out in worsening rain?",
    "correct": "his first f1 win",
    "distractors": [
      "his front wing",
      "a podium finish",
      "his grid penalty appeal"
    ],
    "fact": "norris led the race but stayed out on slicks as rain intensified, dropping him down the order and handing the win to hamilton.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "what did sebastian vettel do after winning the 2013 indian gp to celebrate his 4th title?",
    "correct": "did doughnuts on the straight",
    "distractors": [
      "sprinted to the crowd",
      "threw his steering wheel",
      "climbed a fence"
    ],
    "fact": "vettel's iconic donuts on the main straight became one of f1's most memorable celebrations.",
    "category": "iconic moments",
    "tier": "both"
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
    "tier": "both"
  },
  {
    "prompt": "which team principal is famous for shouting 'no michael no no that is so not right' on team radio?",
    "correct": "toto wolff",
    "distractors": [
      "christian horner",
      "guenther steiner",
      "helmut marko"
    ],
    "fact": "mercedes principal toto wolff's radio outburst to race director michael masi during abu dhabi 2021 became an iconic f1 meme.",
    "category": "iconic moments",
    "tier": "both"
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
    "fact": "raikkonen's ice-cold radio message during abu dhabi 2012 became one of f1's most quoted lines.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "what is a 'megapixel' in f1 slang?",
    "correct": "nothing — it's not real f1 slang",
    "distractors": [
      "a really clean qualifying lap",
      "a high-res onboard camera",
      "a sponsor deal worth millions"
    ],
    "fact": "there's no such thing as a megapixel in f1 jargon — don't let fake terms trip you up.",
    "category": "teams & culture",
    "tier": "both"
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
    "tier": "both"
  },
  {
    "prompt": "what is the 'halo' device on modern f1 cars designed to protect against?",
    "correct": "head impacts from debris",
    "distractors": [
      "rain spray",
      "engine fires",
      "tyre blowouts"
    ],
    "fact": "the halo has been credited with saving multiple lives since its introduction in 2018, including romain grosjean's fiery 2020 crash.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "which driver survived a 137mph crash and fireball at bahrain 2020?",
    "correct": "romain grosjean",
    "distractors": [
      "pierre gasly",
      "lance stroll",
      "carlos sainz"
    ],
    "fact": "grosjean's haas split the barrier and burst into flames, but the halo and his own escape saved his life.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "if it starts raining mid-race, who makes the call to switch to wet tyres?",
    "correct": "the driver and their team",
    "distractors": [
      "the fia race director",
      "the safety car driver",
      "the tyre supplier pirelli"
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
    "tier": "both"
  },
  {
    "prompt": "which driver held the record for most race wins before hamilton broke it?",
    "correct": "michael schumacher",
    "distractors": [
      "ayrton senna",
      "alain prost",
      "sebastian vettel"
    ],
    "fact": "schumacher's record of 91 wins stood for nearly 15 years before hamilton surpassed it in 2020.",
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
    "tier": "both"
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
    "tier": "both"
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
    "fact": "the famous monaco tunnel creates a sudden light-to-dark-to-light transition at extreme speed, one of f1's most unique challenges.",
    "category": "circuits",
    "tier": "both"
  },
  {
    "prompt": "what nickname did daniel ricciardo earn for his celebrations on the podium?",
    "correct": "the honey badger",
    "distractors": [
      "the shoey king",
      "the smiling assassin",
      "danny ric"
    ],
    "fact": "ricciardo adopted the honey badger nickname early in his career, known for his fearless overtaking and trademark grin.",
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
    "fact": "ers harvests energy from braking and exhaust heat, providing a significant power boost to the hybrid power unit.",
    "category": "teams & culture",
    "tier": "both"
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
    "prompt": "what happened when mclaren's pit crew released the car with a wheel gun issue at bahrain 2021?",
    "correct": "the car was released with a loose wheel",
    "distractors": [
      "nothing unusual",
      "the mechanic was dragged along",
      "the pit stop took over 40 seconds"
    ],
    "fact": "unsafe releases remain one of the most dangerous pit stop failures and carry heavy penalties.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "which driver is known for the radio message 'honestly, what are we doing here, racing or ping pong?'?",
    "correct": "fernando alonso",
    "distractors": [
      "sebastian vettel",
      "kimi raikkonen",
      "lewis hamilton"
    ],
    "fact": "alonso's frustrated radios became legendary during his struggles at mclaren-honda.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "what does a driver mean when they report 'understeer' to their engineer?",
    "correct": "the front doesn't turn enough into the corner",
    "distractors": [
      "the car turns more than expected",
      "the rear slides out",
      "the brakes are locking up"
    ],
    "fact": "understeer means the car pushes wide — the front tyres lose grip before the rears.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what is 'dirty air' and why do drivers hate following closely in it?",
    "correct": "turbulence that reduces the following car's downforce",
    "distractors": [
      "exhaust fumes that smell bad",
      "oil spray from the car ahead",
      "brake dust clouding visibility"
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
    "tier": "both"
  },
  {
    "prompt": "what does 'graining' look like on an f1 tyre?",
    "correct": "small rubber pellets rolling across the surface",
    "distractors": [
      "visible cracks in the sidewall",
      "the tyre turning white",
      "smoke pouring from the contact patch"
    ],
    "fact": "graining occurs when the tyre surface tears into tiny rolls of rubber, usually when the tyre is too cold or sliding too much.",
    "category": "strategy & tyres",
    "tier": "both"
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
    "tier": "both"
  },
  {
    "prompt": "what happens if a driver exceeds track limits three times during a race?",
    "correct": "they receive a black and white flag warning",
    "distractors": [
      "nothing until a fourth offense",
      "immediate 5-second penalty",
      "they must give back any positions gained"
    ],
    "fact": "the black and white flag serves as an official warning — further violations lead to time penalties.",
    "category": "rules & flags",
    "tier": "both"
  },
  {
    "prompt": "which driver was nicknamed 'the iceman'?",
    "correct": "kimi raikkonen",
    "distractors": [
      "mika hakkinen",
      "nico rosberg",
      "valtteri bottas"
    ],
    "fact": "raikkonen earned the nickname for his famously emotionless demeanor and ice-cold composure under pressure.",
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
    "fact": "the 2021 belgian gp was widely criticized as a farce — half points were awarded for what was essentially no racing.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "what does 'oversteer' feel like to a driver?",
    "correct": "the rear steps out and the car wants to spin",
    "distractors": [
      "the front washes wide",
      "the brakes lock under pressure",
      "the steering goes heavy"
    ],
    "fact": "oversteer happens when the rear tyres lose grip before the fronts, rotating the car more than the driver intended.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "which team has won the most constructors' championships in f1 history?",
    "correct": "ferrari",
    "distractors": [
      "mclaren",
      "mercedes",
      "red bull"
    ],
    "fact": "ferrari holds the record for the most constructors' titles, cementing their status as f1's most storied team.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "who is the youngest ever f1 race winner?",
    "correct": "max verstappen",
    "distractors": [
      "sebastian vettel",
      "charles leclerc",
      "lando norris"
    ],
    "fact": "verstappen won the 2016 spanish gp aged 18 years and 228 days on his debut race for red bull.",
    "category": "champions & records",
    "tier": "both"
  },
  {
    "prompt": "what does a driver mean when they say the car feels 'on rails'?",
    "correct": "it has perfect grip and balance",
    "distractors": [
      "it's stuck behind the safety car",
      "the steering is locked",
      "it's running out of fuel"
    ],
    "fact": "when a car feels 'on rails', the driver has total confidence in the grip level through every corner.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "why do f1 drivers weave side to side on the formation lap?",
    "correct": "to warm up their tyres",
    "distractors": [
      "to test their steering",
      "to wave to fans",
      "to check mirrors"
    ],
    "fact": "weaving generates lateral friction that heats the tyre surface, crucial for grip at the standing start.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what is a 'power unit' in modern f1?",
    "correct": "the complete hybrid system including engine, turbo, and electrical motors",
    "distractors": [
      "just the engine",
      "the gearbox assembly",
      "the battery pack only"
    ],
    "fact": "a modern f1 power unit combines a v6 turbo engine with mgu-k and mgu-h energy recovery systems producing over 1000hp.",
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
    "fact": "hamilton broke down in tears on the radio after equalling schumacher's record of 7 world titles in a dominant wet-weather drive.",
    "category": "iconic moments",
    "tier": "both"
  },
  {
    "prompt": "what is the 'drs train' that commentators complain about?",
    "correct": "a line of cars all within one second, each canceling out the other's drs advantage",
    "distractors": [
      "a freight train carrying spare drs parts",
      "when drs fails for every car simultaneously",
      "cars drafting in qualifying"
    ],
    "fact": "in a drs train nobody can overtake because the car ahead also has drs from the car in front of them.",
    "category": "racecraft & feel",
    "tier": "both"
  },
  {
    "prompt": "what is 'sandbagging' in the context of f1 practice sessions?",
    "correct": "deliberately hiding true pace to mislead rivals",
    "distractors": [
      "running with extra weight for tyre testing",
      "a penalty for blocking in the pit lane",
      "using sandbags for ballast"
    ],
    "fact": "teams often sandbag in practice to avoid showing their real performance until qualifying or the race.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "what famously happens to the championship leader's car number board?",
    "correct": "it gets a number 1 option for the next season",
    "distractors": [
      "it turns gold",
      "it glows on the halo",
      "nothing special"
    ],
    "fact": "the reigning world champion can choose to race with number 1 instead of their permanent number — verstappen has taken it, hamilton never did.",
    "category": "teams & culture",
    "tier": "both"
  },
  {
    "prompt": "what is a safety car restart often called by fans?",
    "correct": "a rolling restart",
    "distractors": [
      "a standing start",
      "a red flag restart",
      "a formation restart"
    ],
    "fact": "after a safety car period, the leader controls the restart pace and the field goes green at racing speed — no standing start.",
    "category": "race weekend",
    "tier": "both"
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
    "tier": "both"
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
    "tier": "both"
  },
  {
    "prompt": "why do teams put tyre blankets on the wheels before a pit stop?",
    "correct": "to keep the tyres at optimal temperature",
    "distractors": [
      "to hide the tyre compound from rivals",
      "to protect them from debris",
      "to prevent sun damage to the rubber"
    ],
    "fact": "heated tyre blankets keep rubber at around 70-80°c so drivers have immediate grip when they rejoin the track.",
    "category": "strategy & tyres",
    "tier": "both"
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
    "tier": "both"
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
    "tier": "both"
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
    "tier": "both"
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
