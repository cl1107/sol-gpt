import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const launch = document.querySelector('#star-map-launch');
const overlay = document.querySelector('#star-map');
const canvas = document.querySelector('#star-map-canvas');
const closeBtn = document.querySelector('#star-map-close');
const homeBtn = document.querySelector('#star-map-home');
const list = document.querySelector('#star-system-list');
const card = document.querySelector('#star-system-card');
const cardName = document.querySelector('#star-system-name');
const cardType = document.querySelector('#star-system-type');
const cardDistance = document.querySelector('#star-system-distance');
const cardFact = document.querySelector('#star-system-fact');
const cardDescription = document.querySelector('#star-system-description');
const narrationBtn = document.querySelector('#star-system-narration');
const closerBtn = document.querySelector('#star-system-closer');
const labelsLayer = document.querySelector('#star-map-labels');
const breadcrumb = document.querySelector('#breadcrumb');

if (!launch || !overlay || !canvas) throw new Error('Star system explorer UI is missing');

const SYSTEMS = [
  { id:'alpha-centauri', name:'半人马座 α', en:'Alpha Centauri', type:'三星系统', color:'#ffd98a', distance:4.37, distanceText:'约 4.37 光年', fact:'离太阳最近的恒星系统', description:'半人马座 α 由三颗恒星组成：半人马座 α A、α B，以及离我们最近的比邻星。比邻星周围已经发现系外行星。', narration:'这是半人马座阿尔法星系统，距离我们大约四点三七光年。它不是一颗星，而是三颗恒星组成的家族。其中的比邻星，是距离太阳最近的恒星。', position:[-7.2,1.6,3.5], size:.7, style:'triple' },
  { id:'sirius', name:'天狼星', en:'Sirius', type:'双星系统', color:'#b9d7ff', distance:8.6, distanceText:'约 8.6 光年', fact:'夜空中最亮的恒星', description:'天狼星其实是双星系统。明亮的天狼星 A 身边，还有一颗体积很小、密度很高的白矮星天狼星 B。', narration:'这是天狼星系统，距离我们大约八点六光年。我们肉眼看到的亮星旁边，其实还藏着一颗白矮星伙伴，所以它是一个双星系统。', position:[-2,-3.2,7.6], size:.78, style:'binary' },
  { id:'epsilon-eridani', name:'波江座 ε', en:'Epsilon Eridani', type:'行星系统', color:'#ffd0a0', distance:10.5, distanceText:'约 10.5 光年', fact:'年轻的橙色矮星', description:'波江座 ε 是太阳附近一颗比较年轻的橙色矮星。它周围有尘埃盘，也发现了巨型系外行星，是研究年轻行星系统的重要目标。', narration:'这是波江座艾普西隆星，距离我们大约十点五光年。它比太阳更年轻，周围有尘埃盘和系外行星，很像一个还在成长中的行星系统。', position:[5.8,-1,5.7], size:.62, style:'planetary', planets:1 },
  { id:'vega', name:'织女星', en:'Vega', type:'主序星', color:'#d5e4ff', distance:25, distanceText:'约 25 光年', fact:'夏季大三角的一角', description:'织女星是一颗明亮的蓝白色恒星，也是夏季大三角的重要成员。它周围存在尘埃碎屑盘，说明那里曾经发生过大量小天体碰撞。', narration:'这是织女星，距离我们大约二十五光年。它是一颗明亮的蓝白色恒星，也是夏季大三角的一角。它周围还有由尘埃组成的碎屑盘。', position:[8.3,3.5,-2.4], size:.82, style:'single' },
  { id:'trappist-1', name:'TRAPPIST-1', en:'TRAPPIST-1', type:'七行星系统', color:'#ff8d6d', distance:40.7, distanceText:'约 41 光年', fact:'拥有 7 颗地球大小岩石行星', description:'TRAPPIST-1 是一颗很暗、很小的超冷红矮星。它周围紧密排列着 7 颗大小接近地球的岩石行星，是目前最著名的系外行星系统之一。', narration:'这是 TRAPPIST 一号，距离我们大约四十一光年。它是一颗很小的红矮星，却有七颗大小接近地球的岩石行星。七颗行星都挤在离恒星很近的区域。', position:[1.8,4.7,-8.8], size:.48, style:'planetary', planets:7 },
  { id:'betelgeuse', name:'参宿四', en:'Betelgeuse', type:'红超巨星', color:'#ff6b4b', distance:640, distanceText:'约 640 光年', fact:'体积远大于太阳', description:'参宿四位于猎户座肩部，是一颗巨大而寒冷的红超巨星。它已经进入恒星演化的晚期，未来最终会以超新星方式结束生命。', narration:'这是参宿四，猎户座肩膀上的红色亮星。它是一颗红超巨星，体积远远超过太阳。它已经进入恒星生命的晚期，未来会以超新星爆发结束生命。', position:[-9.4,5.5,-5.6], size:1.85, style:'giant' },
  { id:'kepler-186', name:'Kepler-186', en:'Kepler-186', type:'五行星系统', color:'#ff9b78', distance:580, distanceText:'约 580 光年', fact:'拥有著名的 Kepler-186f', description:'Kepler-186 是一颗红矮星，周围发现了多颗行星。其中 Kepler-186f 是最早发现的、大小接近地球并位于恒星宜居带的系外行星之一。', narration:'这是 Kepler 一八六系统。它周围有多颗系外行星，其中 Kepler 一八六 f 很有名，因为它大小接近地球，而且运行在恒星的宜居带附近。', position:[10.6,-5.5,-7], size:.52, style:'planetary', planets:5 },
];

