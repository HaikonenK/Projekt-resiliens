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
      const b=document.createElement('button');b.className='choice';b.innerHTML=it.label;b.onclick=()=>{
        [...host.children].forEach(x=>x.disabled=true);
        if(it.ok){b.classList.add('correct');document.getElementById('fb').innerHTML='<div class="feedback yes">Rätt. '+(it.feedback||'')+'</div>';setTimeout(()=>onCorrect(it),550);}
        else{b.classList.add('wrong');document.getElementById('fb').innerHTML='<div class="feedback no">Inte riktigt. '+(it.feedback||'Försök igen.')+'</div>';setTimeout(()=>{[...host.children].forEach(x=>{x.disabled=false;x.classList.remove('wrong');});},700);}
      };host.appendChild(b);
    });
  }
  function next(step,journalKey,msg){if(journalKey)G.addJournal(journalKey);G.setStep(step);G.closePanel();G.flash(msg||'Ny fältmarkering tillagd.');}

  function start(){
    if(!S.journal.includes('m2intro'))G.addJournal('m2intro');
    S.mission2Complete=false;G.setMission(2,0);G.closePanel();
    G.flash('Uppdrag 2 startat. Följ den gula markeringen till gammelskogen.',3600);
  }

  function forest(){
    G.openPanel(`<div class="stamp">UPPDRAG 2</div><h2>Vem äter vem?</h2><p class="sub">Gammelskogen · Fältsektor B</p>
      <p class="scene">Stigen blir smalare. Mellan gamla granar och död ved står en väderbiten fältskylt. Här kartlade forskarna EKO-7:s födorelationer långt innan populationerna började förändras.</p>
      <div class="terminal"><b>FÖRSTA FRÅGAN</b><br>Vi vet redan att räven har minskat, harar och sorkar har ökat och växtbiomassan har minskat.<br><br>För att förstå om observationerna hänger ihop behöver vi först veta <b>hur energin och näringen förs mellan organismerna</b>.</div>
      <p><b>Vad ska vi kartlägga?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Vilka organismer som <b>äter vilka</b> och hur de bildar näringskedjor och näringsvävar.',ok:true,feedback:'Precis. Då kan vi följa en förändring genom systemet.'},
      {label:'Bara temperaturen i skogen.',ok:false,feedback:'Den kontrollerade vi redan i Uppdrag 1.'},
      {label:'Vilken art som är störst till kroppen.',ok:false,feedback:'Storlek säger inte hur arterna är kopplade i födoväven.'},
      {label:'Om alla organismer tillhör samma population.',ok:false,feedback:'En population innehåller bara individer av samma art.'}
    ],()=>next(1,null,'Först behöver vi hitta näringsvävens producenter.'));
  }

  function producerPlot(){
    const correct=new Set(['Gräs och örter','Blåbärsris','Björk']);const selected=new Set();
    G.openPanel(`<div class="stamp">PRODUCENTRUTA B2</div><h2>Var börjar näringsväven?</h2>
      <p>Fältgruppen har registrerat sex organismer i provrutan. Markera <b>alla producenter</b>.</p>
      <div id="speciesSelect" class="specimen-grid"></div><div id="fb"></div>
      <div class="actions"><button class="btn" id="checkProd">Kontrollera</button></div>`);
    const items=shuffled(['Gräs och örter','Blåbärsris','Björk','Hare','Svamp','Räv']);const host=document.getElementById('speciesSelect');
    items.forEach(name=>{const b=document.createElement('button');b.className='specimen-card';b.innerHTML=`<span class="specimen-icon">${name==='Räv'?'🦊':name==='Hare'?'🐇':name==='Svamp'?'🍄':'🌿'}</span><b>${name}</b>`;b.onclick=()=>{selected.has(name)?selected.delete(name):selected.add(name);b.classList.toggle('sel',selected.has(name));};host.appendChild(b);});
    document.getElementById('checkProd').onclick=()=>{
      const ok=selected.size===correct.size&&[...correct].every(x=>selected.has(x));
      if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Inte riktigt. Producenter tillverkar själva den energirika näring som sedan förs vidare i näringskedjan.</div>';return;}
      photosynthesis();
    };
  }
  function photosynthesis(){
    G.openPanel(`<div class="stamp">PRODUCENTRUTA B2</div><h2>Producenterna för in ny energi</h2>
      <div class="foodweb-mini"><div class="fw-sun">☀</div><div class="fw-arrow">↓</div><div class="fw-node plant">GRÖNA VÄXTER</div></div>
      <p>Varför är de gröna växterna basen i nästan alla ekosystem?</p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Genom <b>fotosyntesen</b> omvandlar de solenergi till kemisk energi i energirika ämnen.',ok:true,feedback:'Det är den energin konsumenterna senare får genom födan.'},
      {label:'De skapar ny materia ur ingenting.',ok:false,feedback:'Materia skapas inte ur ingenting. Växterna använder bland annat koldioxid och vatten.'},
      {label:'De får all sin energi genom att äta konsumenter.',ok:false,feedback:'Det beskriver inte producenter.'},
      {label:'De omvandlar kemisk energi till solenergi.',ok:false,feedback:'Energiomvandlingen går åt andra hållet i fotosyntesen.'}
    ],()=>next(2,'producers','Producenterna är kartlagda. Följ nu spåren efter vad som äter dem.'));
  }

  function feedingSite(){
    G.openPanel(`<div class="stamp">SPÅRPLATS B4</div><h2>Vem åt här?</h2><p class="sub">Avbitna skott · gnagda frön · hår · tasspår</p>
      <p>Koppla varje organism till den föda som bäst passar EKO-7:s förenklade näringsväv.</p>
      <div class="match-table">
        ${matchRow('m1','Hare','Gräs och blåbärsris',['Räv','Uggla'])}
        ${matchRow('m2','Sork','Frön och växtdelar',['Räv','Björkstam'])}
        ${matchRow('m3','Räv','Hare och sork',['Gräs','Svamp'])}
        ${matchRow('m4','Uggla','Sork',['Blåbärsris','Björklöv'])}
      </div><div id="fb"></div><div class="actions"><button class="btn" id="checkFeed">Kontrollera spåren</button></div>`);
    document.getElementById('checkFeed').onclick=()=>{
      const ok=['m1','m2','m3','m4'].every(id=>document.getElementById(id).value==='correct');
      if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Någon koppling stämmer inte. Fundera på om arten är växtätare eller rovdjur.</div>';return;}
      consumerCheck();
    };
  }
  function matchRow(id,name,correct,wrong){
    const opts=shuffled([{text:correct,value:'correct'},...wrong.map(text=>({text,value:'wrong'}))]);
    return `<label class="match-row"><b>${name}</b><span>äter främst</span><select id="${id}"><option value="">– välj –</option>${opts.map(o=>`<option value="${o.value}">${esc(o.text)}</option>`).join('')}</select></label>`;
  }
  function consumerCheck(){
    G.openPanel(`<div class="stamp">SPÅRPLATS B4</div><h2>Konsumenterna</h2><p>Hare och sork äter producenter. Räv och uggla äter andra konsumenter.</p><p><b>Vilket påstående är korrekt?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Hare och sork är <b>förstahandskonsumenter</b> eftersom de äter producenter.',ok:true,feedback:'Ja. De finns på trofinivån direkt ovanför producenterna.'},
      {label:'Räv och uggla är producenter eftersom de producerar kroppsvärme.',ok:false,feedback:'Producent betyder att organismen producerar energirik näring genom fotosyntes.'},
      {label:'Alla djur är nedbrytare.',ok:false,feedback:'Nedbrytare har en annan roll i systemet.'},
      {label:'Hare och sork är toppkonsumenter.',ok:false,feedback:'De äts själva av rovdjur.'}
    ],()=>next(3,'consumers','Födospåren är identifierade. Nu ska relationerna byggas ihop till en näringsväv.'));
  }

  function foodwebBoard(){
    chainRound(0);
  }
  function chainRound(round){
    const rounds=[
      {title:'Näringskedja A',cards:['Räv','Gräs och örter','Hare'],correct:['Gräs och örter','Hare','Räv'],hint:'Börja med producenten och följ sedan födan uppåt.'},
      {title:'Näringskedja B',cards:['Uggla','Sork','Blåbärsris'],correct:['Blåbärsris','Sork','Uggla'],hint:'Vilken organism tillverkar själv sin näring?'}
    ];
    const r=rounds[round],seq=[];
    function draw(){
      G.openPanel(`<div class="stamp">NÄRINGSVÄVSSTATION</div><h2>${r.title}</h2><p>Klicka organismerna i ordning från producent till rovdjur.</p>
        <div id="chainCards" class="chain-bank"></div><div class="chain-result">${seq.length?seq.map(esc).join(' <span>→</span> '):'…'}</div><div id="fb"></div>
        <div class="actions"><button class="btn" id="chainCheck" ${seq.length<3?'disabled':''}>Kontrollera</button><button class="btn secondary" id="chainReset">Rensa</button></div>`);
      const host=document.getElementById('chainCards');r.cards.forEach(name=>{const b=document.createElement('button');b.className='chain-card';b.textContent=name;b.disabled=seq.includes(name);b.onclick=()=>{seq.push(name);draw();};host.appendChild(b);});
      document.getElementById('chainReset').onclick=()=>{seq.length=0;draw();};
      document.getElementById('chainCheck').onclick=()=>{
        if(seq.join('|')!==r.correct.join('|')){seq.length=0;draw();document.getElementById('fb').innerHTML=`<div class="feedback no">Fel ordning. ${r.hint}</div>`;return;}
        if(round===0)setTimeout(()=>chainRound(1),350);else setTimeout(foodwebMeaning,350);
      };
    } draw();
  }
  function foodwebMeaning(){
    G.openPanel(`<div class="stamp">NÄRINGSVÄVSSTATION</div><h2>Två kedjor blir en väv</h2>
      <div class="web-diagram">
        <div class="web-row"><span class="web-node plant">GRÄS</span><span class="web-node plant">BLÅBÄR</span></div>
        <div class="web-arrows">↘ ↓ ↙</div>
        <div class="web-row"><span class="web-node herb">HARE</span><span class="web-node herb">SORK</span></div>
        <div class="web-arrows">↘ ↙ ↘</div>
        <div class="web-row"><span class="web-node pred">RÄV</span><span class="web-node pred">UGGLA</span></div>
      </div>
      <p><b>Varför är en näringsväv en bättre modell än en enda näringskedja?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Den visar att en art kan vara kopplad till <b>flera olika arter och flera näringskedjor samtidigt</b>.',ok:true,feedback:'Exakt. Därför kan en förändring sprida sig åt flera håll.'},
      {label:'Den visar att varje djur bara kan äta en enda art.',ok:false,feedback:'Det är tvärtom – väven visar flera kopplingar.'},
      {label:'Den visar bara de abiotiska faktorerna.',ok:false,feedback:'Näringsväven beskriver födorelationer mellan organismer.'},
      {label:'Den visar att energi återanvänds i ett perfekt kretslopp.',ok:false,feedback:'Energi och materia beter sig olika i ekosystem.'}
    ],()=>{G.addJournal('foodweb');G.addJournal('trophic');next(4,null,'Näringsväven är rekonstruerad. Men vad händer med allt som dör?');});
  }

  function decomposerLog(){
    const selected=new Set(),correct=new Set(['Svampar','Bakterier','Maskar och insekter']);
    G.openPanel(`<div class="stamp">NEDBRYTARPLATS</div><h2>Stocken som inte är "död"</h2><p>Den gamla stocken är full av organismer. Markera de grupper som kan fungera som <b>nedbrytare</b>.</p>
      <div id="decomp" class="specimen-grid"></div><div id="fb"></div><div class="actions"><button class="btn" id="checkDec">Kontrollera</button></div>`);
    const host=document.getElementById('decomp');shuffled(['Svampar','Bakterier','Maskar och insekter','Räv','Björk']).forEach(name=>{const b=document.createElement('button');b.className='specimen-card';b.innerHTML=`<span class="specimen-icon">${name==='Svampar'?'🍄':name==='Bakterier'?'◌':name==='Maskar och insekter'?'🪲':name==='Räv'?'🦊':'🌳'}</span><b>${name}</b>`;b.onclick=()=>{selected.has(name)?selected.delete(name):selected.add(name);b.classList.toggle('sel',selected.has(name));};host.appendChild(b);});
    document.getElementById('checkDec').onclick=()=>{
      const ok=selected.size===correct.size&&[...correct].every(x=>selected.has(x));if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Tänk på vilka organismer som bryter ned döda växter, djur och avföring till enklare ämnen.</div>';return;}matterEnergy();
    };
  }
  function matterEnergy(){
    G.openPanel(`<div class="stamp">NEDBRYTARPLATS</div><h2>Energi och materia går olika vägar</h2>
      <p>Nedbrytarna frigör näringsämnen som växterna kan ta upp igen. Men vad händer med energin?</p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'<b>Materia går i kretslopp</b>, medan energi hela tiden måste tillföras och så småningom lämnar systemet som värme.',ok:true,feedback:'Det är en av ekologins viktigaste skillnader.'},
      {label:'Både energi och materia går runt för alltid i samma kretslopp.',ok:false,feedback:'Energi försvinner gradvis från näringsväven som värme.'},
      {label:'Energi går i kretslopp men materia försvinner helt.',ok:false,feedback:'Det är tvärtom vad gäller kretsloppet.'},
      {label:'Nedbrytare skapar ny solenergi.',ok:false,feedback:'Ny energi kommer i nästan alla ekosystem från solen via fotosyntesen.'}
    ],()=>next(5,'decomposers','Dött material är kopplat tillbaka till producenterna. Nu följer vi energin upp genom trofinivåerna.'));
  }

  function energyStation(){
    G.openPanel(`<div class="stamp">ENERGISTATION</div><h2>Varför blir pyramiden smalare?</h2>
      <p>Forskarna använder 10–15 %-regeln som en förenklad modell.</p>
      <div class="energy-pyramid"><div class="ep top"><b>ROVDJUR</b><span>≈ 100–225</span></div><div class="ep mid"><b>VÄXTÄTARE</b><span>≈ 1 000–1 500</span></div><div class="ep base"><b>PRODUCENTER</b><span>10 000 energienheter</span></div></div>
      <p><b>Varför finns det mycket mindre energi högst upp?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Organismer använder det mesta av energin för att leva, röra sig och hålla igång cellerna. Mycket lämnar systemet som <b>värme</b>.',ok:true,feedback:'Därför förs bara ungefär 10–15 % vidare till nästa trofinivå.'},
      {label:'Rovdjur förstör medvetet all energi de inte behöver.',ok:false,feedback:'Energiförlusten beror på organismers livsprocesser, inte ett aktivt val.'},
      {label:'Producenter innehåller ingen kemisk energi.',ok:false,feedback:'Det är just där solenergin binds som kemisk energi.'},
      {label:'All energi försvinner redan mellan producent och förstahandskonsument.',ok:false,feedback:'En mindre del förs vidare – ungefär 10–15 % i den här förenklade modellen.'}
    ],()=>topConsumerCheck());
  }
  function topConsumerCheck(){
    G.openPanel(`<div class="stamp">ENERGISTATION</div><h2>Konsekvensen</h2><p>En räv behöver indirekt en mycket större mängd producenter än en hare gör.</p><p><b>Vilken slutsats följer av energipyramiden?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Populationer av toppkonsumenter blir oftast relativt små eftersom det finns mycket mindre tillgänglig energi på höga trofinivåer.',ok:true,feedback:'Precis – därför kan förändringar långt ned i näringsväven också begränsa rovdjuren.'},
      {label:'Det kan alltid finnas fler toppkonsumenter än producenter.',ok:false,feedback:'Energiförlusterna gör motsatsen vanlig.'},
      {label:'Trofinivåer påverkar inte hur många individer som kan försörjas.',ok:false,feedback:'Tillgänglig energi sätter tydliga begränsningar.'},
      {label:'Toppkonsumenter lever av solljus.',ok:false,feedback:'Deras energi har passerat flera organismer först.'}
    ],()=>{G.addJournal('energyflow');next(6,null,'Du har hela väven. Återvänd till stationen och testa hypotesen från Uppdrag 1.');});
  }

  function analysis(){
    const cards=['Växtbiomassan minskar','Räven minskar','Harar och sorkar ökar'];const seq=[];
    function draw(){
      G.openPanel(`<div class="stamp">ANALYSSTATION</div><h2>Rekonstruera förändringen</h2><p>Utgå från näringsväven. Klicka korten i den ordning som bäst beskriver en <b>möjlig</b> följd av att rävpopulationen minskar.</p>
        <div id="causeCards" class="chain-bank"></div><div class="chain-result">${seq.length?seq.map(esc).join(' <span>→</span> '):'…'}</div><div id="fb"></div>
        <div class="actions"><button class="btn" id="causeCheck" ${seq.length<3?'disabled':''}>Testa hypotesen</button><button class="btn secondary" id="causeReset">Rensa</button></div>`);
      const host=document.getElementById('causeCards');cards.forEach(name=>{const b=document.createElement('button');b.className='chain-card';b.textContent=name;b.disabled=seq.includes(name);b.onclick=()=>{seq.push(name);draw();};host.appendChild(b);});
      document.getElementById('causeReset').onclick=()=>{seq.length=0;draw();};
      document.getElementById('causeCheck').onclick=()=>{
        const correct=['Räven minskar','Harar och sorkar ökar','Växtbiomassan minskar'];
        if(seq.join('|')!==correct.join('|')){seq.length=0;draw();document.getElementById('fb').innerHTML='<div class="feedback no">Inte den mest rimliga kedjan. Börja med den förändring vi vill testa följderna av.</div>';return;}
        analysisLimit();
      };
    }draw();
  }
  function analysisLimit(){
    G.openPanel(`<div class="stamp">SYSTEMANALYS</div><h2>Näringsväven förklarar sambandet</h2>
      <div class="cause-strip"><span>RÄV ↓</span><b>→</b><span>HARE/SORK ↑</span><b>→</b><span>VÄXTBIO­MASSA ↓</span></div>
      <p>Detta är en rimlig ekologisk förklaring till observationerna från Uppdrag 1. Men hur stark är slutsatsen?</p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Vi har visat en <b>möjlig orsakskedja</b>, men vi vet ännu inte varför räven minskade eller om systemet kommer att stabiliseras.',ok:true,feedback:'Bra. Nästa fråga måste handla om hur populationerna återkopplar på varandra.'},
      {label:'Vi har bevisat att räven ensam orsakade alla förändringar i EKO-7.',ok:false,feedback:'En näringsväv visar samband, men det räcker inte för att bevisa en enda ursprunglig orsak.'},
      {label:'Vi kan nu bortse från alla andra arter och miljöfaktorer.',ok:false,feedback:'Ekosystem består just av många sammankopplade faktorer.'},
      {label:'Näringsväven visar att populationer aldrig påverkar varandra.',ok:false,feedback:'Det är motsatsen till vad våra data visar.'}
    ],()=>finish());
  }

  function finish(){
    G.addJournal('m2conclusion');
    S.journal=S.journal.filter(k=>k!=='m2intro');G.addJournal('m2resolved');
    S.mission2Complete=true;G.setStep(7);G.save();
    G.openPanel(`<div class="stamp">UPPDRAG 2 KLART</div><h2>Vem äter vem?</h2>
      <div class="complete-banner"><div class="big">NÄRINGSVÄVEN REKONSTRUERAD</div><p>Observationerna från Uppdrag 1 passar ihop med EKO-7:s födorelationer.</p></div>
      <div class="cause-strip"><span>RÄV ↓</span><b>→</b><span>HARE/SORK ↑</span><b>→</b><span>VÄXTBIO­MASSA ↓</span></div>
      <p>Du har också visat att producenter för in energi, att konsumenter för energin vidare, att nedbrytare för materia tillbaka till kretsloppen och att energin minskar kraftigt mellan trofinivåerna.</p>
      <div class="next-hook">NÄSTA UPPDRAG: <b>SYSTEMET REAGERAR</b><br>Om rovdjuren blir färre och bytesdjuren fler – vad händer sedan? Kan systemet stabilisera sig självt, eller kan förändringen förstärkas tills ett tröskelvärde passeras?</div>
      <div class="actions"><button class="btn yellow" id="startM3">Starta Uppdrag 3</button><button class="btn secondary" id="journalNow">Öppna fältjournalen</button><button class="btn secondary" id="worldNow">Tillbaka till världen</button></div>`);
    document.getElementById('startM3').onclick=()=>{if(window.EKO7_M3)window.EKO7_M3.start();};
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
    const step=D.mission2Steps[S.step];if(!step||n.place.id!==step.target){G.flash('Det här är inte nästa huvudmål.');return;}
    [forest,producerPlot,feedingSite,foodwebBoard,decomposerLog,energyStation,analysis][S.step]();
  }

  window.EKO7_M2={start,interact};
})();
