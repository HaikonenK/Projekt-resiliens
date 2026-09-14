window.EKO7_DATA = {
  version: 8.0,
  world: {
    minX: -46, maxX: 72, minZ: -40, maxZ: 58,
    places: [
      { id:'station', name:'Forskningsstation', x:0, z:-2.8 },
      { id:'climate', name:'Klimatstation', x:-17, z:-18 },
      { id:'vegetation', name:'Provruta – ängen', x:4, z:-25 },
      { id:'camera', name:'Viltkameror', x:24, z:-12 },
      { id:'den', name:'Rävlya', x:28, z:14 },

      // Uppdrag 2 – gammelskogen. Stationerna ligger utspridda över en större del av
      // skogen, men den gula markören och stigen leder fortfarande eleven steg för steg.
      { id:'forest', name:'Gammelskogen', x:2, z:31, mission:2 },
      { id:'producerPlot', name:'Producentrutan', x:-12, z:36, mission:2 },
      { id:'feedingSite', name:'Spårplatsen', x:-21, z:47, mission:2 },
      { id:'foodwebBoard', name:'Näringsvävsstationen', x:0, z:50, mission:2 },
      { id:'decomposerLog', name:'Nedbrytarplatsen', x:19, z:44, mission:2 },
      { id:'energyStation', name:'Energipyramiden', x:10, z:54, mission:2 },

      // Uppdrag 3 – systemet reagerar. En sammanhängande slinga runt sjön leder
      // eleven genom återkopplingar, bärförmåga, stabilitet, resiliens och tröskelvärden.
      { id:'lake', name:'Sjön – fältsektor C', x:-20, z:19, mission:3 },
      { id:'feedbackStation', name:'Rovdjur–bytesdjur', x:-22, z:27, mission:3 },
      { id:'capacityStation', name:'Bärförmågestationen', x:-29, z:33, mission:3 },
      { id:'flockPoint', name:'Fågeludden', x:-39, z:29, mission:3 },
      { id:'stabilityStation', name:'Stabilitetsstationen', x:-43, z:19, mission:3 },
      { id:'resilienceStation', name:'Resiliensstationen', x:-39, z:9, mission:3 },
      { id:'thresholdStation', name:'Tröskelstationen', x:-27, z:7, mission:3 },

      // Uppdrag 4 – ekosystemtjänster och biologisk mångfald.
      { id:'wetland', name:'Våtmarken', x:-31, z:0, mission:4 },
      { id:'wetlandSensor', name:'Utloppet från våtmarken', x:-38, z:-9, mission:4 },
      { id:'pollinatorMeadow', name:'Pollinatörsängen', x:16, z:-31, mission:4 },
      { id:'farm', name:'Monokulturen', x:31, z:-27, mission:4 },
      { id:'forestCompare', name:'Skogsjämförelsen', x:40, z:-6, mission:4 },
      { id:'serviceStation', name:'Ekosystemtjänststationen', x:23, z:7, mission:4 },

      // Uppdrag 5 – planetens gränser, fotavtryck, gemensamma resurser och hållbar utveckling.
      { id:'boundaryLab', name:'Gränslabbet', x:49, z:-28, mission:5 },
      { id:'biodiversityArchive', name:'Artarkivet', x:62, z:-14, mission:5 },
      { id:'footprintStation', name:'Fotavtrycksstationen', x:66, z:4, mission:5 },
      { id:'commonsDock', name:'Gemensamma fisket', x:59, z:23, mission:5 },
      { id:'fairSpace', name:'Miljöutrymmesstationen', x:67, z:40, mission:5 },
      { id:'sustainabilityStation', name:'Hållbarhetsrådet', x:50, z:51, mission:5 }
    ]
  },

  missionSteps: [
    { id:'climate', title:'Kontrollera klimatstationen', text:'Gå till den gula markeringen vid skogsbrynet och undersök de abiotiska mätvärdena.', target:'climate' },
    { id:'vegetation', title:'Undersök vegetationen', text:'Gå till provrutan på ängen. Ta reda på om något levande har förändrats.', target:'vegetation' },
    { id:'camera', title:'Kontrollera viltkamerorna', text:'Växtbiomassan har minskat. Undersök om djurpopulationerna har förändrats.', target:'camera' },
    { id:'den', title:'Undersök rävarnas område', text:'Rävobservationerna har minskat kraftigt. Följ spåret till den gamla lyan.', target:'den' },
    { id:'analysis', title:'Återvänd till forskningsstationen', text:'Du har tillräckligt med data för en första analys. Gå tillbaka till stationen.', target:'station' },
    { id:'complete', title:'Uppdrag 1 slutfört', text:'Första analysen är klar. Nästa fråga är: Vem äter vem?', target:null }
  ],

  mission2Steps: [
    { id:'forest', title:'Ta dig till gammelskogen', text:'Fältanalysen pekar mot näringsväven. Följ den gula markeringen till gammelskogen.', target:'forest' },
    { id:'producerPlot', title:'Hitta systemets producenter', text:'Undersök producentrutan och avgör vilka organismer som för in ny energi i näringsväven.', target:'producerPlot' },
    { id:'feedingSite', title:'Följ spåren efter föda', text:'Producenterna är grunden. Nu behöver vi veta vilka organismer som äter dem – och vilka som äter växtätarna.', target:'feedingSite' },
    { id:'foodwebBoard', title:'Rekonstruera näringsväven', text:'Använd artobservationerna och bygg EKO-7:s förenklade näringsväv.', target:'foodwebBoard' },
    { id:'decomposerLog', title:'Undersök den döda veden', text:'Näringsväven är mer än levande bytesdjur. Ta reda på vad som händer med dött material.', target:'decomposerLog' },
    { id:'energyStation', title:'Följ energin uppåt', text:'Undersök energipyramiden och förklara varför toppkonsumenter alltid är relativt få.', target:'energyStation' },
    { id:'analysis2', title:'Återvänd till forskningsstationen', text:'Du kan nu testa hypotesen från Uppdrag 1 mot hela näringsväven.', target:'station' },
    { id:'complete2', title:'Uppdrag 2 slutfört', text:'Näringsväven visar hur förändringen sprider sig. Nästa fråga gäller återkopplingar och stabilitet.', target:null }
  ],


  mission3Steps: [
    { id:'lake', title:'Följ förändringen till sjön', text:'Näringsväven visar att populationer påverkar varandra. Gå till fältsektor C vid sjön och undersök hur systemet reagerar över tid.', target:'lake' },
    { id:'feedback', title:'Undersök rovdjur och bytesdjur', text:'Jämför abborrens och gäddans populationskurvor. Ta reda på varför förändringarna ofta bromsar varandra.', target:'feedbackStation' },
    { id:'capacity', title:'Varför växer inte populationen för alltid?', text:'Rovdjuren är inte den enda begränsningen. Undersök vad som händer när en population närmar sig ekosystemets bärförmåga.', target:'capacityStation' },
    { id:'positive', title:'Hitta en förstärkande återkoppling', text:'Alla återkopplingar bromsar inte förändringar. Följ markeringen till fågeludden och undersök ett exempel på positiv återkoppling.', target:'flockPoint' },
    { id:'stability', title:'Stabilt betyder inte stillastående', text:'Jämför mätserier från en gammal skog och en utsatt strandmiljö. Avgör vad som menas med stabila och labila ekosystem.', target:'stabilityStation' },
    { id:'resilience', title:'Kan systemet återhämta sig?', text:'Forskarna har gjort ett kontrollerat störningsförsök. Undersök hur olika delar av sjön återhämtar sig när belastningen upphör.', target:'resilienceStation' },
    { id:'threshold', title:'Hitta systemets tröskelvärde', text:'Kör den förenklade sjömodellen och se vad som händer när belastningen passerar en kritisk nivå.', target:'thresholdStation' },
    { id:'analysis3', title:'Återvänd till forskningsstationen', text:'Du har nu data om återkopplingar, bärförmåga, stabilitet och resiliens. Sammanfatta vad som avgör om EKO-7 återhämtar sig.', target:'station' },
    { id:'complete3', title:'Uppdrag 3 slutfört', text:'Systemet reagerar – ibland genom att bromsa förändringen, ibland genom att förstärka den. Nästa spår leder till människans påverkan och ekosystemtjänster.', target:null }
  ],

  mission4Steps: [
    { id:'wetland', title:'Följ belastningen till våtmarken', text:'Sjöns sensorer pekar mot vattenflödet från våtmarken. Undersök vad våtmarken tidigare gjorde med näringsämnena.', target:'wetland' },
    { id:'wetlandSensor', title:'Kontrollera våtmarkens utlopp', text:'Jämför gamla och nya mätvärden. Ta reda på vad som förändrats när vattnet leds förbi delar av våtmarken.', target:'wetlandSensor' },
    { id:'pollination', title:'Undersök pollinatörerna', text:'Våtmarken är inte den enda ekosystemtjänsten som försvagas. Följ markeringen till blomremsan vid jordbruket.', target:'pollinatorMeadow' },
    { id:'monoculture', title:'Jämför jordbrukslandskapet', text:'Pollinatörerna har minskat. Undersök hur monokultur och färre småbiotoper påverkar den biologiska mångfalden.', target:'farm' },
    { id:'forestCompare', title:'Jämför två skogar', text:'Följ markeringen till skogssektor D och jämför naturskog med odlad, likåldrig skog.', target:'forestCompare' },
    { id:'services', title:'Gör en revision av ekosystemtjänsterna', text:'Du har hittat flera nyttigheter som naturen ger oss. Para ihop ekosystemen med de tjänster de bidrar med.', target:'serviceStation' },
    { id:'analysis4', title:'Återvänd till forskningsstationen', text:'Sammanställ hur människans förändringar i landskapet påverkar både biologisk mångfald och ekosystemtjänster.', target:'station' },
    { id:'complete4', title:'Uppdrag 4 slutfört', text:'När ekosystemen förändras förlorar vi också tjänster vi själva är beroende av. Nästa fråga blir: hur mycket kan vi ta utan att överskrida systemets gränser?', target:null }
  ],

  mission5Steps: [
    { id:'boundary', title:'Hitta systemets gränser', text:'Ekosystemtjänsterna är värdefulla men inte obegränsade. Följ markeringen till gränslabbet och undersök vad planetens gränser betyder.', target:'boundaryLab' },
    { id:'biodiversity', title:'Undersök artförlusten', text:'Gränslabbet visar högt tryck på biologisk mångfald. Gå till artarkivet och följ hur habitatförlust kan påverka arter.', target:'biodiversityArchive' },
    { id:'footprint', title:'Mät vårt ekologiska fotavtryck', text:'Människans påverkan hänger ihop med konsumtion. Jämför två resursprofiler vid fotavtrycksstationen.', target:'footprintStation' },
    { id:'commons', title:'Testa en gemensam resurs', text:'Ett större fotavtryck består av många enskilda val. Vid fisket kan du testa vad som händer när flera aktörer delar samma begränsade resurs.', target:'commonsDock' },
    { id:'fairness', title:'Fördela ett rättvist miljöutrymme', text:'Om resurserna är begränsade uppstår nästa fråga: vem ska få använda hur mycket? Följ markeringen till miljöutrymmesstationen.', target:'fairSpace' },
    { id:'sustainability', title:'Formulera en hållbar regel', text:'Kombinera ekologiska gränser, gemensamma resurser och rättvisa vid hållbarhetsrådet.', target:'sustainabilityStation' },
    { id:'analysis5', title:'Återvänd till forskningsstationen', text:'Du har nu hela kedjan. Koppla ihop planetens gränser, fotavtryck, allmänningarnas tragedi, rättvist miljöutrymme och hållbar utveckling.', target:'station' },
    { id:'complete5', title:'Uppdrag 5 slutfört', text:'Du vet nu varför resurser måste användas inom ekologiska gränser. Nästa steg är att välja åtgärder och försöka återställa EKO-7.', target:null }
  ],


  mission6Steps: [
    { id:'plan', title:'Bygg en återställningsplan', text:'Du har 8 åtgärdspoäng. Välj en kombination som stärker vattenkvalitet, biologisk mångfald, näringsväv och ekosystemtjänster samtidigt.', target:'station' },
    { id:'checkWater', title:'Kontrollera våtmarken', text:'Planen är genomförd. Följ upp om våtmarken och utloppet minskar belastningen på sjön.', target:'wetlandSensor' },
    { id:'checkForest', title:'Kontrollera livsmiljöerna', text:'Undersök om fler habitat och ekologiska nischer kan stärka biologisk mångfald och resiliens.', target:'forestCompare' },
    { id:'checkWeb', title:'Kontrollera näringsväven', text:'Följ upp växtätare och rovdjur. Avgör hur återkopplingar kan hjälpa systemet att stabiliseras.', target:'feedingSite' },
    { id:'finalAnalysis', title:'Gör den sista systemanalysen', text:'Återvänd till forskningsstationen. Avgör om EKO-7 är på väg mot ett mer resilient tillstånd – och vad det egentligen betyder.', target:'station' },
    { id:'complete6', title:'Expeditionen slutförd', text:'EKO-7 är inte återställt till ett perfekt, oföränderligt tillstånd. Det har fått bättre förutsättningar att fortsätta förändras utan att kollapsa.', target:null }
  ],

  readings: {
    climate: [
      ['Temperatur','12,7 °C','12,9 °C','≈'],
      ['Nederbörd','48 mm','51 mm','≈'],
      ['Vind','3,1 m/s','3,3 m/s','≈'],
      ['Ljus','72 %','70 %','≈']
    ],
    biomass: [
      ['Gräs och örter','58 kg','39 kg','↓'],
      ['Buskar och ris','26 kg','22 kg','↓'],
      ['Total växtbiomassa','84 kg','61 kg','↓']
    ],
    wildlife: [
      ['Hare','24','61','↑↑'],
      ['Rådjur','13','18','↑'],
      ['Sork','42','58','↑'],
      ['Räv','17','4','↓↓']
    ]
  },

  ecology: {
    species: [
      {id:'grass',name:'Gräs och örter',role:'producent',eats:[]},
      {id:'blueberry',name:'Blåbärsris',role:'producent',eats:[]},
      {id:'birch',name:'Björk',role:'producent',eats:[]},
      {id:'hare',name:'Hare',role:'konsument',level:'förstahandskonsument',eats:['grass','blueberry','birch']},
      {id:'vole',name:'Sork',role:'konsument',level:'förstahandskonsument',eats:['grass','blueberry']},
      {id:'deer',name:'Rådjur',role:'konsument',level:'förstahandskonsument',eats:['grass','blueberry','birch']},
      {id:'fox',name:'Räv',role:'konsument',level:'toppkonsument',eats:['hare','vole']},
      {id:'owl',name:'Uggla',role:'konsument',level:'toppkonsument',eats:['vole']}
    ],
    foodChains: [
      ['Gräs och örter','Hare','Räv'],
      ['Blåbärsris','Sork','Uggla'],
      ['Blåbärsris','Hare','Räv']
    ],
    energy: [
      ['Producenter','10 000 energienheter'],
      ['Växtätare','≈ 1 000–1 500'],
      ['Rovdjur','≈ 100–225']
    ]
  },

  journalTemplates: {
    intro: {section:'Öppna frågor', text:'Hur hänger förändringarna i EKO-7 ihop?', kind:'question'},
    climate: {section:'Miljö', text:'Temperatur, nederbörd, vind och ljus är abiotiska faktorer. Inga större klimatavvikelser upptäcktes.'},
    vegetation: {section:'Observationer', text:'Vegetationens biomassa har minskat tydligt i provrutan.'},
    population: {section:'Begrepp', text:'En population är alla individer av samma art inom ett visst område.'},
    camera: {section:'Observationer', text:'Harar och sorkar har ökat, medan rävobservationerna har minskat kraftigt.'},
    den: {section:'Observationer', text:'Den gamla rävlyan verkar övergiven. I närheten finns tydliga spår av hårt betad vegetation.'},
    conclusion: {section:'Slutsatser', text:'Förändringen i förhållandet mellan växtätare och rovdjur är viktigast att undersöka vidare.'},
    resolved: {section:'Öppna frågor', text:'Första analysen visar att förändrade djurpopulationer kan hänga ihop med minskad vegetation. Nästa steg är att undersöka näringsväven.', kind:'resolved'},

    m2intro: {section:'Öppna frågor', text:'Vilka födorelationer kan förklara att fler växtätare sammanfaller med mindre vegetation?', kind:'question'},
    producers: {section:'Begrepp', text:'Producenter är gröna växter som genom fotosyntes omvandlar solenergi till kemisk energi. De utgör basen i nästan alla näringskedjor.'},
    consumers: {section:'Begrepp', text:'Konsumenter får sin energi genom att äta producenter eller andra konsumenter. Hare, sork och rådjur är förstahandskonsumenter i den förenklade väven.'},
    foodweb: {section:'Slutsatser', text:'En näringsväv består av flera sammankopplade näringskedjor. Samma art kan påverka flera andra arter samtidigt.'},
    trophic: {section:'Begrepp', text:'Varje länk i en näringskedja är en trofinivå. Producenter finns längst ned; toppkonsumenter finns högt upp.'},
    decomposers: {section:'Begrepp', text:'Nedbrytare som svampar, bakterier och smådjur bryter ned dött material. Materia kan då återgå till kretslopp och tas upp av växter igen.'},
    energyflow: {section:'Begrepp', text:'Energi flödar genom ekosystemet och mycket försvinner som värme vid varje trofinivå. Bara ungefär 10–15 % förs vidare till nästa nivå.'},
    m2conclusion: {section:'Slutsatser', text:'Räv ↓ kan ge hare och sork ↑. Fler växtätare kan i sin tur ge växtbiomassa ↓. Näringsväven gör därför observationerna från Uppdrag 1 begripliga.'},
    m2resolved: {section:'Öppna frågor', text:'Näringsväven förklarar hur förändringen kan sprida sig, men inte varför systemet ibland stabiliserar sig och ibland fortsätter förändras. Nästa steg är att undersöka återkopplingar och resiliens.', kind:'resolved'},

    m3intro: {section:'Öppna frågor', text:'När en population förändras – bromsar ekosystemet förändringen eller förstärks den?', kind:'question'},
    negativeFeedback: {section:'Begrepp', text:'Negativ återkoppling betyder att en förändring leder till följder som motverkar den ursprungliga förändringen. Rovdjur–bytesdjur är ett typiskt exempel.'},
    carryingCapacity: {section:'Begrepp', text:'Bärförmåga är hur stor population ett ekosystem kan försörja. Mat, utrymme, vatten, partner och andra resurser sätter gränser.'},
    positiveFeedback: {section:'Begrepp', text:'Positiv återkoppling betyder att en förändring förstärks av följderna. Positiv betyder inte att förändringen är bra.'},
    stableLabile: {section:'Begrepp', text:'Stabila ekosystem förändras också, men negativa återkopplingar gör att de ofta håller sig inom ungefär samma tillstånd. Labila system kan förändras snabbt och kraftigt.'},
    resilience: {section:'Begrepp', text:'Resiliens är ett ekosystems förmåga att återhämta sig efter en störning.'},
    threshold: {section:'Begrepp', text:'Ett tröskelvärde är en nivå där ett ekosystem eller en population kan förändras snabbt. Om systemet förändras så att det inte återgår till sitt tidigare tillstånd kan det ha passerat en tipping point.'},
    m3conclusion: {section:'Slutsatser', text:'EKO-7 kan inte beskrivas som natur i perfekt balans. Återkopplingar, bärförmåga och resiliens avgör hur systemet reagerar på störningar och om det återhämtar sig.'},
    m3resolved: {section:'Öppna frågor', text:'Sjöns svagare återhämtning tyder på att något utifrån pressar systemet. Nästa spår är vattenflödet från våtmarken och jordbruksområdet.', kind:'resolved'},

    m4intro: {section:'Öppna frågor', text:'Vilka ekosystemtjänster håller på att försvagas när EKO-7 förändras?', kind:'question'},
    ecosystemService: {section:'Begrepp', text:'Ekosystemtjänster är nyttigheter och funktioner som ekosystemen bidrar med till människor, till exempel pollinering, rent vatten, mat och råvaror.'},
    wetlandService: {section:'Observationer', text:'En fungerande våtmark kan fånga upp näringsämnen. När vatten leds förbi våtmarken når mer kväve och fosfor sjön.'},
    pollination: {section:'Observationer', text:'Pollinatörer är en ekosystemtjänst. Färre blommor och småbiotoper kring monokulturen sammanfaller med färre pollinerande insekter.'},
    biodiversity: {section:'Begrepp', text:'Biologisk mångfald innebär en stor variation av arter och livsformer. Omväxlande miljöer med många habitat och nischer kan ge högre mångfald.'},
    monoculture: {section:'Observationer', text:'En monokultur består av en enda odlad art över en stor yta. När småbiotoper försvinner minskar antalet möjliga habitat och ekologiska nischer.'},
    naturalForest: {section:'Observationer', text:'Naturskog med träd av olika arter och åldrar, död ved och gläntor erbjuder fler livsmiljöer än en likåldrig odlad skog.'},
    serviceAudit: {section:'Slutsatser', text:'Rent vatten, pollinering, fisk, virke och klimatreglering är exempel på ekosystemtjänster. De är beroende av fungerande ekosystem.'},
    m4conclusion: {section:'Slutsatser', text:'Människans markanvändning kan ge produkter och inkomster men samtidigt minska biologisk mångfald och försvaga ekosystemtjänster som vattenrening och pollinering.'},
    m4resolved: {section:'Öppna frågor', text:'EKO-7 visar att vi är beroende av de system vi utnyttjar. Nästa fråga är hur mycket resurser vi kan använda utan att överskrida planetens och ekosystemens gränser.', kind:'resolved'},

    m5intro: {section:'Öppna frågor', text:'Hur mycket kan människor använda av jordens resurser och ekosystemtjänster utan att pressa systemen för långt?', kind:'question'},
    planetBoundaries: {section:'Begrepp', text:'Planetens gränser beskriver ekologiska ramar för hur hårt jordens system kan pressas. Artförlust, klimat, markanvändning och användning av kväve och fosfor är viktiga typer av belastning.'},
    speciesLoss: {section:'Observationer', text:'Dagens snabba artminskning drivs i stor utsträckning av människans påverkan, bland annat förlust och splittring av habitat, överutnyttjande och klimatförändringar.'},
    ecologicalFootprint: {section:'Begrepp', text:'Ekologiskt fotavtryck är ett mått på hur mycket resurser och ekosystemtjänster vår konsumtion tar i anspråk.'},
    commonsTragedy: {section:'Begrepp', text:'De allmänna tillgångarnas tragedi beskriver hur en gemensam resurs kan överutnyttjas när varje aktör tjänar på att ta mer själv medan kostnaden delas av alla.'},
    fairSpace: {section:'Begrepp', text:'Rättvist miljöutrymme innebär att alla människor ska kunna få grundläggande behov tillgodosedda samtidigt som den totala resursanvändningen hålls inom ekologiska gränser.'},
    sustainableDevelopment: {section:'Begrepp', text:'Hållbar utveckling innebär att människor kan leva ett gott liv idag utan att förstöra möjligheterna för kommande generationer.'},
    m5conclusion: {section:'Slutsatser', text:'Många individuellt rimliga beslut kan tillsammans öka belastningen över systemets gränser. Hållbar användning kräver uppföljning, gemensamma regler, rättvisa och respekt för ekosystemens resiliens.'},
    m5resolved: {section:'Öppna frågor', text:'Du har identifierat hur EKO-7 fungerar och varför det pressats. Nästa fråga är praktisk: vilka åtgärder bör genomföras först för att öka systemets resiliens?', kind:'resolved'},

    m6intro: {section:'Öppna frågor', text:'Vilka åtgärder ger störst effekt på hela EKO-7 när resurserna är begränsade?', kind:'question'},
    restorationPlan: {section:'Slutsatser', text:'En bra återställningsplan angriper flera kopplade problem samtidigt: belastning på sjön, habitatförlust, näringsvävens återkopplingar och försvagade ekosystemtjänster.'},
    restoredWetland: {section:'Observationer', text:'Efter åtgärderna når mindre kväve och fosfor sjön. Våtmarkens vattenrenande ekosystemtjänst har stärkts.'},
    restoredHabitat: {section:'Observationer', text:'Fler varierade livsmiljöer ger fler möjliga habitat och ekologiska nischer. Det förbättrar förutsättningarna för biologisk mångfald.'},
    restoredWeb: {section:'Observationer', text:'När rovdjur och bytesdjur åter kan påverka varandra stärks negativa återkopplingar som kan bromsa stora populationssvängningar.'},
    restorationMeaning: {section:'Slutsatser', text:'Återställning betyder inte perfekt balans. Målet är ett dynamiskt ekosystem med tillräcklig resiliens för att tåla störningar och fortsätta leverera ekosystemtjänster.'},
    m6conclusion: {section:'Slutsatser', text:'EKO-7 stärks bäst genom åtgärder som minskar belastningen och samtidigt återställer habitat, återkopplingar och ekosystemtjänster.'},
    m6resolved: {section:'Öppna frågor', text:'Expeditionen är avslutad: från observationer och näringsvävar till återkopplingar, ekosystemtjänster, hållbarhet och praktisk återställning.', kind:'resolved'}
  }
};
