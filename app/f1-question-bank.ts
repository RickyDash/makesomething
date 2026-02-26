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
    "prompt": "what is an undercut in race strategy?",
    "options": [
      "staying out on old tires",
      "pitting earlier for tire advantage",
      "overtaking outside track limits",
      "switching to wet tires mid-lap"
    ],
    "answer": 1,
    "fact": "an undercut means pitting earlier to gain time on fresher tires.",
    "event": "strategy call"
  },
  {
    "prompt": "what is an overcut in race strategy?",
    "options": [
      "pitting early to pass rivals",
      "staying out longer before pitting",
      "serving a stop-go penalty",
      "using only hard tires"
    ],
    "answer": 1,
    "fact": "an overcut works by staying out longer and using clean air before your stop.",
    "event": "strategy call"
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
      "tire blankets"
    ],
    "answer": 1,
    "fact": "parc ferme rules lock most setup changes between qualifying and race start.",
    "event": "regulation check"
  },
  {
    "prompt": "why do drivers complete a formation lap before the start?",
    "options": [
      "to score bonus points",
      "to warm tires and brakes",
      "to test drs",
      "to set fastest lap"
    ],
    "answer": 1,
    "fact": "the formation lap builds temperature in tires and brakes before the standing start.",
    "event": "formation lap"
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
      "switch to wet tires",
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
    "prompt": "what does a green flag indicate after an incident zone?",
    "options": [
      "safety car deployed",
      "track clear, normal racing resumes",
      "pit lane closed",
      "session finished"
    ],
    "answer": 1,
    "fact": "green flag signals the end of caution conditions.",
    "event": "flag signal"
  },
  {
    "prompt": "which tire is designed for damp conditions without standing water?",
    "options": [
      "soft",
      "intermediate",
      "full wet",
      "hard"
    ],
    "answer": 1,
    "fact": "intermediates are made for a damp track and light spray conditions.",
    "event": "tire strategy"
  },
  {
    "prompt": "which tire is designed for heavy rain and standing water?",
    "options": [
      "hard",
      "intermediate",
      "full wet",
      "medium"
    ],
    "answer": 2,
    "fact": "full wet tires clear much more water than intermediates.",
    "event": "tire strategy"
  },
  {
    "prompt": "what does the pit lane speed limiter control?",
    "options": [
      "engine mapping",
      "maximum speed in pit lane",
      "drs availability",
      "fuel mixture"
    ],
    "answer": 1,
    "fact": "the limiter helps drivers stay under the pit lane speed limit.",
    "event": "pit lane"
  },
  {
    "prompt": "what is the apex of a corner?",
    "options": [
      "the braking marker",
      "the inside clipping point",
      "the track exit curb",
      "the run-off area"
    ],
    "answer": 1,
    "fact": "the apex is the point where the car is closest to the inside of the corner.",
    "event": "driving line"
  },
  {
    "prompt": "what is a chicane?",
    "options": [
      "a long straight",
      "a quick left-right or right-left sequence",
      "a pit lane tool",
      "a wet tire type"
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
    "prompt": "what is dirty air?",
    "options": [
      "dust from the gravel trap",
      "turbulent air that reduces downforce for the following car",
      "engine smoke",
      "hot air from brakes"
    ],
    "answer": 1,
    "fact": "dirty air makes it harder for a following car to stay close in corners.",
    "event": "aero battle"
  },
  {
    "prompt": "what is tire graining?",
    "options": [
      "rubber tearing into small rolls",
      "tire sidewall puncture",
      "brake overheating",
      "fuel evaporation"
    ],
    "answer": 0,
    "fact": "graining happens when the tire surface slides and forms small rubber marbles.",
    "event": "tire management"
  },
  {
    "prompt": "what is tire blistering?",
    "options": [
      "cold tire cracking",
      "overheated tire surface bubbling",
      "wet tire chunking",
      "rim damage"
    ],
    "answer": 1,
    "fact": "blistering is caused by overheating that creates bubbles in the rubber.",
    "event": "tire management"
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
    "prompt": "how many points does the race winner score in modern f1 points format?",
    "options": [
      "20",
      "25",
      "30",
      "18"
    ],
    "answer": 1,
    "fact": "a race win is worth 25 points in the standard points system.",
    "event": "points table"
  },
  {
    "prompt": "which finishing positions score points in a standard f1 grand prix?",
    "options": [
      "top 6",
      "top 8",
      "top 10",
      "top 12"
    ],
    "answer": 2,
    "fact": "points are awarded from p1 through p10 in a standard grand prix.",
    "event": "points table"
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
    "prompt": "which company supplies f1 tires in the current era?",
    "options": [
      "bridgestone",
      "michelin",
      "pirelli",
      "goodyear"
    ],
    "answer": 2,
    "fact": "pirelli is the current official tire supplier in formula 1.",
    "event": "paddock tech"
  },
  {
    "prompt": "in modern f1, each driver races with which permanent number?",
    "options": [
      "new number every season",
      "one chosen career number",
      "constructor-assigned code",
      "sprint-based number"
    ],
    "answer": 1,
    "fact": "drivers select a permanent number they carry through their f1 career.",
    "event": "driver profile"
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
    "prompt": "who won the f1 drivers' championship in 2000?",
    "options": [
      "michael schumacher",
      "fernando alonso",
      "jenson button",
      "nico rosberg"
    ],
    "answer": 0,
    "fact": "michael schumacher won the drivers' title in 2000.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2001?",
    "options": [
      "michael schumacher",
      "kimi raikkonen",
      "sebastian vettel",
      "max verstappen"
    ],
    "answer": 0,
    "fact": "michael schumacher won the drivers' title in 2001.",
    "event": "title fight"
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
    "prompt": "who won the f1 drivers' championship in 2003?",
    "options": [
      "michael schumacher",
      "jenson button",
      "max verstappen",
      "kimi raikkonen"
    ],
    "answer": 0,
    "fact": "michael schumacher won the drivers' title in 2003.",
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
    "prompt": "who won the f1 drivers' championship in 2012?",
    "options": [
      "sebastian vettel",
      "nico rosberg",
      "fernando alonso",
      "lewis hamilton"
    ],
    "answer": 0,
    "fact": "sebastian vettel won the drivers' title in 2012.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2013?",
    "options": [
      "sebastian vettel",
      "max verstappen",
      "kimi raikkonen",
      "jenson button"
    ],
    "answer": 0,
    "fact": "sebastian vettel won the drivers' title in 2013.",
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
    "prompt": "who won the f1 drivers' championship in 2017?",
    "options": [
      "lewis hamilton",
      "jenson button",
      "max verstappen",
      "fernando alonso"
    ],
    "answer": 0,
    "fact": "lewis hamilton won the drivers' title in 2017.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2018?",
    "options": [
      "lewis hamilton",
      "sebastian vettel",
      "michael schumacher",
      "kimi raikkonen"
    ],
    "answer": 0,
    "fact": "lewis hamilton won the drivers' title in 2018.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2019?",
    "options": [
      "lewis hamilton",
      "nico rosberg",
      "fernando alonso",
      "jenson button"
    ],
    "answer": 0,
    "fact": "lewis hamilton won the drivers' title in 2019.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2020?",
    "options": [
      "lewis hamilton",
      "max verstappen",
      "kimi raikkonen",
      "sebastian vettel"
    ],
    "answer": 0,
    "fact": "lewis hamilton won the drivers' title in 2020.",
    "event": "title fight"
  },
  {
    "prompt": "who won the f1 drivers' championship in 2021?",
    "options": [
      "max verstappen",
      "michael schumacher",
      "lewis hamilton",
      "sebastian vettel"
    ],
    "answer": 0,
    "fact": "max verstappen won the drivers' title in 2021.",
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
    "prompt": "who won the f1 drivers' championship in 2023?",
    "options": [
      "max verstappen",
      "kimi raikkonen",
      "sebastian vettel",
      "michael schumacher"
    ],
    "answer": 0,
    "fact": "max verstappen won the drivers' title in 2023.",
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
    "prompt": "which country hosts the silverstone grand prix circuit?",
    "options": [
      "united kingdom",
      "japan",
      "australia",
      "canada"
    ],
    "answer": 0,
    "fact": "silverstone is located in united kingdom.",
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
    "prompt": "which country hosts the circuit of the americas grand prix circuit?",
    "options": [
      "united states",
      "australia",
      "spain",
      "hungary"
    ],
    "answer": 0,
    "fact": "circuit of the americas is located in united states.",
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
    "prompt": "which country hosts the jeddah corniche circuit grand prix circuit?",
    "options": [
      "saudi arabia",
      "bahrain",
      "netherlands",
      "singapore"
    ],
    "answer": 0,
    "fact": "jeddah corniche circuit is located in saudi arabia.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the bahrain international circuit grand prix circuit?",
    "options": [
      "bahrain",
      "canada",
      "hungary",
      "azerbaijan"
    ],
    "answer": 0,
    "fact": "bahrain international circuit is located in bahrain.",
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
    "prompt": "which country hosts the circuit de barcelona-catalunya grand prix circuit?",
    "options": [
      "spain",
      "monaco",
      "singapore",
      "qatar"
    ],
    "answer": 0,
    "fact": "circuit de barcelona-catalunya is located in spain.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the circuit de monaco grand prix circuit?",
    "options": [
      "monaco",
      "netherlands",
      "azerbaijan",
      "china"
    ],
    "answer": 0,
    "fact": "circuit de monaco is located in monaco.",
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
    "prompt": "which country hosts the hungaroring grand prix circuit?",
    "options": [
      "hungary",
      "austria",
      "qatar",
      "italy"
    ],
    "answer": 0,
    "fact": "hungaroring is located in hungary.",
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
    "prompt": "which country hosts the las vegas street circuit grand prix circuit?",
    "options": [
      "united states",
      "italy",
      "brazil",
      "saudi arabia"
    ],
    "answer": 0,
    "fact": "las vegas street circuit is located in united states.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the miami international autodrome grand prix circuit?",
    "options": [
      "united states",
      "belgium",
      "united arab emirates",
      "bahrain"
    ],
    "answer": 0,
    "fact": "miami international autodrome is located in united states.",
    "event": "track map"
  },
  {
    "prompt": "which country hosts the shanghai international circuit grand prix circuit?",
    "options": [
      "china",
      "united kingdom",
      "united states",
      "bahrain"
    ],
    "answer": 0,
    "fact": "shanghai international circuit is located in china.",
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
    "prompt": "which town is most closely associated with ferrari's f1 base?",
    "options": [
      "maranello",
      "brackley",
      "woking",
      "grove"
    ],
    "answer": 0,
    "fact": "ferrari is commonly associated with maranello in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with mercedes's f1 base?",
    "options": [
      "brackley",
      "milton keynes",
      "grove",
      "enstone"
    ],
    "answer": 0,
    "fact": "mercedes is commonly associated with brackley in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with red bull racing's f1 base?",
    "options": [
      "milton keynes",
      "woking",
      "enstone",
      "silverstone"
    ],
    "answer": 0,
    "fact": "red bull racing is commonly associated with milton keynes in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with mclaren's f1 base?",
    "options": [
      "woking",
      "grove",
      "silverstone",
      "hinwil"
    ],
    "answer": 0,
    "fact": "mclaren is commonly associated with woking in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with williams's f1 base?",
    "options": [
      "grove",
      "enstone",
      "hinwil",
      "faenza"
    ],
    "answer": 0,
    "fact": "williams is commonly associated with grove in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with alpine's f1 base?",
    "options": [
      "enstone",
      "silverstone",
      "faenza",
      "maranello"
    ],
    "answer": 0,
    "fact": "alpine is commonly associated with enstone in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with aston martin's f1 base?",
    "options": [
      "silverstone",
      "hinwil",
      "maranello",
      "brackley"
    ],
    "answer": 0,
    "fact": "aston martin is commonly associated with silverstone in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with sauber's f1 base?",
    "options": [
      "hinwil",
      "faenza",
      "brackley",
      "milton keynes"
    ],
    "answer": 0,
    "fact": "sauber is commonly associated with hinwil in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with racing bulls's f1 base?",
    "options": [
      "faenza",
      "maranello",
      "milton keynes",
      "woking"
    ],
    "answer": 0,
    "fact": "racing bulls is commonly associated with faenza in f1 operations.",
    "event": "team paddock"
  },
  {
    "prompt": "which town is most closely associated with alphatauri (former name)'s f1 base?",
    "options": [
      "faenza",
      "brackley",
      "woking",
      "grove"
    ],
    "answer": 0,
    "fact": "alphatauri (former name) is commonly associated with faenza in f1 operations.",
    "event": "team paddock"
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
    "prompt": "which championship is awarded to teams rather than individual drivers?",
    "options": [
      "drivers' championship",
      "constructors' championship",
      "sprint cup",
      "pole trophy"
    ],
    "answer": 1,
    "fact": "the constructors' championship totals points by team.",
    "event": "points table"
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
