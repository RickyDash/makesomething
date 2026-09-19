export type Question = {
  prompt: string;
  options: string[];
  answer: number;
  fact: string;
  event: string;
};

const questionBank: Question[] = [
  {
    "prompt": "What does DRS stand for in Formula 1?",
    "options": [
      "Drag reduction system",
      "Driver response strategy",
      "Downforce recovery setup",
      "Dynamic racing sequence"
    ],
    "answer": 0,
    "fact": "DRS opens a flap in the rear wing to reduce drag and boost straight-line speed.",
    "event": "lap briefing"
  },
  {
    "prompt": "What color flag signals immediate race stoppage?",
    "options": [
      "Red",
      "Blue",
      "Yellow",
      "Black"
    ],
    "answer": 0,
    "fact": "A red flag stops the session and sends everyone back to pit lane.",
    "event": "track control"
  },
  {
    "prompt": "What does the chequered flag mean?",
    "options": [
      "Race finished",
      "Session suspended",
      "Safety car deployed",
      "Mandatory pit stop"
    ],
    "answer": 0,
    "fact": "The chequered flag marks the end of the race session.",
    "event": "final lap"
  },
  {
    "prompt": "In qualifying, who starts P1 on race day?",
    "options": [
      "Fastest Q3 driver",
      "Last year champion",
      "Fastest pit crew",
      "Sprint winner"
    ],
    "answer": 0,
    "fact": "Pole position goes to the fastest driver in Q3.",
    "event": "grid battle"
  },
  {
    "prompt": "What does parc ferme limit after qualifying?",
    "options": [
      "Major car setup changes",
      "Radio messages",
      "Pit stop practice",
      "Tyre blankets"
    ],
    "answer": 0,
    "fact": "Parc ferme rules lock most setup changes between qualifying and race start.",
    "event": "regulation check"
  },
  {
    "prompt": "What is the main purpose of the safety car?",
    "options": [
      "Neutralize race pace for safety",
      "Increase race speed",
      "Start rain procedures",
      "Award half points"
    ],
    "answer": 0,
    "fact": "The safety car slows and bunches the field so marshals can work safely.",
    "event": "track control"
  },
  {
    "prompt": "Under a virtual safety car, what must drivers do?",
    "options": [
      "Follow a reduced delta pace",
      "Pit immediately",
      "Switch to wet tyres",
      "Line up on the grid"
    ],
    "answer": 0,
    "fact": "Under VSC, drivers follow a minimum delta time instead of racing flat out.",
    "event": "track control"
  },
  {
    "prompt": "What does a blue flag usually indicate?",
    "options": [
      "Faster car is lapping you",
      "Rain expected",
      "Session suspended",
      "Pit lane closed"
    ],
    "answer": 0,
    "fact": "Blue flags warn a slower car that a faster one is approaching to lap.",
    "event": "flag signal"
  },
  {
    "prompt": "What does a black flag mean?",
    "options": [
      "Car is disqualified and must return",
      "Race canceled",
      "Safety car ending",
      "Driver wins pole"
    ],
    "answer": 0,
    "fact": "A black flag means disqualification from the session.",
    "event": "flag signal"
  },
  {
    "prompt": "What does a yellow flag mean for drivers?",
    "options": [
      "Danger ahead, no overtaking",
      "Full speed racing",
      "Mandatory pit stop",
      "Race finished"
    ],
    "answer": 0,
    "fact": "Yellow flag means caution and no overtaking in that zone.",
    "event": "flag signal"
  },
  {
    "prompt": "Which tyre is designed for damp conditions without standing water?",
    "options": [
      "Intermediate",
      "Soft",
      "Full wet",
      "Hard"
    ],
    "answer": 0,
    "fact": "Intermediates are made for a damp track and light spray conditions.",
    "event": "tyre strategy"
  },
  {
    "prompt": "Which tyre is designed for heavy rain and standing water?",
    "options": [
      "Full wet",
      "Intermediate",
      "Hard",
      "Medium"
    ],
    "answer": 0,
    "fact": "Full wet tyres clear much more water than intermediates.",
    "event": "tyre strategy"
  },
  {
    "prompt": "What is a chicane?",
    "options": [
      "A quick left-right or right-left sequence",
      "A long straight",
      "A pit lane tool",
      "A wet tyre type"
    ],
    "answer": 0,
    "fact": "A chicane is a rapid change of direction added to slow cars down.",
    "event": "track layout"
  },
  {
    "prompt": "What is slipstreaming in F1?",
    "options": [
      "Using reduced drag behind another car",
      "Driving through pit lane",
      "Locking brakes into a corner",
      "Saving fuel under safety car"
    ],
    "answer": 0,
    "fact": "A car behind can gain speed by sitting in lower-pressure air.",
    "event": "overtake setup"
  },
  {
    "prompt": "What is a delta time under safety procedures?",
    "options": [
      "Minimum reference pace drivers must respect",
      "Pit stop target",
      "Gap to championship leader",
      "Time of day for sunset"
    ],
    "answer": 0,
    "fact": "The delta is a target lap pace used to keep speeds controlled.",
    "event": "track control"
  },
  {
    "prompt": "What is an out lap?",
    "options": [
      "Lap leaving pits to start a run",
      "Lap returning to pits",
      "Final race lap",
      "Lap under red flag"
    ],
    "answer": 0,
    "fact": "An out lap starts when a car exits the pit lane before a timed push lap.",
    "event": "qualifying run"
  },
  {
    "prompt": "What is an in lap?",
    "options": [
      "Lap returning to the pit lane",
      "Lap before lights out",
      "Lap under DRS",
      "Formation lap"
    ],
    "answer": 0,
    "fact": "An in lap is the lap where the driver comes back to pits.",
    "event": "qualifying run"
  },
  {
    "prompt": "What does downforce mainly help with?",
    "options": [
      "Cornering grip",
      "Top speed on straights",
      "Radio quality",
      "Fuel flow"
    ],
    "answer": 0,
    "fact": "More downforce improves corner speed but usually increases drag.",
    "event": "car setup"
  },
  {
    "prompt": "When is DRS typically enabled in a race?",
    "options": [
      "When a driver is within one second at detection",
      "Anytime in sector 1",
      "Only on the final lap",
      "Only in wet races"
    ],
    "answer": 0,
    "fact": "DRS is usually available if the chasing car is within one second at the detection point.",
    "event": "overtake setup"
  },
  {
    "prompt": "Roughly how long is a full grand prix race distance (except Monaco)?",
    "options": [
      "About 305 km",
      "About 220 km",
      "About 150 km",
      "About 500 km"
    ],
    "answer": 0,
    "fact": "F1 races are set to about 305 km, with Monaco as the classic exception.",
    "event": "race format"
  },
  {
    "prompt": "Which race is the classic exception to the ~305 km distance rule?",
    "options": [
      "Monaco Grand Prix",
      "British Grand Prix",
      "Italian Grand Prix",
      "Japanese Grand Prix"
    ],
    "answer": 0,
    "fact": "Monaco is run at a shorter total distance than most F1 races.",
    "event": "race format"
  },
  {
    "prompt": "Which company supplies F1 tyres in the current era?",
    "options": [
      "Pirelli",
      "Michelin",
      "Bridgestone",
      "Goodyear"
    ],
    "answer": 0,
    "fact": "Pirelli is the current official tyre supplier in Formula 1.",
    "event": "paddock tech"
  },
  {
    "prompt": "Which era began in 2014 in Formula 1?",
    "options": [
      "Turbo-hybrid power unit era",
      "V10 return era",
      "Ground effect ban era",
      "Manual gearbox era"
    ],
    "answer": 0,
    "fact": "2014 introduced the current turbo-hybrid power unit regulations.",
    "event": "regulation era"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2002?",
    "options": [
      "Michael Schumacher",
      "Lewis Hamilton",
      "Nico Rosberg",
      "Fernando Alonso"
    ],
    "answer": 0,
    "fact": "Michael Schumacher won the drivers' title in 2002.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2004?",
    "options": [
      "Michael Schumacher",
      "Sebastian Vettel",
      "Fernando Alonso",
      "Lewis Hamilton"
    ],
    "answer": 0,
    "fact": "Michael Schumacher won the drivers' title in 2004.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2005?",
    "options": [
      "Fernando Alonso",
      "Nico Rosberg",
      "Kimi Raikkonen",
      "Jenson Button"
    ],
    "answer": 0,
    "fact": "Fernando Alonso won the drivers' title in 2005.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2006?",
    "options": [
      "Fernando Alonso",
      "Max Verstappen",
      "Lewis Hamilton",
      "Sebastian Vettel"
    ],
    "answer": 0,
    "fact": "Fernando Alonso won the drivers' title in 2006.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2007?",
    "options": [
      "Kimi Raikkonen",
      "Michael Schumacher",
      "Jenson Button",
      "Nico Rosberg"
    ],
    "answer": 0,
    "fact": "Kimi Raikkonen won the drivers' title in 2007.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2008?",
    "options": [
      "Lewis Hamilton",
      "Fernando Alonso",
      "Sebastian Vettel",
      "Max Verstappen"
    ],
    "answer": 0,
    "fact": "Lewis Hamilton won the drivers' title in 2008.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2009?",
    "options": [
      "Jenson Button",
      "Kimi Raikkonen",
      "Nico Rosberg",
      "Michael Schumacher"
    ],
    "answer": 0,
    "fact": "Jenson Button won the drivers' title in 2009.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2010?",
    "options": [
      "Sebastian Vettel",
      "Lewis Hamilton",
      "Max Verstappen",
      "Fernando Alonso"
    ],
    "answer": 0,
    "fact": "Sebastian Vettel won the drivers' title in 2010.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2011?",
    "options": [
      "Sebastian Vettel",
      "Jenson Button",
      "Michael Schumacher",
      "Kimi Raikkonen"
    ],
    "answer": 0,
    "fact": "Sebastian Vettel won the drivers' title in 2011.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2014?",
    "options": [
      "Lewis Hamilton",
      "Michael Schumacher",
      "Jenson Button",
      "Nico Rosberg"
    ],
    "answer": 0,
    "fact": "Lewis Hamilton won the drivers' title in 2014.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2015?",
    "options": [
      "Lewis Hamilton",
      "Fernando Alonso",
      "Sebastian Vettel",
      "Max Verstappen"
    ],
    "answer": 0,
    "fact": "Lewis Hamilton won the drivers' title in 2015.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2016?",
    "options": [
      "Nico Rosberg",
      "Kimi Raikkonen",
      "Sebastian Vettel",
      "Michael Schumacher"
    ],
    "answer": 0,
    "fact": "Nico Rosberg won the drivers' title in 2016.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2022?",
    "options": [
      "Max Verstappen",
      "Fernando Alonso",
      "Jenson Button",
      "Nico Rosberg"
    ],
    "answer": 0,
    "fact": "Max Verstappen won the drivers' title in 2022.",
    "event": "title fight"
  },
  {
    "prompt": "Who won the F1 Drivers' Championship in 2024?",
    "options": [
      "Max Verstappen",
      "Lewis Hamilton",
      "Nico Rosberg",
      "Fernando Alonso"
    ],
    "answer": 0,
    "fact": "Max Verstappen won the drivers' title in 2024.",
    "event": "title fight"
  },
  {
    "prompt": "Which country hosts the Monza Grand Prix circuit?",
    "options": [
      "Italy",
      "Belgium",
      "United Arab Emirates",
      "Saudi Arabia"
    ],
    "answer": 0,
    "fact": "Monza is located in Italy.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Spa-Francorchamps Grand Prix circuit?",
    "options": [
      "Belgium",
      "United Kingdom",
      "United States",
      "Bahrain"
    ],
    "answer": 0,
    "fact": "Spa-Francorchamps is located in Belgium.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Suzuka Grand Prix circuit?",
    "options": [
      "Japan",
      "Brazil",
      "Saudi Arabia",
      "Spain"
    ],
    "answer": 0,
    "fact": "Suzuka is located in Japan.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Interlagos Grand Prix circuit?",
    "options": [
      "Brazil",
      "United Arab Emirates",
      "Bahrain",
      "Monaco"
    ],
    "answer": 0,
    "fact": "Interlagos is located in Brazil.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Yas Marina Grand Prix circuit?",
    "options": [
      "United Arab Emirates",
      "United States",
      "Canada",
      "Netherlands"
    ],
    "answer": 0,
    "fact": "Yas Marina is located in United Arab Emirates.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Albert Park Grand Prix circuit?",
    "options": [
      "Australia",
      "Saudi Arabia",
      "Monaco",
      "Austria"
    ],
    "answer": 0,
    "fact": "Albert Park is located in Australia.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Circuit Gilles Villeneuve Grand Prix circuit?",
    "options": [
      "Canada",
      "Spain",
      "Austria",
      "Mexico"
    ],
    "answer": 0,
    "fact": "Circuit Gilles Villeneuve is located in Canada.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Zandvoort Grand Prix circuit?",
    "options": [
      "Netherlands",
      "Hungary",
      "Mexico",
      "Germany"
    ],
    "answer": 0,
    "fact": "Zandvoort is located in Netherlands.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Red Bull Ring Grand Prix circuit?",
    "options": [
      "Austria",
      "Singapore",
      "China",
      "Belgium"
    ],
    "answer": 0,
    "fact": "Red Bull Ring is located in Austria.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Marina Bay Grand Prix circuit?",
    "options": [
      "Singapore",
      "Azerbaijan",
      "Germany",
      "United Kingdom"
    ],
    "answer": 0,
    "fact": "Marina Bay is located in Singapore.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Imola Grand Prix circuit?",
    "options": [
      "Italy",
      "Mexico",
      "Belgium",
      "Brazil"
    ],
    "answer": 0,
    "fact": "Imola is located in Italy.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Baku City Circuit Grand Prix circuit?",
    "options": [
      "Azerbaijan",
      "Qatar",
      "Belgium",
      "Brazil"
    ],
    "answer": 0,
    "fact": "Baku City Circuit is located in Azerbaijan.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Autodromo Hermanos Rodriguez Grand Prix circuit?",
    "options": [
      "Mexico",
      "China",
      "United Kingdom",
      "United Arab Emirates"
    ],
    "answer": 0,
    "fact": "Autodromo Hermanos Rodriguez is located in Mexico.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Losail International Circuit Grand Prix circuit?",
    "options": [
      "Qatar",
      "Germany",
      "Japan",
      "United States"
    ],
    "answer": 0,
    "fact": "Losail International Circuit is located in Qatar.",
    "event": "track map"
  },
  {
    "prompt": "Which country hosts the Nurburgring Grand Prix circuit?",
    "options": [
      "Germany",
      "Japan",
      "Australia",
      "Canada"
    ],
    "answer": 0,
    "fact": "Nurburgring is located in Germany.",
    "event": "track map"
  },
  {
    "prompt": "Which F1 team is nicknamed the Prancing Horse?",
    "options": [
      "Ferrari",
      "McLaren",
      "Williams",
      "Sauber"
    ],
    "answer": 0,
    "fact": "The Prancing Horse is Ferrari's iconic symbol.",
    "event": "team identity"
  },
  {
    "prompt": "Which team is often called the Silver Arrows in modern F1?",
    "options": [
      "Mercedes",
      "Red Bull",
      "Aston Martin",
      "Alpine"
    ],
    "answer": 0,
    "fact": "Silver Arrows is the classic nickname for Mercedes motorsport.",
    "event": "team identity"
  },
  {
    "prompt": "Which team is strongly associated with papaya orange?",
    "options": [
      "McLaren",
      "Ferrari",
      "Williams",
      "Haas"
    ],
    "answer": 0,
    "fact": "Papaya orange is McLaren's signature modern race color.",
    "event": "team identity"
  },
  {
    "prompt": "The tifosi are famously passionate fans of which team?",
    "options": [
      "Ferrari",
      "Mercedes",
      "Red Bull",
      "Alpine"
    ],
    "answer": 0,
    "fact": "Tifosi is the traditional name for Ferrari's fan base.",
    "event": "fan zone"
  },
  {
    "prompt": "In 2021, what controversial event decided the championship on the final lap at Abu Dhabi?",
    "options": [
      "A late safety car restart",
      "A red flag restart",
      "A penalty for Max Verstappen",
      "A mechanical failure for Hamilton"
    ],
    "answer": 0,
    "fact": "A controversial late safety car and restart allowed Verstappen to overtake Hamilton on the final lap to win the 2021 title.",
    "event": "iconic moment"
  },
  {
    "prompt": "What did Lando Norris famously lose in Russia 2021 by staying out in worsening rain?",
    "options": [
      "His first F1 win",
      "His front wing",
      "A podium finish",
      "His grid penalty appeal"
    ],
    "answer": 0,
    "fact": "Norris led the race but stayed out on slicks as rain intensified, dropping him down the order and handing the win to Hamilton.",
    "event": "iconic moment"
  },
  {
    "prompt": "What did Sebastian Vettel do after winning the 2013 Indian GP to celebrate his 4th title?",
    "options": [
      "Did doughnuts on the straight",
      "Sprinted to the crowd",
      "Threw his steering wheel",
      "Climbed a fence"
    ],
    "answer": 0,
    "fact": "Vettel's iconic donuts on the main straight became one of F1's most memorable celebrations.",
    "event": "iconic moment"
  },
  {
    "prompt": "At Canada 2019, which driver was given a controversial 5-second penalty while leading, costing them the win?",
    "options": [
      "Vettel",
      "Leclerc",
      "Bottas",
      "Ricciardo"
    ],
    "answer": 0,
    "fact": "Vettel crossed the line first but a 5-second penalty for an unsafe rejoin gave Hamilton the win, sparking huge controversy.",
    "event": "iconic moment"
  },
  {
    "prompt": "Which team principal is famous for shouting 'No Michael no no that is so not right' on team radio?",
    "options": [
      "Toto Wolff",
      "Christian Horner",
      "Guenther Steiner",
      "Helmut Marko"
    ],
    "answer": 0,
    "fact": "Mercedes principal Toto Wolff's radio outburst to race director Michael Masi during Abu Dhabi 2021 became an iconic F1 meme.",
    "event": "iconic moment"
  },
  {
    "prompt": "Which circuit is known as the 'Temple of Speed'?",
    "options": [
      "Monza",
      "Silverstone",
      "Spa",
      "Baku"
    ],
    "answer": 0,
    "fact": "Monza's low-downforce, high-speed layout earned it the legendary nickname.",
    "event": "track lore"
  },
  {
    "prompt": "What is 'porpoising' that plagued teams in 2022?",
    "options": [
      "Car bouncing violently at high speed",
      "Excessive tyre wear",
      "Engine overheating",
      "Gearbox vibrations"
    ],
    "answer": 0,
    "fact": "The 2022 ground effect cars caused violent vertical oscillations on straights as downforce rapidly stalled and reattached.",
    "event": "tech drama"
  },
  {
    "prompt": "Which driver famously said 'Leave me alone, I know what I'm doing' during a race?",
    "options": [
      "Kimi Raikkonen",
      "Fernando Alonso",
      "Lewis Hamilton",
      "Max Verstappen"
    ],
    "answer": 0,
    "fact": "Raikkonen's ice-cold radio message during Abu Dhabi 2012 became one of F1's most quoted lines.",
    "event": "iconic moment"
  },
  {
    "prompt": "What is a 'megapixel' in F1 slang?",
    "options": [
      "Nothing — it's not real F1 slang",
      "A really clean qualifying lap",
      "A high-res onboard camera",
      "A sponsor deal worth millions"
    ],
    "answer": 0,
    "fact": "There's no such thing as a megapixel in F1 jargon — don't let fake terms trip you up.",
    "event": "bluff call"
  },
  {
    "prompt": "'Multi 21, Seb' was a famous team order controversy involving which team?",
    "options": [
      "Red Bull",
      "Ferrari",
      "Mercedes",
      "McLaren"
    ],
    "answer": 0,
    "fact": "Vettel ignored the 'Multi 21' team order and overtook Webber to win the 2013 Malaysian GP, causing a massive rift.",
    "event": "iconic moment"
  },
  {
    "prompt": "What is the 'Halo' device on modern F1 cars designed to protect against?",
    "options": [
      "Head impacts from debris",
      "Rain spray",
      "Engine fires",
      "Tyre blowouts"
    ],
    "answer": 0,
    "fact": "The Halo has been credited with saving multiple lives since its introduction in 2018, including Romain Grosjean's fiery 2020 crash.",
    "event": "safety tech"
  },
  {
    "prompt": "Which driver survived a 137mph crash and fireball at Bahrain 2020?",
    "options": [
      "Romain Grosjean",
      "Pierre Gasly",
      "Lance Stroll",
      "Carlos Sainz"
    ],
    "answer": 0,
    "fact": "Grosjean's Haas split the barrier and burst into flames, but the Halo and his own escape saved his life.",
    "event": "iconic moment"
  },
  {
    "prompt": "If it starts raining mid-race, who makes the call to switch to wet tyres?",
    "options": [
      "The driver and their team",
      "The FIA race director",
      "The safety car driver",
      "The tyre supplier Pirelli"
    ],
    "answer": 0,
    "fact": "Tyre strategy including weather calls is entirely the team's decision — getting the timing right can make or break a race.",
    "event": "strategy call"
  },
  {
    "prompt": "What does 'Box box box' mean on F1 team radio?",
    "options": [
      "Come into the pits this lap",
      "Retire the car",
      "Penalty incoming",
      "Push for fastest lap"
    ],
    "answer": 0,
    "fact": "'Box' comes from the German word for pit stop area and is repeated three times for clarity over radio.",
    "event": "radio call"
  },
  {
    "prompt": "Which driver held the record for most race wins before Hamilton broke it?",
    "options": [
      "Michael Schumacher",
      "Ayrton Senna",
      "Alain Prost",
      "Sebastian Vettel"
    ],
    "answer": 0,
    "fact": "Schumacher's record of 91 wins stood for nearly 15 years before Hamilton surpassed it in 2020.",
    "event": "record book"
  },
  {
    "prompt": "Which corner at Spa-Francorchamps is one of the most famous in all of motorsport?",
    "options": [
      "Eau Rouge / Raidillon",
      "La Source",
      "Bus Stop chicane",
      "Pouhon"
    ],
    "answer": 0,
    "fact": "The high-speed uphill left-right-left through Eau Rouge and Raidillon is a legendary test of commitment.",
    "event": "track lore"
  },
  {
    "prompt": "Which team did Fernando Alonso return to in 2021 after two years away from F1?",
    "options": [
      "Alpine",
      "Ferrari",
      "McLaren",
      "Aston Martin"
    ],
    "answer": 0,
    "fact": "Alonso returned to the renamed Alpine team (formerly Renault) in 2021, continuing his remarkable F1 longevity.",
    "event": "driver move"
  },
  {
    "prompt": "What is 'the undercut' referring to when commentators say 'they've pulled off the undercut'?",
    "options": [
      "Overtaking by pitting earlier and using fresh tyre pace",
      "Diving up the inside at a chicane",
      "Blocking a car on a straight",
      "Running wide to gain an advantage"
    ],
    "answer": 0,
    "fact": "A successful undercut means your out-lap on fresh tyres was fast enough to jump ahead of someone who stayed out.",
    "event": "strategy call"
  },
  {
    "prompt": "Which F1 track features a tunnel that drivers blast through at over 150mph?",
    "options": [
      "Monaco",
      "Singapore",
      "Baku",
      "Jeddah"
    ],
    "answer": 0,
    "fact": "The famous Monaco tunnel creates a sudden light-to-dark-to-light transition at extreme speed, one of F1's most unique challenges.",
    "event": "track lore"
  },
  {
    "prompt": "What nickname did Daniel Ricciardo earn for his celebrations on the podium?",
    "options": [
      "The Honey Badger",
      "The Shoey King",
      "The Smiling Assassin",
      "Danny Ric"
    ],
    "answer": 0,
    "fact": "Ricciardo adopted the Honey Badger nickname early in his career, known for his fearless overtaking and trademark grin.",
    "event": "driver profile"
  },
  {
    "prompt": "What does ERS stand for in a modern F1 power unit?",
    "options": [
      "Energy recovery system",
      "Electronic race stabilizer",
      "Engine rev sync",
      "Exhaust recirculation setup"
    ],
    "answer": 0,
    "fact": "ERS harvests energy from braking and exhaust heat, providing a significant power boost to the hybrid power unit.",
    "event": "tech specs"
  },
  {
    "prompt": "Which legendary commentator was known for the catchphrase 'And it's go go go!'?",
    "options": [
      "Murray Walker",
      "Martin Brundle",
      "David Croft",
      "James Hunt"
    ],
    "answer": 0,
    "fact": "Murray Walker's breathless, excitable commentary defined F1 broadcasting for decades.",
    "event": "f1 culture"
  },
  {
    "prompt": "What happened when McLaren's pit crew released the car with a wheel gun issue at Bahrain 2021?",
    "options": [
      "The car was released with a loose wheel",
      "Nothing unusual",
      "The mechanic was dragged along",
      "The pit stop took over 40 seconds"
    ],
    "answer": 0,
    "fact": "Unsafe releases remain one of the most dangerous pit stop failures and carry heavy penalties.",
    "event": "pit drama"
  },
  {
    "prompt": "Which driver is known for the radio message 'Honestly, what are we doing here, racing or ping pong?'?",
    "options": [
      "Fernando Alonso",
      "Sebastian Vettel",
      "Kimi Raikkonen",
      "Lewis Hamilton"
    ],
    "answer": 0,
    "fact": "Alonso's frustrated radios became legendary during his struggles at McLaren-Honda.",
    "event": "radio call"
  },
  {
    "prompt": "What does a driver mean when they report 'understeer' to their engineer?",
    "options": [
      "The front doesn't turn enough into the corner",
      "The car turns more than expected",
      "The rear slides out",
      "The brakes are locking up"
    ],
    "answer": 0,
    "fact": "Understeer means the car pushes wide — the front tyres lose grip before the rears.",
    "event": "driving feel"
  },
  {
    "prompt": "What is 'dirty air' and why do drivers hate following closely in it?",
    "options": [
      "Turbulence that reduces the following car's downforce",
      "Exhaust fumes that smell bad",
      "Oil spray from the car ahead",
      "Brake dust clouding visibility"
    ],
    "answer": 0,
    "fact": "Dirty air causes the following car to lose grip in corners, which is why the 2022 rules aimed to reduce this effect.",
    "event": "aero battle"
  },
  {
    "prompt": "What is a 'shoey' that Ricciardo made famous on F1 podiums?",
    "options": [
      "Drinking champagne from a racing boot",
      "A victory dance",
      "Throwing shoes into the crowd",
      "Signing a shoe for a fan"
    ],
    "answer": 0,
    "fact": "Ricciardo's shoey became one of the most iconic podium traditions, with even other drivers and celebrities joining in.",
    "event": "f1 culture"
  },
  {
    "prompt": "What does 'graining' look like on an F1 tyre?",
    "options": [
      "Small rubber pellets rolling across the surface",
      "Visible cracks in the sidewall",
      "The tyre turning white",
      "Smoke pouring from the contact patch"
    ],
    "answer": 0,
    "fact": "Graining occurs when the tyre surface tears into tiny rolls of rubber, usually when the tyre is too cold or sliding too much.",
    "event": "tyre management"
  },
  {
    "prompt": "What is the 'parc ferme' period in an F1 weekend?",
    "options": [
      "A lockdown on car changes between qualifying and race",
      "The cooldown window after the race ends",
      "The mandatory rest period for drivers overnight",
      "The pre-race media obligations window"
    ],
    "answer": 0,
    "fact": "Parc ferme prevents teams from making major setup changes once qualifying ends, ensuring the car you qualified is the car you race.",
    "event": "regulation check"
  },
  {
    "prompt": "What happens if a driver exceeds track limits three times during a race?",
    "options": [
      "They receive a black and white flag warning",
      "Nothing until a fourth offense",
      "Immediate 5-second penalty",
      "They must give back any positions gained"
    ],
    "answer": 0,
    "fact": "The black and white flag serves as an official warning — further violations lead to time penalties.",
    "event": "regulation check"
  },
  {
    "prompt": "Which driver was nicknamed 'The Iceman'?",
    "options": [
      "Kimi Raikkonen",
      "Mika Hakkinen",
      "Nico Rosberg",
      "Valtteri Bottas"
    ],
    "answer": 0,
    "fact": "Raikkonen earned the nickname for his famously emotionless demeanor and ice-cold composure under pressure.",
    "event": "driver profile"
  },
  {
    "prompt": "What was special about the 2021 Spa-Francorchamps Grand Prix?",
    "options": [
      "It lasted only a few laps behind the safety car due to rain",
      "It was the longest race in F1 history",
      "Three drivers were disqualified",
      "It was canceled entirely"
    ],
    "answer": 0,
    "fact": "The 2021 Belgian GP was widely criticized as a farce — half points were awarded for what was essentially no racing.",
    "event": "race drama"
  },
  {
    "prompt": "What does 'oversteer' feel like to a driver?",
    "options": [
      "The rear steps out and the car wants to spin",
      "The front washes wide",
      "The brakes lock under pressure",
      "The steering goes heavy"
    ],
    "answer": 0,
    "fact": "Oversteer happens when the rear tyres lose grip before the fronts, rotating the car more than the driver intended.",
    "event": "driving feel"
  },
  {
    "prompt": "Which team has won the most Constructors' Championships in F1 history?",
    "options": [
      "Ferrari",
      "McLaren",
      "Mercedes",
      "Red Bull"
    ],
    "answer": 0,
    "fact": "Ferrari holds the record for the most constructors' titles, cementing their status as F1's most storied team.",
    "event": "record book"
  },
  {
    "prompt": "Who is the youngest ever F1 race winner?",
    "options": [
      "Max Verstappen",
      "Sebastian Vettel",
      "Charles Leclerc",
      "Lando Norris"
    ],
    "answer": 0,
    "fact": "Verstappen won the 2016 Spanish GP aged 18 years and 228 days on his debut race for Red Bull.",
    "event": "record book"
  },
  {
    "prompt": "What does a driver mean when they say the car feels 'on rails'?",
    "options": [
      "It has perfect grip and balance",
      "It's stuck behind the safety car",
      "The steering is locked",
      "It's running out of fuel"
    ],
    "answer": 0,
    "fact": "When a car feels 'on rails', the driver has total confidence in the grip level through every corner.",
    "event": "driving feel"
  },
  {
    "prompt": "Why do F1 drivers weave side to side on the formation lap?",
    "options": [
      "To warm up their tyres",
      "To test their steering",
      "To wave to fans",
      "To check mirrors"
    ],
    "answer": 0,
    "fact": "Weaving generates lateral friction that heats the tyre surface, crucial for grip at the standing start.",
    "event": "race craft"
  },
  {
    "prompt": "What is a 'power unit' in modern F1?",
    "options": [
      "The complete hybrid system including engine, turbo, and electrical motors",
      "Just the engine",
      "The gearbox assembly",
      "The battery pack only"
    ],
    "answer": 0,
    "fact": "A modern F1 power unit combines a V6 turbo engine with MGU-K and MGU-H energy recovery systems producing over 1000hp.",
    "event": "tech specs"
  },
  {
    "prompt": "What did Lewis Hamilton do immediately after crossing the line to win his 7th title in Turkey 2020?",
    "options": [
      "Screamed on the radio and cried in the car",
      "Did donuts",
      "Jumped out of the car",
      "Sprayed his team with champagne"
    ],
    "answer": 0,
    "fact": "Hamilton broke down in tears on the radio after equalling Schumacher's record of 7 world titles in a dominant wet-weather drive.",
    "event": "iconic moment"
  },
  {
    "prompt": "What is the 'DRS train' that commentators complain about?",
    "options": [
      "A line of cars all within one second, each canceling out the other's DRS advantage",
      "A freight train carrying spare DRS parts",
      "When DRS fails for every car simultaneously",
      "Cars drafting in qualifying"
    ],
    "answer": 0,
    "fact": "In a DRS train nobody can overtake because the car ahead also has DRS from the car in front of them.",
    "event": "race craft"
  },
  {
    "prompt": "What is 'sandbagging' in the context of F1 practice sessions?",
    "options": [
      "Deliberately hiding true pace to mislead rivals",
      "Running with extra weight for tyre testing",
      "A penalty for blocking in the pit lane",
      "Using sandbags for ballast"
    ],
    "answer": 0,
    "fact": "Teams often sandbag in practice to avoid showing their real performance until qualifying or the race.",
    "event": "paddock mind games"
  },
  {
    "prompt": "What famously happens to the championship leader's car number board?",
    "options": [
      "It gets a number 1 option for the next season",
      "It turns gold",
      "It glows on the Halo",
      "Nothing special"
    ],
    "answer": 0,
    "fact": "The reigning world champion can choose to race with number 1 instead of their permanent number — Verstappen has taken it, Hamilton never did.",
    "event": "f1 culture"
  },
  {
    "prompt": "What is a safety car restart often called by fans?",
    "options": [
      "A rolling restart",
      "A standing start",
      "A red flag restart",
      "A formation restart"
    ],
    "answer": 0,
    "fact": "After a safety car period, the leader controls the restart pace and the field goes green at racing speed — no standing start.",
    "event": "race format"
  },
  {
    "prompt": "What does 'flat out' mean in F1 driver language?",
    "options": [
      "Driving at maximum speed without lifting",
      "The tyres are completely worn",
      "The car is bottoming out on the track",
      "Running on fumes"
    ],
    "answer": 0,
    "fact": "Taking a corner 'flat out' means the driver keeps full throttle through it — a sign of extreme downforce and bravery.",
    "event": "driving feel"
  },
  {
    "prompt": "What does it mean when a driver is told 'You are on the delta' by their engineer?",
    "options": [
      "They're matching the required target lap time",
      "They need to speed up immediately",
      "They've been given a penalty",
      "They're running low on fuel"
    ],
    "answer": 0,
    "fact": "The delta is a reference pace — staying 'on the delta' means the driver is hitting their time targets, crucial under safety car or VSC.",
    "event": "radio call"
  },
  {
    "prompt": "Why do teams put tyre blankets on the wheels before a pit stop?",
    "options": [
      "To keep the tyres at optimal temperature",
      "To hide the tyre compound from rivals",
      "To protect them from debris",
      "To prevent sun damage to the rubber"
    ],
    "answer": 0,
    "fact": "Heated tyre blankets keep rubber at around 70-80°C so drivers have immediate grip when they rejoin the track.",
    "event": "pit strategy"
  },
  {
    "prompt": "What are the 'marbles' that drivers try to avoid on track?",
    "options": [
      "Small balls of rubber shed from tyres that litter the track surface",
      "Loose gravel from the run-off",
      "Rain droplets on the racing line",
      "Debris from broken front wings"
    ],
    "answer": 0,
    "fact": "Marbles collect off the racing line and are extremely slippery — running over them can cause a car to snap sideways.",
    "event": "tyre management"
  },
  {
    "prompt": "What does 'Lights out and away we go' signal?",
    "options": [
      "The race start",
      "The end of a safety car period",
      "Qualifying has begun",
      "Pit lane is open"
    ],
    "answer": 0,
    "fact": "Five red lights illuminate one by one, then all go out simultaneously — that's the signal to race.",
    "event": "race format"
  },
  {
    "prompt": "Why is overtaking considered nearly impossible at Monaco?",
    "options": [
      "The street circuit is too narrow for side-by-side racing",
      "DRS is banned there",
      "The cars run too much downforce",
      "There's no straight long enough"
    ],
    "answer": 0,
    "fact": "Monaco's tight barriers and narrow streets mean qualifying position is often more important than race pace.",
    "event": "track lore"
  },
  {
    "prompt": "What is the 'racing line' and why do drivers follow it?",
    "options": [
      "The fastest path through a corner, using the full width of the track",
      "The white line marking the edge of the track",
      "The pit lane entry line",
      "A painted guide on the asphalt"
    ],
    "answer": 0,
    "fact": "The racing line maximizes corner speed by taking the widest arc possible, which is why the track surface is most rubbered-in on that line.",
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

  return pool.slice(0, LAPS_PER_WEEKEND).map((q) => {
    const indices = [0, 1, 2, 3];
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = getRandomIndex(i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return {
      ...q,
      options: indices.map((i) => q.options[i]),
      answer: indices.indexOf(q.answer),
    };
  });
};

export const initialWeekendQuestions = getRandomWeekendQuestions();
