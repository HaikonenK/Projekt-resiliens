(function(){
  'use strict';
  const G=window.EKO7, S=G.state, D=window.EKO7_DATA;

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
  function dataTable(rows,heads=['Mätning','Tidigare','Nu','Förändring']){
    return `<table class="data-table"><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map((x,i)=>`<td class="${i===3?(x.includes('↓')?'trend-down':x.includes('↑')?'trend-up':'trend-flat'):''}">${esc(x)}</td>`).join('')}</tr>`).join('')}</table>`;
  }
  function nextStep(step,journalKey,message){if(journalKey)G.addJournal(journalKey);G.setStep(step);G.closePanel();G.flash(message||'Ny uppdragsmarkering tillagd.');}

  function climate(){
    G.openPanel(`<div class="stamp">MÄTSTATION 01</div><h2>Klimatstationen</h2><p class="sub">Skogsbrynet · automatiska mätningar</p><p>Stationen registrerar fyra faktorer. Vilket påstående beskriver dem bäst?</p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Temperatur, nederbörd, vind och ljus är <b>abiotiska faktorer</b>.',ok:true,feedback:'De är icke-levande delar av miljön.'},
      {label:'De är <b>biotiska faktorer</b> eftersom de påverkar organismer.',ok:false,feedback:'Biotiska faktorer är sådant som lever.'},
      {label:'De är olika <b>populationer</b>.',ok:false,feedback:'En population består av individer av samma art.'},
      {label:'De är olika <b>habitat</b>.',ok:false,feedback:'Habitat är den miljö en viss art behöver för att leva.'}
    ],()=>setTimeout(climateReadings,250));
  }
  function climateReadings(){
    G.openPanel(`<div class="stamp">MÄTSTATION 01</div><h2>Klimatdata</h2><p>Jämför samma period förra året med årets mätningar.</p>${dataTable(D.readings.climate)}<p><b>Vilken slutsats stöds bäst av mätningarna?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Klimatet verkar ha förändrats dramatiskt.',ok:false,feedback:'Skillnaderna är små.'},
      {label:'Ingen större förändring i de abiotiska faktorerna syns här.',ok:true,feedback:'Då behöver vi undersöka de levande delarna av ekosystemet.'},
      {label:'Rovdjuren måste ha blivit fler.',ok:false,feedback:'Klimatstationen mäter inte djurpopulationer.'},
      {label:'Ekosystemet har passerat en tipping point.',ok:false,feedback:'Det finns inte tillräckligt med information för den slutsatsen.'}
    ],()=>nextStep(1,'climate','Klimatet ser normalt ut. Nytt uppdrag: undersök vegetationen.'));
  }

  function vegetation(){
    G.openPanel(`<div class="stamp">PROVRUTA A3</div><h2>Ängens vegetation</h2><p>Du står i en markerad provruta. Här finns gräs, örter, blåbärsris, små björkplantor och insekter.</p><p><b>Vad har dessa gemensamt?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'De är alla <b>biotiska faktorer</b>.',ok:true,feedback:'De är levande delar av ekosystemet.'},
      {label:'De är alla <b>abiotiska faktorer</b>.',ok:false,feedback:'Abiotiska faktorer är icke-levande.'},
      {label:'De tillhör samma <b>population</b>.',ok:false,feedback:'De är flera olika arter.'},
      {label:'De har samma <b>ekologiska nisch</b>.',ok:false,feedback:'Olika arter använder miljön på olika sätt.'}
    ],()=>setTimeout(vegetationBiomass,250));
  }
  function vegetationBiomass(){
    G.openPanel(`<div class="stamp">PROVRUTA A3</div><h2>Biomassan har förändrats</h2><p>Forskarna har vägt allt växtmaterial i provrutan.</p>${dataTable(D.readings.biomass,['Vegetation','Förra året','I år','Förändring'])}<p><b>Vad betyder biomassa i det här sammanhanget?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Den sammanlagda massan av levande organismer i området.',ok:true,feedback:'Precis. Här tittar vi på växternas sammanlagda massa.'},
      {label:'Antalet olika arter i området.',ok:false,feedback:'Det beskriver biologisk mångfald, inte biomassa.'},
      {label:'Hur mycket energi solen ger området.',ok:false,feedback:'Biomassa mäter massa, inte solenergi.'},
      {label:'Hur många individer som finns av en enda art.',ok:false,feedback:'Det handlar om populationens storlek.'}
    ],()=>nextStep(2,'vegetation','Växtbiomassan har minskat. Datorn pekar ut viltkamerorna.'));
  }

  function camera(){
    G.openPanel(`<div class="stamp">KAMERASTATION 04</div><h2>Viltkamerorna</h2><p>Automatiken har räknat hur många gånger olika arter registrerats under samma period.</p>${dataTable(D.readings.wildlife,['Art','Förra året','I år','Förändring'])}<p><b>Vilket mönster sticker ut mest?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Alla arter minskar ungefär lika mycket.',ok:false,feedback:'Titta särskilt på hare och räv.'},
      {label:'Växtätarna ökar samtidigt som rävobservationerna minskar kraftigt.',ok:true,feedback:'Det är ett tydligt spår att följa.'},
      {label:'Räven har blivit den vanligaste arten.',ok:false,feedback:'Räven går åt motsatt håll.'},
      {label:'Mätningarna visar inga förändringar alls.',ok:false,feedback:'Flera förändringar är stora.'}
    ],()=>setTimeout(populationCheck,250));
  }
  function populationCheck(){
    G.openPanel(`<div class="stamp">BEGREPPSKONTROLL</div><h2>Vad är en population?</h2><p>Innan vi går vidare måste rapporten använda begreppet korrekt.</p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'En enda räv i EKO-7.',ok:false,feedback:'Det är en individ.'},
      {label:'Alla rävar i EKO-7.',ok:true,feedback:'Samma art inom samma område = population.'},
      {label:'Alla djur i EKO-7.',ok:false,feedback:'Då blandas flera arter.'},
      {label:'Rävar och harar tillsammans.',ok:false,feedback:'De tillhör olika arter.'}
    ],()=>{G.addJournal('population');nextStep(3,'camera','Rävpopulationen verkar ha minskat. Följ spåret till den gamla lyan.');});
  }

  function den(){
    G.openPanel(`<div class="stamp">FÄLTOBSERVATION</div><h2>Den gamla rävlyan</h2><p class="sub">Norra skogsbrynet</p><div class="analysis-card"><strong>Observation A</strong>Inga färska spår, ingen avföring och inget nytt grävmaterial syns vid öppningen. Lyan verkar inte användas.</div><div class="analysis-card"><strong>Observation B</strong>Vegetationen i närheten är hårt betad. Många unga skott är avbitna.</div><p>Det här räcker ännu inte för att förklara <i>varför</i> rävarna har minskat. Men du har nu ett tydligt samband att ta med tillbaka.</p><div class="actions"><button class="btn yellow" id="record">Registrera observationerna</button></div>`);
    document.getElementById('record').onclick=()=>nextStep(4,'den','Fältdata komplett. Återvänd till forskningsstationen för analys.');
  }

  function analysis(){
    const cards=[
      ['Temperatur','abiotisk'],['Nederbörd','abiotisk'],['Vind','abiotisk'],['Ljus','abiotisk'],
      ['Hare','biotisk'],['Räv','biotisk'],['Sork','biotisk'],['Vegetation','biotisk']
    ];
    const answers={};
    G.openPanel(`<div class="stamp">ANALYSSTATION</div><h2>Sortera fältdata</h2><p>Innan datorn gör sin första analys måste du visa att data är rätt klassificerad.</p><div id="sort" class="sort-list"></div><div id="fb"></div><div class="actions"><button class="btn" id="check" disabled>Analysera</button></div>`);
    const host=document.getElementById('sort');
    function draw(){
      host.innerHTML='';cards.forEach(([label],i)=>{const row=document.createElement('div');row.className='sort-card';row.innerHTML=`<span><b>${label}</b></span><button data-v="abiotisk" class="${answers[i]==='abiotisk'?'sel':''}">Abiotisk</button><button data-v="biotisk" class="${answers[i]==='biotisk'?'sel':''}">Biotisk</button>`;row.querySelectorAll('button').forEach(b=>b.onclick=()=>{answers[i]=b.dataset.v;draw();});host.appendChild(row);});document.getElementById('check').disabled=Object.keys(answers).length<cards.length;
    }
    draw();
    document.getElementById('check').onclick=()=>{
      const wrong=cards.filter((c,i)=>answers[i]!==c[1]);
      if(wrong.length){document.getElementById('fb').innerHTML=`<div class="feedback no">${wrong.length} klassificering${wrong.length>1?'ar':''} är fel. Kom ihåg: biotisk = levande, abiotisk = icke-levande.</div>`;return;}
      analysisConclusion();
    };
  }
  function analysisConclusion(){
    G.openPanel(`<div class="stamp">FÖRSTA ANALYS</div><h2>Vad bör vi undersöka vidare?</h2><div class="terminal"><b>ABIOTISKA FAKTORER:</b> inga stora avvikelser<br><b>VÄXTBIO­MASSA:</b> ↓ 27 %<br><b>HARE:</b> ↑ kraftigt<br><b>SORK:</b> ↑<br><b>RÄV:</b> ↓ kraftigt<br><b>RÄVLYA:</b> övergiven</div><p>Vi kan ännu inte säga vad som orsakade förändringen. Vilket spår är mest rimligt att undersöka härnäst?</p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Förhållandet mellan växtätare och rovdjur – och vem som äter vem.',ok:true,feedback:'Det kan visa hur förändringar i en population påverkar andra.'},
      {label:'Om solen har börjat lysa från ett annat håll.',ok:false,feedback:'Mätningarna visar ingen sådan förändring.'},
      {label:'Om alla arter i området tillhör samma population.',ok:false,feedback:'Olika arter kan aldrig bilda samma population.'},
      {label:'Om biomassa betyder samma sak som temperatur.',ok:false,feedback:'Det är två helt olika typer av mätningar.'}
    ],()=>finish());
  }
  function finish(){
    G.addJournal('conclusion');
    S.journal=S.journal.filter(k=>k!=='intro');
    if(!S.journal.includes('resolved')) S.journal.push('resolved');
    G.renderJournal();
    S.complete=true;G.setStep(5);G.save();
    G.openPanel(`<div class="stamp">UPPDRAG 1 KLART</div><h2>Något stämmer inte</h2><div class="complete-banner"><div class="big">FÖRSTA ANALYS KLAR</div><p>Du har visat att de stora förändringarna framför allt finns i de <b>biotiska</b> delarna av EKO-7.</p></div><p>Växtbiomassan har minskat samtidigt som flera växtätare blivit vanligare och räven blivit ovanligare. Det räcker inte för att bevisa orsaken – men det ger oss nästa fråga.</p><div class="next-hook">NÄSTA UPPDRAG: <b>VEM ÄTER VEM?</b><br>Rekonstruera EKO-7:s näringsväv och ta reda på hur förändringen kan sprida sig genom systemet.</div><div class="actions"><button class="btn yellow" id="startM2">Starta Uppdrag 2</button><button class="btn" id="journalNow">Öppna fältjournalen</button><button class="btn secondary" id="endNow">Tillbaka till världen</button></div>`);
    document.getElementById('startM2').onclick=()=>window.EKO7_M2&&window.EKO7_M2.start();
    document.getElementById('journalNow').onclick=()=>{G.closePanel();G.showJournal(true);};
    document.getElementById('endNow').onclick=G.closePanel;
  }

  function optional(p){
    G.openPanel(`<div class="stamp">FRIVILLIG OBSERVATION</div><h2>${esc(p.name)}</h2><p>${esc(p.text)}</p><div class="actions"><button class="btn" id="ok">Spara observation</button></div>`);
    document.getElementById('ok').onclick=()=>{S.optionalSeen[p.id]=true;G.save();G.closePanel();G.flash('Frivillig observation registrerad.');};
  }

  function interact(){
    const n=G.nearPlace(); if(!n){G.flash('Inget att undersöka här. Följ den gula markeringen.');return;}
    if(n.kind==='optional'){optional(n.place);return;}
    const step=D.missionSteps[S.step];
    if(!step||n.place.id!==step.target){G.flash('Det här är inte nästa huvudmål.');return;}
    [climate,vegetation,camera,den,analysis][S.step]();
  }

  window.EKO7_M1={interact};
})();
