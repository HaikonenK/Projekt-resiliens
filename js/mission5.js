(function(){
  'use strict';
  const G=window.EKO7,S=G.state,D=window.EKO7_DATA;

  function esc(s){return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));}
  function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function choices(items,onCorrect){
    const host=document.getElementById('choices');
    shuffled(items).forEach(it=>{
      const b=document.createElement('button');b.className='choice';b.innerHTML=it.label;
      b.onclick=()=>{
        [...host.children].forEach(x=>x.disabled=true);
        if(it.ok){b.classList.add('correct');document.getElementById('fb').innerHTML='<div class="feedback yes">Rätt. '+(it.feedback||'')+'</div>';setTimeout(()=>onCorrect(it),560);}
        else{b.classList.add('wrong');document.getElementById('fb').innerHTML='<div class="feedback no">Inte riktigt. '+(it.feedback||'Försök igen.')+'</div>';setTimeout(()=>{[...host.children].forEach(x=>{x.disabled=false;x.classList.remove('wrong');});},760);}
      };
      host.appendChild(b);
    });
  }
  function next(step,journalKey,msg){if(journalKey)G.addJournal(journalKey);G.setStep(step);G.closePanel();G.flash(msg||'Ny fältmarkering tillagd.');}

  function start(){
    if(!S.journal.includes('m5intro'))G.addJournal('m5intro');
    S.mission5Complete=false;G.setMission(5,0);G.closePanel();
    G.flash('Uppdrag 5 startat. Följ den gula markeringen till gränslabbet.',3600);
  }

  function boundaryLab(){
    G.openPanel(`<div class="stamp">UPPDRAG 5</div><h2>Inom gränserna</h2><p class="sub">Gränslabbet · Fältsektor F</p>
      <p class="scene">En gammal analog kontrollpanel visar flera nålar. Några står i grönt, andra nära rött. På mässingsskylten står: <i>"Ett system kan användas – men inte hur mycket som helst."</i></p>
      <div class="boundary-panel"><span><b>ARTER</b><i class="danger">HÖGT TRYCK</i></span><span><b>KVÄVE/FOSFOR</b><i class="danger">HÖGT TRYCK</i></span><span><b>MARKANVÄNDNING</b><i class="warn">ÖKAR</i></span><span><b>KLIMAT</b><i class="warn">ÖKAR</i></span></div>
      <p><b>Vad menas med planetens gränser?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Gränser för hur hårt vi kan <b>pressa jordens ekosystem</b> utan att öka risken för stora och svårförutsägbara förändringar.',ok:true,feedback:'Precis. Idén handlar om att vår användning måste hålla sig inom vad systemen tål.'},
      {label:'Landsgränser mellan världens länder.',ok:false,feedback:'Här handlar gränserna om jordens ekologiska system, inte kartgränser.'},
      {label:'En lista över hur många människor som får bo på varje kontinent.',ok:false,feedback:'Modellen beskriver ekologisk belastning, inte befolkningskvoter.'},
      {label:'En regel som säger att naturen aldrig får användas av människor.',ok:false,feedback:'Poängen är inte noll användning utan att undvika överbelastning.'}
    ],boundaryPressures);
  }
  function boundaryPressures(){
    G.openPanel(`<div class="stamp">GRÄNSLABB F0</div><h2>Vilka tryck känner du igen?</h2>
      <p>Forskarna har jämfört EKO-7 med större miljöproblem på jorden. Vilken grupp innehåller de typer av belastning som lyfts fram i materialet?</p>
      <div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'<b>Förlust av arter, klimatförändringar, förändrad markanvändning samt för stor användning av kväve och fosfor.</b>',ok:true,feedback:'Ja. De här processerna kan alla pressa ekosystem och deras resiliens.'},
      {label:'Månens faser, jordens magnetfält, tidvatten och norrsken.',ok:false,feedback:'De är naturfenomen men inte de ekologiska belastningar som avses här.'},
      {label:'Bara vind och nederbörd.',ok:false,feedback:'Planetens gränser handlar om flera olika typer av mänsklig påverkan.'},
      {label:'Enbart mängden plast i skolor.',ok:false,feedback:'Det är betydligt bredare än så.'}
    ],()=>next(1,'planetBoundaries','Gränserna beskriver tryck. Nästa steg är att undersöka vad som händer när livsmiljöer försvinner.'));
  }

  function biodiversityArchive(){
    G.openPanel(`<div class="stamp">ARTARKIV F1</div><h2>När arter försvinner</h2>
      <p class="scene">I ett väderskyddat arkiv finns två kartor över samma landskap. Den äldre visar sammanhängande skog och våtmark. Den nya visar större åkrar, vägar och små isolerade naturfläckar.</p>
      <div class="habitat-strip"><span class="old"><b>FÖRR</b><small>stora sammanhängande habitat</small></span><b>→</b><span class="new"><b>NU</b><small>mindre och splittrade habitat</small></span></div>
      <p><b>Varför kan detta minska den biologiska mångfalden?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'När habitat försvinner eller splittras får arter <b>mindre plats, färre resurser och svårare att överleva och fortplanta sig</b>.',ok:true,feedback:'Rätt. Förlust av livsmiljöer är en viktig orsak till dagens artminskning.'},
      {label:'Arter blir automatiskt fler när deras habitat blir mindre.',ok:false,feedback:'Mindre livsutrymme brukar i stället öka pressen på populationerna.'},
      {label:'Habitat påverkar bara växter, aldrig djur.',ok:false,feedback:'Både växter och djur är beroende av lämpliga livsmiljöer.'},
      {label:'Biologisk mångfald betyder att alla arter måste leva på exakt samma plats.',ok:false,feedback:'Mångfald handlar om variation av arter och livsformer.'}
    ],extinctionQuestion);
  }
  function extinctionQuestion(){
    G.openPanel(`<div class="stamp">ARTARKIV F1</div><h2>Den sjätte artutrotningen</h2>
      <p>Jorden har haft flera stora perioder av artutrotning. Vad är den viktigaste skillnaden som materialet lyfter fram om den pågående artminskningen?</p>
      <div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Den pågående artminskningen drivs i stor utsträckning av <b>människans påverkan</b>, till exempel habitatförlust, överutnyttjande och klimatförändringar.',ok:true,feedback:'Precis. Det är också därför våra beslut kan minska trycket.'},
      {label:'Den orsakas enbart av asteroidnedslag.',ok:false,feedback:'Det gäller en tidigare massutrotning, inte den pågående utvecklingen.'},
      {label:'Den är helt opåverkad av markanvändning och fiske.',ok:false,feedback:'Just sådana aktiviteter lyfts fram som viktiga orsaker.'},
      {label:'Artutrotning betyder bara att en enskild individ dör.',ok:false,feedback:'En art är utdöd först när inga individer av arten finns kvar.'}
    ],()=>next(2,'speciesLoss','Artförlusten visar vad som står på spel. Nu ska du undersöka hur vår konsumtion skapar belastning.'));
  }

  function footprintStation(){
    G.openPanel(`<div class="stamp">FOTAVTRYCKSSTATION F2</div><h2>Två sätt att leva</h2>
      <p>Två fiktiva hushåll använder ekosystemtjänster på olika sätt.</p>
      <div class="footprint-compare">
        <div><b>HUSHÅLL A</b><span>stor bostad</span><span>många nya kläder</span><span>flera flygresor</span><span>hög konsumtion</span></div>
        <div><b>HUSHÅLL B</b><span>mindre bostad</span><span>färre nyköp</span><span>mest tåg/cykel</span><span>lägre konsumtion</span></div>
      </div>
      <p><b>Vilket hushåll har sannolikt störst ekologiskt fotavtryck?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'<b>Hushåll A</b>, eftersom dess konsumtion tar större mängder mark, vatten, råvaror och andra ekosystemtjänster i anspråk.',ok:true,feedback:'Ja. Fotavtrycket försöker beskriva resursanspråket bakom konsumtionen.'},
      {label:'Hushåll B, eftersom ett mindre fotavtryck alltid kräver mer resurser.',ok:false,feedback:'Det är tvärtom.'},
      {label:'De måste ha exakt samma fotavtryck eftersom de är lika många personer.',ok:false,feedback:'Konsumtionsmönstret spelar stor roll.'},
      {label:'Ekologiskt fotavtryck mäter bara skostorlek.',ok:false,feedback:'Begreppet beskriver resursanvändning, inte fötter.'}
    ],footprintMeaning);
  }
  function footprintMeaning(){
    G.openPanel(`<div class="stamp">FOTAVTRYCKSSTATION F2</div><h2>Vad mäter vi?</h2>
      <p><b>Vilken definition stämmer bäst?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Ett mått på <b>hur mycket av jordens resurser och ekosystemtjänster vår konsumtion tar i anspråk</b>.',ok:true,feedback:'Rätt. Ett större resursanspråk ger ett större ekologiskt fotavtryck.'},
      {label:'Hur många kilometer en person promenerar i naturen.',ok:false,feedback:'Det är inte vad begreppet betyder.'},
      {label:'Antalet arter i en skog.',ok:false,feedback:'Det beskriver biologisk mångfald, inte fotavtryck.'},
      {label:'Hur snabbt en population återhämtar sig.',ok:false,feedback:'Det beskriver resiliens.'}
    ],()=>next(3,'ecologicalFootprint','Konsumtion skapar ett gemensamt tryck. Vid fiskedammen kan du se vad som händer när alla tar så mycket de kan.'));
  }

  function commonsDock(){
    let freeRan=false,quotaRan=false;
    const simulate=(policy)=>{
      const free=policy==='free';
      const rows=free?
        [['Start','60','–','60'],['År 1','60','36','34'],['År 2','34','30','12'],['År 3','12','12','4']]:
        [['Start','60','–','60'],['År 1','60','18','55'],['År 2','55','18','52'],['År 3','52','18','50']];
      if(free)freeRan=true;else quotaRan=true;
      render(rows,free?'<b>Fri fångst:</b> varje lag försöker maximera sin egen fångst. Beståndet pressas snabbt.':'<b>Gemensam kvot:</b> lagen begränsar fångsten tillsammans. Beståndet hålls nära en nivå där det kan återhämta sig.');
    };
    const render=(rows,msg='Kör båda modellerna. Siffrorna är förenklade och används bara för att visa principen.')=>{
      G.openPanel(`<div class="stamp">GEMENSAM RESURS F3</div><h2>Tre fiskelag – en sjö</h2>
        <p>Tre grupper fiskar ur samma bestånd. Kör två <b>förenklade modeller</b> och jämför.</p>
        <div class="commons-controls"><button class="btn" id="runFree">Kör: fri fångst</button><button class="btn secondary" id="runQuota">Kör: gemensam kvot</button></div>
        ${rows?`<table class="field-table"><thead><tr><th>Tid</th><th>Bestånd före</th><th>Total fångst</th><th>Bestånd efter återväxt</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`:''}
        <div class="feedback hint">${msg}</div>
        ${freeRan&&quotaRan?'<div class="actions"><button class="btn yellow" id="interpretCommons">Tolka modellerna</button></div>':''}`);
      document.getElementById('runFree').onclick=()=>simulate('free');document.getElementById('runQuota').onclick=()=>simulate('quota');
      const i=document.getElementById('interpretCommons');if(i)i.onclick=commonsInterpret;
    };
    render(null);
  }
  function commonsInterpret(){
    G.openPanel(`<div class="stamp">GEMENSAM RESURS F3</div><h2>De allmänna tillgångarnas tragedi</h2>
      <p><b>Vilken förklaring passar bäst till simuleringen?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'När en resurs är <b>gemensam men varje aktör tjänar på att ta lite mer själv</b>, kan summan av allas val överutnyttja resursen. Gemensamma regler kan motverka det.',ok:true,feedback:'Precis. Vinsten är individuell men kostnaden delas av alla.'},
      {label:'Gemensamma resurser tar aldrig slut eftersom ingen äger dem.',ok:false,feedback:'Just avsaknaden av fungerande regler kan göra dem sårbara för överutnyttjande.'},
      {label:'Problemet uppstår bara om en enda person använder resursen.',ok:false,feedback:'Teorin handlar särskilt om många aktörer som delar samma begränsade resurs.'},
      {label:'En kvot gör automatiskt att fisken slutar fortplanta sig.',ok:false,feedback:'I modellen gav kvoten beståndet bättre möjlighet att återhämta sig.'}
    ],()=>next(4,'commonsTragedy','Gemensamma regler kan skydda resurser. Men vem ska få använda hur mycket? Följ markeringen till miljöutrymmesstationen.'));
  }

  function fairSpace(){
    G.openPanel(`<div class="stamp">MILJÖUTRYMME F4</div><h2>En begränsad budget</h2>
      <p>Förenklad modell: EKO-7:s säkra resursbudget är <b>6 enheter</b>. Tre samhällen använder idag tillsammans 7. Det fattigaste behöver samtidigt öka sin tillgång till rent vatten, mat och skydd.</p>
      <div class="resource-bars"><span><b>RIKT</b><i style="--v:4">4</i></span><span><b>MEDEL</b><i style="--v:2">2</i></span><span><b>FATTIGT</b><i style="--v:1">1</i></span></div>
      <p><b>Vilken förändring passar bäst med ett rättvist miljöutrymme och håller totalen inom 6?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Rikt samhälle <b>4 → 2</b>, medel stannar på 2, fattigt <b>1 → 2</b>. Total: 6.',ok:true,feedback:'Ja. De med störst fotavtryck minskar så att grundläggande behov kan öka där de är låga.'},
      {label:'Rikt 4 → 5, medel 2 → 2, fattigt 1 → 0. Total: 7.',ok:false,feedback:'Det varken minskar totalen eller ger det fattigaste samhället rimligt utrymme.'},
      {label:'Alla behåller exakt samma användning som idag. Total: 7.',ok:false,feedback:'Då ligger systemet fortfarande över den angivna gränsen.'},
      {label:'Fattigt 1 → 0 och övriga behåller allt.',ok:false,feedback:'Det går emot idén om att alla ska ha tillgång till grundläggande ekosystemtjänster.'}
    ],fairMeaning);
  }
  function fairMeaning(){
    G.openPanel(`<div class="stamp">MILJÖUTRYMME F4</div><h2>Vad betyder rättvist?</h2>
      <p><b>Vilken beskrivning stämmer bäst med begreppet rättvist miljöutrymme?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Alla människor bör ha möjlighet att få sina <b>grundläggande behov</b> tillgodosedda, samtidigt som den sammanlagda resursanvändningen hålls inom ekologiska gränser.',ok:true,feedback:'Precis. Rättvisa och ekologiska gränser måste hanteras samtidigt.'},
      {label:'Alla måste konsumera exakt samma produkter oavsett behov.',ok:false,feedback:'Begreppet handlar om rättigheter och resursutrymme, inte identiska inköpslistor.'},
      {label:'De som redan använder mest bör alltid få öka mest.',ok:false,feedback:'Det skulle öka trycket och lämna mindre utrymme åt andra.'},
      {label:'Ingen människa får använda några ekosystemtjänster.',ok:false,feedback:'Målet är hållbar användning, inte noll användning.'}
    ],()=>next(5,'fairSpace','Nu har du både ekologiska gränser och rättvisa. Sista fältstationen handlar om hur beslut kan hålla över tid.'));
  }

  function sustainabilityStation(){
    G.openPanel(`<div class="stamp">HÅLLBARHETSRÅDET F5</div><h2>Vilken plan håller?</h2>
      <p>Fyra förslag ligger på bordet. Välj det som bäst beskriver <b>hållbar utveckling</b>.</p>
      <div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Vi försöker ge människor ett gott liv idag, men använder resurser och ekosystem så att <b>framtida generationer också har möjlighet till ett gott liv</b>.',ok:true,feedback:'Det är kärnan i hållbar utveckling i materialet.'},
      {label:'Vi tar ut så mycket som möjligt nu och låter framtiden lösa problemen.',ok:false,feedback:'Det flyttar kostnaderna till framtida generationer.'},
      {label:'Hållbar utveckling betyder att all ekonomisk och social förändring måste stoppas.',ok:false,feedback:'Begreppet handlar om att utvecklingen ska ske inom hållbara ramar.'},
      {label:'Det räcker att en enda person minskar sin konsumtion; gemensamma regler behövs aldrig.',ok:false,feedback:'Många miljöproblem kräver samordning mellan människor, företag och länder.'}
    ],sustainableRules);
  }
  function sustainableRules(){
    G.openPanel(`<div class="stamp">HÅLLBARHETSRÅDET F5</div><h2>Från princip till regler</h2>
      <p>EKO-7 behöver fortfarande ge mat, råvaror och andra nyttor. Vilken styrning passar bäst med det du lärt dig?</p>
      <div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Följ belastningen, sätt <b>gemensamma regler och gränser</b>, skydda viktiga habitat och justera användningen när data visar att resiliensen försämras.',ok:true,feedback:'Ja. Det kombinerar användning med försiktighet och uppföljning.'},
      {label:'Låt varje aktör ta så mycket den hinner innan någon annan gör det.',ok:false,feedback:'Det riskerar samma problem som i allmänningarnas tragedi.'},
      {label:'Ignorera mätdata tills ekosystemet säkert har passerat en tipping point.',ok:false,feedback:'Då kan återhämtningen redan vara mycket svår.'},
      {label:'Maximera alltid en enda ekosystemtjänst och bortse från alla andra.',ok:false,feedback:'Det kan skapa nya konflikter och försvaga systemet.'}
    ],()=>next(6,'sustainableDevelopment','Du har alla delar. Återvänd till forskningsstationen och koppla ihop dem.'));
  }

  function analysis(){
    const defs={
      'Planetens gränser':'Ramar för hur hårt jordens system kan pressas utan att risken för stora förändringar ökar.',
      'Ekologiskt fotavtryck':'Ett mått på hur mycket resurser och ekosystemtjänster vår konsumtion tar i anspråk.',
      'Allmänningarnas tragedi':'En gemensam resurs riskerar att överutnyttjas när varje aktör tjänar på att ta mer själv.',
      'Rättvist miljöutrymme':'Alla ska kunna få grundläggande behov tillgodosedda inom de ekologiska gränserna.',
      'Hållbar utveckling':'Ett gott liv idag utan att förstöra möjligheterna för kommande generationer.'
    };
    const terms=Object.keys(defs),values=shuffled(Object.values(defs));
    G.openPanel(`<div class="stamp">SYSTEMANALYS 5</div><h2>Fem begrepp – ett system</h2>
      <p>Para ihop begreppen med rätt beskrivning.</p>
      <div class="match-table">${terms.map((t,i)=>`<label class="match-row concept"><b>${esc(t)}</b><select id="m5d${i}"><option value="">– välj beskrivning –</option>${values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label>`).join('')}</div>
      <div id="fb"></div><div class="actions"><button class="btn" id="checkM5">Kontrollera</button></div>`);
    document.getElementById('checkM5').onclick=()=>{
      const ok=terms.every((t,i)=>document.getElementById('m5d'+i).value===defs[t]);
      if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Någon koppling är fel. Fundera på om begreppet handlar om en gräns, ett mått, en gemensam resurs, rättvisa eller framtiden.</div>';return;}
      finalInterpretation();
    };
  }
  function finalInterpretation(){
    G.openPanel(`<div class="stamp">SYSTEMANALYS 5</div><h2>Vad säger EKO-7 oss?</h2>
      <p>Våtmarken dikades ut för mer mark. Monokulturen gav hög produktion. Fiske och andra resurser gav nytta. Varje beslut kunde verka rimligt för den som tog beslutet.</p>
      <p><b>Varför kan ändå helheten bli ohållbar?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Många enskilda beslut kan tillsammans <b>öka den totala belastningen</b> tills habitat, ekosystemtjänster och resiliens försvagas. Därför behövs gemensamma regler och användning inom ekologiska gränser.',ok:true,feedback:'Det är kärnan i Uppdrag 5 – från enskilda val till systemnivå.'},
      {label:'Om varje enskilt beslut ger en ekonomisk vinst kan ekosystemet aldrig skadas.',ok:false,feedback:'En lokal vinst kan samtidigt skapa kostnader för systemet och andra människor.'},
      {label:'Ekosystem påverkas bara av en enda faktor åt gången.',ok:false,feedback:'Hela spelet har visat hur flera faktorer och återkopplingar samverkar.'},
      {label:'Hållbarhet betyder att man aldrig behöver mäta eller följa upp något.',ok:false,feedback:'Tvärtom behövs kunskap om hur systemen reagerar.'}
    ],finish);
  }

  function finish(){
    G.addJournal('m5conclusion');
    S.journal=S.journal.filter(k=>k!=='m5intro');G.addJournal('m5resolved');
    S.mission5Complete=true;G.setStep(7);G.save();
    G.openPanel(`<div class="stamp">UPPDRAG 5 KLART</div><h2>Inom gränserna</h2>
      <div class="complete-banner"><div class="big">ALLT KAN INTE VÄXA FÖR EVIGT</div><p>Jordens ekosystem ger oss resurser och tjänster, men belastningen kan bli större än systemen klarar. Hållbarhet handlar därför både om ekologiska gränser, gemensamma regler och rättvisa.</p></div>
      <div class="systems-strip"><span>FOTAVTRYCK<br><small>vårt resursanspråk</small></span><b>→</b><span>GEMENSAMMA RESURSER<br><small>kräver regler</small></span><b>→</b><span>HÅLLBARHET<br><small>inom gränserna</small></span></div>
      <p>Nu vet du <b>hur EKO-7 fungerar</b>, <b>hur det har pressats</b> och <b>varför människorna är beroende av att systemet fortsätter fungera</b>.</p>
      <div class="next-hook">NÄSTA UPPDRAG: <b>ÅTERSTÄLL EKO-7</b><br>Du får begränsade resurser och måste välja vilka åtgärder som ger störst effekt på hela systemet.</div>
      <div class="actions"><button class="btn yellow" id="startM6">Starta finaluppdraget</button><button class="btn secondary" id="journalNow">Öppna fältjournalen</button><button class="btn secondary" id="worldNow">Tillbaka till världen</button></div>`);
    document.getElementById('startM6').onclick=()=>{if(window.EKO7_M6)window.EKO7_M6.start();};
    document.getElementById('journalNow').onclick=()=>{G.closePanel();G.showJournal(true);};
    document.getElementById('worldNow').onclick=G.closePanel;
  }

  function optional(p){
    G.openPanel(`<div class="stamp">FRIVILLIG OBSERVATION</div><h2>${esc(p.name)}</h2><p>${esc(p.text)}</p><div class="actions"><button class="btn" id="ok">Spara observation</button></div>`);
    document.getElementById('ok').onclick=()=>{S.optionalSeen[p.id]=true;G.save();G.closePanel();G.flash('Frivillig observation registrerad.');};
  }
  function interact(){
    const n=G.nearPlace();if(!n){G.flash('Inget att undersöka här. Följ den gula markeringen.');return;}
    if(n.kind==='optional'){optional(n.place);return;}
    const step=D.mission5Steps[S.step];if(!step||n.place.id!==step.target){G.flash('Det här är inte nästa huvudmål.');return;}
    [boundaryLab,biodiversityArchive,footprintStation,commonsDock,fairSpace,sustainabilityStation,analysis][S.step]();
  }

  window.EKO7_M5={start,interact};
})();
