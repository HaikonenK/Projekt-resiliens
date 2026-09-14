(function(){
  'use strict';
  const G=window.EKO7,S=G.state,D=window.EKO7_DATA;

  function esc(s){return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));}
  function shuffled(items){
    const a=[...items];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function choices(items,onCorrect){
    const host=document.getElementById('choices');
    shuffled(items).forEach(it=>{
      const b=document.createElement('button');b.className='choice';b.innerHTML=it.label;
      b.onclick=()=>{
        [...host.children].forEach(x=>x.disabled=true);
        if(it.ok){
          b.classList.add('correct');
          document.getElementById('fb').innerHTML='<div class="feedback yes">Rätt. '+(it.feedback||'')+'</div>';
          setTimeout(()=>onCorrect(it),560);
        }else{
          b.classList.add('wrong');
          document.getElementById('fb').innerHTML='<div class="feedback no">Inte riktigt. '+(it.feedback||'Försök igen.')+'</div>';
          setTimeout(()=>{[...host.children].forEach(x=>{x.disabled=false;x.classList.remove('wrong');});},720);
        }
      };
      host.appendChild(b);
    });
  }
  function next(step,journalKey,msg){
    if(journalKey)G.addJournal(journalKey);
    G.setStep(step);G.closePanel();G.flash(msg||'Ny fältmarkering tillagd.');
  }

  function start(){
    if(!S.journal.includes('m4intro'))G.addJournal('m4intro');
    S.mission4Complete=false;G.setMission(4,0);G.closePanel();
    G.flash('Uppdrag 4 startat. Följ den gula markeringen till våtmarken.',3600);
  }

  function wetland(){
    G.openPanel(`<div class="stamp">UPPDRAG 4</div><h2>Vad förlorar vi?</h2><p class="sub">Våtmarken · Fältsektor E</p>
      <p class="scene">Ett gammalt dike leder vatten från jordbruksområdet mot sjön. Bredvid diket ligger resterna av en grund våtmark med vass, starr och mörk, vattenmättad jord.</p>
      <div class="terminal"><b>HISTORISKA MÄTNINGAR</b><br>Före våtmark: kväve 8,4 mg/L · fosfor 0,42 mg/L<br>Efter våtmark: kväve 3,1 mg/L · fosfor 0,16 mg/L</div>
      <p><b>Vilken slutsats stöds bäst av mätningarna?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Våtmarken <b>fångade upp en del näringsämnen</b> innan vattnet nådde sjön.',ok:true,feedback:'Ja. Växter, mikroorganismer och sediment i våtmarker kan hålla kvar näringsämnen.'},
      {label:'Våtmarken skapade kväve och fosfor så att halterna blev högre.',ok:false,feedback:'Mätningarna visar tvärtom lägre halter efter våtmarken.'},
      {label:'Våtmarken gjorde vattnet varmare, därför försvann näringsämnena.',ok:false,feedback:'Temperaturen förklarar inte den tydliga minskningen här.'},
      {label:'Näringsämnen kan bara försvinna om alla organismer i området dör.',ok:false,feedback:'Näringsämnen kan tas upp, bindas och lagras i systemet.'}
    ],wetlandService);
  }

  function wetlandService(){
    G.openPanel(`<div class="stamp">FÄLTSEKTOR E</div><h2>En osynlig tjänst</h2>
      <p>Forskarna beskrev våtmarkens förmåga att fånga upp näringsämnen som en nytta för både sjön och människorna som använder vattnet.</p>
      <p><b>Vad är en ekosystemtjänst?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'En <b>nyttighet eller funktion som ett ekosystem bidrar med till människor</b>, till exempel pollinering, rent vatten eller råvaror.',ok:true,feedback:'Precis. Tjänsten kan vara viktig även om vi sällan tänker på den.'},
      {label:'Ett arbete som människor måste göra åt naturen varje vecka.',ok:false,feedback:'Det är ekosystemet som bidrar med tjänsten.'},
      {label:'Ett annat ord för att köpa ekologiska produkter.',ok:false,feedback:'Begreppet handlar om funktioner och nyttigheter från ekosystem.'},
      {label:'En tjänst som bara finns i nationalparker.',ok:false,feedback:'Ekosystemtjänster finns i skogar, åkrar, våtmarker, sjöar, hav och många andra miljöer.'}
    ],()=>{G.addJournal('ecosystemService');next(1,null,'Våtmarken renade vatten. Kontrollera om tjänsten fortfarande fungerar lika bra.');});
  }

  function wetlandSensor(){
    G.openPanel(`<div class="stamp">UTLOPPSSENSOR E1</div><h2>När vattnet tar en genväg</h2>
      <p>Ett nytt, rakt dräneringsdike leder numera större delen av vattnet förbi den grunda våtmarken.</p>
      <table class="field-table"><thead><tr><th>Mätning</th><th>Förr – efter våtmark</th><th>Nu – efter diket</th></tr></thead><tbody>
        <tr><td>Kväve</td><td>3,1 mg/L</td><td>7,8 mg/L</td></tr>
        <tr><td>Fosfor</td><td>0,16 mg/L</td><td>0,39 mg/L</td></tr>
      </tbody></table>
      <p><b>Vad innebär förändringen sannolikt för sjön?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Mer kväve och fosfor når sjön, vilket kan <b>öka belastningen och bidra till övergödning</b>.',ok:true,feedback:'Ja. Den vattenrenande ekosystemtjänsten har försvagats.'},
      {label:'Sjön får automatiskt färre näringsämnen när diket blir rakare.',ok:false,feedback:'Mätningarna visar tvärtom att mer når utloppet.'},
      {label:'Det påverkar bara jordbruket och kan inte påverka sjön.',ok:false,feedback:'Vattnet för näringsämnen vidare mellan delarna av landskapet.'},
      {label:'Kväve och fosfor är rovdjur och äter därför upp fiskarna.',ok:false,feedback:'Det är näringsämnen, inte organismer.'}
    ],()=>{G.addJournal('wetlandService');next(2,null,'Spåret förklarar en del av sjöbelastningen. Men fler tjänster verkar ha försvagats.');});
  }

  function pollinatorMeadow(){
    G.openPanel(`<div class="stamp">POLLINATÖRSÄNG E2</div><h2>Blommor utan besökare</h2>
      <p class="scene">Mellan åkern och skogsbrynet finns en smal remsa med klöver, prästkrage och andra blommande växter. Den gamla inventeringen jämförde området med åkerkanten.</p>
      <table class="field-table"><thead><tr><th>Plats</th><th>Blommande arter</th><th>Pollinatörbesök / 10 min</th></tr></thead><tbody>
        <tr><td>Blomrik kantzon</td><td>14</td><td>38</td></tr>
        <tr><td>Monokulturens mitt</td><td>1</td><td>5</td></tr>
      </tbody></table>
      <p><b>Vilken ekosystemtjänst syns tydligast här?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'<b>Pollinering</b> – insekter hjälper fröväxter och många grödor att fortplanta sig.',ok:true,feedback:'Rätt. Utan pollinatörer skulle många grödor ge sämre skörd eller kräva dyr hjälp av människor.'},
      {label:'Bärförmåga – bina bär pollen på ryggen.',ok:false,feedback:'Bärförmåga handlar om hur stor population ett ekosystem kan försörja.'},
      {label:'Anrikning – pollen samlas i högre halt för varje trofinivå.',ok:false,feedback:'Det är ett annat ekologiskt begrepp.'},
      {label:'Tipping point – varje blomma är en tipping point.',ok:false,feedback:'Här undersöker vi en ekosystemtjänst.'}
    ],pollinatorReason);
  }

  function pollinatorReason(){
    G.openPanel(`<div class="stamp">POLLINATÖRSÄNG E2</div><h2>Varför skiljer sig platserna?</h2>
      <p>Blomremsan innehåller många växtarter, skyddade småytor och blomning under en längre del av säsongen. Mitt ute i åkern finns nästan bara en gröda.</p>
      <p><b>Vilken förklaring är bäst?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'En mer varierad miljö ger <b>fler möjliga habitat och ekologiska nischer</b>, vilket kan gynna fler arter.',ok:true,feedback:'Precis. Variation i miljön skapar fler sätt att leva.'},
      {label:'Pollinatörer kan bara leva där människor har satt upp en skylt.',ok:false,feedback:'Det är tillgången på resurser och livsmiljöer som spelar roll.'},
      {label:'Ju färre växtarter det finns, desto fler nischer skapas automatiskt.',ok:false,feedback:'Färre strukturer och resurser betyder oftast färre möjliga nischer.'},
      {label:'Alla insekter har exakt samma habitat och nisch.',ok:false,feedback:'Olika arter har olika krav och sätt att utnyttja miljön.'}
    ],()=>{G.addJournal('pollination');next(3,null,'Pollinatörerna behöver variation. Undersök nu själva jordbrukslandskapet.');});
  }

  function farm(){
    G.openPanel(`<div class="stamp">JORDBRUKSSEKTOR E3</div><h2>När landskapet blir ensidigt</h2>
      <div class="landscape-compare">
        <div class="landscape-card diverse"><b>Äldre odlingslandskap</b><span>små åkrar · diken · buskar · åkerholmar · flera grödor</span><strong>många småbiotoper</strong></div>
        <div class="landscape-card mono"><b>Nuvarande odling</b><span>en gröda · stora sammanhängande fält · få kantzoner</span><strong>monokultur</strong></div>
      </div>
      <p><b>Vad menas med en monokultur?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Ett stort sammanhängande område där <b>en enda art eller gröda odlas</b>.',ok:true,feedback:'Ja. Det förenklar landskapet och kan minska livsutrymmet för andra arter.'},
      {label:'En liten yta med många olika växtarter.',ok:false,feedback:'Det beskriver snarare en mer varierad miljö.'},
      {label:'En skog där alla arter får växa fritt.',ok:false,feedback:'Det är inte definitionen av monokultur.'},
      {label:'Ett område där bara rovdjur får leva.',ok:false,feedback:'Begreppet handlar om odling av en art.'}
    ],biodiversityQuestion);
  }

  function biodiversityQuestion(){
    G.openPanel(`<div class="stamp">JORDBRUKSSEKTOR E3</div><h2>Vad händer med mångfalden?</h2>
      <p>När åkerholmar, diken, stenrösen och blomrika kanter tas bort försvinner många små livsmiljöer.</p>
      <p><b>Vilken beskrivning av biologisk mångfald stämmer bäst?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'En stor <b>variation av arter och livsformer</b> i naturen.',ok:true,feedback:'Rätt. Fler typer av livsmiljöer kan ge plats åt fler arter.'},
      {label:'Att alla individer i ett område tillhör samma art.',ok:false,feedback:'Det är motsatsen till hög biologisk mångfald.'},
      {label:'Att alla arter är lika stora.',ok:false,feedback:'Mångfald handlar inte om kroppsstorlek.'},
      {label:'Att ett ekosystem aldrig förändras.',ok:false,feedback:'Ekosystem är dynamiska även när de är artrika.'}
    ],()=>{G.addJournal('biodiversity');G.addJournal('monoculture');next(4,null,'Jordbruket visar samma mönster som nästa plats: hög produktion kan göra miljön mer ensidig.');});
  }

  function forestCompare(){
    G.openPanel(`<div class="stamp">SKOGSSEKTOR D</div><h2>Två skogar – två helt olika miljöer</h2>
      <div class="forest-compare">
        <div class="forest-card natural"><b>NATURSKOG</b><ul><li>träd i många åldrar</li><li>gran, tall, björk och asp</li><li>död ved och gamla stubbar</li><li>gläntor och tätare partier</li></ul></div>
        <div class="forest-card planted"><b>ODLAD SKOG</b><ul><li>nästan bara gran</li><li>träden är ungefär lika gamla</li><li>lite död ved</li><li>planterad för virkesproduktion</li></ul></div>
      </div>
      <p><b>Varför kan naturskogen innehålla fler arter?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Variation i trädslag, ålder, ljus och död ved skapar <b>fler habitat och ekologiska nischer</b>.',ok:true,feedback:'Ja. Den större variationen ger fler arter möjlighet att hitta en plats att leva på.'},
      {label:'Gamla träd producerar alltid mer virke än planterad skog.',ok:false,feedback:'Frågan handlar om livsmiljöer och mångfald, inte maximal virkesproduktion.'},
      {label:'Alla arter behöver exakt samma typ av träd.',ok:false,feedback:'Arter har olika habitat och nischer.'},
      {label:'Död ved gör att inga organismer kan leva i skogen.',ok:false,feedback:'Död ved är tvärtom livsmiljö och föda för många svampar och insekter.'}
    ],forestTradeoff);
  }

  function forestTradeoff(){
    G.openPanel(`<div class="stamp">SKOGSSEKTOR D</div><h2>Konflikten</h2>
      <p>Den odlade skogen kan ge mycket virke – vilket också är en ekosystemtjänst. Naturskogen ger samtidigt livsmiljöer åt fler arter och bidrar med andra tjänster.</p>
      <p><b>Vilken slutsats är mest rimlig?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Olika sätt att använda ett ekosystem kan ge <b>olika nyttor men också konflikter</b>. Mer virkesproduktion kan till exempel minska vissa livsmiljöer.',ok:true,feedback:'Precis. Ekosystemtjänster behöver ofta vägas mot varandra.'},
      {label:'Om skogen ger virke har den inga andra ekologiska funktioner.',ok:false,feedback:'Samma ekosystem kan bidra med flera tjänster samtidigt.'},
      {label:'Biologisk mångfald och virkesproduktion är alltid exakt samma sak.',ok:false,feedback:'De kan ibland gynnas tillsammans men är inte samma sak.'},
      {label:'Det bästa ekologiska beslutet är alltid att aldrig använda skog.',ok:false,feedback:'Poängen är att förstå avvägningar och hur olika användning påverkar systemet.'}
    ],()=>{G.addJournal('naturalForest');next(5,null,'Du har sett flera tjänster. Nu ska hela området revideras.');});
  }

  function serviceStation(){
    const pairs={
      'Våtmark':'Fångar upp näringsämnen och bidrar till renare vatten',
      'Pollinerande insekter':'Pollinerar grödor och vilda fröväxter',
      'Skog':'Ger bland annat virke och tar upp koldioxid genom fotosyntes',
      'Sjö':'Ger bland annat fisk och vatten'
    };
    const left=Object.keys(pairs), right=shuffled(Object.values(pairs));
    G.openPanel(`<div class="stamp">EKOSYSTEMTJÄNSTSTATION E4</div><h2>Revision av EKO-7</h2>
      <p>Para ihop varje del av ekosystemet med en tjänst den bidrar med.</p>
      <div class="match-table">${left.map((k,i)=>`<label class="match-row service"><b>${esc(k)}</b><select id="svc${i}"><option value="">– välj tjänst –</option>${right.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label>`).join('')}</div>
      <div id="fb"></div><div class="actions"><button class="btn" id="checkServices">Kontrollera</button></div>`);
    document.getElementById('checkServices').onclick=()=>{
      const ok=left.every((k,i)=>document.getElementById('svc'+i).value===pairs[k]);
      if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Någon koppling är fel. Fråga dig vad människan faktiskt får från just den delen av ekosystemet.</div>';return;}
      serviceMeaning();
    };
  }

  function serviceMeaning(){
    G.openPanel(`<div class="stamp">EKOSYSTEMTJÄNSTSTATION E4</div><h2>Det viktiga sambandet</h2>
      <p>Vattenrening, pollinering, virke och fisk ser ut som helt olika saker. Men de har något gemensamt.</p>
      <p><b>Vilken slutsats binder ihop dem?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'De är beroende av att <b>ekosystemen fortsätter fungera</b>. Om vi förändrar systemen kraftigt kan tjänsterna försämras eller försvinna.',ok:true,feedback:'Precis. Därför är biologisk mångfald och fungerande ekosystem inte bara en fråga om "fin natur".'},
      {label:'Alla tjänster kan alltid ersättas gratis av maskiner.',ok:false,feedback:'Vissa går att ersätta delvis, men ofta till stor kostnad och inte alltid alls.'},
      {label:'Ekosystemtjänster påverkar bara andra djur, inte människor.',ok:false,feedback:'Begreppet beskriver just nyttan som människor får från ekosystem.'},
      {label:'Ju mer vi förändrar naturen, desto fler tjänster får vi automatiskt.',ok:false,feedback:'Viss användning ger produkter, men andra tjänster kan samtidigt försämras.'}
    ],()=>next(6,'serviceAudit','Revisionen är klar. Återvänd till forskningsstationen och bygg hela orsakskedjan.'));
  }

  function analysis(){
    const chains=[
      {cause:'Våtmark dikas ut',effect:'Mer kväve och fosfor når sjön',service:'Vattenreningen försvagas'},
      {cause:'Småbiotoper och blomremsor försvinner',effect:'Färre pollinatörer hittar mat och boplatser',service:'Pollineringen försvagas'},
      {cause:'Skogen blir likåldrig och ensidig',effect:'Färre habitat och nischer',service:'Biologisk mångfald minskar'}
    ];
    const effects=shuffled(chains.map(c=>c.effect)),services=shuffled(chains.map(c=>c.service));
    G.openPanel(`<div class="stamp">SYSTEMANALYS 4</div><h2>Bygg tre orsakskedjor</h2>
      <p>Koppla varje mänsklig förändring till en ekologisk följd och vad som sedan riskerar att försvagas.</p>
      <div class="cause-match">${chains.map((c,i)=>`<div class="cause-row"><b>${esc(c.cause)}</b><span>→</span><select id="eff${i}"><option value="">– ekologisk följd –</option>${effects.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select><span>→</span><select id="ser${i}"><option value="">– konsekvens/tjänst –</option>${services.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></div>`).join('')}</div>
      <div id="fb"></div><div class="actions"><button class="btn" id="checkChains">Analysera</button></div>`);
    document.getElementById('checkChains').onclick=()=>{
      const ok=chains.every((c,i)=>document.getElementById('eff'+i).value===c.effect&&document.getElementById('ser'+i).value===c.service);
      if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Någon kedja är fel. Följ först vad som händer ekologiskt – och sedan vilken nytta som påverkas.</div>';return;}
      finalInterpretation();
    };
  }

  function finalInterpretation(){
    G.openPanel(`<div class="stamp">SYSTEMANALYS 4</div><h2>Vad är problemet egentligen?</h2>
      <p>Forskningsstationen sammanfattar fynden: jordbruk och skogsbruk ger oss mat och råvaror. Samtidigt har vissa förändringar i landskapet minskat andra funktioner.</p>
      <p><b>Vilken slutsats är bäst?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Människan är <b>beroende av ekosystemen</b>. Om vi utnyttjar dem på ett sätt som förstör habitat, mångfald och återkopplingar kan vi också förlora tjänster som rent vatten, pollinering och stabila fiskbestånd.',ok:true,feedback:'Det är kärnan i Uppdrag 4.'},
      {label:'Människan står utanför ekosystemen och påverkas inte av vad som händer där.',ok:false,feedback:'Vi är beroende av mat, vatten, råvaror, pollinering och många andra ekosystemtjänster.'},
      {label:'All mänsklig användning av naturen är automatiskt skadlig.',ok:false,feedback:'Frågan handlar om hur mycket och på vilket sätt vi använder systemen.'},
      {label:'Hög produktion av en enda vara betyder alltid att alla andra ekosystemtjänster blir bättre.',ok:false,feedback:'Olika nyttor kan stå i konflikt med varandra.'}
    ],finish);
  }

  function finish(){
    G.addJournal('m4conclusion');
    S.journal=S.journal.filter(k=>k!=='m4intro');G.addJournal('m4resolved');
    S.mission4Complete=true;G.setStep(7);G.save();
    G.openPanel(`<div class="stamp">UPPDRAG 4 KLART</div><h2>Vad förlorar vi?</h2>
      <div class="complete-banner"><div class="big">VI STÅR INTE UTANFÖR EKOSYSTEMET</div><p>Våtmarken renar vatten. Insekter pollinerar. Skogar ger både råvaror och livsmiljöer. När systemen förenklas kan också tjänsterna försvagas.</p></div>
      <div class="service-strip"><span>VÅTMARK<br><small>renare vatten</small></span><b>·</b><span>POLLINATÖRER<br><small>grödor</small></span><b>·</b><span>SKOG<br><small>virke + livsmiljöer</small></span></div>
      <p>Men EKO-7 lämnar oss med en större fråga. Vi behöver mat, virke och andra resurser. <b>Hur mycket kan vi använda utan att pressa systemen förbi deras gränser?</b></p>
      <div class="next-hook">NÄSTA UPPDRAG: <b>INOM GRÄNSERNA</b><br>Planetens gränser, ekologiskt fotavtryck, gemensamma resurser och hållbar utveckling.</div>
      <div class="actions"><button class="btn yellow" id="startM5">Starta Uppdrag 5</button><button class="btn secondary" id="journalNow">Öppna fältjournalen</button><button class="btn secondary" id="worldNow">Tillbaka till världen</button></div>`);
    document.getElementById('startM5').onclick=()=>{if(window.EKO7_M5)window.EKO7_M5.start();};
    document.getElementById('journalNow').onclick=()=>{G.closePanel();G.showJournal(true);};
    document.getElementById('worldNow').onclick=G.closePanel;
  }

  function optional(p){
    G.openPanel(`<div class="stamp">FRIVILLIG OBSERVATION</div><h2>${esc(p.name)}</h2><p>${esc(p.text)}</p><div class="actions"><button class="btn" id="ok">Spara observation</button></div>`);
    document.getElementById('ok').onclick=()=>{S.optionalSeen[p.id]=true;G.save();G.closePanel();G.flash('Frivillig observation registrerad.');};
  }

  function interact(){
    const n=G.nearPlace();
    if(!n){G.flash('Inget att undersöka här. Följ den gula markeringen.');return;}
    if(n.kind==='optional'){optional(n.place);return;}
    const step=D.mission4Steps[S.step];
    if(!step||n.place.id!==step.target){G.flash('Det här är inte nästa huvudmål.');return;}
    [wetland,wetlandSensor,pollinatorMeadow,farm,forestCompare,serviceStation,analysis][S.step]();
  }

  window.EKO7_M4={start,interact};
})();