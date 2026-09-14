(function(){
  'use strict';
  const D = window.EKO7_DATA;
  const SAVE_KEY = 'eko7-resiliens-expedition-v8';
  const overlay = document.getElementById('overlay');
  const panel = document.getElementById('panel');
  const hintEl = document.getElementById('hint');
  const focusNote = document.getElementById('focusNote');
  const missionTitle = document.getElementById('missionTitle');
  const missionText = document.getElementById('missionText');
  const missionProgress = document.getElementById('missionProgress');
  const progressFill = document.getElementById('progressFill');
  const journalEl = document.getElementById('journal');
  const journalBody = document.getElementById('journalBody');
  const mapOverlay = document.getElementById('mapOverlay');
  const mini = document.getElementById('miniMap');
  const mctx = mini.getContext('2d');
  const bigMap = document.getElementById('bigMap');
  const bctx = bigMap.getContext('2d');
  const compassNeedle = document.getElementById('compassNeedle');

  const state = {
    started:false,
    name:'',
    mission:1,
    step:0,
    journal:[],
    optionalSeen:{},
    pos:{x:0,z:-5.5},
    yaw:0,
    complete:false,
    mission2Complete:false,
    mission3Complete:false,
    mission4Complete:false,
    mission5Complete:false,
    mission6Complete:false,
    restorationPlan:[],
    restorationScores:null,
    restorationVisual:0
  };
  window.EKO7_STATE = state;

  function load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY);
      if(!raw) return false;
      const s = JSON.parse(raw);
      Object.assign(state, s);
      if(!state.mission) state.mission=state.complete?2:1;
      if(!state.pos) state.pos={x:0,z:-5.5};
      return !!state.started;
    }catch(e){ return false; }
  }
  function save(){
    try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function reset(){
    try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
    location.reload();
  }

  function currentSteps(){ return state.mission===6 ? D.mission6Steps : state.mission===5 ? D.mission5Steps : state.mission===4 ? D.mission4Steps : state.mission===3 ? D.mission3Steps : state.mission===2 ? D.mission2Steps : D.missionSteps; }
  function setMission(mission,step=0){
    state.mission=mission;state.step=step;
    renderMission();save();updateMarkers();drawMaps();
  }
  window.EKO7 = {state,save,reset,openPanel,closePanel,addJournal,setStep,setMission,flash,renderJournal,showJournal,toggleMap,activeTarget,currentSteps,places:D.world.places};

  function esc(s){ return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c)); }
  function openPanel(html){ panel.innerHTML=html; overlay.classList.add('show'); held.clear(); }
  function closePanel(){ overlay.classList.remove('show'); held.clear(); }
  function flash(text, ms=2600){ hintEl.textContent=text; clearTimeout(flash.t); flash.t=setTimeout(updateHint,ms); }
  function addJournal(key){
    if(state.journal.includes(key)) return;
    state.journal.push(key); renderJournal(); save();
  }
  function setStep(step){
    state.step = step; renderMission(); save(); updateMarkers(); drawMaps();
  }
  function activeTarget(){
    const steps=currentSteps();const s=steps[state.step];
    return s && s.target ? D.world.places.find(p=>p.id===s.target) : null;
  }
  function renderMission(){
    const steps=currentSteps();const s=steps[state.step] || steps[steps.length-1];
    missionTitle.textContent=s.title; missionText.textContent=s.text;
    const max=state.mission===6?5:state.mission===5?7:state.mission===4?7:state.mission===3?8:state.mission===2?7:5;const done=Math.min(state.step,max);
    missionProgress.textContent=`Uppdrag ${state.mission} · ${done} / ${max} undersökningar`;
    progressFill.style.width=`${Math.round(done/max*100)}%`;
  }
  function renderJournal(){
    const groups=['Miljö','Begrepp','Observationer','Slutsatser','Öppna frågor'];
    const by={}; groups.forEach(g=>by[g]=[]);
    state.journal.forEach(k=>{const x=D.journalTemplates[k]; if(x) by[x.section].push(x);});
    journalBody.innerHTML=groups.map(g=>{
      const xs=by[g]; if(!xs.length) return '';
      return `<section class="journal-section"><h3>${g}</h3>${xs.map(x=>`<div class="journal-entry ${x.kind==='question'?'open-question':''} ${x.kind==='resolved'?'open-question resolved':''}">${esc(x.text)}</div>`).join('')}</section>`;
    }).join('') || '<p class="small">Journalen är tom än så länge.</p>';
  }
  function showJournal(force){
    const open = force===undefined ? !journalEl.classList.contains('open') : force;
    journalEl.classList.toggle('open',open); journalEl.setAttribute('aria-hidden',String(!open));
  }
  function toggleMap(force){
    const open = force===undefined ? !mapOverlay.classList.contains('open') : force;
    mapOverlay.classList.toggle('open',open); mapOverlay.setAttribute('aria-hidden',String(!open));
    if(open) drawMaps();
  }

  document.getElementById('journalBtn').onclick=()=>showJournal();
  document.getElementById('journalClose').onclick=()=>showJournal(false);
  document.getElementById('mapBtn').onclick=()=>toggleMap();
  document.getElementById('mapClose').onclick=()=>toggleMap(false);
  document.getElementById('resetBtn').onclick=()=>{ if(confirm('Återställa hela expeditionen och börja om från Uppdrag 1?')) reset(); };

  // --- THREE WORLD: expedition / field-biologist visual pass ---
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0xaab7a0);
  scene.fog=new THREE.Fog(0xa1aa91,36,112);
  const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,180);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  renderer.domElement.tabIndex=0;
  document.getElementById('gameRoot').prepend(renderer.domElement);
  renderer.domElement.addEventListener('pointerdown',()=>{renderer.domElement.focus();focusNote.style.display='none';});

  const hemi=new THREE.HemisphereLight(0xd9e6d6,0x4b422b,1.16);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffe7b7,2.35);sun.position.set(-28,46,-24);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:1,far:170});sun.shadow.bias=-.00045;scene.add(sun);
  const amb=new THREE.AmbientLight(0xfff0d2,.11);scene.add(amb);

  // Painted expedition sky: warm horizon fading to cool blue-green overhead.
  const sky=new THREE.Mesh(new THREE.SphereGeometry(120,28,16),new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color(0x789aa0)},bottom:{value:new THREE.Color(0xd9c793)},offset:{value:9},exponent:{value:.72}},
    vertexShader:'varying vec3 vWorld; void main(){vec4 w=modelMatrix*vec4(position,1.0);vWorld=w.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top;uniform vec3 bottom;uniform float offset;uniform float exponent;varying vec3 vWorld;void main(){float h=normalize(vWorld+vec3(0.0,offset,0.0)).y;float f=pow(max(0.0,h),exponent);gl_FragColor=vec4(mix(bottom,top,f),1.0);}'
  }));scene.add(sky);
  const sunDisk=new THREE.Mesh(new THREE.CircleGeometry(3.2,32),new THREE.MeshBasicMaterial({color:0xffe5aa,transparent:true,opacity:.38,depthWrite:false}));sunDisk.position.set(-48,42,-65);sunDisk.lookAt(camera.position);scene.add(sunDisk);

  const mat=(c,r=.82,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  function canvasTex(size,draw,rx=1,ry=1){
    const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');draw(g,size);
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
  }
  const TEX={
    grass:canvasTex(256,(g,S)=>{g.fillStyle='#667d4c';g.fillRect(0,0,S,S);for(let i=0;i<5200;i++){const v=55+Math.random()*70;g.fillStyle=`rgba(${v*.72|0},${v|0},${v*.55|0},${.08+Math.random()*.18})`;g.fillRect(Math.random()*S,Math.random()*S,1,1+Math.random()*3);}for(let i=0;i<80;i++){g.fillStyle='rgba(60,45,24,.10)';g.beginPath();g.arc(Math.random()*S,Math.random()*S,2+Math.random()*9,0,7);g.fill();}},18,18),
    dirt:canvasTex(256,(g,S)=>{g.fillStyle='#907853';g.fillRect(0,0,S,S);for(let i=0;i<3500;i++){const c=70+Math.random()*70;g.fillStyle=`rgba(${c+20|0},${c|0},${c*.58|0},${.08+Math.random()*.2})`;g.fillRect(Math.random()*S,Math.random()*S,1+Math.random()*2,1+Math.random()*2);}for(let i=0;i<45;i++){g.strokeStyle='rgba(55,38,20,.20)';g.lineWidth=1;g.beginPath();g.moveTo(Math.random()*S,Math.random()*S);g.lineTo(Math.random()*S,Math.random()*S);g.stroke();}},8,8),
    wood:canvasTex(256,(g,S)=>{g.fillStyle='#6c4d2f';g.fillRect(0,0,S,S);for(let y=0;y<S;y+=34){g.fillStyle='rgba(30,18,8,.23)';g.fillRect(0,y,S,2);for(let i=0;i<8;i++){g.strokeStyle='rgba(40,22,8,.18)';g.beginPath();g.moveTo(0,y+5+Math.random()*24);g.bezierCurveTo(S*.35,y+Math.random()*34,S*.7,y+Math.random()*34,S,y+5+Math.random()*24);g.stroke();}}},4,3),
    canvas:canvasTex(192,(g,S)=>{g.fillStyle='#b6aa7d';g.fillRect(0,0,S,S);for(let y=0;y<S;y+=3){g.fillStyle='rgba(255,255,225,.055)';g.fillRect(0,y,S,1);}for(let x=0;x<S;x+=5){g.fillStyle='rgba(50,40,20,.035)';g.fillRect(x,0,1,S);}},3,3),
    metal:canvasTex(192,(g,S)=>{g.fillStyle='#737b73';g.fillRect(0,0,S,S);for(let y=0;y<S;y+=3){g.fillStyle=`rgba(255,255,255,${Math.random()*.07})`;g.fillRect(0,y,S,1);}for(let i=0;i<300;i++){g.fillStyle='rgba(20,20,15,.08)';g.fillRect(Math.random()*S,Math.random()*S,1,1);}},2,2)
  };
  const texMat=(t,c=0xffffff,r=.86,m=.02)=>new THREE.MeshStandardMaterial({map:t.clone(),color:c,roughness:r,metalness:m});
  function cloneRepeat(base,rx,ry){const t=base.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return t;}
  const box=(w,h,d,c,x,y,z,cast=true)=>{const material=(c&&c.isMaterial)?c:mat(c);const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o;};
  const tbox=(w,h,d,tex,c,x,y,z,rx=1,ry=1,cast=true)=>{const material=new THREE.MeshStandardMaterial({map:cloneRepeat(tex,rx,ry),color:c,roughness:.88,metalness:.02});const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o;};
  const cyl=(r,h,c,x,y,z,seg=12)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat(c));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
  const sphere=(r,c,x,y,z,seg=12)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(8,seg-3)),mat(c));o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o;};
  const boxMesh=(w,h,d,c,r=.82,m=0)=>{const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,r,m));q.castShadow=true;q.receiveShadow=true;return q;};

  // --- Physical world: simple, fast 2D collision for Chromebooks ---
  // We only collide with objects that should actually stop a person: trunks, buildings,
  // large equipment, water and a few substantial props. Ferns/grass/flowers remain walkable.
  const colliders=[];
  const cameraObstacles=[];
  const PLAYER_R=.34;
  function addCircleCollider(x,z,r,label=''){colliders.push({type:'circle',x,z,r,label});}
  function addBoxCollider(x,z,halfW,halfD,label=''){colliders.push({type:'box',x,z,halfW,halfD,label});}
  function registerCameraObstacle(mesh){if(mesh)cameraObstacles.push(mesh);return mesh;}
  function hitsCollider(x,z){
    for(const c of colliders){
      if(c.type==='circle'){if(Math.hypot(x-c.x,z-c.z)<c.r+PLAYER_R)return true;}
      else{const qx=Math.max(c.x-c.halfW,Math.min(x,c.x+c.halfW));const qz=Math.max(c.z-c.halfD,Math.min(z,c.z+c.halfD));if(Math.hypot(x-qx,z-qz)<PLAYER_R)return true;}
    }
    return false;
  }

  // Ground and worn expedition trails.
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(150,140),new THREE.MeshStandardMaterial({map:cloneRepeat(TEX.grass,24,22),color:0xb2b58c,roughness:.96}));ground.rotation.x=-Math.PI/2;ground.position.x=10;ground.receiveShadow=true;scene.add(ground);
  function path(x,z,w,d,rot=0){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:cloneRepeat(TEX.dirt,Math.max(1,w/4),Math.max(1,d/3)),color:0xc7ad7b,roughness:.98}));p.rotation.x=-Math.PI/2;p.rotation.z=rot;p.position.set(x,.016,z);p.receiveShadow=true;scene.add(p);return p;}
  path(0,-7,4.4,38); path(12,-12,31,3.7,-.37); path(13,9,34,3.7,.25); path(-10,-4,24,3.4,.4);
  // Smal stig genom gammelskogen för Uppdrag 2. Den öppna världen finns kvar, men huvudrutten är tydlig.
  path(8,25,4.0,28,.05); path(1,32,20,3.1,-.08);
  for(let i=0;i<75;i++){const r=.08+Math.random()*.26;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),mat(0x777566,.95));rock.scale.set(1.4,.65,1);rock.position.set((Math.random()-.5)*78,r*.35,(Math.random()-.5)*70);rock.rotation.set(Math.random(),Math.random()*5,Math.random());rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);if(r>.23)addCircleCollider(rock.position.x,rock.position.z,r*1.05,'sten');}
  // Low-poly wooded ridges hide the hard edge of the reserve and make the world feel much larger.
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2+(Math.random()-.5)*.12;const rr=63+Math.random()*8;const h=5+Math.random()*8;const hill=new THREE.Mesh(new THREE.ConeGeometry(7+Math.random()*6,h,7),mat(i%3===0?0x536248:0x465a40,.98));hill.position.set(Math.cos(a)*rr,-.25+h/2,Math.sin(a)*rr);hill.rotation.y=Math.random()*Math.PI;hill.scale.z=.65+Math.random()*.5;hill.receiveShadow=true;scene.add(hill);}

  // EKO-7 expedition station: part field laboratory, part old jungle camp.
  const stationBody=tbox(11,3.7,7.7,TEX.wood,0xc9b98f,0,2.0,5,4,2,true);registerCameraObstacle(stationBody);addBoxCollider(0,5,5.45,3.80,'forskningsstation');
  // dark lower skirting / raised platform
  tbox(12,.45,8.7,TEX.wood,0x66513a,0,.25,5,4,2,true);
  for(const x of [-4.5,4.5])for(const z of [2,8])cyl(.16,1.1,0x4b3827,x,.55,z,10);
  // pitched weathered roof
  const roofMat=new THREE.MeshStandardMaterial({map:cloneRepeat(TEX.metal,4,3),color:0x6e776b,roughness:.75,metalness:.15});
  const roofL=new THREE.Mesh(new THREE.BoxGeometry(6.5,.22,9),roofMat);roofL.position.set(-2.8,4.25,5);roofL.rotation.z=.27;roofL.castShadow=true;scene.add(roofL);
  const roofR=roofL.clone();roofR.position.x=2.8;roofR.rotation.z=-.27;scene.add(roofR);
  // doorway and lab screen
  box(3.7,2.85,.15,0x24342e,0,1.72,1.08,false);
  const screen=box(2.65,1.34,.10,0x152822,0,1.82,1.0,false);screen.material.emissive=new THREE.Color(0x335847);screen.material.emissiveIntensity=1.15;
  // covered field-work porch
  for(const x of [-4.3,4.3])cyl(.08,3.0,0x54402c,x,1.5,-.7,10);
  const awning=tbox(9.2,.12,4.2,TEX.canvas,0xb9a777,0,3.1,-1,3,2,true);awning.rotation.x=-.07;
  // crates and specimen cases
  function crate(x,y,z,s=1){const q=tbox(1.15*s,.78*s,.9*s,TEX.wood,0xa57a48,x,y+.39*s,z,1,1,true);for(const dz of [-.39,.39]){const sl=box(1.2*s,.06*s,.07*s,0x493521,x,y+.39*s,z+dz,false);}return q;}
  crate(-3.0,.48,-.45,.9);crate(-1.9,.48,-.65,.72);crate(3.2,.48,.1,.85);
  addBoxCollider(-3.0,-.45,.58,.46,'låda');addBoxCollider(-1.9,-.65,.43,.34,'låda');addBoxCollider(3.2,.1,.52,.40,'låda');
  // expedition table, papers and sample jars
  tbox(3.2,.16,1.3,TEX.wood,0x997248,2.0,1.0,-1.15,2,1,true);for(const x of [1.0,3.0])for(const z of [-1.55,-.8])cyl(.06,.92,0x50402c,x,.52,z,8);
  addBoxCollider(2.0,-1.15,1.6,.65,'fältbord');
  for(let k=0;k<4;k++){const jar=new THREE.Mesh(new THREE.CylinderGeometry(.10,.10,.34,12),new THREE.MeshStandardMaterial({color:0xa8d0c4,transparent:true,opacity:.62,roughness:.2,metalness:.05}));jar.position.set(1.25+k*.48,1.23,-1.15);scene.add(jar);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,.05,12),mat(0x44483c,.6,.2));cap.position.set(jar.position.x,1.42,-1.15);scene.add(cap);}
  // radio mast and old antenna
  cyl(.07,4.8,0x4d5850,-4.5,6.3,5,10); sphere(.22,0xd0d1bb,-4.5,8.75,5,12);box(1.5,.04,.04,0xa6aaa0,-4.5,8.55,5,false);
  // warm lamps that sell the adventure-camp atmosphere
  const lampLights=[];
  for(const [x,z] of [[-4.1,-.7],[4.1,-.7]]){const bulb=sphere(.11,0xffc766,x,2.65,z,10);bulb.material.emissive=new THREE.Color(0xffb34e);bulb.material.emissiveIntensity=2;const l=new THREE.PointLight(0xffba62,1.15,9,1.8);l.position.set(x,2.65,z);scene.add(l);lampLights.push(l);}
  // EKO-7 wood sign
  const signBoard=tbox(4.3,.85,.12,TEX.wood,0xa77a48,-6.2,2.0,1.0,2,1,true);signBoard.rotation.y=.23;
  const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;const sg=signCanvas.getContext('2d');sg.fillStyle='#b18a54';sg.fillRect(0,0,512,128);sg.strokeStyle='#4a3420';sg.lineWidth=8;sg.strokeRect(5,5,502,118);sg.fillStyle='#2b2419';sg.font='bold 42px Georgia';sg.textAlign='center';sg.fillText('EKO–7',256,55);sg.font='bold 22px Courier New';sg.fillText('FIELD RESEARCH STATION',256,92);const signText=new THREE.Mesh(new THREE.PlaneGeometry(3.85,.72),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCanvas),transparent:true}));signText.position.set(-6.2,2.0,.925);signText.rotation.y=.23;scene.add(signText);
  addCircleCollider(-6.2,1.0,.40,'skylt');

  // Weathered field 4x4 and canvas tent: stronger pulp-expedition silhouette, entirely original.
  function expeditionJeep(x,z,rot=-.25){const g=new THREE.Group();const body=boxMesh(3.4,.62,1.62,0x5f6841,.76,.08);body.position.y=.68;g.add(body);const hood=boxMesh(1.25,.42,1.48,0x687248,.72,.08);hood.position.set(1.15,1.03,0);g.add(hood);const cab=boxMesh(1.25,.68,1.42,0x4b5437,.78,.05);cab.position.set(-.55,1.17,0);g.add(cab);const glassMat=new THREE.MeshStandardMaterial({color:0x8aa5a0,roughness:.16,metalness:.18,transparent:true,opacity:.72});const wind=new THREE.Mesh(new THREE.BoxGeometry(.07,.58,1.20),glassMat);wind.position.set(.05,1.48,0);wind.rotation.z=-.08;g.add(wind);for(const sx of [-1,1])for(const sz of [-1,1]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.24,12),mat(0x25251f,.86));wh.rotation.x=Math.PI/2;wh.position.set(sx*1.13,.43,sz*.78);g.add(wh);}const rack=boxMesh(1.7,.06,1.3,0x3d4032,.6,.35);rack.position.set(-.62,1.62,0);g.add(rack);const can=boxMesh(.36,.55,.24,0x7b6038,.8,.12);can.position.set(-1.5,1.0,-.64);g.add(can);const spare=new THREE.Mesh(new THREE.TorusGeometry(.36,.12,8,16),mat(0x282720,.88));spare.rotation.y=Math.PI/2;spare.position.set(-1.75,.87,0);g.add(spare);g.rotation.y=rot;g.position.set(x,0,z);scene.add(g);addBoxCollider(x,z,1.8,1.0,'fältfordon');return g;}
  expeditionJeep(8.2,-3.2,-.18);
  (()=>{const g=new THREE.Group();const cloth=new THREE.Mesh(new THREE.ConeGeometry(2.35,2.7,4),new THREE.MeshStandardMaterial({map:cloneRepeat(TEX.canvas,2,2),color:0xb8a677,roughness:1,side:THREE.DoubleSide}));cloth.rotation.y=Math.PI/4;cloth.position.y=1.35;cloth.scale.z=.72;g.add(cloth);const flap=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.55),new THREE.MeshStandardMaterial({color:0x7c6d4b,side:THREE.DoubleSide,roughness:1}));flap.position.set(0,1.0,1.72);flap.rotation.x=-.08;g.add(flap);g.position.set(-9.7,0,-3.5);scene.add(g);addCircleCollider(-9.7,-3.5,1.75,'fältält');})();

  const sway=[];
  function tree(x,z,s=1){
    const trunk=cyl(.18*s,2.10*s,0x5d432b,x,1.05*s,z,10);registerCameraObstacle(trunk);
    trunk.rotation.z=(Math.random()-.5)*.045;addCircleCollider(x,z,Math.max(.23,.22*s),'träd');
    // buttress roots make the trees feel anchored rather than planted as poles
    for(let k=0;k<3;k++){const root=box(.62*s,.10*s,.14*s,0x58402a,x+Math.cos(k*2.094)*.24*s,.07*s,z+Math.sin(k*2.094)*.24*s,false);root.rotation.y=-k*2.094;}
    const crown=new THREE.Group();
    for(const [dx,dy,dz,r,c] of [[0,0,0,1.0,0x3f6837],[.55,.25,.15,.72,0x4d7740],[-.48,.36,-.25,.68,0x365e33],[.08,.62,.38,.58,0x527f45],[.15,.25,-.56,.52,0x466f39]]){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r*s,1),mat(c,.95));m.position.set(dx*s,dy*s,dz*s);m.castShadow=true;crown.add(m);}crown.position.set(x,2.25*s,z);scene.add(crown);sway.push({m:crown,a:.012+Math.random()*.018,p:Math.random()*6});
  }
  function pine(x,z,s=1){
    const trunk=cyl(.16*s,1.82*s,0x55402b,x,.91*s,z,10);registerCameraObstacle(trunk);addCircleCollider(x,z,Math.max(.22,.20*s),'tall');
    const group=new THREE.Group();for(let k=0;k<5;k++){const c=new THREE.Mesh(new THREE.ConeGeometry((1.22-k*.20)*s,1.30*s,10),mat(k%2?0x315536:0x365f38,.94));c.position.y=(.93+k*.52)*s;c.castShadow=true;group.add(c);}group.position.set(x,.45*s,z);scene.add(group);sway.push({m:group,a:.008+Math.random()*.014,p:Math.random()*6});
  }
  function fern(x,z,s=1){const g=new THREE.Group();for(let k=0;k<6;k++){const leaf=new THREE.Mesh(new THREE.PlaneGeometry(.18*s,1.15*s),new THREE.MeshStandardMaterial({color:0x527943,side:THREE.DoubleSide,roughness:1}));leaf.position.y=.35*s;leaf.rotation.z=-.55+k*.22;leaf.rotation.y=k*1.05;g.add(leaf);}g.position.set(x,.02,z);scene.add(g);sway.push({m:g,a:.025,p:Math.random()*6});}
  // forests, keeping mission stations and expedition trails readable.
  const forestClear=D.world.places.filter(p=>['station','climate','vegetation','camera','den','forest','producerPlot','feedingSite','foodwebBoard','decomposerLog','energyStation','lake','feedbackStation','capacityStation','flockPoint','stabilityStation','resilienceStation','thresholdStation','wetland','wetlandSensor','pollinatorMeadow','farm','forestCompare','serviceStation','boundaryLab','biodiversityArchive','footprintStation','commonsDock','fairSpace','sustainabilityStation'].includes(p.id));
  function nearFieldSite(x,z,pad=4){return forestClear.some(p=>Math.hypot(x-p.x,z-p.z)<(p.id==='station'?11:pad));}
  for(let i=0;i<150;i++){
    let x=-41+Math.random()*82,z=-37+Math.random()*91;
    if(nearFieldSite(x,z,4.1)){i--;continue;}
    (Math.random()<.48?tree:pine)(x,z,.62+Math.random()*.62);
  }
  for(let i=0;i<135;i++){let x=-40+Math.random()*80,z=-36+Math.random()*89;if(nearFieldSite(x,z,2.7))continue;fern(x,z,.45+Math.random()*.7);}

  // Forest-floor storytelling: leaf litter, dead wood, fungi and expedition debris.
  for(let i=0;i<42;i++){const patch=new THREE.Mesh(new THREE.CircleGeometry(.6+Math.random()*1.5,14),new THREE.MeshBasicMaterial({color:Math.random()<.5?0x665838:0x766542,transparent:true,opacity:.12,depthWrite:false}));patch.rotation.x=-Math.PI/2;patch.position.set((Math.random()-.5)*72,.019,(Math.random()-.5)*68);scene.add(patch);}
  function fallenLog(x,z,len=3,rot=0){const g=new THREE.Group();const log=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,len,10),mat(0x5a4028,.97));log.rotation.z=Math.PI/2;log.castShadow=true;g.add(log);for(let k=0;k<4;k++){const moss=new THREE.Mesh(new THREE.SphereGeometry(.18+Math.random()*.13,8,6),mat(0x60764a,.98));moss.scale.set(1.4,.28,.7);moss.position.set(-len*.35+k*len*.23,.23,.02);g.add(moss);}g.rotation.y=rot;g.position.set(x,.24,z);scene.add(g);addBoxCollider(x,z,Math.abs(Math.cos(rot))*len*.50+Math.abs(Math.sin(rot))*.30,Math.abs(Math.sin(rot))*len*.50+Math.abs(Math.cos(rot))*.30,'fallen stock');}
  fallenLog(12,25,3.5,.3);fallenLog(-13,28,2.8,-.65);fallenLog(17,19,2.6,1.0);fallenLog(-25,-8,3.0,.25);
  for(const [x,z,r] of [[-18,20,.85],[20,29,.72],[-27,31,.95],[35,21,.78]]){const b=new THREE.Mesh(new THREE.DodecahedronGeometry(r,1),mat(0x6f7167,.98));b.scale.set(1.3,.72,1);b.position.set(x,r*.52,z);b.rotation.set(.2,Math.random()*3,.12);b.castShadow=true;b.receiveShadow=true;scene.add(b);addCircleCollider(x,z,r*.9,'block');}
  for(let i=0;i<26;i++){const x=(Math.random()-.5)*66,z=14+Math.random()*19;const stalk=cyl(.035,.12,0xe4dac0,x,.06,z,7);const cap=new THREE.Mesh(new THREE.SphereGeometry(.11+Math.random()*.07,8,5,0,Math.PI*2,0,Math.PI*.5),mat(Math.random()<.4?0xa85b42:0xb59a67,.95));cap.position.set(x,.16,z);scene.add(cap);}

  // Efficient meadow grass: thousands of blades as instanced geometry.
  const grassTime={value:0};(()=>{const N=1500,geo=new THREE.PlaneGeometry(.075,.56,1,2);geo.translate(0,.28,0);const gm=new THREE.MeshStandardMaterial({color:0x708b48,side:THREE.DoubleSide,roughness:1});gm.onBeforeCompile=sh=>{sh.uniforms.uTime=grassTime;sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat ph=instanceMatrix[3][0]*.55+instanceMatrix[3][2]*.43; transformed.x += sin(uTime*1.6+ph)*0.10*max(0.0,position.y); transformed.z += cos(uTime*1.15+ph)*0.035*max(0.0,position.y);');};const im=new THREE.InstancedMesh(geo,gm,N);const d=new THREE.Object3D();for(let i=0;i<N;i++){d.position.set(-7+Math.random()*24,.01,-34+Math.random()*20);d.rotation.y=Math.random()*Math.PI;const ss=.5+Math.random()*.95;d.scale.set(ss,ss,ss);d.updateMatrix();im.setMatrixAt(i,d.matrix);}im.receiveShadow=true;scene.add(im);})();
  // Wild flowers and seed heads.
  for(let i=0;i<95;i++){const x=-5+Math.random()*20,z=-31+Math.random()*17;const stem=box(.025,.38+Math.random()*.35,.025,0x536e3b,x,.24,z,false);if(Math.random()<.55)sphere(.055,Math.random()<.5?0xd9c665:0xc7b6d8,x,stem.geometry.parameters.height+.04,z,8);}

  // lake / wetland context
  const lakeGeo=new THREE.CircleGeometry(10,72);const lakeBase=lakeGeo.attributes.position.array.slice();const lake=new THREE.Mesh(lakeGeo,new THREE.MeshPhysicalMaterial({color:0x3b7a84,roughness:.16,metalness:.03,transparent:true,opacity:.88,clearcoat:.55,clearcoatRoughness:.18}));lake.rotation.x=-Math.PI/2;lake.position.set(-31,.055,19);scene.add(lake);addCircleCollider(-31,19,9.35,'sjö');
  const shore=new THREE.Mesh(new THREE.RingGeometry(9.7,11.0,48),new THREE.MeshStandardMaterial({color:0x7d7957,roughness:1,side:THREE.DoubleSide}));shore.rotation.x=-Math.PI/2;shore.position.set(-31,.025,19);scene.add(shore);
  for(let i=0;i<70;i++){const x=-38+Math.random()*14,z=-5+Math.random()*17;const h=.4+Math.random()*.75;const reed=box(.035,h,.035,0x5c7840,x,h/2,z,false);reed.rotation.z=(Math.random()-.5)*.14;}
  // farm context
  const farm=new THREE.Mesh(new THREE.PlaneGeometry(16,12),new THREE.MeshStandardMaterial({map:cloneRepeat(TEX.dirt,5,4),color:0x9c834d,roughness:1}));farm.rotation.x=-Math.PI/2;farm.position.set(31,.025,-28);farm.receiveShadow=true;scene.add(farm);
  for(let i=0;i<11;i++)for(let j=0;j<8;j++){const st=box(.045,.50,.045,0xb9953f,23.7+i*1.45,.25,-33.5+j*1.5,false);st.rotation.z=(Math.random()-.5)*.12;}

  // Mission props styled as old field-science equipment.
  const climateCab=tbox(1.65,1.55,1.25,TEX.metal,0x9aa297,-17,.78,-18,1,1,true);registerCameraObstacle(climateCab);addBoxCollider(-17,-18,.86,.66,'klimatstation');cyl(.055,3.7,0x4c5853,-17,2.65,-18,10);box(.95,.10,.22,0xcfcab3,-17,4.38,-18,false);box(.07,.82,.07,0x5b625d,-17,4.0,-18,false);
  // little animated anemometer cups
  const anemometer=new THREE.Group();anemometer.position.set(-17,4.45,-18);scene.add(anemometer);for(let k=0;k<3;k++){const a=k*Math.PI*2/3;const arm=boxMesh(.46,.025,.025,0x66716c,.55,.25);arm.position.x=.23;arm.rotation.y=-a;const pivot=new THREE.Group();pivot.rotation.y=a;pivot.add(arm);const cup=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),mat(0x4d5854,.55,.2));cup.scale.set(1,.65,.8);cup.position.set(Math.cos(a)*.45,0,Math.sin(a)*.45);anemometer.add(cup);anemometer.add(pivot);}
  // vegetation quadrat with rope
  for(const [dx,dz] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])cyl(.035,.40,0xe0d3aa,4+dx,.20,-25+dz,8);
  const ropeMat=mat(0xbda86f,.95);for(const [x,z,w,d] of [[4,-26.6,3.2,.035],[4,-23.4,3.2,.035],[2.4,-25,.035,3.2],[5.6,-25,.035,3.2]])box(w,.035,d,ropeMat,x,.32,z,false);
  // camera station with tripod style mounts
  for(let k=0;k<3;k++){const x=22+k*2,z=-12+(k%2)*1.4;cyl(.055,1.65,0x4b4033,x,.82,z,8);addCircleCollider(x,z+.1,.34,'viltkamera');for(const dx of [-.28,.28]){const leg=box(.035,1.25,.035,0x4b4033,x+dx,.55,z+.2,false);leg.rotation.z=dx>0?-.18:.18;}const cam=box(.68,.44,.48,0x303731,x,1.58,z+.25);cam.rotation.y=.4;const lens=new THREE.Mesh(new THREE.CylinderGeometry(.13,.18,.19,12),mat(0x18201d,.25,.45));lens.rotation.x=Math.PI/2;lens.position.set(x+.25,1.58,z+.46);scene.add(lens);}
  // fox den and weathered field flag
  const denOuter=new THREE.Mesh(new THREE.TorusGeometry(1.08,.24,8,28),mat(0x62472f,.95));denOuter.rotation.x=Math.PI/2;denOuter.position.set(28,.17,14);scene.add(denOuter);
  const hole=new THREE.Mesh(new THREE.CircleGeometry(.88,28),new THREE.MeshBasicMaterial({color:0x151109}));hole.rotation.x=-Math.PI/2;hole.position.set(28,.18,14);scene.add(hole);
  addCircleCollider(28,14,.92,'rävlya');
  for(let i=0;i<20;i++){const h=.18+Math.random()*.35;const st=box(.025,h,.025,0x8b8347,25.4+Math.random()*5.3,h/2,11.7+Math.random()*4.8,false);st.rotation.z=(Math.random()-.5)*.35;}
  cyl(.035,2.1,0x56432c,30.1,1.05,12.5,8);const flag=box(.95,.48,.035,0x9a5b35,30.55,1.75,12.5,false);flag.rotation.y=.1;

  // --- Uppdrag 2: gammelskogen / näringsväven ---
  const placePos=id=>{const p=D.world.places.find(q=>q.id===id);return p||{x:0,z:0};};
  const F2={forest:placePos('forest'),producer:placePos('producerPlot'),feeding:placePos('feedingSite'),web:placePos('foodwebBoard'),decomp:placePos('decomposerLog'),energy:placePos('energyStation')};
  // Smala expeditionsstigar binder ihop stationerna. De ger riktning utan att göra skogen linjär.
  function trailBetween(a,b,width=2.15){const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);const p=path((a.x+b.x)/2,(a.z+b.z)/2,L,width,Math.atan2(dz,dx)-Math.PI/2);p.material.opacity=.84;p.material.transparent=true;return p;}
  trailBetween(F2.forest,F2.producer);trailBetween(F2.producer,F2.feeding);trailBetween(F2.feeding,F2.web);trailBetween(F2.web,F2.decomp);trailBetween(F2.decomp,F2.energy);
  function signTexture(title,sub=''){
    const c=document.createElement('canvas');c.width=512;c.height=192;const g=c.getContext('2d');
    g.fillStyle='#d8c89c';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#5e472c';g.lineWidth=12;g.strokeRect(6,6,c.width-12,c.height-12);
    g.fillStyle='#2b261b';g.textAlign='center';g.font='bold 42px Georgia';g.fillText(title,256,78);
    if(sub){g.font='22px Courier New';g.fillStyle='#594c34';g.fillText(sub,256,128);}
    for(let i=0;i<380;i++){g.fillStyle=`rgba(60,45,25,${Math.random()*.05})`;g.fillRect(Math.random()*512,Math.random()*192,1,1);}
    return new THREE.CanvasTexture(c);
  }
  function fieldBoard(title,sub,x,z,rot=0,w=3.3){
    for(const sx of [-1,1])cyl(.07,2.5,0x513b27,x+Math.cos(rot)*sx*w*.36,1.25,z-Math.sin(rot)*sx*w*.36,9);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w*.37),new THREE.MeshStandardMaterial({map:signTexture(title,sub),roughness:.92,side:THREE.DoubleSide}));
    m.position.set(x,2.05,z);m.rotation.y=rot;scene.add(m);addBoxCollider(x,z,w*.47,.18,'fältstation');return m;
  }
  // Gammelskogen: en gammal träskylt markerar ingången till fältsektor B.
  fieldBoard('GAMMELSKOG','FÄLTSEKTOR B · EKO-7',F2.forest.x,F2.forest.z,0,4.0);
  for(const dx of [-.8,.8]){const post=cyl(.08,2.8,0x4f3824,F2.forest.x+dx,1.4,F2.forest.z-1.1,10);registerCameraObstacle(post);}
  const arch=box(2.4,.16,.18,0x684a2d,F2.forest.x,2.75,F2.forest.z-1.1,true);addBoxCollider(F2.forest.x,F2.forest.z-1.1,1.25,.18,'skogsskylt');

  // Producentruta: växter, mätpinnar och små mässingsetiketter.
  for(const [dx,dz] of [[-1.5,-1.3],[1.5,-1.3],[-1.5,1.3],[1.5,1.3]])cyl(.035,.50,0xd9c78b,F2.producer.x+dx,.25,F2.producer.z+dz,8);
  for(const [x,z,w,d] of [[F2.producer.x,F2.producer.z-1.3,3,.035],[F2.producer.x,F2.producer.z+1.3,3,.035],[F2.producer.x-1.5,F2.producer.z,.035,2.6],[F2.producer.x+1.5,F2.producer.z,.035,2.6]])box(w,.03,d,0xb99c62,x,.34,z,false);
  for(let i=0;i<26;i++){const x=F2.producer.x-1.2+Math.random()*2.4,z=F2.producer.z-1+Math.random()*2;const h=.28+Math.random()*.5;box(.025,h,.025,0x54713b,x,h/2,z,false);if(Math.random()<.45)sphere(.05,Math.random()<.5?0x76994d:0x586f38,x,h+.02,z,8);}
  const ptag=fieldBoard('PRODUCENTER','Vem för in energi?',F2.producer.x,F2.producer.z,Math.PI,2.35);ptag.position.y=1.85;

  // Spårplats: gnagda skott, hår och markerade spåravtryck.
  const gnawed=cyl(.12,1.35,0x675038,F2.feeding.x+.3,.68,F2.feeding.z+.3,9);gnawed.rotation.z=.09;addCircleCollider(F2.feeding.x+.3,F2.feeding.z+.3,.18,'ungträd');
  for(let i=0;i<7;i++){const track=new THREE.Mesh(new THREE.CircleGeometry(.09,10),new THREE.MeshBasicMaterial({color:0x4c3c29,transparent:true,opacity:.70}));track.rotation.x=-Math.PI/2;track.scale.set(1,.55,1);track.position.set(F2.feeding.x-1.1+i*.35,.035,F2.feeding.z-.6+Math.sin(i)*.16);scene.add(track);}
  const hair=box(.42,.04,.06,0xb8a689,F2.feeding.x-.6,.16,F2.feeding.z+.9,false);hair.rotation.y=.5;
  fieldBoard('SPÅRPLATS','Växtätare · rovdjur',F2.feeding.x,F2.feeding.z,-.18,2.7);

  // Näringsvävsstation: stor korktavla med artbrickor och röda trådar.
  const board=box(4.5,2.55,.18,0x7c5f3b,F2.web.x,1.75,F2.web.z,true);addBoxCollider(F2.web.x,F2.web.z,2.3,.24,'näringsvävstavla');
  const cork=box(4.15,2.18,.05,0xb28a56,F2.web.x,1.78,F2.web.z-.11,false);cork.material.roughness=.97;
  const cardPos=[[-1.45,.55],[-.15,.72],[1.25,.52],[-1.05,-.2],[.28,-.08],[1.35,-.45],[-.35,-.72]];
  cardPos.forEach(([dx,dy])=>{const c=box(.72,.35,.035,0xe5d8ad,F2.web.x+dx,1.78+dy,F2.web.z-.16,false);c.material.roughness=.9;});
  for(const [a,b] of [[0,3],[1,4],[2,4],[3,6],[4,5]]){const [ax,ay]=cardPos[a],[bx,by]=cardPos[b];const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy);const l=box(L,.025,.018,0x8e3c32,F2.web.x+(ax+bx)/2,1.78+(ay+by)/2,F2.web.z-.20,false);l.rotation.z=Math.atan2(dy,dx);}
  const roof=box(5.0,.16,.7,0x6c5336,F2.web.x,3.25,F2.web.z,true);roof.rotation.z=.02;

  // Nedbrytarplats: gammal stock, svampar och jordprofil.
  const decLog=new THREE.Mesh(new THREE.CylinderGeometry(.34,.42,3.6,12),mat(0x54402c,.98));decLog.rotation.z=Math.PI/2;decLog.position.set(F2.decomp.x,.42,F2.decomp.z);decLog.castShadow=true;scene.add(decLog);addBoxCollider(F2.decomp.x,F2.decomp.z,1.85,.45,'död stock');
  for(let i=0;i<10;i++){const x=F2.decomp.x-1.3+i*.28,z=F2.decomp.z-.2+(i%2)*.28;cyl(.03,.13,0xd8ccb0,x,.53,z,7);const cap=new THREE.Mesh(new THREE.SphereGeometry(.10+(i%3)*.025,8,5,0,Math.PI*2,0,Math.PI*.5),mat(i%2?0xb47a4d:0xc5aa72,.94));cap.position.set(x,.64,z);scene.add(cap);}
  box(1.2,.55,.12,0x4a3524,F2.decomp.x-1.9,.35,F2.decomp.z+1.15,true);addBoxCollider(F2.decomp.x-1.9,F2.decomp.z+1.15,.62,.15,'jordprofil');
  fieldBoard('NEDBRYTARE','Materia går runt',F2.decomp.x,F2.decomp.z+.7,.08,2.7);

  // Energipyramiden: tre staplade träplattformar med ljuspunkter som blir färre uppåt.
  const levels=[[3.5,.35,0x7d8a49],[2.5,.35,0x9b8050],[1.5,.35,0x825b3e]];
  levels.forEach(([w,h,c],i)=>{const y=.22+i*.48;box(w,h,1.5,c,F2.energy.x,y,F2.energy.z,true);addBoxCollider(F2.energy.x,F2.energy.z,w/2,.78,'energipyramid');for(let k=0;k<Math.max(1,7-i*3);k++){const orb=sphere(.045,0xf2d26e,F2.energy.x-w*.36+k*(w*.72/Math.max(1,6-i*3)),y+.24,F2.energy.z-.78,7);orb.material.emissive=new THREE.Color(0xb88a2e);orb.material.emissiveIntensity=.45;}});
  fieldBoard('ENERGIFLÖDE','10–15 % vidare',F2.energy.x,F2.energy.z+1.5,Math.PI,2.8);

  // --- Uppdrag 3: sjöslingan / återkopplingar och resiliens ---
  const F3={lake:placePos('lake'),feedback:placePos('feedbackStation'),capacity:placePos('capacityStation'),flock:placePos('flockPoint'),stability:placePos('stabilityStation'),resilience:placePos('resilienceStation'),threshold:placePos('thresholdStation')};
  trailBetween(placePos('station'),F3.lake,2.3);trailBetween(F3.lake,F3.feedback,2.05);trailBetween(F3.feedback,F3.capacity,2.05);trailBetween(F3.capacity,F3.flock,2.05);trailBetween(F3.flock,F3.stability,2.05);trailBetween(F3.stability,F3.resilience,2.05);trailBetween(F3.resilience,F3.threshold,2.05);trailBetween(F3.threshold,placePos('station'),2.15);

  // Fältsektor C: liten brygga, provlådor och sjösensorer.
  fieldBoard('SJÖN','FÄLTSEKTOR C · SYSTEMDYNAMIK',F3.lake.x,F3.lake.z,Math.PI/2,4.0);
  const dock=tbox(4.3,.16,1.7,TEX.wood,0x8a6840,F3.lake.x-1.5,.18,F3.lake.z,3,1,true);dock.rotation.y=Math.PI/2;addBoxCollider(F3.lake.x-1.5,F3.lake.z,.85,2.15,'brygga');
  for(const zz of [-1.5,1.5])cyl(.08,1.0,0x4d3925,F3.lake.x-2.2,.5,F3.lake.z+zz,9);
  const sensorPole=cyl(.055,2.4,0x59645e,F3.lake.x+.9,1.2,F3.lake.z-1.25,10);registerCameraObstacle(sensorPole);
  box(.72,.42,.36,0x6e756d,F3.lake.x+.9,2.15,F3.lake.z-1.25,true);addCircleCollider(F3.lake.x+.9,F3.lake.z-1.25,.28,'sjösensor');
  crate(F3.lake.x+1.6,.06,F3.lake.z+1.1,.58);

  // C1: gammal kurvstation med två mätserier i olika material.
  fieldBoard('ÅTERKOPPLING','Rovdjur · bytesdjur',F3.feedback.x,F3.feedback.z,-.25,3.25);
  const curveBoard=box(3.25,1.7,.12,0x6b5033,F3.feedback.x,1.55,F3.feedback.z+.9,true);addBoxCollider(F3.feedback.x,F3.feedback.z+.9,1.65,.18,'kurvstation');
  for(let i=0;i<7;i++){const h1=.18+[.30,.72,1.05,.68,.28,.42,.82][i];const h2=.18+[.20,.31,.58,.96,.79,.38,.23][i];box(.14,h1,.08,0xc6b45c,F3.feedback.x-1.25+i*.40,h1/2+.45,F3.feedback.z+.80,false);box(.14,h2,.08,0x526e72,F3.feedback.x-1.18+i*.40,h2/2+.45,F3.feedback.z+.66,false);}
  sphere(.09,0xd3bd63,F3.feedback.x-1.35,2.50,F3.feedback.z+.72,8);sphere(.09,0x58777b,F3.feedback.x-.65,2.50,F3.feedback.z+.72,8);

  // C2: betesbur och resursmätning – visuellt ankare för bärförmåga.
  fieldBoard('BÄRFÖRMÅGA','Resurser sätter gränsen',F3.capacity.x,F3.capacity.z,.15,3.5);
  for(const [dx,dz] of [[-1.55,-1.25],[1.55,-1.25],[-1.55,1.25],[1.55,1.25]])cyl(.045,1.25,0x756b58,F3.capacity.x+dx,.63,F3.capacity.z+dz,8);
  for(const [x,z,w,d] of [[F3.capacity.x,F3.capacity.z-1.25,3.1,.045],[F3.capacity.x,F3.capacity.z+1.25,3.1,.045],[F3.capacity.x-1.55,F3.capacity.z,.045,2.5],[F3.capacity.x+1.55,F3.capacity.z,.045,2.5]])box(w,.04,d,0x7d765f,x,.75,z,false);
  for(let i=0;i<18;i++){const x=F3.capacity.x-1.25+Math.random()*2.5,z=F3.capacity.z-1+Math.random()*2;const h=.18+Math.random()*.34;box(.025,h,.025,0x617846,x,h/2,z,false);}
  addBoxCollider(F3.capacity.x,F3.capacity.z,1.62,1.32,'betesbur');

  // C3: fågeludde – sittande fåglar och spaningspunkt.
  fieldBoard('FÅGELUDDEN','Förstärkande återkoppling',F3.flock.x,F3.flock.z,-.55,3.2);
  for(let i=0;i<6;i++){const rx=F3.flock.x-1.4+i*.55,rz=F3.flock.z+.85+Math.sin(i)*.18;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.30+(i%2)*.08,0),mat(0x77776c,.96));rock.scale.set(1.35,.62,1);rock.position.set(rx,.18,rz);scene.add(rock);addCircleCollider(rx,rz,.30,'udde sten');const bird=sphere(.11,0xe7e4d6,rx,.47,rz,9);bird.scale.set(1.15,.8,.9);const head=sphere(.07,0xf0ede2,rx+.10,.55,rz,8);const beak=new THREE.Mesh(new THREE.ConeGeometry(.025,.10,6),mat(0xc59d3d,.8));beak.rotation.z=-Math.PI/2;beak.position.set(rx+.18,.55,rz);scene.add(beak);}

  // C4: två dataloggrar – lugn och hackig signal.
  fieldBoard('STABILITET','Stabilt ≠ stillastående',F3.stability.x,F3.stability.z,Math.PI/2,3.45);
  for(const dz of [-.95,.95]){const cab=box(1.15,1.1,.72,0x777c73,F3.stability.x+1.0,.85,F3.stability.z+dz,true);addBoxCollider(F3.stability.x+1.0,F3.stability.z+dz,.62,.40,'datalogger');for(let i=0;i<5;i++){const y=.58+([.12,.18,.16,.21,.17][i]+(dz>0?[0,.45,-.2,.38,-.08][i]:0));sphere(.035,dz<0?0x8caf68:0xc27b4b,F3.stability.x+.72+i*.14,y,F3.stability.z+dz-.38,7);}}

  // C5: provbord med två transparenta mesokosmer – en återhämtar sig, en förblir grumlig.
  fieldBoard('RESILIENS','Återhämtning efter störning',F3.resilience.x,F3.resilience.z,.35,3.5);
  tbox(3.5,.15,1.25,TEX.wood,0x8a6840,F3.resilience.x,.82,F3.resilience.z+.8,2,1,true);addBoxCollider(F3.resilience.x,F3.resilience.z+.8,1.78,.65,'resiliensbord');
  for(const dx of [-.72,.72]){const tankMat=new THREE.MeshPhysicalMaterial({color:dx<0?0x6b9a88:0x76855a,roughness:.18,transparent:true,opacity:.62,clearcoat:.4});const tank=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.9,20),tankMat);tank.position.set(F3.resilience.x+dx,1.35,F3.resilience.z+.8);scene.add(tank);const cap=new THREE.Mesh(new THREE.TorusGeometry(.43,.035,7,20),mat(0x575c53,.6,.2));cap.rotation.x=Math.PI/2;cap.position.set(F3.resilience.x+dx,1.80,F3.resilience.z+.8);scene.add(cap);}

  // C6: mekanisk belastningsmätare och varningslykta för tröskelvärde.
  fieldBoard('TRÖSKEL','När slår systemet om?',F3.threshold.x,F3.threshold.z,-.25,3.35);
  const gauge=new THREE.Mesh(new THREE.TorusGeometry(.72,.10,10,28),mat(0x776445,.55,.28));gauge.rotation.x=Math.PI/2;gauge.position.set(F3.threshold.x,1.4,F3.threshold.z+.95);scene.add(gauge);
  const needle=box(.06,.78,.05,0xa94c3d,F3.threshold.x,1.4,F3.threshold.z+.89,false);needle.rotation.z=-.65;
  const beacon=sphere(.18,0xd16a3f,F3.threshold.x+1.25,1.55,F3.threshold.z+.9,10);beacon.material.emissive=new THREE.Color(0x8f2e1f);beacon.material.emissiveIntensity=.9;
  cyl(.08,1.3,0x55584f,F3.threshold.x+1.25,.7,F3.threshold.z+.9,9);addCircleCollider(F3.threshold.x+1.25,F3.threshold.z+.9,.22,'varningslykta');

  // Frivillig observationspunkt: parasit på ett värdträd (kopplar till kap. 5.3 utan att bryta huvudflödet).
  tree(-34,35,.86);for(const [dx,dy,dz] of [[.18,2.05,.05],[-.12,2.18,.12],[.05,2.32,-.08]]){const cl=sphere(.24,0x6d8746,-34+dx,dy,35+dz,10);cl.scale.set(1.4,.75,1.0);}


  // --- Uppdrag 4: ekosystemtjänster / markanvändning ---
  const F4={wetland:placePos('wetland'),outlet:placePos('wetlandSensor'),poll:placePos('pollinatorMeadow'),farm:placePos('farm'),forest:placePos('forestCompare'),services:placePos('serviceStation')};
  trailBetween(placePos('station'),F4.wetland,2.1);trailBetween(F4.wetland,F4.outlet,2.2);trailBetween(F4.outlet,F4.poll,2.0);trailBetween(F4.poll,F4.farm,2.0);trailBetween(F4.farm,F4.forest,2.0);trailBetween(F4.forest,F4.services,2.0);trailBetween(F4.services,placePos('station'),2.1);

  // E0 – våtmark: grundvatten, vass och ett gammalt mätbord.
  fieldBoard('VÅTMARK','FÄLTSEKTOR E · VATTENRENING',F4.wetland.x,F4.wetland.z,.22,3.7);
  const marshMat=new THREE.MeshPhysicalMaterial({color:0x547d72,roughness:.34,metalness:.02,transparent:true,opacity:.72,clearcoat:.22});
  for(const [dx,dz,rx,rz] of [[-1.6,.5,2.5,1.8],[1.6,-.5,2.2,1.5],[.2,1.7,1.9,1.1]]){
    const patch=new THREE.Mesh(new THREE.CircleGeometry(1,28),marshMat.clone());patch.scale.set(rx,rz,1);patch.rotation.x=-Math.PI/2;patch.position.set(F4.wetland.x+dx,.04,F4.wetland.z+dz);scene.add(patch);
  }
  for(let i=0;i<55;i++){const a=Math.random()*Math.PI*2,r=1+Math.random()*3.1,x=F4.wetland.x+Math.cos(a)*r,z=F4.wetland.z+Math.sin(a)*r;const h=.45+Math.random()*.9;const reed=box(.028,h,.028,0x617b43,x,h/2,z,false);reed.rotation.z=(Math.random()-.5)*.18;}
  tbox(2.5,.14,1.1,TEX.wood,0x8a6840,F4.wetland.x+3.3,.72,F4.wetland.z+.6,2,1,true);addBoxCollider(F4.wetland.x+3.3,F4.wetland.z+.6,1.3,.6,'våtmarksbord');
  for(const x of [-.62,.62]){const tube=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.72,14),new THREE.MeshPhysicalMaterial({color:x<0?0x6ca29b:0x7d8b59,transparent:true,opacity:.66,roughness:.2}));tube.position.set(F4.wetland.x+3.3+x,1.18,F4.wetland.z+.6);scene.add(tube);}

  // E1 – rakt dräneringsdike och utlopp.
  fieldBoard('UTLOPP','Näring på väg mot sjön',F4.outlet.x,F4.outlet.z,.55,3.1);
  const ditchMat=new THREE.MeshStandardMaterial({color:0x496c69,roughness:.32,transparent:true,opacity:.82});
  const ditch=new THREE.Mesh(new THREE.PlaneGeometry(2.2,7.0),ditchMat);ditch.rotation.x=-Math.PI/2;ditch.rotation.z=-.22;ditch.position.set(F4.outlet.x+.5,.035,F4.outlet.z+.6);scene.add(ditch);
  for(const side of [-1,1])for(let i=0;i<6;i++){const st=cyl(.04,.55+Math.random()*.4,0x697d48,F4.outlet.x+side*1.25+i*.12,.35,F4.outlet.z-2+i*.78,7);st.rotation.z=side*.08;}
  const outCab=tbox(1.25,1.15,.75,TEX.metal,0x858d85,F4.outlet.x+2.4,.65,F4.outlet.z-.8,1,1,true);addBoxCollider(F4.outlet.x+2.4,F4.outlet.z-.8,.68,.44,'utloppssensor');
  cyl(.05,2.2,0x59645e,F4.outlet.x+2.4,1.65,F4.outlet.z-.8,9);

  // E2 – blomrik kantzon med enkel insektshotell / provstation.
  fieldBoard('POLLINATÖRSÄNG','Blommor · bin · grödor',F4.poll.x,F4.poll.z,-.12,3.4);
  for(let i=0;i<80;i++){const x=F4.poll.x-3+Math.random()*6,z=F4.poll.z-2+Math.random()*4,h=.28+Math.random()*.55;box(.024,h,.024,0x54733d,x,h/2,z,false);const col=[0xe2c44f,0xd5896a,0xc0a2cf,0xf0e2c1][i%4];sphere(.055+Math.random()*.025,col,x,h+.02,z,8);}
  const hotel=box(1.15,1.45,.45,0x6f5131,F4.poll.x+2.8,.82,F4.poll.z+1.0,true);addBoxCollider(F4.poll.x+2.8,F4.poll.z+1.0,.62,.30,'insektshotell');
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){const hole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.42,8),mat(0x2d2217,.95));hole.rotation.x=Math.PI/2;hole.position.set(F4.poll.x+2.45+x*.22,.62+y*.26,F4.poll.z+.74);scene.add(hole);}
  // några stiliserade bin
  for(let i=0;i<10;i++){const x=F4.poll.x-2.6+Math.random()*5.2,z=F4.poll.z-1.7+Math.random()*3.4,y=.55+Math.random()*1.25;const bee=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),mat(0xc99a2e,.7));body.scale.set(1.5,.8,.8);bee.add(body);for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.PlaneGeometry(.10,.07),new THREE.MeshBasicMaterial({color:0xdbe4df,transparent:true,opacity:.65,side:THREE.DoubleSide}));wing.position.set(0,0,side*.07);bee.add(wing);}bee.position.set(x,y,z);scene.add(bee);}

  // E3 – monokultur: befintligt fält kompletteras med homogena rader och borttagen kantzon.
  fieldBoard('MONOKULTUR','En gröda · stor yta',F4.farm.x,F4.farm.z,.18,3.4);
  for(let row=0;row<6;row++){const ridge=box(12,.045,.18,0x715b35,F4.farm.x,.055,F4.farm.z-4+row*1.55,false);ridge.rotation.y=.02;}
  const pesticide=tbox(.85,1.2,.6,TEX.metal,0x8c835d,F4.farm.x+6.1,.65,F4.farm.z+3.8,1,1,true);addBoxCollider(F4.farm.x+6.1,F4.farm.z+3.8,.48,.36,'fältbehållare');
  const oldHedge=fallenLog(F4.farm.x-6.6,F4.farm.z+3.8,2.2,.1);

  // E4 – två skogsrutor sida vid sida.
  fieldBoard('SKOGSJÄMFÖRELSE','Naturskog ↔ odlad skog',F4.forest.x,F4.forest.z,.08,4.1);
  // naturskog till vänster: blandade träd, död ved, buskar
  tree(F4.forest.x-3.4,F4.forest.z-.4,.88);pine(F4.forest.x-2.3,F4.forest.z+1.5,.82);tree(F4.forest.x-4.0,F4.forest.z+1.9,.62);
  fallenLog(F4.forest.x-3.1,F4.forest.z+3.0,2.6,-.3);for(let i=0;i<8;i++)fern(F4.forest.x-4.6+Math.random()*3.5,F4.forest.z-1.8+Math.random()*4,.55+Math.random()*.4);
  // odlad skog till höger: raka likåldriga granrader
  for(let rz=0;rz<3;rz++)for(let rx=0;rx<3;rx++)pine(F4.forest.x+1.7+rx*1.45,F4.forest.z-1.7+rz*1.7,.74);
  const divider=box(.08,.06,6.0,0xd3bb76,F4.forest.x,.06,F4.forest.z+.5,false);

  // E5 – tjänststation: fem små fältlådor som symboliserar det som människan får.
  fieldBoard('EKOSYSTEMTJÄNSTER','Vad får vi – och vad riskerar vi?',F4.services.x,F4.services.z,-.32,4.1);
  tbox(4.8,.16,1.4,TEX.wood,0x85633c,F4.services.x,.70,F4.services.z+.9,3,1,true);addBoxCollider(F4.services.x,F4.services.z+.9,2.45,.75,'tjänstebord');
  const serviceCols=[0x6e9a91,0xd5ad43,0x7d8a49,0x8b6840,0x527e87];
  for(let i=0;i<5;i++){const crateM=box(.58,.50,.58,serviceCols[i],F4.services.x-1.55+i*.78,1.04,F4.services.z+.9,true);crateM.material.roughness=.88;}
  // en gammal arkivskylt om kostnaden när naturens funktion måste ersättas
  const note=tbox(1.2,.8,.10,TEX.wood,0xaa8752,F4.services.x+3.1,1.4,F4.services.z+.2,1,1,true);note.rotation.y=-.25;addBoxCollider(F4.services.x+3.1,F4.services.z+.2,.65,.16,'tjänsteskylt');

  // --- Uppdrag 5: planetens gränser / gemensamma resurser / hållbar utveckling ---
  const F5={boundary:placePos('boundaryLab'),bio:placePos('biodiversityArchive'),foot:placePos('footprintStation'),commons:placePos('commonsDock'),fair:placePos('fairSpace'),sustain:placePos('sustainabilityStation')};
  trailBetween(F4.farm,F5.boundary,2.15);trailBetween(F5.boundary,F5.bio,2.05);trailBetween(F5.bio,F5.foot,2.0);trailBetween(F5.foot,F5.commons,2.0);trailBetween(F5.commons,F5.fair,2.0);trailBetween(F5.fair,F5.sustain,2.0);trailBetween(F5.sustain,placePos('station'),2.15);

  // Den östra sektorn är en gammal forskningskorridor med gles skog mellan stationerna.
  const eastSites=Object.values(F5);
  const eastTrailSegments=[[F4.farm,F5.boundary],[F5.boundary,F5.bio],[F5.bio,F5.foot],[F5.foot,F5.commons],[F5.commons,F5.fair],[F5.fair,F5.sustain],[F5.sustain,placePos('station')]];
  function pointSegDist(px,pz,a,b){const vx=b.x-a.x,vz=b.z-a.z,wx=px-a.x,wz=pz-a.z,c1=vx*wx+vz*wz,c2=vx*vx+vz*vz,t=Math.max(0,Math.min(1,c2?c1/c2:0));return Math.hypot(px-(a.x+t*vx),pz-(a.z+t*vz));}
  function nearEastSite(x,z,pad=4.3){return eastSites.some(q=>Math.hypot(x-q.x,z-q.z)<pad)||eastTrailSegments.some(([a,b])=>pointSegDist(x,z,a,b)<1.8);}
  for(let i=0;i<38;i++){
    let x=43+Math.random()*26,z=-36+Math.random()*91;
    if(nearEastSite(x,z,4.7)){i--;continue;}
    (Math.random()<.55?tree:pine)(x,z,.58+Math.random()*.45);
  }
  for(let i=0;i<34;i++){let x=43+Math.random()*27,z=-35+Math.random()*89;if(nearEastSite(x,z,2.4))continue;fern(x,z,.42+Math.random()*.55);}

  // F0 – gränslabbet: sexkantigt instrumentbord med analoga mätare.
  fieldBoard('GRÄNSLABB','PLANETENS GRÄNSER · FÄLTSEKTOR F',F5.boundary.x,F5.boundary.z,.1,4.2);
  tbox(4.4,.16,1.5,TEX.wood,0x85643e,F5.boundary.x,.74,F5.boundary.z+.95,3,1,true);addBoxCollider(F5.boundary.x,F5.boundary.z+.95,2.25,.78,'gränslabb bord');
  const gaugeCols=[0xa44f3d,0xb98438,0xa85243,0xb88d42];
  for(let i=0;i<4;i++){
    const gx=F5.boundary.x-1.45+i*.96,gz=F5.boundary.z+.88;
    const tor=new THREE.Mesh(new THREE.TorusGeometry(.31,.055,8,24),mat(0x786746,.55,.25));tor.rotation.x=Math.PI/2;tor.position.set(gx,1.14,gz);scene.add(tor);
    const face=new THREE.Mesh(new THREE.CircleGeometry(.27,20),new THREE.MeshBasicMaterial({color:0xd8cfaa,side:THREE.DoubleSide}));face.rotation.x=-Math.PI/2;face.position.set(gx,1.135,gz);scene.add(face);
    const nd=box(.035,.27,.025,gaugeCols[i],gx,1.145,gz,false);nd.rotation.y=(i<2?-.8:.35);
  }
  const warningLamp=sphere(.13,0xb4513c,F5.boundary.x+2.5,1.28,F5.boundary.z+.75,10);warningLamp.material.emissive=new THREE.Color(0x7b241b);warningLamp.material.emissiveIntensity=.8;

  // F1 – artarkiv: två gamla landskapskartor och lådor med artkort.
  fieldBoard('ARTARKIV','HABITAT · ARTFÖRLUST',F5.bio.x,F5.bio.z,-.2,3.6);
  for(const dx of [-1.2,1.2]){
    const frame=box(2.0,1.45,.12,0x64492f,F5.bio.x+dx,1.55,F5.bio.z+.75,true);addBoxCollider(F5.bio.x+dx,F5.bio.z+.75,1.05,.16,'arkivkarta');
    const mapcol=dx<0?0x79905d:0xae9a6b;box(1.72,1.16,.035,mapcol,F5.bio.x+dx,1.55,F5.bio.z+.67,false);
    if(dx>0){for(let k=0;k<5;k++)box(.22,.16,.04,0xd4c88f,F5.bio.x+dx-0.62+(k%3)*.55,1.25+Math.floor(k/3)*.46,F5.bio.z+.64,false);}
  }
  for(let i=0;i<4;i++){const crate=tbox(.75,.48,.70,TEX.wood,0x8c6b43,F5.bio.x-1.35+i*.90,.26,F5.bio.z-1.05,1,1,true);addBoxCollider(crate.position.x,crate.position.z,.40,.38,'artarkiv låda');}

  // F2 – fotavtrycksstationen: två lägerprofiler med olika mängd utrustning.
  fieldBoard('FOTAVTRYCK','KONSUMTION · RESURSANSPRÅK',F5.foot.x,F5.foot.z,.2,4.0);
  const footprintBase=tbox(5.0,.12,1.5,TEX.wood,0x86653e,F5.foot.x,.62,F5.foot.z+.8,3,1,true);addBoxCollider(F5.foot.x,F5.foot.z+.8,2.55,.8,'fotavtrycksbord');
  // vänster: många stora resurslådor; höger: färre mindre.
  for(let i=0;i<5;i++)tbox(.58,.42,.52,TEX.canvas,0xb59a63,F5.foot.x-1.75+(i%3)*.64,.92+Math.floor(i/3)*.43,F5.foot.z+.78,1,1,true);
  for(let i=0;i<2;i++)tbox(.48,.34,.44,TEX.canvas,0x81906a,F5.foot.x+.95+i*.62,.84,F5.foot.z+.78,1,1,true);
  const scaleBeam=box(2.7,.07,.07,0x75603c,F5.foot.x,1.85,F5.foot.z+.75,false);scaleBeam.rotation.z=-.16;cyl(.08,1.2,0x5e5748,F5.foot.x,1.24,F5.foot.z+.75,10);

  // F3 – gemensamma fisket: liten damm, brygga och tre fiskelådor.
  fieldBoard('GEMENSAM RESURS','TRE FISKELAG · EN SJÖ',F5.commons.x,F5.commons.z,-.28,3.8);
  const commonPond=new THREE.Mesh(new THREE.CircleGeometry(5.2,48),new THREE.MeshPhysicalMaterial({color:0x477d83,roughness:.18,transparent:true,opacity:.86,clearcoat:.42}));commonPond.rotation.x=-Math.PI/2;commonPond.position.set(F5.commons.x+1.2,.045,F5.commons.z+2.9);scene.add(commonPond);addCircleCollider(F5.commons.x+1.2,F5.commons.z+2.9,4.75,'gemensam fiskedamm');
  const commonShore=new THREE.Mesh(new THREE.RingGeometry(5.0,5.65,40),new THREE.MeshStandardMaterial({color:0x827858,roughness:1,side:THREE.DoubleSide}));commonShore.rotation.x=-Math.PI/2;commonShore.position.set(F5.commons.x+1.2,.027,F5.commons.z+2.9);scene.add(commonShore);
  for(let i=0;i<5;i++){const plank=tbox(.90,.12,2.0,TEX.wood,0x886640,F5.commons.x-1.3+i*.82,.20,F5.commons.z+.65,1,1,true);addBoxCollider(plank.position.x,plank.position.z,.46,1.02,'brygga');}
  for(let i=0;i<3;i++){const fc=tbox(.78,.50,.62,TEX.wood,[0x8a6e42,0x786542,0x9a7440][i],F5.commons.x-2.1+i*.92,.36,F5.commons.z-1.05,1,1,true);addBoxCollider(fc.position.x,fc.position.z,.42,.34,'fiskelåda');}

  // F4 – rättvist miljöutrymme: en gammal balansvåg med tre resursstaplar.
  fieldBoard('MILJÖUTRYMME','RÄTTVISA INOM EN GRÄNS',F5.fair.x,F5.fair.z,.05,4.0);
  const fairTable=tbox(4.6,.14,1.45,TEX.wood,0x84613c,F5.fair.x,.72,F5.fair.z+.9,3,1,true);addBoxCollider(F5.fair.x,F5.fair.z+.9,2.35,.76,'miljöutrymmesbord');
  cyl(.09,1.5,0x5d584c,F5.fair.x,1.48,F5.fair.z+.9,10);const fairBeam=box(3.3,.08,.10,0x6c5a3d,F5.fair.x,2.05,F5.fair.z+.9,false);fairBeam.rotation.z=.02;
  const piles=[4,2,1];for(let g=0;g<3;g++)for(let i=0;i<piles[g];i++){const xx=F5.fair.x-1.5+g*1.5+(i%2)*.25,yy=.98+Math.floor(i/2)*.28;box(.34,.25,.34,[0x9a6945,0x8a8152,0x66856b][g],xx,yy,F5.fair.z+.88,true);}

  // F5 – hållbarhetsrådet: runt fältbord med en enkel jordglob och mätkort.
  fieldBoard('HÅLLBARHETSRÅDET','IDAG ↔ FRAMTIDEN',F5.sustain.x,F5.sustain.z,.0,4.0);
  const roundTop=new THREE.Mesh(new THREE.CylinderGeometry(2.0,2.0,.15,24),texMat(TEX.wood,0x8e7047,.94));roundTop.position.set(F5.sustain.x,.82,F5.sustain.z+.8);roundTop.castShadow=true;scene.add(roundTop);addCircleCollider(F5.sustain.x,F5.sustain.z+.8,2.05,'rådsbord');
  cyl(.25,1.35,0x5d4b34,F5.sustain.x,.65,F5.sustain.z+.8,12);
  const globe=sphere(.50,0x4f7b80,F5.sustain.x,1.48,F5.sustain.z+.8,16);globe.material.roughness=.55;for(let k=0;k<5;k++){const land=sphere(.12+Math.random()*.08,0x708a4f,F5.sustain.x+(Math.random()-.5)*.55,1.42+(Math.random()-.5)*.45,F5.sustain.z+.35+(Math.random()-.5)*.34,8);land.scale.set(1.5,.55,.5);}
  const globeRing=new THREE.Mesh(new THREE.TorusGeometry(.62,.025,7,28),mat(0x8a7045,.52,.2));globeRing.rotation.x=.35;globeRing.position.set(F5.sustain.x,1.48,F5.sustain.z+.8);scene.add(globeRing);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;const stool=new THREE.Mesh(new THREE.CylinderGeometry(.34,.38,.44,12),mat(0x695039,.9));stool.position.set(F5.sustain.x+Math.cos(a)*2.75,.24,F5.sustain.z+.8+Math.sin(a)*2.75);scene.add(stool);addCircleCollider(stool.position.x,stool.position.z,.40,'rådspall');}

  // Frivillig observation i naturskogen: känslig lav som indikator på gammal, orörd skog.
  tree(35.8,1.8,.82);
  for(let i=0;i<5;i++){const strand=new THREE.Mesh(new THREE.CylinderGeometry(.015,.022,.9+Math.random()*.5,5),mat(0x9aa57a,.96));strand.rotation.z=.25+(Math.random()-.5)*.3;strand.position.set(35.9+i*.05,1.65-i*.04,1.8);scene.add(strand);}

  // Ambient animals.
  function rabbit(x,z,s=.75){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(.35*s,12,9),mat(0xb3a185,.94));body.scale.set(1.4,1,.9);body.castShadow=true;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.24*s,11,8),mat(0xc1b092,.94));head.position.set(.43*s,.2*s,0);head.castShadow=true;g.add(head);for(const zz of [-.1,.1]){const ear=new THREE.Mesh(new THREE.BoxGeometry(.08*s,.45*s,.08*s),mat(0xc1b092,.94));ear.position.set(.48*s,.55*s,zz*s);ear.rotation.z=-.12;g.add(ear);}const eye=new THREE.Mesh(new THREE.SphereGeometry(.035*s,7,6),mat(0x15120f,.4));eye.position.set(.64*s,.25*s,.16*s);g.add(eye);g.position.set(x,.32*s,z);scene.add(g);return g;}
  const rabbits=[];for(let i=0;i<9;i++)rabbits.push(rabbit(-2+Math.random()*16,-30+Math.random()*12,.65+Math.random()*.3));
  const mice=[];for(let i=0;i<5;i++){const m=sphere(.11,0x817460,18+Math.random()*8,.11,-10+Math.random()*5,10);m.scale.set(1.5,.8,1);mice.push(m);}

  // Birds and butterflies give the reserve some life without expensive models.
  const birds=[];for(let i=0;i<6;i++){const g=new THREE.Group();for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.BoxGeometry(.48,.025,.13),mat(0x292d26,.85));wing.position.x=side*.25;wing.rotation.z=side*.18;g.add(wing);g.userData['w'+side]=wing;}scene.add(g);birds.push({g,cx:-6+Math.random()*20,cz:12+Math.random()*20,r:7+Math.random()*10,h:7+Math.random()*5,sp:.14+Math.random()*.12,t:Math.random()*6});}
  const butterflies=[];for(let i=0;i<18;i++){const g=new THREE.Group();const color=i%3===0?0xe0b94c:i%3===1?0xc97a57:0x8d79b9;for(const side of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.10,.075),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.86}));w.position.x=side*.055;g.add(w);g.userData['w'+side]=w;}g.position.set(-3+Math.random()*20,.45+Math.random()*1.3,-31+Math.random()*16);scene.add(g);butterflies.push({g,base:g.position.clone(),ph:Math.random()*6});}

  function setRestorationVisual(level=1){
    state.restorationVisual=Math.max(state.restorationVisual||0,level);
    if(state.restorationVisual>0){
      lake.material.color.set(0x4f9697);lake.material.opacity=.94;
      butterflies.forEach((b,i)=>{b.g.visible=true;b.g.children.forEach(w=>{if(w.material)w.material.opacity=.96;});});
      scene.fog.color.set(0x9eaf92);renderer.toneMappingExposure=1.10;
    }
    save();
  }
  window.EKO7.setRestorationVisual=setRestorationVisual;

  // Dust / pollen motes in the warm shafts of light.
  const moteN=170,motePos=new Float32Array(moteN*3),motePhase=[];
  for(let i=0;i<moteN;i++){motePos[i*3]=(Math.random()-.5)*80;motePos[i*3+1]=.4+Math.random()*4.8;motePos[i*3+2]=(Math.random()-.5)*72;motePhase.push(Math.random()*6.28);}
  const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.BufferAttribute(motePos,3));const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:0xe5cc8a,size:.045,transparent:true,opacity:.32,depthWrite:false}));scene.add(motes);

  // Player: an original rugged field biologist / expedition explorer.
  function makeExplorer(){
    const root=new THREE.Group();
    const visual=new THREE.Group();root.add(visual);
    const khaki=0x8f8458,khakiDark=0x6e6845,leather=0x533b26,pants=0x565846,boot=0x2c251d,skin=0xc79f78;
    const pelvis=boxMesh(.58,.30,.34,pants);pelvis.position.y=.83;visual.add(pelvis);
    const torso=boxMesh(.72,.82,.40,khaki);torso.position.y=1.28;visual.add(torso);
    // shirt pockets / collar
    const p1=boxMesh(.20,.17,.035,khakiDark);p1.position.set(-.20,1.38,.22);visual.add(p1);const p2=p1.clone();p2.position.x=.20;visual.add(p2);
    const collarL=boxMesh(.22,.08,.04,0x6b6544);collarL.position.set(-.12,1.68,.215);collarL.rotation.z=-.28;visual.add(collarL);const collarR=collarL.clone();collarR.position.x=.12;collarR.rotation.z=.28;visual.add(collarR);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.18,10),mat(skin));neck.position.y=1.76;visual.add(neck);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.235,16,12),mat(skin,.82));head.position.y=1.96;head.castShadow=true;visual.add(head);
    // hair
    const hair=new THREE.Mesh(new THREE.SphereGeometry(.245,14,10,0,Math.PI*2,0,Math.PI*.52),mat(0x3a2b20,.9));hair.position.y=2.04;visual.add(hair);
    // expedition hat: broad brim, crown, leather band
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(.41,.41,.055,22),mat(0x5d4229,.92));brim.position.y=2.17;visual.add(brim);
    const crown=new THREE.Mesh(new THREE.CylinderGeometry(.25,.29,.28,18),mat(0x66482d,.9));crown.position.y=2.32;crown.scale.z=.92;visual.add(crown);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(.295,.295,.055,18),mat(0x2c2118,.72));band.position.y=2.23;visual.add(band);
    // tiny face details
    for(const x of [-.08,.08]){const e=new THREE.Mesh(new THREE.SphereGeometry(.022,7,6),mat(0x221a13,.5));e.position.set(x,1.99,.222);visual.add(e);}const nose=new THREE.Mesh(new THREE.ConeGeometry(.035,.10,7),mat(0xb98f6a,.85));nose.rotation.x=Math.PI/2;nose.position.set(0,1.93,.255);visual.add(nose);
    // backpack and field-roll
    const pack=boxMesh(.56,.70,.25,0x4f5136);pack.position.set(0,1.25,-.33);visual.add(pack);
    const roll=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.57,10),mat(0xafa06c,.92));roll.rotation.z=Math.PI/2;roll.position.set(0,1.58,-.49);visual.add(roll);
    // satchel strap and leather bag
    const strap=boxMesh(.055,1.30,.035,leather);strap.position.set(.05,1.33,.225);strap.rotation.z=-.55;visual.add(strap);
    const satchel=boxMesh(.42,.38,.18,0x5c3d25);satchel.position.set(.45,.88,.07);satchel.rotation.z=-.08;visual.add(satchel);
    // field-biologist gear: binoculars, specimen tube and map case
    const binoBar=boxMesh(.29,.11,.11,0x2f332b,.58,.18);binoBar.position.set(-.23,1.26,.28);visual.add(binoBar);for(const x of [-.09,.09]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.055,.07,.18,9),mat(0x252922,.5,.25));b.rotation.x=Math.PI/2;b.position.set(-.23+x,1.25,.35);visual.add(b);}
    const mapCase=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.48,10),mat(0x8d6b3d,.92));mapCase.rotation.z=.18;mapCase.position.set(-.37,.95,-.05);visual.add(mapCase);
    // arms with shoulder/elbow pivots
    const arms=[];
    function arm(side){const shoulder=new THREE.Group();shoulder.position.set(side*.45,1.58,0);const upper=boxMesh(.19,.55,.20,khaki);upper.position.y=-.27;shoulder.add(upper);const elbow=new THREE.Group();elbow.position.y=-.54;const fore=boxMesh(.17,.48,.18,skin);fore.position.y=-.23;elbow.add(fore);const hand=new THREE.Mesh(new THREE.SphereGeometry(.095,9,7),mat(skin,.84));hand.position.y=-.50;elbow.add(hand);shoulder.add(elbow);visual.add(shoulder);arms.push({shoulder,elbow});}
    arm(-1);arm(1);
    // legs with hip/knee pivots
    const legs=[];
    function leg(side){const hip=new THREE.Group();hip.position.set(side*.19,.83,0);const thigh=boxMesh(.23,.56,.25,pants);thigh.position.y=-.28;hip.add(thigh);const knee=new THREE.Group();knee.position.y=-.55;const calf=boxMesh(.21,.52,.23,pants);calf.position.y=-.25;knee.add(calf);const bt=boxMesh(.24,.17,.42,boot,.72);bt.position.set(0,-.53,.075);knee.add(bt);hip.add(knee);visual.add(hip);legs.push({hip,knee});}
    leg(-1);leg(1);
    root.userData={visual,arms,legs,torso,head,pack,satchel,brim,crown,baseY:0};
    return root;
  }
  const player=makeExplorer();scene.add(player);player.position.set(state.pos.x,0,state.pos.z);

  // markers + POIs
  const markerMap={};
  function createMarker(place,color){
    const g=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.RingGeometry(.7,.95,32),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.95,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.08;g.add(ring);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.45,.7,3.2,18,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));beam.position.y=1.6;g.add(beam);
    g.position.set(place.x,0,place.z);scene.add(g);return {g,ring,beam,color};
  }
  D.world.places.filter(p=>['station','climate','vegetation','camera','den','forest','producerPlot','feedingSite','foodwebBoard','decomposerLog','energyStation','lake','feedbackStation','capacityStation','flockPoint','stabilityStation','resilienceStation','thresholdStation','wetland','wetlandSensor','pollinatorMeadow','farm','forestCompare','serviceStation','boundaryLab','biodiversityArchive','footprintStation','commonsDock','fairSpace','sustainabilityStation'].includes(p.id)).forEach(p=>markerMap[p.id]=createMarker(p,0xffd447));
  const optional=[
    {id:'deadlog',name:'Död ved',x:13,z:22,text:'Död ved är full av liv. Svampar och insekter som bryter ned veden är biotiska faktorer – och viktiga delar av ekosystemet.'},
    {id:'shore',name:'Sjökant',x:-22,z:14,text:'Samma område innehåller både levande och icke-levande delar. Vatten, ljus och temperatur påverkar organismerna i sjön.'},
    {id:'parasite',name:'Parasit på värdväxt',x:-34,z:35,mission:3,text:'Parasiter lever på andra arters bekostnad. Om en parasit vore så framgångsrik att värdarten försvann skulle också parasitens egen möjlighet att överleva försvinna.'},
    {id:'oldlichen',name:'Lav på gammalt träd',x:35.8,z:1.8,mission:4,text:'Vissa lavar och insekter är beroende av gamla träd och lång kontinuitet. När gammal skog och död ved försvinner kan specialiserade arter få svårt att hitta sitt habitat.'},
    {id:'phosphor',name:'Fosforprov',x:54.5,z:-21.5,mission:5,text:'Fosfor är ett viktigt näringsämne men bryts ofta ur begränsade mineralförråd. Om det används fel kan det dessutom bidra till övergödning.'},
    {id:'cotton',name:'Bomullsbalar',x:64.0,z:8.7,mission:5,text:'Även kläder kräver ekosystemtjänster och resurser. Bomull behöver bland annat mark och vatten innan den blir till tyg och kläder.'}
  ];
  optional.forEach(p=>{p.mark=createMarker(p,0x54c6e8);});
  window.EKO7_OPTIONAL=optional;

  function updateMarkers(){
    const target=activeTarget();
    Object.entries(markerMap).forEach(([id,m])=>m.g.visible=!!target&&id===target.id);
    optional.forEach(p=>p.mark.g.visible=!state.optionalSeen[p.id]&&(!p.mission||state.mission>=p.mission));
  }

  function nearPlace(){
    const target=activeTarget();
    if(target && Math.hypot(state.pos.x-target.x,state.pos.z-target.z)<2.4) return {kind:'target',place:target};
    for(const p of optional) if(!state.optionalSeen[p.id] && (!p.mission||state.mission>=p.mission) && Math.hypot(state.pos.x-p.x,state.pos.z-p.z)<2.1) return {kind:'optional',place:p};
    return null;
  }
  window.EKO7.nearPlace=nearPlace;

  const held=new Set();let dragX=null;
  addEventListener('keydown',e=>{
    if(overlay.classList.contains('show')||journalEl.classList.contains('open')||mapOverlay.classList.contains('open')){
      if(e.key==='Escape'){closePanel();showJournal(false);toggleMap(false);} return;
    }
    const k=e.key.length===1?e.key.toLowerCase():e.key;held.add(k);
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k))e.preventDefault();
    if(k==='e'||k==='Enter'||k===' '){ if(state.mission===6 && window.EKO7_M6) window.EKO7_M6.interact(); else if(state.mission===5 && window.EKO7_M5) window.EKO7_M5.interact(); else if(state.mission===4 && window.EKO7_M4) window.EKO7_M4.interact(); else if(state.mission===3 && window.EKO7_M3) window.EKO7_M3.interact(); else if(state.mission===2 && window.EKO7_M2) window.EKO7_M2.interact(); else if(window.EKO7_M1) window.EKO7_M1.interact(); }
    if(k==='j')showJournal(); if(k==='k')toggleMap();
  });
  addEventListener('keyup',e=>held.delete(e.key.length===1?e.key.toLowerCase():e.key));
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===0)dragX=e.clientX;});
  addEventListener('pointermove',e=>{if(dragX!==null&&!overlay.classList.contains('show')){state.yaw-=(e.clientX-dragX)*.006;dragX=e.clientX;}});
  addEventListener('pointerup',()=>dragX=null);
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

  function walkable(x,z){return x>D.world.minX+PLAYER_R&&x<D.world.maxX-PLAYER_R&&z>D.world.minZ+PLAYER_R&&z<D.world.maxZ-PLAYER_R&&!hitsCollider(x,z);}
  function updateHint(){
    const n=nearPlace();
    if(n){hintEl.textContent=n.kind==='target'?`E – undersök: ${n.place.name}`:`E – frivillig observation: ${n.place.name}`;return;}
    hintEl.textContent='W/S gå · A/D sidled · piltangenter eller mus för att vrida · E undersök';
  }

  function drawMap(ctx,w,h){
    const pad=18,minX=D.world.minX,maxX=D.world.maxX,minZ=D.world.minZ,maxZ=D.world.maxZ;
    const X=x=>pad+(x-minX)/(maxX-minX)*(w-pad*2), Z=z=>pad+(z-minZ)/(maxZ-minZ)*(h-pad*2);
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#203324';ctx.fillRect(0,0,w,h);
    // water/farm/forest hints
    ctx.fillStyle='#3e7180';ctx.beginPath();ctx.arc(X(-31),Z(19),Math.min(w,h)*.10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#8c7b43';ctx.fillRect(X(23),Z(-34),X(39)-X(23),Z(-22)-Z(-34));
    ctx.fillStyle='rgba(64,98,52,.8)';ctx.beginPath();ctx.arc(X(2),Z(31),Math.min(w,h)*.1,0,Math.PI*2);ctx.fill();
    // paths
    ctx.strokeStyle='rgba(220,207,164,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(0),Z(-2.8));ctx.lineTo(X(-17),Z(-18));ctx.lineTo(X(4),Z(-25));ctx.lineTo(X(24),Z(-12));ctx.lineTo(X(28),Z(14));ctx.stroke();
    if(state.mission>=2){ctx.beginPath();ctx.moveTo(X(28),Z(14));ctx.lineTo(X(2),Z(31));ctx.lineTo(X(-5),Z(29));ctx.lineTo(X(8),Z(28));ctx.lineTo(X(13),Z(34));ctx.lineTo(X(-7),Z(35));ctx.lineTo(X(5),Z(36.5));ctx.stroke();}
    if(state.mission>=3){ctx.beginPath();ctx.moveTo(X(0),Z(-2.8));ctx.lineTo(X(-20),Z(19));ctx.lineTo(X(-22),Z(27));ctx.lineTo(X(-29),Z(33));ctx.lineTo(X(-39),Z(29));ctx.lineTo(X(-43),Z(19));ctx.lineTo(X(-39),Z(9));ctx.lineTo(X(-27),Z(7));ctx.lineTo(X(0),Z(-2.8));ctx.stroke();}
    if(state.mission>=4){ctx.beginPath();ctx.moveTo(X(-31),Z(0));ctx.lineTo(X(-38),Z(-9));ctx.lineTo(X(16),Z(-31));ctx.lineTo(X(31),Z(-27));ctx.lineTo(X(40),Z(-6));ctx.lineTo(X(23),Z(7));ctx.lineTo(X(0),Z(-2.8));ctx.stroke();}
    if(state.mission>=5){ctx.beginPath();ctx.moveTo(X(49),Z(-28));ctx.lineTo(X(62),Z(-14));ctx.lineTo(X(66),Z(4));ctx.lineTo(X(59),Z(23));ctx.lineTo(X(67),Z(40));ctx.lineTo(X(50),Z(51));ctx.lineTo(X(0),Z(-2.8));ctx.stroke();ctx.fillStyle='#3e7180';ctx.beginPath();ctx.arc(X(59),Z(23),Math.min(w,h)*.045,0,Math.PI*2);ctx.fill();}
    const t=activeTarget();
    D.world.places.forEach(p=>{if(p.mission&&state.mission<p.mission)return;if(p.locked&&state.mission<(p.mission||99))return;ctx.fillStyle=(t&&p.id===t.id)?'#ffd447':'#d9e3cf';ctx.beginPath();ctx.arc(X(p.x),Z(p.z),p.id==='station'?5:4,0,Math.PI*2);ctx.fill(); if(w>300){ctx.fillStyle='#edf0df';ctx.font='12px system-ui';ctx.fillText(p.name,X(p.x)+7,Z(p.z)-6);}});
    optional.forEach(p=>{if(state.optionalSeen[p.id]||(p.mission&&state.mission<p.mission))return;ctx.fillStyle='#54c6e8';ctx.beginPath();ctx.arc(X(p.x),Z(p.z),3,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(X(state.pos.x),Z(state.pos.z),5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#102318';ctx.lineWidth=2;ctx.stroke();
  }
  function drawMaps(){drawMap(mctx,mini.width,mini.height);drawMap(bctx,bigMap.width,bigMap.height);}

  let last=performance.now();
  function animateExplorer(now,dt,moving,moveStrength=1){
    const u=player.userData,t=now/1000;
    if(!u||!u.arms)return;
    const stride=Math.sin(now/115)*.72*moveStrength;
    const lift=Math.max(0,Math.sin(now/115))*moveStrength;
    if(moving){
      u.legs[0].hip.rotation.x=stride;u.legs[1].hip.rotation.x=-stride;
      u.legs[0].knee.rotation.x=Math.max(0,-stride)*.48;u.legs[1].knee.rotation.x=Math.max(0,stride)*.48;
      u.arms[0].shoulder.rotation.x=-stride*.72;u.arms[1].shoulder.rotation.x=stride*.72;
      u.arms[0].elbow.rotation.x=-.20-Math.max(0,stride)*.20;u.arms[1].elbow.rotation.x=-.20-Math.max(0,-stride)*.20;
      u.visual.position.y=.055+Math.abs(Math.sin(now/115))*-.045;
      u.torso.rotation.z=Math.sin(now/230)*.034;
      u.torso.rotation.x=.045;u.torso.rotation.y=Math.sin(now/230)*.018;
      u.head.rotation.y=Math.sin(now/310)*.045;u.head.rotation.z=-u.torso.rotation.z*.28;
      if(u.pack)u.pack.rotation.z=-u.torso.rotation.z*.45;if(u.satchel){u.satchel.rotation.x=Math.sin(now/115)*.10;u.satchel.rotation.z=-.08+Math.sin(now/150)*.055;}
      if(u.brim)u.brim.rotation.z=Math.sin(now/260)*.008;if(u.crown)u.crown.rotation.z=Math.sin(now/260)*.008;
    }else{
      const k=1-Math.exp(-7*dt);
      u.legs.forEach(L=>{L.hip.rotation.x+=(0-L.hip.rotation.x)*k;L.knee.rotation.x+=(0-L.knee.rotation.x)*k;});
      u.arms[0].shoulder.rotation.x+=(-.055+Math.sin(t*1.25)*.025-u.arms[0].shoulder.rotation.x)*k;
      u.arms[1].shoulder.rotation.x+=(-.055-Math.sin(t*1.25)*.025-u.arms[1].shoulder.rotation.x)*k;
      u.arms.forEach(A=>A.elbow.rotation.x+=(-.16-A.elbow.rotation.x)*k);
      u.visual.position.y=.012+Math.sin(t*1.8)*.008;
      u.torso.rotation.z=Math.sin(t*1.1)*.006;u.torso.rotation.x=0;u.torso.rotation.y=Math.sin(t*.7)*.004;
      u.head.rotation.y=Math.sin(t*.55)*.055;u.head.rotation.z=Math.sin(t*.83)*.006;
      if(u.pack)u.pack.rotation.z=Math.sin(t*.9)*.004;if(u.satchel){u.satchel.rotation.x=Math.sin(t*.8)*.018;u.satchel.rotation.z=-.08;}
    }
  }
  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    const blocked=overlay.classList.contains('show')||journalEl.classList.contains('open')||mapOverlay.classList.contains('open');
    let moving=false,moveStrength=0;
    if(!blocked){
      const rot=2.4,sp=6.0;
      if(held.has('ArrowLeft')||held.has('q'))state.yaw+=rot*dt;
      if(held.has('ArrowRight'))state.yaw-=rot*dt;
      let fwd=(held.has('w')||held.has('ArrowUp'))?1:(held.has('s')||held.has('ArrowDown'))?-1:0;
      let str=held.has('d')?1:held.has('a')?-1:0;
      if(fwd||str){
        moving=true;moveStrength=Math.min(1,Math.hypot(fwd,str));
        let fx=Math.sin(state.yaw)*fwd+Math.cos(state.yaw)*str;let fz=Math.cos(state.yaw)*fwd-Math.sin(state.yaw)*str;const L=Math.hypot(fx,fz)||1;fx/=L;fz/=L;
        const nx=state.pos.x+fx*sp*dt,nz=state.pos.z+fz*sp*dt;
        // Axis-separated movement lets the player slide naturally along trunks/walls instead of sticking.
        const ox=state.pos.x,oz=state.pos.z;
        if(walkable(nx,state.pos.z))state.pos.x=nx;
        if(walkable(state.pos.x,nz))state.pos.z=nz;
        if(state.pos.x===ox&&state.pos.z===oz){moveStrength=.15;}
        player.rotation.y=Math.atan2(fx,fz);
      }
      player.position.set(state.pos.x,0,state.pos.z);
      if(Math.random()<.008)save();
    }
    animateExplorer(now,dt,moving,moveStrength);

    // Camera follow with a restrained walking bob: enough life without making students seasick.
    const bob=moving?Math.sin(now/115)*.055:Math.sin(now/800)*.012;
    const cd=7.5,ch=6.25;const tx=state.pos.x-Math.sin(state.yaw)*cd,tz=state.pos.z-Math.cos(state.yaw)*cd;
    const desiredCam=new THREE.Vector3(tx,ch+bob,tz),lookPoint=new THREE.Vector3(state.pos.x,1.05+bob*.45,state.pos.z);
    // Keep the camera from sitting inside the station or a tree trunk.
    if(cameraObstacles.length){const ray=new THREE.Raycaster();const dir=desiredCam.clone().sub(lookPoint),dist=dir.length();dir.normalize();ray.set(lookPoint,dir);ray.far=dist;const hit=ray.intersectObjects(cameraObstacles,false)[0];if(hit&&hit.distance>1.15)desiredCam.copy(lookPoint).addScaledVector(dir,Math.max(1.2,hit.distance-.35));}
    camera.position.lerp(desiredCam,1-Math.exp(-7*dt));camera.lookAt(lookPoint);

    const t=now/1000;
    Object.values(markerMap).forEach(m=>{m.ring.rotation.z=t*.7;m.g.scale.setScalar(.92+.08*Math.sin(t*3));m.beam.material.opacity=.09+.04*(1+Math.sin(t*2));});
    optional.forEach(p=>{p.mark.ring.rotation.z=-t*.6;p.mark.g.scale.setScalar(.95+.06*Math.sin(t*2.5));});
    rabbits.forEach((r,i)=>{r.position.y=.21+.035*Math.sin(t*3+i);r.rotation.y+=Math.sin(t*.45+i)*.001;});
    sway.forEach(S=>{S.m.rotation.z=Math.sin(t*1.15+S.p)*S.a;S.m.rotation.x=Math.cos(t*.82+S.p)*S.a*.45;});
    lampLights.forEach((l,i)=>l.intensity=1.05+.12*Math.sin(t*7+i*2.1)+(Math.random()<.008?.25:0));
    const mp=moteGeo.attributes.position.array;for(let i=0;i<moteN;i++){mp[i*3+1]+=.035*dt;if(mp[i*3+1]>5.4)mp[i*3+1]=.35;mp[i*3]+=Math.sin(t*.6+motePhase[i])*.006;mp[i*3+2]+=Math.cos(t*.5+motePhase[i])*.004;}moteGeo.attributes.position.needsUpdate=true;
    grassTime.value=t;anemometer.rotation.y+=dt*2.8;
    const lp=lakeGeo.attributes.position.array;for(let i=1;i<lakeGeo.attributes.position.count;i++){const bi=i*3;lp[bi+2]=Math.sin(t*1.25+lakeBase[bi]*.55+lakeBase[bi+1]*.35)*.035+Math.cos(t*.82+lakeBase[bi]*.25)*.018;}lakeGeo.attributes.position.needsUpdate=true;
    birds.forEach((b,i)=>{b.t+=dt*b.sp;const x=b.cx+Math.cos(b.t)*b.r,z=b.cz+Math.sin(b.t)*b.r*.7;b.g.position.set(x,b.h+Math.sin(b.t*2+i)*.28,z);b.g.rotation.y=-b.t+Math.PI/2;const flap=Math.sin(t*8+i)*.42;b.g.userData['w1'].rotation.z=.18+flap;b.g.userData['w-1'].rotation.z=-.18-flap;});
    butterflies.forEach((b,i)=>{b.g.position.x=b.base.x+Math.sin(t*.65+b.ph)*.65;b.g.position.z=b.base.z+Math.cos(t*.53+b.ph)*.50;b.g.position.y=b.base.y+Math.sin(t*2.3+b.ph)*.22;const flap=Math.sin(t*11+b.ph)*1.0;b.g.userData['w1'].rotation.y=flap;b.g.userData['w-1'].rotation.y=-flap;});
    sunDisk.lookAt(camera.position);if(compassNeedle)compassNeedle.style.transform=`translate(-50%,-88%) rotate(${-state.yaw}rad)`;

    updateHint();drawMaps();renderer.render(scene,camera);requestAnimationFrame(loop);
  }

  function intro(hasSave){
    const betweenM1M2=hasSave&&state.mission===1&&state.complete&&state.step>=5;
    const betweenM2M3=hasSave&&state.mission===2&&state.mission2Complete&&state.step>=7;
    const betweenM3M4=hasSave&&state.mission===3&&state.mission3Complete&&state.step>=8;
    const betweenM4M5=hasSave&&state.mission===4&&state.mission4Complete&&state.step>=7;
    const betweenM5M6=hasSave&&state.mission===5&&state.mission5Complete&&state.step>=7;
    const sub=betweenM5M6?'EKO-7 · FINALEN redo: <b>Återställ EKO-7</b>':state.mission===6?'EKO-7 · Finaluppdrag: <b>Återställ EKO-7</b>':betweenM4M5?'EKO-7 · Uppdrag 5 redo: <b>Inom gränserna</b>':state.mission===5?'EKO-7 · Uppdrag 5: <b>Inom gränserna</b>':betweenM3M4?'EKO-7 · Uppdrag 4 redo: <b>Vad förlorar vi?</b>':state.mission===4?'EKO-7 · Uppdrag 4: <b>Vad förlorar vi?</b>':betweenM2M3?'EKO-7 · Uppdrag 3 redo: <b>Systemet reagerar</b>':state.mission===3?'EKO-7 · Uppdrag 3: <b>Systemet reagerar</b>':state.mission===2?'EKO-7 · Uppdrag 2: <b>Vem äter vem?</b>':'EKO-7 · Uppdrag 1: <b>Något stämmer inte</b>';
    const startLabel=betweenM5M6?'Starta finaluppdraget':betweenM4M5?'Starta Uppdrag 5':betweenM3M4?'Starta Uppdrag 4':betweenM2M3?'Starta Uppdrag 3':betweenM1M2?'Starta Uppdrag 2':hasSave?'Fortsätt expeditionen':'Starta expeditionen';
    const testButtons=location.hash.includes('test')?'<button class="btn secondary" id="testM2">TEST: Uppdrag 2</button><button class="btn secondary" id="testM3">TEST: Uppdrag 3</button><button class="btn secondary" id="testM4">TEST: Uppdrag 4</button><button class="btn secondary" id="testM5">TEST: Uppdrag 5</button><button class="btn secondary" id="testM6">TEST: Finalen</button>':'';
    openPanel(`<div class="stamp">FORSKNINGSUPPDRAG</div><h1>Projekt Resiliens</h1><p class="sub">${sub}</p>
      <div class="alert"><b>VARNING</b><br>Avvikelse upptäckt i biologiska mätvärden.<br>Orsak: <b>OKÄND</b><br>Manuell fältundersökning krävs.</div>
      <p>EKO-7 förändras alltid. Det är normalt. Din uppgift är att följa mätningarna steg för steg och ta reda på hur förändringen sprider sig genom ekosystemet.</p>
      <p>Spelet leder dig steg för steg. <b>Gul markering</b> visar nästa huvudmål. <b>Blå markering</b> är frivilliga observationer som kan ge extra information.</p>
      <label class="small" for="codename">Förnamn eller kodnamn</label><br><input id="codename" value="${esc(state.name||'')}" style="width:min(320px,100%);padding:9px;border:1px solid #9ca990;border-radius:5px;background:#fffef8;margin:5px 0 10px">
      <div class="terminal"><b>STYRNING</b><br>W/S = fram/bak · A/D = sidled · piltangenter eller mus = vrid · E = undersök · J = journal · K = karta</div>
      <div class="actions"><button class="btn yellow" id="startBtn">${startLabel}</button>${hasSave?'<button class="btn secondary" id="newBtn">Börja om</button>':''}${testButtons}</div>`);
    document.getElementById('startBtn').onclick=()=>{
      state.name=document.getElementById('codename').value.trim();state.started=true;if(!state.journal.length)addJournal('intro');save();
      if(betweenM5M6&&window.EKO7_M6){window.EKO7_M6.start();return;}
      if(betweenM4M5&&window.EKO7_M5){window.EKO7_M5.start();return;}
      if(betweenM3M4&&window.EKO7_M4){window.EKO7_M4.start();return;}
      if(betweenM2M3&&window.EKO7_M3){window.EKO7_M3.start();return;}
      if(betweenM1M2&&window.EKO7_M2){window.EKO7_M2.start();return;}
      closePanel();renderMission();updateMarkers();
    };
    const nb=document.getElementById('newBtn');if(nb)nb.onclick=()=>{if(confirm('Börja om från början?'))reset();};
    const tm=document.getElementById('testM2');if(tm)tm.onclick=()=>{
      state.name=document.getElementById('codename').value.trim()||'TEST';state.started=true;state.complete=true;
      ['climate','vegetation','population','camera','den','conclusion','resolved'].forEach(addJournal);save();window.EKO7_M2&&window.EKO7_M2.start();
    };
    const t3=document.getElementById('testM3');if(t3)t3.onclick=()=>{
      state.name=document.getElementById('codename').value.trim()||'TEST';state.started=true;state.complete=true;state.mission2Complete=true;
      ['climate','vegetation','population','camera','den','conclusion','resolved','producers','consumers','foodweb','trophic','decomposers','energyflow','m2conclusion','m2resolved'].forEach(addJournal);
      state.pos={x:-16,z:19};save();window.EKO7_M3&&window.EKO7_M3.start();
    };
    const t4=document.getElementById('testM4');if(t4)t4.onclick=()=>{
      state.name=document.getElementById('codename').value.trim()||'TEST';state.started=true;state.complete=true;state.mission2Complete=true;state.mission3Complete=true;
      ['climate','vegetation','population','camera','den','conclusion','resolved','producers','consumers','foodweb','trophic','decomposers','energyflow','m2conclusion','m2resolved','negativeFeedback','carryingCapacity','positiveFeedback','stableLabile','resilience','threshold','m3conclusion','m3resolved'].forEach(addJournal);
      state.pos={x:-30,z:-3};save();window.EKO7_M4&&window.EKO7_M4.start();
    };
    const t5=document.getElementById('testM5');if(t5)t5.onclick=()=>{
      state.name=document.getElementById('codename').value.trim()||'TEST';state.started=true;state.complete=true;state.mission2Complete=true;state.mission3Complete=true;state.mission4Complete=true;
      ['climate','vegetation','population','camera','den','conclusion','resolved','producers','consumers','foodweb','trophic','decomposers','energyflow','m2conclusion','m2resolved','negativeFeedback','carryingCapacity','positiveFeedback','stableLabile','resilience','threshold','m3conclusion','m3resolved','ecosystemService','wetlandService','pollination','biodiversity','monoculture','naturalForest','serviceAudit','m4conclusion','m4resolved'].forEach(addJournal);
      state.pos={x:47,z:-28};save();window.EKO7_M5&&window.EKO7_M5.start();
    };
    const t6=document.getElementById('testM6');if(t6)t6.onclick=()=>{
      state.name=document.getElementById('codename').value.trim()||'TEST';state.started=true;state.complete=true;state.mission2Complete=true;state.mission3Complete=true;state.mission4Complete=true;state.mission5Complete=true;
      ['climate','vegetation','population','camera','den','conclusion','resolved','producers','consumers','foodweb','trophic','decomposers','energyflow','m2conclusion','m2resolved','negativeFeedback','carryingCapacity','positiveFeedback','stableLabile','resilience','threshold','m3conclusion','m3resolved','ecosystemService','wetlandService','pollination','biodiversity','monoculture','naturalForest','serviceAudit','m4conclusion','m4resolved','planetBoundaries','speciesLoss','ecologicalFootprint','commonsTragedy','fairSpace','sustainableDevelopment','m5conclusion','m5resolved'].forEach(addJournal);
      state.pos={x:0,z:-5};save();window.EKO7_M6&&window.EKO7_M6.start();
    };
  }

  const hasSave=load();
  if(state.restorationVisual>0)setRestorationVisual(state.restorationVisual);
  player.position.set(state.pos.x,0,state.pos.z);
  renderJournal();renderMission();updateMarkers();drawMaps();intro(hasSave);requestAnimationFrame(loop);
})();