let renderer, scene, camera, controls, frameId, activeSystem, speech;
const objects = new Map();
const labelEntries = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tmp = new THREE.Vector3();
const clock = new THREE.Clock();
let sharedGlowTexture;

function isMilkyWayScene() {
  const galaxyBtn = breadcrumb?.querySelector('[data-level="galaxy"]');
  const localBtn = breadcrumb?.querySelector('[data-level="local-group"]');
  return Boolean(galaxyBtn?.classList.contains('active') && /银河系/.test(galaxyBtn.textContent || '') && !localBtn?.classList.contains('active'));
}
function updateLaunchVisibility(){ launch.classList.toggle('hidden', !isMilkyWayScene()); }
const breadcrumbObserver = new MutationObserver(updateLaunchVisibility);
if (breadcrumb) breadcrumbObserver.observe(breadcrumb,{subtree:true,attributes:true,childList:true,characterData:true});
updateLaunchVisibility();

function makeGlowTexture(){
  if (sharedGlowTexture) return sharedGlowTexture;
  const c=document.createElement('canvas'); c.width=c.height=128; const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.12,'rgba(190,220,255,.9)'); g.addColorStop(.42,'rgba(87,118,255,.34)'); g.addColorStop(1,'rgba(35,42,110,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,128,128);
  sharedGlowTexture=new THREE.CanvasTexture(c); return sharedGlowTexture;
}
function addBackdrop(){
  const count=1800, positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){ const r=35+Math.random()*80, theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1); positions[i*3]=r*Math.sin(phi)*Math.cos(theta); positions[i*3+1]=r*Math.cos(phi); positions[i*3+2]=r*Math.sin(phi)*Math.sin(theta); }
  const geometry=new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  scene.add(new THREE.Points(geometry,new THREE.PointsMaterial({color:0xc8d8ff,size:.12,transparent:true,opacity:.68})));
}
function createOrbit(radius,parent,color=0x6e84af,opacity=.22){ const pts=[]; for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));} parent.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity}))); }
function addPlanetaryDetails(group,system){
  if(!system.planets)return; const palette=[0xc4a47d,0x8eb8ff,0xf1c77e,0xb5d79b,0xc69bd8,0xe49a84,0x86cfd5];
  for(let i=0;i<system.planets;i++){ const radius=1+i*.36; createOrbit(radius,group,0x7890bc,.2); const pivot=new THREE.Group(); pivot.userData.speed=.22+(system.planets-i)*.035; pivot.rotation.y=i*.91; group.add(pivot); const p=new THREE.Mesh(new THREE.SphereGeometry(.055+(i%3)*.012,18,12),new THREE.MeshStandardMaterial({color:palette[i%palette.length],roughness:.8})); p.position.x=radius; pivot.add(p); }
}
function createSystem(system){
  const group=new THREE.Group(); group.position.fromArray(system.position); group.userData.systemId=system.id; scene.add(group);
  const primary=new THREE.Mesh(new THREE.SphereGeometry(system.size,40,28),new THREE.MeshBasicMaterial({color:system.color})); primary.userData.systemId=system.id; group.add(primary);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlowTexture(),color:system.color,transparent:true,opacity:.66,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(system.size*5.4,system.size*5.4,1); primary.add(glow);
  if(system.style==='binary'||system.style==='triple'){ const companion=new THREE.Mesh(new THREE.SphereGeometry(system.size*.34,28,20),new THREE.MeshBasicMaterial({color:system.id==='sirius'?0xe8efff:0xffc978})); companion.position.set(system.size*2,.35,0); group.add(companion); createOrbit(system.size*2,group,0x9eb8e9,.27); if(system.style==='triple'){ const third=new THREE.Mesh(new THREE.SphereGeometry(system.size*.22,24,16),new THREE.MeshBasicMaterial({color:0xff6c54})); third.position.set(-system.size*3.2,-.2,system.size*1.4); group.add(third); } }
  if(system.style==='planetary')addPlanetaryDetails(group,system);
  const ring=new THREE.Mesh(new THREE.RingGeometry(system.size*1.8,system.size*1.92,64),new THREE.MeshBasicMaterial({color:0x9edfff,transparent:true,opacity:.18,side:THREE.DoubleSide})); ring.rotation.x=Math.PI/2; group.add(ring); group.userData.ring=ring;
  objects.set(system.id,{system,group,primary});
  const label=document.createElement('button'); label.type='button'; label.className='star-map-label'; label.innerHTML=`<strong>${system.name}</strong><small>${system.distanceText}</small>`; label.addEventListener('click',()=>focusSystem(system.id)); labelsLayer.appendChild(label); labelEntries.push({label,anchor:primary});
}
function buildScene(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(window.innerWidth,window.innerHeight,false); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
  scene=new THREE.Scene(); scene.background=new THREE.Color(0x02050f); camera=new THREE.PerspectiveCamera(52,window.innerWidth/window.innerHeight,.05,240); camera.position.set(0,8.5,23);
  controls=new OrbitControls(camera,canvas); controls.enableDamping=true; controls.dampingFactor=.055; controls.enablePan=false; controls.minDistance=2.4; controls.maxDistance=42; controls.target.set(0,0,0);
  scene.add(new THREE.AmbientLight(0x6682b3,.55)); addBackdrop();
  const sun=new THREE.Mesh(new THREE.SphereGeometry(.72,40,28),new THREE.MeshBasicMaterial({color:0xffce62})); scene.add(sun); const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlowTexture(),color:0xffd87b,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending})); sunGlow.scale.set(4.6,4.6,1); sun.add(sunGlow); const homeRing=new THREE.Mesh(new THREE.RingGeometry(1.05,1.12,72),new THREE.MeshBasicMaterial({color:0x79e3ff,transparent:true,opacity:.55,side:THREE.DoubleSide})); homeRing.rotation.x=Math.PI/2; sun.add(homeRing);
  SYSTEMS.forEach(createSystem); buildList();
}
function buildList(){ list.innerHTML=''; SYSTEMS.forEach(system=>{ const button=document.createElement('button'); button.type='button'; button.dataset.id=system.id; button.innerHTML=`<span style="--star-color:${system.color}"></span><div><strong>${system.name}</strong><small>${system.type} · ${system.distanceText}</small></div>`; button.addEventListener('click',()=>focusSystem(system.id)); list.appendChild(button); }); }
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function tweenCamera(toPos,toTarget,duration=900){ const fromPos=camera.position.clone(),fromTarget=controls.target.clone(),start=performance.now(); controls.enabled=false; return new Promise(resolve=>{function step(now){const t=Math.min(1,(now-start)/duration),e=ease(t);camera.position.lerpVectors(fromPos,toPos,e);controls.target.lerpVectors(fromTarget,toTarget,e);camera.lookAt(controls.target);if(t<1)requestAnimationFrame(step);else{controls.enabled=true;resolve();}}requestAnimationFrame(step);}); }
async function focusSystem(id){ const entry=objects.get(id); if(!entry)return; activeSystem=entry.system; stopSpeech(); entry.primary.getWorldPosition(tmp); const s=entry.system.size,offset=new THREE.Vector3(s*5+2,s*2.3+1.1,s*5.8+2.6); await tweenCamera(tmp.clone().add(offset),tmp.clone(),880); showCard(entry.system); [...list.querySelectorAll('button')].forEach(b=>b.classList.toggle('active',b.dataset.id===id)); }
function showCard(system){ cardName.textContent=system.name; cardType.textContent=system.type; cardDistance.textContent=system.distanceText; cardFact.textContent=system.fact; cardDescription.textContent=system.description; card.style.setProperty('--star-color',system.color); card.classList.add('visible'); card.setAttribute('aria-hidden','false'); }
function stopSpeech(){ if('speechSynthesis'in window)window.speechSynthesis.cancel(); speech=null; narrationBtn.textContent='🔊 听讲解'; }
function narrate(){ if(!activeSystem||!('speechSynthesis'in window))return; if(speech){stopSpeech();return;} const utterance=new SpeechSynthesisUtterance(activeSystem.narration); utterance.lang='zh-CN'; utterance.rate=.93; utterance.pitch=1.02; const voices=window.speechSynthesis.getVoices(); utterance.voice=voices.find(v=>/^zh(-|_)?CN/i.test(v.lang))||voices.find(v=>/^zh/i.test(v.lang))||null; utterance.onend=stopSpeech; utterance.onerror=stopSpeech; speech=utterance; narrationBtn.textContent='■ 停止讲解'; window.speechSynthesis.speak(utterance); }
async function flyCloser(){ if(!activeSystem)return; const entry=objects.get(activeSystem.id); entry.primary.getWorldPosition(tmp); const s=activeSystem.size; await tweenCamera(tmp.clone().add(new THREE.Vector3(s*2.7+.8,s*1.2+.45,s*3+1)),tmp.clone(),650); }
async function goHome(){ activeSystem=null; stopSpeech(); card.classList.remove('visible'); card.setAttribute('aria-hidden','true'); [...list.querySelectorAll('button')].forEach(b=>b.classList.remove('active')); await tweenCamera(new THREE.Vector3(0,8.5,23),new THREE.Vector3(0,0,0),850); }
function updateLabels(){ labelEntries.forEach(({label,anchor})=>{ anchor.getWorldPosition(tmp); tmp.project(camera); const visible=tmp.z<1&&Math.abs(tmp.x)<1.12&&Math.abs(tmp.y)<1.12; label.style.display=visible?'block':'none'; if(!visible)return; label.style.left=`${(tmp.x*.5+.5)*window.innerWidth}px`; label.style.top=`${(-tmp.y*.5+.5)*window.innerHeight}px`; }); }
function animate(){ frameId=requestAnimationFrame(animate); const dt=Math.min(clock.getDelta(),.05); objects.forEach(({group})=>{group.userData.ring.rotation.z+=dt*.18;group.children.forEach(child=>{if(child.userData.speed)child.rotation.y+=dt*child.userData.speed;});}); controls.update(); updateLabels(); renderer.render(scene,camera); }
function openExplorer(){ overlay.classList.remove('hidden'); overlay.setAttribute('aria-hidden','false'); document.body.classList.add('star-map-open'); if(!renderer)buildScene(); resize(); clock.start(); if(!frameId)animate(); }
function closeExplorer(){ stopSpeech(); overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); document.body.classList.remove('star-map-open'); if(frameId)cancelAnimationFrame(frameId); frameId=null; }
function resize(){ if(!renderer)return; camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(window.innerWidth,window.innerHeight,false); }
function pick(event){ if(!renderer)return; const rect=canvas.getBoundingClientRect(); pointer.x=((event.clientX-rect.left)/rect.width)*2-1; pointer.y=-((event.clientY-rect.top)/rect.height)*2+1; raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects([...objects.values()].map(x=>x.primary),false); if(hits.length)focusSystem(hits[0].object.userData.systemId); }
let down=null; canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};}); canvas.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved<6)pick(e);});
launch.addEventListener('click',openExplorer); closeBtn.addEventListener('click',closeExplorer); homeBtn.addEventListener('click',goHome); narrationBtn.addEventListener('click',narrate); closerBtn.addEventListener('click',flyCloser); window.addEventListener('resize',resize); window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.classList.contains('hidden'))closeExplorer();});
