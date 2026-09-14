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
          setTimeout(()=>onCorrect(it),550);
        }else{
          b.classList.add('wrong');
          document.getElementById('fb').innerHTML='<div class="feedback no">Inte riktigt. '+(it.feedback||'Försök igen.')+'</div>';
          setTimeout(()=>{[...host.children].forEach(x=>{x.disabled=false;x.classList.remove('wrong');});},700);
        }
      };
      host.appendChild(b);
    });
  }
  function next(step,journalKey,msg){if(journalKey)G.addJournal(journalKey);G.setStep(step);G.closePanel();G.flash(msg||'Ny fältmarkering tillagd.');}

  function start(){
    if(!S.journal.includes('m3intro'))G.addJournal('m3intro');
    S.mission3Complete=false;G.setMission(3,0);G.closePanel();
    G.flash('Uppdrag 3 startat. Följ den gula markeringen till sjön.',3600);
  }

  function lake(){
    G.openPanel(`<div class="stamp">UPPDRAG 3</div><h2>Systemet reagerar</h2><p class="sub">Sjön · Fältsektor C</p>
      <p class="scene">Vattnet ligger stilla mellan vassen. På bryggan sitter en gammal registreringslåda med tjugo års populationsdata. Forskarna följde inte bara hur många individer som fanns – utan hur en förändring i en population följdes av förändringar i andra.</p>
      <div class="terminal"><b>FRÅGAN HAR FÖRÄNDRATS</b><br>Uppdrag 2 visade en möjlig kedja: räv ↓ → hare/sork ↑ → växtbiomassa ↓.<br><br>Nu måste vi ta reda på vad som händer <b>sedan</b>.</div>
      <p><b>Vad behöver vi undersöka för att förstå om systemet stabiliserar sig?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Hur en förändring leder till <b>nya förändringar</b> som antingen bromsar eller förstärker den första.',ok:true,feedback:'Precis. Det är återkopplingar i ekosystemet.'},
      {label:'Bara vilken art som väger mest.',ok:false,feedback:'Kroppsvikt berättar inte hur systemet reagerar över tid.'},
      {label:'Om alla populationer alltid är lika stora.',ok:false,feedback:'Populationer förändras hela tiden.'},
      {label:'Vilken organism som står närmast forskningsstationen.',ok:false,feedback:'Vi behöver följa samband, inte avstånd på kartan.'}
    ],()=>next(1,null,'Följ populationsserien för rovdjur och bytesdjur.'));
  }

  function feedbackStation(){
    G.openPanel(`<div class="stamp">POPULATIONSSTATION C1</div><h2>Rovdjur och bytesdjur</h2>
      <p>Den förenklade mätserien visar hur två populationer förändras. <b>Abborrarna</b> är bytesdjur och <b>gäddorna</b> rovdjur.</p>
      <div class="pop-chart-wrap">
        <svg class="pop-chart" viewBox="0 0 560 230" role="img" aria-label="Populationskurvor för abborre och gädda">
          <line x1="44" y1="190" x2="535" y2="190" class="axis"/><line x1="44" y1="25" x2="44" y2="190" class="axis"/>
          <g class="grid"><line x1="44" y1="55" x2="535" y2="55"/><line x1="44" y1="95" x2="535" y2="95"/><line x1="44" y1="135" x2="535" y2="135"/></g>
          <polyline points="50,125 120,70 190,45 260,92 330,150 400,136 470,85 530,62" class="prey-line"/>
          <polyline points="50,158 120,142 190,105 260,62 330,77 400,128 470,151 530,118" class="pred-line"/>
          <text x="365" y="42" class="chart-label prey">ABBORRE</text><text x="365" y="168" class="chart-label pred">GÄDDA</text>
          <text x="42" y="212" class="tick">tid →</text><text x="9" y="20" class="tick">antal</text>
        </svg>
      </div>
      <p>Abborrarna minskar kraftigt efter period 3. Gäddorna minskar först <b>en tid senare</b>. Varför?</p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'När abborrarna blir färre får gäddorna <b>mindre mat</b>. Då överlever och förökar sig färre gäddor.',ok:true,feedback:'Det är precis den fördröjning som en rovdjur–bytesdjur-relation kan ge.'},
      {label:'Gäddorna härmar abborrarna med några veckors fördröjning.',ok:false,feedback:'Populationer förändras genom resurser, överlevnad och fortplantning – inte genom imitation.'},
      {label:'Gäddorna får automatiskt mindre syre när abborrarna minskar.',ok:false,feedback:'Det framgår inte av datan. Här är den direkta kopplingen födan.'},
      {label:'Färre abborrar gör att gäddorna får mer mat.',ok:false,feedback:'Det blir tvärtom mindre tillgängligt byte.'}
    ],feedbackType);
  }
  function feedbackType(){
    G.openPanel(`<div class="stamp">POPULATIONSSTATION C1</div><h2>En förändring bromsar en annan</h2>
      <div class="feedback-loop"><span>ABBORRE ↑</span><b>→</b><span>MER MAT</span><b>→</b><span>GÄDDA ↑</span><b>→</b><span>ABBORRE ↓</span></div>
      <p>När rovdjuren ökar blir bytesdjuren färre. Då får rovdjuren mindre mat och börjar i sin tur minska.</p>
      <p><b>Vad kallas en återkoppling som motverkar den ursprungliga förändringen?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'<b>Negativ återkoppling</b>',ok:true,feedback:'Ja. Negativ betyder här att förändringen bromsas – inte att den är "dålig".'},
      {label:'Positiv återkoppling',ok:false,feedback:'Positiv återkoppling förstärker den tidigare förändringen.'},
      {label:'Tipping point',ok:false,feedback:'Det beskriver ett mer genomgripande skifte i systemet.'},
      {label:'Biomassa',ok:false,feedback:'Biomassa är den sammanlagda massan av organismer.'}
    ],()=>next(2,'negativeFeedback','Negativ återkoppling registrerad. Men rovdjur är inte det enda som begränsar populationer.'));
  }

  function capacityStation(){
    G.openPanel(`<div class="stamp">BÄRFÖRMÅGESTATION C2</div><h2>Fler och fler harar … tills vad?</h2>
      <p>Efter att räven minskade steg harobservationerna snabbt. Men den gamla mätserien visar att ökningen sedan vände.</p>
      <table class="field-table"><thead><tr><th>Period</th><th>Harar</th><th>Växtbiomassa</th></tr></thead><tbody>
        <tr><td>1</td><td>24</td><td>84 kg</td></tr><tr><td>2</td><td>61</td><td>61 kg</td></tr><tr><td>3</td><td>78</td><td>36 kg</td></tr><tr><td>4</td><td>46</td><td>52 kg</td></tr>
      </tbody></table>
      <p><b>Varför fortsätter inte harpopulationen att öka hur länge som helst?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'När populationen blir stor ökar <b>konkurrensen om begränsade resurser</b>, till exempel föda och utrymme.',ok:true,feedback:'Just det. Något kommer alltid att begränsa populationens storlek.'},
      {label:'En population måste alltid minska efter exakt tre perioder.',ok:false,feedback:'Det finns ingen sådan regel.'},
      {label:'Harar slutar äta när det finns många andra harar.',ok:false,feedback:'De behöver fortfarande energi och resurser.'},
      {label:'Ekosystem kan försörja obegränsat många individer.',ok:false,feedback:'Tillgången på resurser sätter gränser.'}
    ],capacityDefinition);
  }
  function capacityDefinition(){
    G.openPanel(`<div class="stamp">BÄRFÖRMÅGESTATION C2</div><h2>Systemets gräns</h2>
      <p>Forskarna använde ett särskilt begrepp för hur stor population området kan försörja.</p><p><b>Vilken definition stämmer bäst med <i>bärförmåga</i>?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Hur stor population av en art som ekosystemet kan <b>försörja med sina resurser</b>.',ok:true,feedback:'Ja. Bärförmågan förändras dessutom när miljön och resurserna förändras.'},
      {label:'Hur mycket vikt ett djur kan bära.',ok:false,feedback:'Begreppet handlar om populationer och ekosystem.'},
      {label:'Antalet arter som finns i hela världen.',ok:false,feedback:'Det beskriver inte bärförmåga.'},
      {label:'Hur snabbt en växt kan genomföra fotosyntes.',ok:false,feedback:'Fotosyntesen påverkar resurserna, men det är inte definitionen.'}
    ],()=>next(3,'carryingCapacity','Bärförmågan sätter en gräns. Nu ska du hitta en återkoppling som i stället förstärker en förändring.'));
  }

  function flockPoint(){
    G.openPanel(`<div class="stamp">FÅGELUDDEN C3</div><h2>När fler faktiskt kan ge fler</h2>
      <p class="scene">På stenarna sitter en tät koloni av måsfåglar. Fler individer betyder mer konkurrens om maten – men också fler ögon som kan upptäcka ett rovdjur.</p>
      <div class="flock-visual"><span>🐦</span><span>🐦</span><span>🐦</span><span>🐦</span><span>🐦</span><span>👁</span></div>
      <p>Om en större flock upptäcker rovdjur tidigare kan fler ungar överleva. Då kan flocken växa ytterligare.</p><p><b>Vad beskriver detta?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'<b>Positiv återkoppling</b> – den första förändringen förstärks.',ok:true,feedback:'Ja. Fler individer kan i det här exemplet öka fördelen av att vara många.'},
      {label:'Negativ återkoppling – förändringen bromsas direkt.',ok:false,feedback:'Här förstärks förändringen snarare än motverkas.'},
      {label:'Fotosyntes',ok:false,feedback:'Det handlar om populationens återkoppling.'},
      {label:'Anrikning',ok:false,feedback:'Anrikning handlar om ökande halter av vissa miljögifter mellan trofinivåer.'}
    ],positiveMeaning);
  }
  function positiveMeaning(){
    G.openPanel(`<div class="stamp">FÅGELUDDEN C3</div><h2>Positiv betyder inte "bra"</h2><p>Orden positiv och negativ kan vara luriga i ekologi.</p><p><b>Vad betyder "positiv" i positiv återkoppling?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Att följden <b>förstärker</b> den förändring som redan har börjat – oavsett om resultatet är bra eller dåligt.',ok:true,feedback:'Precis. Det är riktningen på återkopplingen som avses.'},
      {label:'Att förändringen alltid är bra för alla arter.',ok:false,feedback:'Positiv betyder inte värderingen "bra".'},
      {label:'Att populationen alltid blir större.',ok:false,feedback:'En positiv återkoppling kan också förstärka en minskning.'},
      {label:'Att ekosystemet alltid återgår till ursprungsläget.',ok:false,feedback:'Det är snarare negativa återkopplingar som ofta bidrar till stabilisering.'}
    ],()=>next(4,'positiveFeedback','Du har sett både bromsande och förstärkande återkopplingar. Nu jämför vi hela ekosystem.'));
  }

  function stabilityStation(){
    G.openPanel(`<div class="stamp">STABILITETSSTATION C4</div><h2>Stabilt eller labilt?</h2>
      <p>Två dataloggrar har registrerat hur mycket miljön varierar under samma tidsperiod.</p>
      <div class="stability-panels"><div class="stability-card stable"><b>GAMMELSKOG</b><div class="spark">▁▂▂▃▂▂▃▂▃▂▂▁</div><small>små, långsamma variationer</small></div><div class="stability-card labile"><b>UTSATT STRAND</b><div class="spark">▂▇▁▆▃█▁▅▂▇▃▁</div><small>snabba, stora variationer</small></div></div>
      <p><b>Vilket påstående stämmer?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Gammelskogen kan beskrivas som mer <b>stabil</b>, medan den utsatta stranden är mer <b>labil</b>.',ok:true,feedback:'Ja. Stabilt betyder inte oföränderligt – variationerna är bara mindre eller långsammare.'},
      {label:'Stabilt betyder att ingenting någonsin förändras.',ok:false,feedback:'Även stabila ekosystem är dynamiska och förändras.'},
      {label:'Labilt betyder att ekosystemet saknar alla arter.',ok:false,feedback:'Ett labilt system kan ha många arter men förändras snabbt.'},
      {label:'Den utsatta stranden är stabil eftersom den förändras mycket.',ok:false,feedback:'Snabba och kraftiga variationer är typiska för mer labila system.'}
    ],perfectBalance);
  }
  function perfectBalance(){
    G.openPanel(`<div class="stamp">STABILITETSSTATION C4</div><h2>"Naturen är i perfekt balans"?</h2><p>En gammal anteckning i marginalen lyder: <i>"Stabil natur står still."</i></p><p><b>Vad skulle en ekolog invända?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Ekosystem förändras hela tiden. Ett stabilt system kan ändå vara sig ganska likt över tid eftersom återkopplingar <b>balanserar förändringar</b>.',ok:true,feedback:'Det är kärnan. Stabilitet är inte samma sak som stillastående.'},
      {label:'Stabila ekosystem innehåller inga återkopplingar.',ok:false,feedback:'Negativa återkopplingar är tvärtom viktiga för stabilitet.'},
      {label:'Alla förändringar i naturen är fel.',ok:false,feedback:'Förändring är en normal del av ekosystemens dynamik.'},
      {label:'Ett ekosystem är stabilt bara om alla populationer är exakt lika stora varje år.',ok:false,feedback:'Populationer kan variera även i stabila system.'}
    ],()=>next(5,'stableLabile','Stabilitet beskriver variation över tid. Nu testar vi något annat: förmågan att återhämta sig efter en störning.'));
  }

  function resilienceStation(){
    G.openPanel(`<div class="stamp">RESILIENSSTATION C5</div><h2>Störningen upphör – vad händer sedan?</h2>
      <p>Två delområden utsattes i en äldre försöksserie för samma tillfälliga belastning. Belastningen stoppades efter period 2.</p>
      <table class="field-table"><thead><tr><th>Period</th><th>Vik A – index</th><th>Vik B – index</th></tr></thead><tbody>
        <tr><td>Före</td><td>100</td><td>100</td></tr><tr><td>Störning</td><td>62</td><td>61</td></tr><tr><td>+1</td><td>78</td><td>58</td></tr><tr><td>+2</td><td>92</td><td>55</td></tr><tr><td>+3</td><td>98</td><td>54</td></tr>
      </tbody></table>
      <p><b>Vilken vik visar högst resiliens?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'<b>Vik A</b>, eftersom den efter störningen återgår nära sitt tidigare tillstånd.',ok:true,feedback:'Ja. Resiliens handlar om förmågan att återhämta sig.'},
      {label:'Vik B, eftersom den förändras mest.',ok:false,feedback:'Stor förändring är inte samma sak som hög återhämtningsförmåga.'},
      {label:'Båda har exakt samma resiliens eftersom störningen var lika stor.',ok:false,feedback:'Samma störning kan ge olika återhämtning i olika system.'},
      {label:'Det går bara att mäta resiliens genom att väga alla djur.',ok:false,feedback:'Resiliens bedöms genom hur systemet reagerar och återhämtar sig efter störning.'}
    ],resilienceDefinition);
  }
  function resilienceDefinition(){
    G.openPanel(`<div class="stamp">RESILIENSSTATION C5</div><h2>Resiliens</h2><p><b>Vilken definition ska skrivas in i fältjournalen?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Ett mått på ett ekosystems förmåga att <b>återhämta sig efter en störning</b>.',ok:true,feedback:'Rätt. Ett resilient system kan alltså påverkas – men ändå återhämta sig.'},
      {label:'Antalet rovdjur i ett ekosystem.',ok:false,feedback:'Rovdjur kan påverka systemet, men det är inte definitionen.'},
      {label:'Hur snabbt en positiv återkoppling går.',ok:false,feedback:'Det är ett annat begrepp.'},
      {label:'Ett mått på hur stilla naturen är.',ok:false,feedback:'Resiliens handlar om återhämtning efter störning.'}
    ],()=>next(6,'resilience','Vik B återhämtade sig inte. Nästa station testar vad som kan hända när ett system pressas förbi en kritisk nivå.'));
  }

  function thresholdStation(){
    let load=1,flipped=false,removed=false;
    const draw=()=>{
      const state=flipped?'GRUMLIGT TILLSTÅND':load<=2?'KLART TILLSTÅND':load===3?'PRESSAT MEN STABILT':'NÄRA TRÖSKEL';
      const cls=flipped?'turbid':load>=4?'warning':'clear';
      G.openPanel(`<div class="stamp">TRÖSKELSTATION C6</div><h2>Hur mycket belastning tål sjön?</h2>
        <p>Det här är en <b>förenklad modell</b>. Öka belastningen stegvis och följ systemets tillstånd.</p>
        <div class="threshold-box ${cls}"><div class="threshold-water"></div><div><b>Belastning: ${load}/5</b><br><span>${state}</span></div></div>
        <div class="threshold-scale"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
        <div class="actions"><button class="btn" id="incLoad" ${flipped||load>=5?'disabled':''}>Öka belastningen</button>${flipped&&!removed?'<button class="btn secondary" id="removeLoad">Stoppa belastningen</button>':''}</div>
        <div id="modelMsg" class="feedback ${flipped?'no':'hint'}">${flipped?(removed?'Belastningen är stoppad – men modellen återgår inte till klart tillstånd.':'Vid nivå 5 sker en snabb omsvängning i modellen.'):load===4?'Systemet ligger nära en kritisk nivå.':'Systemet förändras, men är kvar i samma grundtillstånd.'}</div>
        ${removed?'<div class="actions"><button class="btn yellow" id="interpret">Tolka resultatet</button></div>':''}`);
      const inc=document.getElementById('incLoad');if(inc)inc.onclick=()=>{load++;if(load>=5)flipped=true;draw();};
      const rem=document.getElementById('removeLoad');if(rem)rem.onclick=()=>{load=1;removed=true;draw();};
      const inter=document.getElementById('interpret');if(inter)inter.onclick=thresholdInterpret;
    };
    draw();
  }
  function thresholdInterpret(){
    G.openPanel(`<div class="stamp">TRÖSKELSTATION C6</div><h2>Två begrepp</h2>
      <div class="threshold-summary"><span><b>TRÖSKELVÄRDE</b><br>en nivå där systemet kan förändras snabbt</span><span><b>TIPPING POINT</b><br>systemet har slagit över och återgår inte enkelt till tidigare tillstånd</span></div>
      <p><b>Vilken tolkning passar den modell du just körde?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Belastningen passerade ett <b>tröskelvärde</b>. När systemet sedan inte återgick trots att belastningen stoppades illustrerade modellen en <b>tipping point</b>.',ok:true,feedback:'Precis. De två begreppen hör ihop men betyder inte exakt samma sak.'},
      {label:'Tröskelvärde och tipping point betyder bara att populationen växer lite.',ok:false,feedback:'Här handlar det om en snabb eller varaktig systemförändring.'},
      {label:'Resiliens betyder samma sak som tipping point.',ok:false,feedback:'Resiliens är förmågan att återhämta sig. Tipping point beskriver ett skifte som inte enkelt går tillbaka.'},
      {label:'Ett tröskelvärde betyder att inga förändringar sker.',ok:false,feedback:'Tvärtom är det en nivå där förändringen kan bli snabb.'}
    ],()=>next(7,'threshold','Modellen visar varför det är riskabelt att pressa ett system för långt. Återvänd till stationen för systemanalys.'));
  }

  function analysis(){
    const defs={
      'Negativ återkoppling':'En förändring motverkas av följder som drar systemet tillbaka.',
      'Positiv återkoppling':'En förändring förstärks av följder som driver utvecklingen vidare.',
      'Bärförmåga':'Hur stor population ekosystemets resurser kan försörja.',
      'Resiliens':'Förmågan att återhämta sig efter en störning.',
      'Tröskelvärde':'En nivå där systemet eller populationen kan förändras snabbt.'
    };
    const terms=Object.keys(defs);const defValues=shuffled(Object.values(defs));
    G.openPanel(`<div class="stamp">SYSTEMANALYS</div><h2>Vad avgör om EKO-7 återhämtar sig?</h2>
      <p>Para ihop begreppen med rätt beskrivning.</p><div class="match-table" id="conceptMatch">
        ${terms.map((term,i)=>`<label class="match-row concept"><b>${esc(term)}</b><select id="c${i}"><option value="">– välj beskrivning –</option>${defValues.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('')}</select></label>`).join('')}
      </div><div id="fb"></div><div class="actions"><button class="btn" id="checkConcepts">Kontrollera</button></div>`);
    document.getElementById('checkConcepts').onclick=()=>{
      const ok=terms.every((term,i)=>document.getElementById('c'+i).value===defs[term]);
      if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Någon koppling är fel. Tänk på om begreppet beskriver en återkoppling, en gräns eller återhämtning efter störning.</div>';return;}
      finalInterpretation();
    };
  }
  function finalInterpretation(){
    G.openPanel(`<div class="stamp">SYSTEMANALYS</div><h2>Den viktigaste slutsatsen</h2>
      <p>Forskningschefen har lämnat en gammal notering: <i>"Om naturen vore i perfekt balans skulle den alltid återgå exakt till utgångsläget."</i></p>
      <p><b>Vilken slutsats stämmer bäst med det du undersökt?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Ekosystem är <b>dynamiska</b>. Negativa återkopplingar kan stabilisera dem, men positiva återkopplingar och kraftiga störningar kan driva dem mot tröskelvärden. Resiliensen avgör hur väl de återhämtar sig.',ok:true,feedback:'Det sammanfattar hela Uppdrag 3.'},
      {label:'Alla ekosystem är antingen helt stabila eller helt förstörda.',ok:false,feedback:'Ekosystem kan befinna sig i många tillstånd och förändras hela tiden.'},
      {label:'Om ett ekosystem har hög resiliens förändras det aldrig.',ok:false,feedback:'Hög resiliens betyder att systemet kan återhämta sig efter förändring.'},
      {label:'Positiv återkoppling gör alltid naturen mer stabil.',ok:false,feedback:'Förstärkande återkopplingar kan i stället driva förändringar vidare.'}
    ],finish);
  }

  function finish(){
    G.addJournal('m3conclusion');
    S.journal=S.journal.filter(k=>k!=='m3intro');G.addJournal('m3resolved');
    S.mission3Complete=true;G.setStep(8);G.save();
    G.openPanel(`<div class="stamp">UPPDRAG 3 KLART</div><h2>Systemet reagerar</h2>
      <div class="complete-banner"><div class="big">EKO-7 ÄR INTE I "PERFEKT BALANS"</div><p>Det förändras hela tiden. Frågan är om återkopplingarna bromsar förändringen – och om systemets resiliens räcker när störningen blir stor.</p></div>
      <div class="systems-strip"><span>NEGATIV ÅTERKOPPLING<br><small>bromsar</small></span><b>↔</b><span>POSITIV ÅTERKOPPLING<br><small>förstärker</small></span><b>→</b><span>TRÖSKELVÄRDE</span></div>
      <p>Det mest oroande fyndet är att en del av sjön inte återhämtar sig lika bra som tidigare. Sensordatan visar dessutom att den största yttre belastningen kommer via vattenflödet från området med <b>våtmark och jordbruk</b>.</p>
      <div class="next-hook">NÄSTA UPPDRAG: <b>VAD FÖRLORAR VI?</b><br>Vad gör våtmarken, skogen och andra ekosystem egentligen för oss – och vad händer när människan förändrar dem?</div>
      <div class="actions"><button class="btn yellow" id="startM4">Starta Uppdrag 4</button><button class="btn secondary" id="journalNow">Öppna fältjournalen</button><button class="btn secondary" id="worldNow">Tillbaka till världen</button></div>`);
    document.getElementById('startM4').onclick=()=>{if(window.EKO7_M4)window.EKO7_M4.start();};
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
    const step=D.mission3Steps[S.step];if(!step||n.place.id!==step.target){G.flash('Det här är inte nästa huvudmål.');return;}
    [lake,feedbackStation,capacityStation,flockPoint,stabilityStation,resilienceStation,thresholdStation,analysis][S.step]();
  }

  window.EKO7_M3={start,interact};
})();
