export type Question = {
  prompt: string;
  options: string[];
  answer: number;
  fact: string;
  event: string;
};

const questionBank: Question[] = [
  {
    "prompt": "what does drs stand for in formula 1?",
    "options": [
      "drag reduction system",
      "driver response strategy",
      "downforce recovery setup",
      "dynamic racing sequence"
    ],
    "answer": 0,
    "fact": "drs opens a flap in the rear wing to reduce drag and boost straight-line speed.",
    "event": "lap briefing"
  },
  {
    "prompt": "what color flag signals immediate race stoppage?",
    "options": [
      "yellow",
      "blue",
      "red",
      "black"
    ],
    "answer": 2,
    "fact": "a red flag stops the session and sends everyone back to pit lane.",
    "event": "track control"
  },
  {
    "prompt": "what does the chequered flag mean?",
    "options": [
      "safety car deployed",
      "session suspended",
      "race finished",
      "mandatory pit stop"
    ],
    "answer": 2,
    "fact": "the chequered flag marks the end of the race session.",
    "event": "final lap"
  },
  {
    "prompt": "in qualifying, who starts p1 on race day?",
    "options": [
      "fastest q3 driver",
      "last year champion",
      "fastest pit crew",
      "sprint winner"
    ],
    "answer": 0,
    "fact": "pole position goes to the fastest driver in q3.",
    "event": "grid battle"
  },
  {
    "prompt": "what does parc ferme limit after qualifying?",
    "options": [
      "radio messages",
      "major car setup changes",
      "pit stop practice",
      "tyre blankets"
    ],
    "answer": 1,
    "fact": "parc ferme rules lock most setup changes between qualifying and race start.",
    "event": "regulation check"
  },
  {
    "prompt": "what is the main purpose of the safety car?",
    "options": [
      "increase race speed",
      "neutralize race pace for safety",
      "start rain procedures",
      "award half points"
    ],
    "answer": 1,
    "fact": "the safety car slows and bunches the field so marshals can work safely.",
    "event": "track control"
  },
  {
    "prompt": "under a virtual safety car, what must drivers do?",
    "options": [
      "pit immediately",
      "follow a reduced delta pace",
      "switch to wet tyres",
      "line up on the grid"
    ],
    "answer": 1,
    "fact": "under vsc, drivers follow a minimum delta time instead of racing flat out.",
    "event": "track control"
  },
  {
    "prompt": "what does a blue flag usually indicate?",
    "options": [
      "rain expected",
      "faster car is lapping you",
      "session suspended",
      "pit lane closed"
    ],
    "answer": 1,
    "fact": "blue flags warn a slower car that a faster one is approaching to lap.",
    "event": "flag signal"
  },
  {
    "prompt": "what does a black flag mean?",
    "options": [
      "race canceled",
      "car is disqualified and must return",
      "safety car ending",
      "driver wins pole"
    ],
    "answer": 1,
    "fact": "a black flag means disqualification from the session.",
    "event": "flag signal"
  },
  {
    "prompt": "what does a yellow flag mean for drivers?",
    "options": [
      "full speed racing",
      "danger ahead, no overtaking",
      "mandatory pit stop",
      "race finished"
    ],
    "answer": 1,
    "fact": "yellow flag means caution and no overtaking in that zone.",
    "event": "flag signal"
  },
  {
    "prompt": "which tyre is designed for damp conditions without standing water?",
    "options": [
      "soft",
      "intermediate",
      "full wet",
      "hard"
    ],
    "answer": 1,
    "fact": "intermediates are made for a damp track and light spray conditions.",
    "event": "tyre strategy"
  },
  {
    "prompt": "which tyre is designed for heavy rain and standing water?",
    "options": [
      "hard",
      "intermediate",
      "full wet",
      "medium"
    ],
    "answer": 2,
    "fact": "full wet tyres clear much more water than intermediates.",
    "event": "tyre strategy"
  },
  {
    "prompt": "what is a chicane?",
    "options": [
      "a long straight",
      "a quick left-right or right-left sequence",
      "a pit lane tool",
      "a wet tyre type"
    ],
    "answer": 1,
    "fact": "a chicane is a rapid change of direction added to slow cars down.",
    "event": "track layout"
  },
  {
    "prompt": "what is slipstreaming in f1?",
    "options": [
      "driving through pit lane",
      "using reduced drag behind another car",
      "locking brakes into a corner",
      "saving fuel under safety car"
    ],
    "answer": 1,
    "fact": "a car behind can gain speed by sitting in lower-pressure air.",
    "event": "overtake setup"
  },
  {
    "prompt": "what is a delta time under safety procedures?",
    "options": [
      "pit stop target",
      "minimum reference pace drivers must respect",
      "gap to championship leader",
      "time of day for sunset"
    ],
    "answer": 1,
    "fact": "the delta is a target lap pace used to keep speeds controlled.",
    "event": "track control"
  },
  {
    "prompt": "what is an out lap?",
    "options": [
      "lap returning to pits",
      "lap leaving pits to start a run",
      "final race lap",
      "lap under red flag"
    ],
    "answer": 1,
    "fact": "an out lap starts when a car exits the pit lane before a timed push lap.",
    "event": "qualifying run"
  },
  {
    "prompt": "what is an in lap?",
    "options": [
      "lap before lights out",
      "lap returning to the pit lane",
      "lap under drs",
      "formation lap"
    ],
    "answer": 1,
    "fact": "an in lap is the lap where the driver comes back to pits.",
    "event": "qualifying run"
  },
  {
    "prompt": "what does downforce mainly help with?",
    "options": [
      "top speed on straights",
      "cornering grip",
      "radio quality",
      "fuel flow"
    ],
    "answer": 1,
    "fact": "more downforce improves corner speed but usually increases drag.",
    "event": "car setup"
  },
  {
    "prompt": "when is drs typically enabled in a race?",
    "options": [
      "anytime in sector 1",
      "when a driver is within one second at detection",
      "only on the final lap",
      "only in wet races"
    ],
    "answer": 1,
    "fact": "drs is usually available if the chasing car is within one second at the detection point.",
    "event": "overtake setup"
  },
  {
    "prompt": "roughly how long is a full grand prix race distance (except monaco)?",
    "options": [
      "about 150 km",
      "about 220 km",
      "about 305 km",
      "about 500 km"
    ],
    "answer": 2,
    "fact": "f1 races are set to about 305 km, with monaco as the classic exception.",
    "event": "race format"
  },
  {
    "prompt": "which race is the classic exception to the ~305 km distance rule?",
    "options": [
      "monaco grand prix",
      "british grand prix",
      "italian grand prix",
      "japanese grand prix"
    ],
    "answer": 0,
    "fact": "monaco is run at a shorter total distance than most f1 races.",
    "event": "race format"
  },
  {
    "prompt": "which company supplies f1 tyres in the current era?",
    "options": [
      "bridgestone",
      "michelin",
      "pirelli",
      "goodyear"
    ],
    "answer": 2,
    "fact": "pirelli is the current official tyre supplier in formula 1.",
    "event": "paddock tech"
  },
  {
    "prompt": "which era began in 2014 in formula 1?",
    "options": [
      "v10 return era",
      "turbo-hybrid power unit era",
      "ground effect ban era",
      "manual gearbox era"
    ],
    "answer": 1,
    "fact": "2014 introduced the current turbo-hybrid power unit regulations.",
    "event": "regulation era"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2002?",
    "options": [
      "michael schumacher",
      "lewis hamilton",
      "nico rosberg",
      "fernando alonso"
    ],
    "answer": 0,
    "fact": "michael schumacher won the drivers' title in 2002.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2004?",
    "options": [
      "michael schumacher",
      "sebastian vettel",
      "fernando alonso",
      "lewis hamilton"
    ],
    "answer": 0,
    "fact": "michael schumacher won the drivers' title in 2004.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2005?",
    "options": [
      "fernando alonso",
      "nico rosberg",
      "kimi raikkonen",
      "jenson button"
    ],
    "answer": 0,
    "fact": "fernando alonso won the drivers' title in 2005.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2006?",
    "options": [
      "fernando alonso",
      "max verstappen",
      "lewis hamilton",
      "sebastian vettel"
    ],
    "answer": 0,
    "fact": "fernando alonso won the drivers' title in 2006.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2007?",
    "options": [
      "kimi raikkonen",
      "michael schumacher",
      "jenson button",
      "nico rosberg"
    ],
    "answer": 0,
    "fact": "kimi raikkonen won the drivers' title in 2007.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2008?",
    "options": [
      "lewis hamilton",
      "fernando alonso",
      "sebastian vettel",
      "max verstappen"
    ],
    "answer": 0,
    "fact": "lewis hamilton won the drivers' title in 2008.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2009?",
    "options": [
      "jenson button",
      "kimi raikkonen",
      "nico rosberg",
      "michael schumacher"
    ],
    "answer": 0,
    "fact": "jenson button won the drivers' title in 2009.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2010?",
    "options": [
      "sebastian vettel",
      "lewis hamilton",
      "max verstappen",
      "fernando alonso"
    ],
    "answer": 0,
    "fact": "sebastian vettel won the drivers' title in 2010.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2011?",
    "options": [
      "sebastian vettel",
      "jenson button",
      "michael schumacher",
      "kimi raikkonen"
    ],
    "answer": 0,
    "fact": "sebastian vettel won the drivers' title in 2011.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2014?",
    "options": [
      "lewis hamilton",
      "michael schumacher",
      "jenson button",
      "nico rosberg"
    ],
    "answer": 0,
    "fact": "lewis hamilton won the drivers' title in 2014.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2015?",
    "options": [
      "lewis hamilton",
      "fernando alonso",
      "sebastian vettel",
      "max verstappen"
    ],
    "answer": 0,
    "fact": "lewis hamilton won the drivers' title in 2015.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2016?",
    "options": [
      "nico rosberg",
      "kimi raikkonen",
      "sebastian vettel",
      "michael schumacher"
    ],
    "answer": 0,
    "fact": "nico rosberg won the drivers' title in 2016.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2022?",
    "options": [
      "max verstappen",
      "fernando alonso",
      "jenson button",
      "nico rosberg"
    ],
    "answer": 0,
    "fact": "max verstappen won the drivers' title in 2022.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2024?",
    "options": [
      "max verstappen",
      "lewis hamilton",
      "nico rosberg",
      "fernando alonso"
    ],
    "answer": 0,
    "fact": "max verstappen won the drivers' title in 2024.",
    "event": "title fight"
  },
  {
    "prompt": "which country hosts the monza grand prix circuit?",
    "options": [
      "italy",
      "belgium",
      "united arab emirates",
      "saudi arabia"
    ],
    "answer": 0,
    "fact": "monza is located in italy.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the spa-francorchamps grand prix circuit?",
    "options": [
      "belgium",
      "united kingdom",
      "united states",
      "bahrain"
    ],
    "answer": 0,
    "fact": "spa-francorchamps is located in belgium.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the suzuka grand prix circuit?",
    "options": [
      "japan",
      "brazil",
      "saudi arabia",
      "spain"
    ],
    "answer": 0,
    "fact": "suzuka is located in japan.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the interlagos grand prix circuit?",
    "options": [
      "brazil",
      "united arab emirates",
      "bahrain",
      "monaco"
    ],
    "answer": 0,
    "fact": "interlagos is located in brazil.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the yas marina grand prix circuit?",
    "options": [
      "united arab emirates",
      "united states",
      "canada",
      "netherlands"
    ],
    "answer": 0,
    "fact": "yas marina is located in united arab emirates.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the albert park grand prix circuit?",
    "options": [
      "australia",
      "saudi arabia",
      "monaco",
      "austria"
    ],
    "answer": 0,
    "fact": "albert park is located in australia.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the circuit gilles villeneuve grand prix circuit?",
    "options": [
      "canada",
      "spain",
      "austria",
      "mexico"
    ],
    "answer": 0,
    "fact": "circuit gilles villeneuve is located in canada.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the zandvoort grand prix circuit?",
    "options": [
      "netherlands",
      "hungary",
      "mexico",
      "germany"
    ],
    "answer": 0,
    "fact": "zandvoort is located in netherlands.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the red bull ring grand prix circuit?",
    "options": [
      "austria",
      "singapore",
      "china",
      "belgium"
    ],
    "answer": 0,
    "fact": "red bull ring is located in austria.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the marina bay grand prix circuit?",
    "options": [
      "singapore",
      "azerbaijan",
      "germany",
      "united kingdom"
    ],
    "answer": 0,
    "fact": "marina bay is located in singapore.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the imola grand prix circuit?",
    "options": [
      "italy",
      "mexico",
      "belgium",
      "brazil"
    ],
    "answer": 0,
    "fact": "imola is located in italy.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the baku city circuit grand prix circuit?",
    "options": [
      "azerbaijan",
      "qatar",
      "belgium",
      "brazil"
    ],
    "answer": 0,
    "fact": "baku city circuit is located in azerbaijan.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the autodromo hermanos rodriguez grand prix circuit?",
    "options": [
      "mexico",
      "china",
      "united kingdom",
      "united arab emirates"
    ],
    "answer": 0,
    "fact": "autodromo hermanos rodriguez is located in mexico.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the losail international circuit grand prix circuit?",
    "options": [
      "qatar",
      "germany",
      "japan",
      "united states"
    ],
    "answer": 0,
    "fact": "losail international circuit is located in qatar.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the nurburgring grand prix circuit?",
    "options": [
      "germany",
      "japan",
      "australia",
      "canada"
    ],
    "answer": 0,
    "fact": "nurburgring is located in germany.",
    "event": "track map"
  },
  {
    "prompt": "which f1 team is nicknamed the prancing horse?",
    "options": [
      "ferrari",
      "mclaren",
      "williams",
      "sauber"
    ],
    "answer": 0,
    "fact": "the prancing horse is ferrari's iconic symbol.",
    "event": "team identity"
  },
  {
    "prompt": "which team is often called the silver arrows in modern f1?",
    "options": [
      "red bull",
      "mercedes",
      "aston martin",
      "alpine"
    ],
    "answer": 1,
    "fact": "silver arrows is the classic nickname for mercedes motorsport.",
    "event": "team identity"
  },
  {
    "prompt": "which team is strongly associated with papaya orange?",
    "options": [
      "mclaren",
      "ferrari",
      "williams",
      "haas"
    ],
    "answer": 0,
    "fact": "papaya orange is mclaren's signature modern race color.",
    "event": "team identity"
  },
  {
    "prompt": "the tifosi are famously passionate fans of which team?",
    "options": [
      "ferrari",
      "mercedes",
      "red bull",
      "alpine"
    ],
    "answer": 0,
    "fact": "tifosi is the traditional name for ferrari's fan base.",
    "event": "fan zone"
  },
  {
    "prompt": "in 2021, what controversial event decided the championship on the final lap at abu dhabi?",
    "options": [
      "a red flag restart",
      "a late safety car restart",
      "a penalty for max verstappen",
      "a mechanical failure for hamilton"
    ],
    "answer": 1,
    "fact": "a controversial late safety car and restart allowed verstappen to overtake hamilton on the final lap to win the 2021 title.",
    "event": "iconic moment"
  },
  {
    "prompt": "what did lando norris famously lose in russia 2021 by staying out in worsening rain?",
    "options": [
      "his front wing",
      "his first f1 win",
      "a podium finish",
      "his grid penalty appeal"
    ],
    "answer": 1,
    "fact": "norris led the race but stayed out on slicks as rain intensified, dropping him down the order and handing the win to hamilton.",
    "event": "iconic moment"
  },
  {
    "prompt": "what did sebastian vettel do after winning the 2013 indian gp to celebrate his 4th title?",
    "options": [
      "sprinted to the crowd",
      "did donuts on the straight",
      "threw his steering wheel",
      "climbed a fence"
    ],
    "answer": 1,
    "fact": "vettel's iconic donuts on the main straight became one of f1's most memorable celebrations.",
    "event": "iconic moment"
  },
  {
    "prompt": "at canada 2019, which driver was given a controversial 5-second penalty while leading, costing them the win?",
    "options": [
      "vettel",
      "leclerc",
      "bottas",
      "ricciardo"
    ],
    "answer": 0,
    "fact": "vettel crossed the line first but a 5-second penalty for an unsafe rejoin gave hamilton the win, sparking huge controversy.",
    "event": "iconic moment"
  },
  {
    "prompt": "which team principal is famous for shouting 'no michael no no that is so not right' on team radio?",
    "options": [
      "toto wolff",
      "christian horner",
      "guenther steiner",
      "helmut marko"
    ],
    "answer": 0,
    "fact": "mercedes principal toto wolff's radio outburst to race director michael masi during abu dhabi 2021 became an iconic f1 meme.",
    "event": "iconic moment"
  },
  {
    "prompt": "which circuit is known as the 'temple of speed'?",
    "options": [
      "monza",
      "silverstone",
      "spa",
      "baku"
    ],
    "answer": 0,
    "fact": "monza's low-downforce, high-speed layout earned it the legendary nickname.",
    "event": "track lore"
  },
  {
    "prompt": "what is 'porpoising' that plagued teams in 2022?",
    "options": [
      "excessive tyre wear",
      "car bouncing violently at high speed",
      "engine overheating",
      "gearbox vibrations"
    ],
    "answer": 1,
    "fact": "the 2022 ground effect cars caused violent vertical oscillations on straights as downforce rapidly stalled and reattached.",
    "event": "tech drama"
  },
  {
    "prompt": "which driver famously said 'leave me alone, i know what i'm doing' during a race?",
    "options": [
      "kimi raikkonen",
      "fernando alonso",
      "lewis hamilton",
      "max verstappen"
    ],
    "answer": 0,
    "fact": "raikkonen's ice-cold radio message during abu dhabi 2012 became one of f1's most quoted lines.",
    "event": "iconic moment"
  },
  {
    "prompt": "what is a 'megapixel' in f1 slang?",
    "options": [
      "a really clean qualifying lap",
      "nothing — it's not real f1 slang",
      "a high-res onboard camera",
      "a sponsor deal worth millions"
    ],
    "answer": 1,
    "fact": "there's no such thing as a megapixel in f1 jargon — don't let fake terms trip you up.",
    "event": "bluff call"
  },
  {
    "prompt": "'multi 21, seb' was a famous team order controversy involving which team?",
    "options": [
      "red bull",
      "ferrari",
      "mercedes",
      "mclaren"
    ],
    "answer": 0,
    "fact": "vettel ignored the 'multi 21' team order and overtook webber to win the 2013 malaysian gp, causing a massive rift.",
    "event": "iconic moment"
  },
  {
    "prompt": "what is the 'halo' device on modern f1 cars designed to protect against?",
    "options": [
      "rain spray",
      "head impacts from debris",
      "engine fires",
      "tyre blowouts"
    ],
    "answer": 1,
    "fact": "the halo has been credited with saving multiple lives since its introduction in 2018, including romain grosjean's fiery 2020 crash.",
    "event": "safety tech"
  },
  {
    "prompt": "which driver survived a 137mph crash and fireball at bahrain 2020?",
    "options": [
      "romain grosjean",
      "pierre gasly",
      "lance stroll",
      "carlos sainz"
    ],
    "answer": 0,
    "fact": "grosjean's haas split the barrier and burst into flames, but the halo and his own escape saved his life.",
    "event": "iconic moment"
  },
  {
    "prompt": "if it starts raining mid-race, who makes the call to switch to wet tyres?",
    "options": [
      "the fia race director",
      "the driver and their team",
      "the safety car driver",
      "the tyre supplier pirelli"
    ],
    "answer": 1,
    "fact": "tyre strategy including weather calls is entirely the team's decision — getting the timing right can make or break a race.",
    "event": "strategy call"
  },
  {
    "prompt": "what does 'box box box' mean on f1 team radio?",
    "options": [
      "penalty incoming",
      "retire the car",
      "come into the pits this lap",
      "push for fastest lap"
    ],
    "answer": 2,
    "fact": "'box' comes from the german word for pit stop area and is repeated three times for clarity over radio.",
    "event": "radio call"
  },
  {
    "prompt": "which driver held the record for most race wins before hamilton broke it?",
    "options": [
      "michael schumacher",
      "ayrton senna",
      "alain prost",
      "sebastian vettel"
    ],
    "answer": 0,
    "fact": "schumacher's record of 91 wins stood for nearly 15 years before hamilton surpassed it in 2020.",
    "event": "record book"
  },
  {
    "prompt": "which corner at spa-francorchamps is one of the most famous in all of motorsport?",
    "options": [
      "eau rouge / raidillon",
      "la source",
      "bus stop chicane",
      "pouhon"
    ],
    "answer": 0,
    "fact": "the high-speed uphill left-right-left through eau rouge and raidillon is a legendary test of commitment.",
    "event": "track lore"
  },
  {
    "prompt": "which team did fernando alonso return to in 2021 after two years away from f1?",
    "options": [
      "alpine",
      "ferrari",
      "mclaren",
      "aston martin"
    ],
    "answer": 0,
    "fact": "alonso returned to the renamed alpine team (formerly renault) in 2021, continuing his remarkable f1 longevity.",
    "event": "driver move"
  },
  {
    "prompt": "what is 'the undercut' referring to when commentators say 'they've pulled off the undercut'?",
    "options": [
      "overtaking by pitting earlier and using fresh tyre pace",
      "diving up the inside at a chicane",
      "blocking a car on a straight",
      "running wide to gain an advantage"
    ],
    "answer": 0,
    "fact": "a successful undercut means your out-lap on fresh tyres was fast enough to jump ahead of someone who stayed out.",
    "event": "strategy call"
  },
  {
    "prompt": "which f1 track features a tunnel that drivers blast through at over 150mph?",
    "options": [
      "monaco",
      "singapore",
      "baku",
      "jeddah"
    ],
    "answer": 0,
    "fact": "the famous monaco tunnel creates a sudden light-to-dark-to-light transition at extreme speed, one of f1's most unique challenges.",
    "event": "track lore"
  },
  {
    "prompt": "what nickname did daniel ricciardo earn for his celebrations on the podium?",
    "options": [
      "the honey badger",
      "the shoey king",
      "the smiling assassin",
      "danny ric"
    ],
    "answer": 0,
    "fact": "ricciardo adopted the honey badger nickname early in his career, known for his fearless overtaking and trademark grin.",
    "event": "driver profile"
  },
  {
    "prompt": "what does ers stand for in a modern f1 power unit?",
    "options": [
      "energy recovery system",
      "electronic race stabilizer",
      "engine rev sync",
      "exhaust recirculation setup"
    ],
    "answer": 0,
    "fact": "ers harvests energy from braking and exhaust heat, providing a significant power boost to the hybrid power unit.",
    "event": "tech specs"
  },
  {
    "prompt": "which legendary commentator was known for the catchphrase 'and it's go go go!'?",
    "options": [
      "murray walker",
      "martin brundle",
      "david croft",
      "james hunt"
    ],
    "answer": 0,
    "fact": "murray walker's breathless, excitable commentary defined f1 broadcasting for decades.",
    "event": "f1 culture"
  },
  {
    "prompt": "what happened when mclaren's pit crew released the car with a wheel gun issue at bahrain 2021?",
    "options": [
      "nothing unusual",
      "the car was released with a loose wheel",
      "the mechanic was dragged along",
      "the pit stop took over 40 seconds"
    ],
    "answer": 1,
    "fact": "unsafe releases remain one of the most dangerous pit stop failures and carry heavy penalties.",
    "event": "pit drama"
  },
  {
    "prompt": "which driver is known for the radio message 'honestly, what are we doing here, racing or ping pong?'?",
    "options": [
      "fernando alonso",
      "sebastian vettel",
      "kimi raikkonen",
      "lewis hamilton"
    ],
    "answer": 0,
    "fact": "alonso's frustrated radios became legendary during his struggles at mclaren-honda.",
    "event": "radio call"
  },
  {
    "prompt": "what does a driver mean when they report 'understeer' to their engineer?",
    "options": [
      "the car turns more than expected",
      "the front doesn't turn enough into the corner",
      "the rear slides out",
      "the brakes are locking up"
    ],
    "answer": 1,
    "fact": "understeer means the car pushes wide — the front tyres lose grip before the rears.",
    "event": "driving feel"
  },
  {
    "prompt": "what is 'dirty air' and why do drivers hate following closely in it?",
    "options": [
      "exhaust fumes that smell bad",
      "turbulence that reduces the following car's downforce",
      "oil spray from the car ahead",
      "brake dust clouding visibility"
    ],
    "answer": 1,
    "fact": "dirty air causes the following car to lose grip in corners, which is why the 2022 rules aimed to reduce this effect.",
    "event": "aero battle"
  },
  {
    "prompt": "what is a 'shoey' that ricciardo made famous on f1 podiums?",
    "options": [
      "drinking champagne from a racing boot",
      "a victory dance",
      "throwing shoes into the crowd",
      "signing a shoe for a fan"
    ],
    "answer": 0,
    "fact": "ricciardo's shoey became one of the most iconic podium traditions, with even other drivers and celebrities joining in.",
    "event": "f1 culture"
  },
  {
    "prompt": "what does 'graining' look like on an f1 tyre?",
    "options": [
      "small rubber pellets rolling across the surface",
      "visible cracks in the sidewall",
      "the tyre turning white",
      "smoke pouring from the contact patch"
    ],
    "answer": 0,
    "fact": "graining occurs when the tyre surface tears into tiny rolls of rubber, usually when the tyre is too cold or sliding too much.",
    "event": "tyre management"
  },
  {
    "prompt": "what is the 'parc ferme' period in an f1 weekend?",
    "options": [
      "the cooldown window after the race ends",
      "a lockdown on car changes between qualifying and race",
      "the mandatory rest period for drivers overnight",
      "the pre-race media obligations window"
    ],
    "answer": 1,
    "fact": "parc ferme prevents teams from making major setup changes once qualifying ends, ensuring the car you qualified is the car you race.",
    "event": "regulation check"
  },
  {
    "prompt": "what happens if a driver exceeds track limits three times during a race?",
    "options": [
      "nothing until a fourth offense",
      "they receive a black and white flag warning",
      "immediate 5-second penalty",
      "they must give back any positions gained"
    ],
    "answer": 1,
    "fact": "the black and white flag serves as an official warning — further violations lead to time penalties.",
    "event": "regulation check"
  },
  {
    "prompt": "which driver was nicknamed 'the iceman'?",
    "options": [
      "kimi raikkonen",
      "mika hakkinen",
      "nico rosberg",
      "valtteri bottas"
    ],
    "answer": 0,
    "fact": "raikkonen earned the nickname for his famously emotionless demeanor and ice-cold composure under pressure.",
    "event": "driver profile"
  },
  {
    "prompt": "what was special about the 2021 spa-francorchamps grand prix?",
    "options": [
      "it was the longest race in f1 history",
      "it lasted only a few laps behind the safety car due to rain",
      "three drivers were disqualified",
      "it was canceled entirely"
    ],
    "answer": 1,
    "fact": "the 2021 belgian gp was widely criticized as a farce — half points were awarded for what was essentially no racing.",
    "event": "race drama"
  },
  {
    "prompt": "what does 'oversteer' feel like to a driver?",
    "options": [
      "the front washes wide",
      "the rear steps out and the car wants to spin",
      "the brakes lock under pressure",
      "the steering goes heavy"
    ],
    "answer": 1,
    "fact": "oversteer happens when the rear tyres lose grip before the fronts, rotating the car more than the driver intended.",
    "event": "driving feel"
  },
  {
    "prompt": "which team has won the most constructors' championships in f1 history?",
    "options": [
      "ferrari",
      "mclaren",
      "mercedes",
      "red bull"
    ],
    "answer": 0,
    "fact": "ferrari holds the record for the most constructors' titles, cementing their status as f1's most storied team.",
    "event": "record book"
  },
  {
    "prompt": "who is the youngest ever f1 race winner?",
    "options": [
      "max verstappen",
      "sebastian vettel",
      "charles leclerc",
      "lando norris"
    ],
    "answer": 0,
    "fact": "verstappen won the 2016 spanish gp aged 18 years and 228 days on his debut race for red bull.",
    "event": "record book"
  },
  {
    "prompt": "what does a driver mean when they say the car feels 'on rails'?",
    "options": [
      "it's stuck behind the safety car",
      "it has perfect grip and balance",
      "the steering is locked",
      "it's running out of fuel"
    ],
    "answer": 1,
    "fact": "when a car feels 'on rails', the driver has total confidence in the grip level through every corner.",
    "event": "driving feel"
  },
  {
    "prompt": "why do f1 drivers weave side to side on the formation lap?",
    "options": [
      "to warm up their tyres",
      "to test their steering",
      "to wave to fans",
      "to check mirrors"
    ],
    "answer": 0,
    "fact": "weaving generates lateral friction that heats the tyre surface, crucial for grip at the standing start.",
    "event": "race craft"
  },
  {
    "prompt": "what is a 'power unit' in modern f1?",
    "options": [
      "just the engine",
      "the complete hybrid system including engine, turbo, and electrical motors",
      "the gearbox assembly",
      "the battery pack only"
    ],
    "answer": 1,
    "fact": "a modern f1 power unit combines a v6 turbo engine with mgu-k and mgu-h energy recovery systems producing over 1000hp.",
    "event": "tech specs"
  },
  {
    "prompt": "what did lewis hamilton do immediately after crossing the line to win his 7th title in turkey 2020?",
    "options": [
      "screamed on the radio and cried in the car",
      "did donuts",
      "jumped out of the car",
      "sprayed his team with champagne"
    ],
    "answer": 0,
    "fact": "hamilton broke down in tears on the radio after equalling schumacher's record of 7 world titles in a dominant wet-weather drive.",
    "event": "iconic moment"
  },
  {
    "prompt": "what is the 'drs train' that commentators complain about?",
    "options": [
      "a line of cars all within one second, each canceling out the other's drs advantage",
      "a freight train carrying spare drs parts",
      "when drs fails for every car simultaneously",
      "cars drafting in qualifying"
    ],
    "answer": 0,
    "fact": "in a drs train nobody can overtake because the car ahead also has drs from the car in front of them.",
    "event": "race craft"
  },
  {
    "prompt": "what is 'sandbagging' in the context of f1 practice sessions?",
    "options": [
      "deliberately hiding true pace to mislead rivals",
      "running with extra weight for tyre testing",
      "a penalty for blocking in the pit lane",
      "using sandbags for ballast"
    ],
    "answer": 0,
    "fact": "teams often sandbag in practice to avoid showing their real performance until qualifying or the race.",
    "event": "paddock mind games"
  },
  {
    "prompt": "what famously happens to the championship leader's car number board?",
    "options": [
      "it turns gold",
      "it gets a number 1 option for the next season",
      "it glows on the halo",
      "nothing special"
    ],
    "answer": 1,
    "fact": "the reigning world champion can choose to race with number 1 instead of their permanent number — verstappen has taken it, hamilton never did.",
    "event": "f1 culture"
  },
  {
    "prompt": "what is a safety car restart often called by fans?",
    "options": [
      "a standing start",
      "a rolling restart",
      "a red flag restart",
      "a formation restart"
    ],
    "answer": 1,
    "fact": "after a safety car period, the leader controls the restart pace and the field goes green at racing speed — no standing start.",
    "event": "race format"
  },
  {
    "prompt": "what does 'flat out' mean in f1 driver language?",
    "options": [
      "the tyres are completely worn",
      "driving at maximum speed without lifting",
      "the car is bottoming out on the track",
      "running on fumes"
    ],
    "answer": 1,
    "fact": "taking a corner 'flat out' means the driver keeps full throttle through it — a sign of extreme downforce and bravery.",
    "event": "driving feel"
  },
  {
    "prompt": "what does it mean when a driver is told 'you are on the delta' by their engineer?",
    "options": [
      "they're matching the required target lap time",
      "they need to speed up immediately",
      "they've been given a penalty",
      "they're running low on fuel"
    ],
    "answer": 0,
    "fact": "the delta is a reference pace — staying 'on the delta' means the driver is hitting their time targets, crucial under safety car or vsc.",
    "event": "radio call"
  },
  {
    "prompt": "why do teams put tyre blankets on the wheels before a pit stop?",
    "options": [
      "to keep the tyres at optimal temperature",
      "to hide the tyre compound from rivals",
      "to protect them from debris",
      "to prevent sun damage to the rubber"
    ],
    "answer": 0,
    "fact": "heated tyre blankets keep rubber at around 70-80°c so drivers have immediate grip when they rejoin the track.",
    "event": "pit strategy"
  },
  {
    "prompt": "what are the 'marbles' that drivers try to avoid on track?",
    "options": [
      "small balls of rubber shed from tyres that litter the track surface",
      "loose gravel from the run-off",
      "rain droplets on the racing line",
      "debris from broken front wings"
    ],
    "answer": 0,
    "fact": "marbles collect off the racing line and are extremely slippery — running over them can cause a car to snap sideways.",
    "event": "tyre management"
  },
  {
    "prompt": "what does 'lights out and away we go' signal?",
    "options": [
      "the race start",
      "the end of a safety car period",
      "qualifying has begun",
      "pit lane is open"
    ],
    "answer": 0,
    "fact": "five red lights illuminate one by one, then all go out simultaneously — that's the signal to race.",
    "event": "race format"
  },
  {
    "prompt": "why is overtaking considered nearly impossible at monaco?",
    "options": [
      "the street circuit is too narrow for side-by-side racing",
      "drs is banned there",
      "the cars run too much downforce",
      "there's no straight long enough"
    ],
    "answer": 0,
    "fact": "monaco's tight barriers and narrow streets mean qualifying position is often more important than race pace.",
    "event": "track lore"
  },
  {
    "prompt": "what is the 'racing line' and why do drivers follow it?",
    "options": [
      "the fastest path through a corner, using the full width of the track",
      "the white line marking the edge of the track",
      "the pit lane entry line",
      "a painted guide on the asphalt"
    ],
    "answer": 0,
    "fact": "the racing line maximizes corner speed by taking the widest arc possible, which is why the track surface is most rubbered-in on that line.",
    "event": "driving feel"
  }
];

export const LAPS_PER_WEEKEND = 6;

const getRandomIndex = (max: number) => Math.floor(Math.random() * max);

export const getRandomWeekendQuestions = (): Question[] => {
  const pool = [...questionBank];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomIndex(index + 1);
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, LAPS_PER_WEEKEND);
};

export const initialWeekendQuestions = getRandomWeekendQuestions();
