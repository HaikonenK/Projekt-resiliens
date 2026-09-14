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

  const ACTIONS=[
    {id:'wetland',name:'Återskapa våtmarken',cost:3,desc:'Återanslut vattenflödet till våtmarken så att mer kväve och fosfor fångas upp.',fx:{water:3,bio:1,web:0,services:2}},
    {id:'buffer',name:'Skyddszoner vid åkern',cost:2,desc:'Anlägg gräs- och blomremsor som bromsar avrinning och skapar småbiotoper.',fx:{water:2,bio:1,web:0,services:1}},
    {id:'habitat',name:'Återskapa varierade habitat',cost:3,desc:'Låt död ved, lövträd, gläntor och sammanhängande naturmiljöer finnas kvar.',fx:{water:0,bio:3,web:1,services:2}},
    {id:'pollinator',name:'Pollinatörskorridorer',cost:2,desc:'Skapa blommande stråk och boplatser mellan odlingsytorna.',fx:{water:0,bio:2,web:0,services:2}},
    {id:'fish',name:'Gemensam fiskekvot',cost:2,desc:'Minska uttaget tills fiskbestånden hinner föröka sig och återhämta sig.',fx:{water:1,bio:1,web:2,services:1}},
    {id:'predator',name:'Skydda toppkonsumenterna',cost:2,desc:'Minska störningar och jakt på rovdjur så att rovdjur–bytesdjurssystemet kan återhämta sig.',fx:{water:0,bio:1,web:3,services:0}}
  ];
  const LABELS={water:'Vatten',bio:'Mångfald',web:'Näringsväv',services:'Tjänster'};
  const threshold=3;

  function scoresFor(ids){
    const s={water:0,bio:0,web:0,services:0,cost:0};
    ids.forEach(id=>{const a=ACTIONS.find(x=>x.id===id);if(!a)return;s.cost+=a.cost;for(const k of ['water','bio','web','services'])s[k]+=a.fx[k];});
    return s;
  }
  function scoreBars(sc){return `<div class="restore-meters">${['water','bio','web','services'].map(k=>`<span><b>${LABELS[k]}</b><i class="${sc[k]>=threshold?'ok':'low'}"><em style="width:${Math.min(100,sc[k]/6*100)}%"></em></i><strong>${sc[k]}</strong></span>`).join('')}</div>`;}

  function start(){
    if(!S.journal.includes('m6intro'))G.addJournal('m6intro');
    S.mission6Complete=false;S.restorationPlan=S.restorationPlan||[];S.restorationScores=S.restorationScores||null;
    G.setMission(6,0);G.closePanel();
    G.flash('FINALUPPDRAGET har startat. Gå till forskningsstationens planeringsbord.',3800);
  }

  function planning(){
    let selected=new Set(S.restorationPlan||[]);
    const actionOrder=shuffled(ACTIONS);
    function draw(){
      const sc=scoresFor([...selected]);
      G.openPanel(`<div class="stamp">FINALUPPDRAG</div><h2>Återställ EKO-7</h2><p class="sub">Forskningsstationen · planeringsbordet</p>
        <p class="scene">På bordet ligger sex åtgärdskort och en budgetbricka märkt <b>8 ÅTGÄRDSPOÄNG</b>. Du kan inte göra allt. Planen måste stärka flera delar av systemet samtidigt.</p>
        <div class="budget-line"><b>Budget:</b> ${sc.cost} / 8 poäng <span>${sc.cost>8?'ÖVER BUDGET':''}</span></div>
        <div class="restore-grid" id="restoreGrid"></div>
        <h3>Förväntad systemeffekt</h3>${scoreBars(sc)}
        <p class="small">Målet är minst <b>3</b> i varje område. Siffrorna är en förenklad modell – inte exakta naturvärden.</p>
        <div id="fb"></div><div class="actions"><button class="btn yellow" id="runPlan">Genomför planen</button><button class="btn secondary" id="clearPlan">Rensa</button></div>`);
      const grid=document.getElementById('restoreGrid');
      actionOrder.forEach(a=>{
        const b=document.createElement('button');b.className='restore-card'+(selected.has(a.id)?' selected':'');
        b.innerHTML=`<b>${esc(a.name)}</b><small>${esc(a.desc)}</small><span>Kostnad ${a.cost}</span><em>Vatten +${a.fx.water} · Mångfald +${a.fx.bio} · Väven +${a.fx.web} · Tjänster +${a.fx.services}</em>`;
        b.onclick=()=>{selected.has(a.id)?selected.delete(a.id):selected.add(a.id);draw();};grid.appendChild(b);
      });
      document.getElementById('clearPlan').onclick=()=>{selected.clear();draw();};
      document.getElementById('runPlan').onclick=()=>{
        const now=scoresFor([...selected]);
        const fb=document.getElementById('fb');
        if(!selected.size){fb.innerHTML='<div class="feedback no">Välj minst en åtgärd.</div>';return;}
        if(now.cost>8){fb.innerHTML='<div class="feedback no">Planen kostar mer än 8 poäng. Prioritera.</div>';return;}
        const weak=['water','bio','web','services'].filter(k=>now[k]<threshold);
        if(weak.length){fb.innerHTML=`<div class="feedback no"><b>Simuleringen visar en svag länk:</b> ${weak.map(k=>LABELS[k]).join(', ')}. En hållbar plan behöver angripa flera kopplade problem samtidigt. Ändra kombinationen och prova igen.</div>`;return;}
        S.restorationPlan=[...selected];S.restorationScores=now;G.save();
        implementation(now);
      };
    }
    draw();
  }

  function implementation(sc){
    G.setRestorationVisual&&G.setRestorationVisual(1);
    G.openPanel(`<div class="stamp">PLAN GODKÄND</div><h2>Åtgärderna sätts in</h2>
      <div class="complete-banner"><div class="big">SYSTEMPLAN AKTIVERAD</div><p>Du har inte försökt maximera en enda sak. Du har byggt en plan som stärker flera kopplade delar av EKO-7 samtidigt.</p></div>
      ${scoreBars(sc)}
      <div class="cause-strip"><span>MINSKAD BELASTNING</span><b>+</b><span>FLER HABITAT</span><b>+</b><span>STARKARE ÅTERKOPPLINGAR</span><b>→</b><span>ÖKAD RESILIENS?</span></div>
      <p>Men en plan är bara en hypotes. Nu måste du <b>mäta om den faktiskt fungerar</b>.</p>
      <div class="actions"><button class="btn yellow" id="fieldCheck">Starta uppföljningen</button></div>`);
    document.getElementById('fieldCheck').onclick=()=>{G.addJournal('restorationPlan');next(1,null,'Åtgärderna är genomförda. Kontrollera först våtmarkens utlopp.');};
  }

  function waterCheck(){
    G.openPanel(`<div class="stamp">UPPFÖLJNING 1</div><h2>Vattnet reagerar</h2><p class="sub">Våtmarkens utlopp</p>
      <table class="field-table"><tr><th>Mätning</th><th>Före åtgärd</th><th>Efter</th></tr><tr><td>Kväve</td><td>Högt</td><td><b>↓ tydligt</b></td></tr><tr><td>Fosfor</td><td>Högt</td><td><b>↓ tydligt</b></td></tr><tr><td>Vattnets grumlighet</td><td>Hög</td><td><b>↓ långsamt</b></td></tr></table>
      <p><b>Vilken tolkning är bäst?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Mindre näringsämnen når sjön. Det <b>minskar belastningen</b>, men återhämtningen kan ta tid eftersom resiliens handlar om hur systemet svarar efter störningen.',ok:true,feedback:'Precis. Att stoppa belastningen är inte samma sak som att allt blir friskt omedelbart.'},
      {label:'När kväve och fosfor minskar måste sjön bli helt återställd samma sekund.',ok:false,feedback:'Ekosystem reagerar över tid. Återhämtningen kan vara långsam.'},
      {label:'Våtmarken har ingen koppling till sjöns vattenkvalitet.',ok:false,feedback:'Tidigare uppdrag visade att våtmarken kan fånga upp näringsämnen.'},
      {label:'Mer grumligt vatten är alltid ett tecken på högre resiliens.',ok:false,feedback:'Grumlighet i sig är inte ett mått på resiliens.'}
    ],()=>next(2,'restoredWetland','Vattenbelastningen minskar. Nästa uppföljning gäller livsmiljöerna.'));
  }

  function habitatCheck(){
    G.openPanel(`<div class="stamp">UPPFÖLJNING 2</div><h2>Fler platser att leva på</h2><p class="sub">Skogsjämförelsen</p>
      <div class="forest-compare"><div class="forest-card planted"><b>FÖRE</b><ul><li>likåldriga träd</li><li>lite död ved</li><li>få gläntor</li><li>färre småbiotoper</li></ul></div><div class="forest-card natural"><b>EFTER ÅTGÄRDER</b><ul><li>fler trädslag och åldrar</li><li>död ved lämnas</li><li>gläntor och buskskikt</li><li>sammanhängande naturstråk</li></ul></div></div>
      <p><b>Varför kan detta göra systemet mer robust?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'Fler typer av livsmiljöer ger <b>fler habitat och ekologiska nischer</b>. Fler arter och fler olika funktioner kan göra att systemet inte blir lika beroende av en enda art eller miljö.',ok:true,feedback:'Ja. Mångfald kan ge fler vägar för systemet att fortsätta fungera när något förändras.'},
      {label:'Alla arter får exakt samma ekologiska nisch.',ok:false,feedback:'Arter kan leva sida vid sida just eftersom deras nischer skiljer sig.'},
      {label:'Biologisk mångfald ökar bara om alla träd är lika gamla.',ok:false,feedback:'Det omväxlande området erbjuder fler livsmiljöer.'},
      {label:'Död ved gör automatiskt att inga nedbrytare kan leva där.',ok:false,feedback:'Död ved är tvärtom viktig för många nedbrytare och andra arter.'}
    ],()=>next(3,'restoredHabitat','Livsmiljöerna blir mer varierade. Kontrollera nu om näringsväven också reagerar.'));
  }

  function webCheck(){
    G.openPanel(`<div class="stamp">UPPFÖLJNING 3</div><h2>Näringsväven svarar</h2><p class="sub">Spårplatsen · gammelskogen</p>
      <table class="field-table"><tr><th>Population</th><th>Före</th><th>Nu</th></tr><tr><td>Räv</td><td>mycket låg</td><td><b>ökar</b></td></tr><tr><td>Hare/sork</td><td>mycket hög</td><td><b>minskar något</b></td></tr><tr><td>Vegetation</td><td>minskande</td><td><b>stabiliseras</b></td></tr></table>
      <p><b>Vilket ekologiskt samband illustreras tydligast?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'En <b>negativ återkoppling</b>: fler rovdjur kan minska bytesdjuren, vilket minskar betestrycket. När bytesdjuren senare blir färre begränsas även rovdjurens ökning.',ok:true,feedback:'Exakt. Återkopplingen bromsar stora förändringar.'},
      {label:'En positiv återkoppling där varje förändring förstärks för alltid.',ok:false,feedback:'Här finns en bromsande mekanism mellan rovdjur och bytesdjur.'},
      {label:'Bevis för att energi cirkulerar utan förluster mellan trofinivåer.',ok:false,feedback:'Energi flödar och mycket försvinner som värme mellan nivåerna.'},
      {label:'Bevis för att populationer kan växa obegränsat.',ok:false,feedback:'Bärförmåga och födotillgång sätter gränser.'}
    ],()=>next(4,'restoredWeb','Tre uppföljningar pekar åt rätt håll. Återvänd till stationen för slutanalysen.'));
  }

  function finalAnalysis(){
    G.openPanel(`<div class="stamp">SLUTANALYS</div><h2>Är EKO-7 räddat?</h2>
      <p>Efter flera mätperioder ser forskarna:</p>
      <div class="systems-strip"><span>NÄRINGSBELASTNING<br><small>minskar</small></span><b>·</b><span>HABITAT<br><small>ökar</small></span><b>·</b><span>NÄRINGSVÄV<br><small>stabiliseras</small></span><b>·</b><span>EKOSYSTEMTJÄNSTER<br><small>stärks</small></span></div>
      <p><b>Vilken slutsats visar bäst att du förstått hela expeditionen?</b></p><div id="choices" class="choice-grid"></div><div id="fb"></div>`);
    choices([
      {label:'EKO-7 behöver inte bli ett system där ingenting förändras. Målet är ett <b>dynamiskt men resilient ekosystem</b> som kan tåla störningar, återhämta sig och fortsätta ge livsutrymme och ekosystemtjänster.',ok:true,feedback:'Det är finalens kärna – stabilitet är inte samma sak som stillastående.'},
      {label:'EKO-7 är räddat först när alla populationer har exakt samma storlek varje år.',ok:false,feedback:'Populationer förändras naturligt. Ett fungerande ekosystem är dynamiskt.'},
      {label:'Det viktigaste är att maximera en enda art och bortse från resten av systemet.',ok:false,feedback:'Spelet har visat att arter och funktioner är sammankopplade.'},
      {label:'När en åtgärd har gjorts behöver systemet aldrig övervakas igen.',ok:false,feedback:'Hållbar förvaltning kräver uppföljning eftersom ekosystem ständigt förändras.'}
    ],finalChain);
  }

  function finalChain(){
    const rows=[
      {start:'Återskapa våtmark',mid:'mindre kväve och fosfor når sjön',end:'vattenrening och resiliens stärks'},
      {start:'Fler varierade habitat',mid:'fler nischer och bättre livsmiljöer',end:'biologisk mångfald får bättre förutsättningar'},
      {start:'Fungerande rovdjur–bytesdjur',mid:'betestrycket bromsas av negativa återkopplingar',end:'mindre extrema populationssvängningar'}
    ];
    const mids=shuffled(rows.map(r=>r.mid)),ends=shuffled(rows.map(r=>r.end));
    G.openPanel(`<div class="stamp">SLUTANALYS</div><h2>Tre åtgärder – tre kedjor</h2><p>Koppla varje åtgärd till dess direkta ekologiska effekt och den större systemeffekten.</p>
      <div class="cause-match">${rows.map((r,i)=>`<div class="cause-row"><b>${esc(r.start)}</b><span>→</span><select id="fm${i}"><option value="">– direkt effekt –</option>${mids.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select><span>→</span><select id="fe${i}"><option value="">– systemeffekt –</option>${ends.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></div>`).join('')}</div>
      <div id="fb"></div><div class="actions"><button class="btn yellow" id="finishExp">Lämna slutrapporten</button></div>`);
    document.getElementById('finishExp').onclick=()=>{
      const ok=rows.every((r,i)=>document.getElementById('fm'+i).value===r.mid&&document.getElementById('fe'+i).value===r.end);
      if(!ok){document.getElementById('fb').innerHTML='<div class="feedback no">Någon kedja är fel. Följ först den direkta ekologiska effekten och sedan vad den betyder för hela systemet.</div>';return;}
      finish();
    };
  }

  function finish(){
    G.addJournal('restorationMeaning');G.addJournal('m6conclusion');
    S.journal=S.journal.filter(k=>k!=='m6intro');G.addJournal('m6resolved');
    S.mission6Complete=true;G.setStep(5);G.setRestorationVisual&&G.setRestorationVisual(2);G.save();
    const chosen=(S.restorationPlan||[]).map(id=>ACTIONS.find(a=>a.id===id)).filter(Boolean);
    const report=`PROJEKT RESILIENS – SLUTRAPPORT\nExpeditionsmedlem: ${S.name||'–'}\n\nValda åtgärder:\n${chosen.map(a=>'• '+a.name).join('\n')}\n\nSlutsats: EKO-7 är ett dynamiskt system. Målet med återställningen är inte perfekt balans utan högre resiliens: mindre belastning, fungerande återkopplingar, fler livsmiljöer och bevarade ekosystemtjänster.\n\nEXPEDITION SLUTFÖRD.`;
    G.openPanel(`<div class="stamp">EXPEDITION SLUTFÖRD</div><h1>Projekt Resiliens</h1>
      <div class="finale-hero"><div class="finale-seal">EKO-7<br><b>RESILIENT</b></div><div><h2>Systemet svarar.</h2><p>EKO-7 har inte frusits i en perfekt balans. Det förändras fortfarande – men belastningen har minskat och flera av systemets egna återkopplingar och funktioner har stärkts.</p></div></div>
      <div class="complete-banner"><div class="big">FRÅN OBSERVATION TILL SYSTEMFÖRSTÅELSE</div><p>Du började med några konstiga mätvärden. Du avslutar med att kunna förklara hur energi, materia, populationer, återkopplingar, biologisk mångfald, ekosystemtjänster och hållbarhet hänger ihop.</p></div>
      <div class="final-journey"><span>1<br><small>Observera</small></span><b>→</b><span>2<br><small>Näringsväv</small></span><b>→</b><span>3<br><small>Återkopplingar</small></span><b>→</b><span>4<br><small>Tjänster</small></span><b>→</b><span>5<br><small>Gränser</small></span><b>→</b><span>6<br><small>Återställ</small></span></div>
      <p><b>Expeditionens sista lärdom:</b> Ett ekosystem är inte en maskin som ska stå still. Det är ett nätverk av levande och icke-levande delar som hela tiden förändras. Hållbar förvaltning handlar om att inte pressa det hårdare än att det fortfarande kan fungera och återhämta sig.</p>
      <pre class="final-report" id="finalReport">${esc(report)}</pre>
      <div class="actions"><button class="btn yellow" id="copyReport">Kopiera slutrapport</button><button class="btn secondary" id="journalNow">Öppna fältjournalen</button><button class="btn secondary" id="worldNow">Gå ut i det återhämtande EKO-7</button></div>`);
    document.getElementById('copyReport').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(report).then(()=>{document.getElementById('copyReport').textContent='Kopierad ✓';}).catch(()=>{});};
    document.getElementById('journalNow').onclick=()=>{G.closePanel();G.showJournal(true);};
    document.getElementById('worldNow').onclick=()=>{G.closePanel();G.flash('Expeditionen är klar. EKO-7 fortsätter att förändras – och övervakas.',4200);};
  }

  function optional(p){
    G.openPanel(`<div class="stamp">FRIVILLIG OBSERVATION</div><h2>${esc(p.name)}</h2><p>${esc(p.text)}</p><div class="actions"><button class="btn" id="ok">Spara observation</button></div>`);
    document.getElementById('ok').onclick=()=>{S.optionalSeen[p.id]=true;G.save();G.closePanel();G.flash('Frivillig observation registrerad.');};
  }

  function interact(){
    const n=G.nearPlace();if(!n){G.flash('Inget att undersöka här. Följ den gula markeringen.');return;}
    if(n.kind==='optional'){optional(n.place);return;}
    const step=D.mission6Steps[S.step];if(!step||n.place.id!==step.target){G.flash('Det här är inte nästa huvudmål.');return;}
    [planning,waterCheck,habitatCheck,webCheck,finalAnalysis][S.step]();
  }

  window.EKO7_M6={start,interact};
})();
