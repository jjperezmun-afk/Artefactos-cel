// Uso: node aventuras/pruebas/suite.js [carpeta-capturas]
const {chromium}=require('playwright');const SP=process.argv[2]||'.';const FILE='file://'+require('path').resolve(__dirname,'../index.html');
const results=[];const ok=(n,c,extra='')=>results.push(`${c?'PASS':'FAIL'}  ${n}${extra?'  ('+extra+')':''}`);
const mock=(opts)=>`(()=>{const O=${JSON.stringify(opts)};const S=O.seed||{};window.__S=S;window.__up=[];window.__del=[];const subs=[];
const snapC=c=>({docs:Object.entries(S).filter(([k])=>k.split('/')[0]===c&&k.split('/').length===2).map(([k,v])=>({id:k.split('/')[1],exists:true,data:()=>v})),metadata:{fromCache:false}});
const fire=()=>subs.forEach(f=>f());window.__fire=fire;
const doc=path=>({id:path.split('/')[1],set:async d=>{if(O.ro)throw{code:'invalid_argument'};S[path]=JSON.parse(JSON.stringify(d));setTimeout(fire)},update:async d=>{if(!S[path])throw{code:'invalid_argument'};S[path]={...S[path],...JSON.parse(JSON.stringify(d))};setTimeout(fire)},delete:async()=>{delete S[path];setTimeout(fire)},onSnapshot(n){const f=()=>n({exists:!!S[path],data:()=>S[path],metadata:{fromCache:false}});subs.push(f);f();return()=>{}}});
let n=0;const db={doc,collection:c=>({doc:id=>doc(c+'/'+(id||'gen'+(++n))),onSnapshot(cb){const f=()=>cb(snapC(c));subs.push(f);setTimeout(f);return()=>{}}})};
const assets={upload:async(b,o)=>{if(O.upFail)throw{code:'upstream_error'};let dims=null;try{const bm=await createImageBitmap(b);dims=[bm.width,bm.height]}catch(e){}window.__up.push({size:b.size,type:o?.type,dims});return{id:'asset'+window.__up.length}},delete:async id=>{window.__del.push(id);return{deleted:true}}};
window.__prompts=[];const sample=Object.assign(async()=>({text:''}),{json:async(pr,op)=>{window.__prompts.push({pr,op});await new Promise(r=>setTimeout(r,O.sampleDelay||300));if(O.sampleErr)throw{code:O.sampleErr};return O.disc||[{name:'Ramblas',sector:'Lastarria',city:'Santiago',type:'Bar',price:2,why:'Bar con terraza como les gusta',confidence:'alta'},{name:'Enigma bar',city:'Santiago',type:'Bar',price:2,why:'ya lo conocen',confidence:'alta'},{name:'Peumayén',sector:'Bellavista',city:'Santiago',type:'Restaurante',price:3,why:'Cocina ancestral para una ocasión',confidence:'media'},{name:'Liguria',sector:'Providencia',city:'Santiago',type:'Restaurante',price:2,why:'Clásico',confidence:'alta'},{name:'<img src=x onerror=window.__x=9>',city:'Santiago',type:'Bar',price:9,why:'<b>xss</b>'}]}});
window.__audio=0;window.__wav=null;const AC0=window.AudioContext;if(AC0)window.AudioContext=class extends AC0{constructor(){super();window.__audio++}};const cou=URL.createObjectURL;URL.createObjectURL=o=>{if(o&&o.type==='audio/wav')window.__wav=o.size;return cou(o)};window.__plays=0;const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__plays++;window.__lastMedia=this;return pl.call(this)};
window.claude={use:async k=>k==='db'?(O.nodb?null:db):k==='assets'?(O.noassets?null:assets):k==='sample'?(O.nosample?null:sample):{can:async()=>O.ro?false:true}}})()`;
const seed=()=>({'places/p1':{name:'Enigma bar',city:'Santiago',type:'Bar',status:'visited',createdAt:1},'places/p2':{name:'Yako',city:'Rancagua',type:'Restaurante',status:'visited',createdAt:2},
'places/w1':{name:'Oculto bar',city:'Santiago',status:'wish',type:'',reason:'Recomendacion',link:'',addedBy:'a',createdAt:3},
'reviews/p1__a':{pid:'p1',slot:'a',scores:{atencion:4,ambiente:4,comida:4,barra:2,pc:null,experiencia:5},notes:{barra:'jugos'},price:2,photos:['old1'],tags:['Sushi'],updatedAt:50},
'reviews/p1__j':{pid:'p1',slot:'j',scores:{atencion:4.5,ambiente:4,comida:4.3,barra:2.5,pc:null,experiencia:4.5},price:2,photos:[],tags:[],updatedAt:1},
'reviews/p2__j':{pid:'p2',slot:'j',scores:{atencion:3,ambiente:2,comida:4,barra:3.5,pc:3,experiencia:2.5},price:3,photos:[],tags:['Sushi'],updatedAt:2},
'outings/o1':{name:'Cerro La Campana',city:'Olmué',cat:'naturaleza',sub:'Cerro / trekking',scale:'paseo',dif:'exigente',dur:'7 horas',ideal:['Pareja'],epoca:['Primavera'],link:'https://maps.app/x',status:'visited',createdAt:5},
'outings/o2':{name:'Chiloé',city:'Chiloé',cat:'viajes',sub:'Viaje largo',scale:'viaje',status:'visited',createdAt:6},
'outings/o3':{name:'Termas de Colina',city:'Colina',cat:'actividades',sub:'Bienestar',scale:'general',status:'visited',createdAt:7},
'oreviews/o1__a':{pid:'o1',slot:'a',scores:{paisaje:5,experiencia:4.5,estado:3,acceso:2,tranquilidad:4},price:1,photos:['f1','f2'],tags:['Llevar agua'],updatedAt:100},
'oreviews/o1__b':{pid:'o1',slot:'b',scores:{paisaje:5,experiencia:4,estado:3,acceso:4,tranquilidad:4},price:1,photos:[],tags:[],updatedAt:90},
'oreviews/o2__j':{pid:'o2',slot:'j',scores:{destino:5,alojamiento:4,logistica:3,comida:4.5,actividades:4,pc:3.5},price:3,photos:[],tags:[],updatedAt:80},
'oreviews/o3__j':{pid:'o3',slot:'j',scores:{diversion:3,organizacion:4,guia:4,instalaciones:4.5,pc:3},price:2,photos:[],tags:[],updatedAt:70},
'config/pareja':{a:'Juanjo',b:'Lore'},'config/pesos':{atencion:1.5,ambiente:1,comida:1,barra:1,pc:1,experiencia:1},'config/pesos-salidas':{naturaleza:{paisaje:2,experiencia:1,estado:1,acceso:1,tranquilidad:1}}});
async function page(b,opts,vp={width:390,height:844},hash=''){const p=await b.newPage({viewport:vp});p.__errs=[];p.on('pageerror',e=>p.__errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/Failed to load resource|ERR_FILE/.test(m.text())&&p.__errs.push(m.text()));await p.addInitScript(mock(opts));await p.goto(FILE+hash);await p.waitForTimeout(700);return p}
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
const txt=(p,s)=>p.$eval(s,e=>e.textContent);
const tapStar=async(p,k,fr)=>{const r=await p.$(`.rate[data-k="${k}"]`);await r.scrollIntoViewIfNeeded();const bb=await r.boundingBox();await p.mouse.click(bb.x+bb.width*fr,bb.y+bb.height/2)};
const closeSheet=p=>p.click('#scrim',{position:{x:200,y:10}});
(async()=>{const b=await chromium.launch();
// INICIO
{const p=await page(b,{seed:seed()});
 ok('Inicio: muestra las dos secciones con sus cifras',/2 evaluados · 1 por ir/.test(await txt(p,'#hm'))&&/3 evaluados · 0 por ir/.test(await txt(p,'#hs')),await txt(p,'#hm')+' | '+await txt(p,'#hs'));
 const last=await p.$$eval('#lastList .last b:first-of-type',x=>x.map(e=>e.textContent));
 ok('Inicio: «Lo último» mezcla ambas secciones por fecha',last[0]==='Cerro La Campana'&&last.includes('Enigma bar'),last.join(', '));
 ok('Inicio: sin barra inferior ni ajustes',await p.$eval('nav',e=>getComputedStyle(e).opacity)==='0'&&!(await p.isVisible('#cfgBtn')));
 await p.screenshot({path:SP+'/av-inicio.png'});
 await p.click('[data-go="salidas"]');await p.waitForTimeout(600);
 ok('Entrar a Salidas cambia título, color y muestra la barra',await txt(p,'#hTitle')==='Nuestras salidas'&&await p.evaluate(()=>document.body.dataset.mod)==='salidas');
 // pesos salidas: naturaleza paisaje x2
 const t=await p.$eval('.card[data-pid="o1"] .score b',e=>e.textContent);
 const crit={paisaje:5,experiencia:4.25,estado:3,acceso:3,tranquilidad:4},w={paisaje:2,experiencia:1,estado:1,acceso:1,tranquilidad:1};let sw=0,sv=0;for(const k in crit){sw+=w[k];sv+=w[k]*crit[k]}
 ok('Salidas: promedio ponderado por categoría',t===(Math.round(sv/sw*10)/10).toString().replace('.',','),`${t}`);
 ok('Salidas: marca «Opinan distinto» (acceso 2 vs 4)',/Opinan distinto/.test(await txt(p,'.card[data-pid="o1"]')));
 ok('Salidas: muestra escala y dificultad en la tarjeta',/Paseo grande/.test(await txt(p,'.card[data-pid="o1"]'))&&/Exigente/.test(await txt(p,'.card[data-pid="o1"]')));
 await p.click('#fBtn');await p.waitForTimeout(450);await p.click('[data-scale="viaje"]');let names=await p.$$eval('#list .card h3',x=>x.map(e=>e.textContent));
 ok('Filtro escala: Viaje',names.join()==='Chiloé',names.join());
 await p.click('[data-scale="general"]');names=await p.$$eval('#list .card h3',x=>x.map(e=>e.textContent));
 ok('Filtro escala: Actividad general',names.join()==='Termas de Colina',names.join());
 await p.click('[data-scale="all"]');await p.click('[data-cat="naturaleza"]');names=await p.$$eval('#list .card h3',x=>x.map(e=>e.textContent));
 ok('Filtro categoría: Naturaleza',names.join()==='Cerro La Campana',names.join());
 await p.click('[data-cat="all"]');
 await p.screenshot({path:SP+'/av-salidas.png'});
 // detalle salidas
 await p.click('.card[data-pid="o1"]');await p.waitForTimeout(600);const sh=await txt(p,'#sheet');
 ok('Detalle salida: categoría, info, link y Δ',/Naturaleza · Cerro \/ trekking · Olmué/.test(sh)&&/Dificultad exigente/.test(sh)&&/7 horas/.test(sh)&&/Ideal: Pareja/.test(sh)&&(await p.$eval("#sheet a.mapl",e=>e.href))==="https://maps.app/x"&&/Δ 2/.test(sh)&&/Costo/.test(sh));
 await p.screenshot({path:SP+'/av-detalle.png'});
 // editar salida: precarga info y notas
 await p.click('[data-rate="o1"]');await p.waitForTimeout(500);
 ok('Editar salida: precarga estrellas de Juanjo y datos del lugar',await p.$eval('.rate[data-k="acceso"]',e=>e.getAttribute('aria-valuenow'))==='2'&&await p.$eval('#durIn',e=>e.value)==='7 horas'&&await p.$eval('[data-dif="exigente"]',e=>e.classList.contains('on')));
 await p.fill('#durIn','6 horas');await p.click('#saveBtn');await p.waitForTimeout(1500);
 ok('Editar salida: guarda cambios de datos del lugar',(await p.evaluate(()=>__S['outings/o1'].dur))==='6 horas');
 await closeSheet(p);await p.waitForTimeout(300);
 // ranking salidas
 await p.click('#t-ranking');await p.waitForTimeout(500);
 ok('Ranking salidas: «Mejor en» solo General si no hay categoría',(await p.$$('#rkCrit .chip')).length===1);
 await p.click('#rBtn');await p.waitForTimeout(450);await p.click('[data-rkcat="viajes"]');const crs=await p.$$eval('#rkCrit .chip',x=>x.map(e=>e.textContent));
 ok('Ranking salidas: al elegir Viajes muestra sus características',crs.includes('Alojamiento')&&crs.includes('Destino'),crs.join(','));
 await p.click('[data-rkc="alojamiento"]');ok('Ranking por Alojamiento',/Chiloé/.test(await txt(p,'#rank')));
 await p.click('[data-rkcat="all"]');await p.click('[data-rkscale="paseo"]');ok('Ranking filtrado por escala',/Cerro La Campana/.test(await txt(p,'#rank'))&&!/Chiloé/.test(await txt(p,'#rank')));
 await p.screenshot({path:SP+'/av-ranking.png'});
 // por ir salidas
 await p.click('#t-por-ir');await p.waitForTimeout(400);await p.click('[data-wcat="pueblos"]');await p.fill('#wName','Zapallar');await p.fill('#wCity','V Región');await p.click('#wf .save');await p.waitForTimeout(400);
 const wid=await p.evaluate(()=>Object.keys(__S).find(k=>k.startsWith('outings/')&&__S[k].name==='Zapallar'));
 ok('Por ir salidas: guarda con categoría',wid&&(await p.evaluate(k=>__S[k].cat,wid))==='pueblos');
 await p.click(`[data-went="${wid.split('/')[1]}"]`);await p.waitForTimeout(400);
 const cr=await p.$$eval('#crits .crit h3',x=>x.map(e=>e.textContent));
 ok('¡Fuimos!: el formulario usa las características de Pueblos',cr.join()==='Encanto,Qué hacer,Comida,Limpieza y seguridad,Experiencia',cr.join());
 await p.click('[data-sub="Pueblo"]');await tapStar(p,'encanto',.9);await p.click('#saveBtn');await p.waitForTimeout(1500);
 const z=await p.evaluate(k=>__S[k],wid);ok('¡Fuimos!: pasa a evaluados con subcategoría',z.status==='visited'&&z.sub==='Pueblo');
 await closeSheet(p);await p.waitForTimeout(300);
 // nueva salida: cambiar categoría a viajes ajusta escala y criterios; puntajes de otra categoría no se guardan
 await p.click('#t-nuevo');await p.waitForTimeout(400);await p.fill('#pname','San Pedro');await tapStar(p,'paisaje',.9);
 await p.click('#placeBox [data-cat="viajes"]');
 ok('Elegir Viajes pone escala Viaje',await p.$eval('[data-scl="viaje"]',e=>e.classList.contains('on')));
 await p.click('#saveBtn');ok('No guarda si solo hay estrellas de otra categoría',await txt(p,'#toast')==='Pon al menos una estrella');
 await tapStar(p,'destino',.7);await p.click('[data-subother="1"]');await p.fill('#subIn','Desierto');await p.click('[data-ideal="Amigos"]');await p.click('[data-epoca="Invierno"]');
 await p.click('#saveBtn');await p.waitForTimeout(1500);
 const sp=await p.evaluate(()=>{const k=Object.keys(__S).find(k=>k.startsWith('outings/')&&__S[k].name==='San Pedro');return {p:__S[k],r:__S['oreviews/'+k.split('/')[1]+'__a']}});
 ok('Nueva salida: guarda categoría, subcategoría propia, escala, ideal y época',sp.p.cat==='viajes'&&sp.p.sub==='Desierto'&&sp.p.scale==='viaje'&&sp.p.ideal[0]==='Amigos'&&sp.p.epoca[0]==='Invierno');
 ok('Nueva salida: solo guarda puntajes de su categoría',JSON.stringify(sp.r.scores)==='{"destino":3.5}',JSON.stringify(sp.r.scores));
 await closeSheet(p);await p.waitForTimeout(300);
 // pesos salidas
 await p.click('#cfgBtn');await p.waitForTimeout(400);await p.click('[data-wcat2="viajes"]');await p.click('[data-w="alojamiento"][data-dw="0.5"]');await p.click('#saveW');await p.waitForTimeout(300);
 const pw=await p.evaluate(()=>__S['config/pesos-salidas']);ok('Pesos por categoría: guarda Viajes sin tocar Naturaleza',pw.viajes.alojamiento===1.5&&pw.naturaleza.paisaje===2);
 // volver a inicio y a mesa
 await p.click('#backBtn');await p.waitForTimeout(500);ok('Volver a inicio',await txt(p,'#hTitle')==='Nuestras aventuras');
 await p.click('[data-go="mesa"]');await p.waitForTimeout(500);
 const tm=await p.$eval('.card[data-pid="p1"] .score b',e=>e.textContent);
 ok('Mesa: mismos datos y promedio que la app actual (3,9)',tm==='3,9',tm);
 ok('Mesa: no muestra filtros de salidas',!(await p.$('#cats .chip'))&&!(await p.$('#scales .chip')));
 await p.click('.card[data-pid="p1"]');await p.waitForTimeout(400);await p.click('[data-rate="p1"]');await p.waitForTimeout(400);
 ok('Mesa: editar precarga como antes',await p.$eval('.rate[data-k="barra"]',e=>e.getAttribute('aria-valuenow'))==='2'&&!(await p.$('#durIn')));
 await p.click('[data-slot="b"]');await tapStar(p,'barra',.9);await p.click('#saveBtn');await p.waitForTimeout(1500);
 ok('Mesa: guardar evaluación de Lore',!!(await p.evaluate(()=>__S['reviews/p1__b'])));
 // borrar en salidas borra fotos
 await closeSheet(p);await p.click('#backBtn');await p.waitForTimeout(400);await p.click('#lastList [data-pid="o1"]');await p.waitForTimeout(900);
 ok('Tocar «Lo último» abre la sección y el detalle',await txt(p,'#hTitle')==='Nuestras salidas'&&/Cerro La Campana/.test(await txt(p,'#sheet')));
 await p.click('[data-del="o1"]');await p.click('[data-del="o1"]');await p.waitForTimeout(500);
 const st=await p.evaluate(()=>({pl:!!__S['outings/o1'],r1:!!__S['oreviews/o1__a'],del:__del}));
 ok('Borrar salida: borra evaluaciones y fotos',!st.pl&&!st.r1&&st.del.includes('f1'));
 ok('Sin errores JS en todo el recorrido',!p.__errs.length,p.__errs.join('|'));await p.close()}
// NUEVO: top3, inicio, filtros plegables, sucursal, duplicados, editar datos, maps
{const p=await page(b,{seed:seed()},undefined,'#mesa');
 const t3=await p.$$eval('.top3 [data-top] .nm',x=>x.map(e=>e.textContent));
 ok('Top 3 arriba en orden',t3.length===2&&t3[0].startsWith('Enigma'),t3.join(','));
 await p.click('.top3 [data-top]');await p.waitForTimeout(500);ok('Tocar el top 3 abre el detalle',/Enigma bar/.test(await txt(p,'#sheet')));await closeSheet(p);await p.waitForTimeout(300);
 ok('Filtros parten ocultos',(await p.$eval('#fWrap',e=>e.getBoundingClientRect().height))<2);
 await p.click('#fBtn');await p.waitForTimeout(500);ok('Botón Filtros los despliega',(await p.$eval('#fWrap',e=>e.getBoundingClientRect().height))>60);
 await p.click('[data-city="Rancagua"]');await p.waitForTimeout(200);
 ok('Filtro activo: contador y resumen',await txt(p,'#fCnt')==='1'&&/Rancagua ×/.test(await txt(p,'#fSum')));
 await p.click('#fSum [data-clear="city"]');await p.waitForTimeout(200);ok('Quitar filtro desde el resumen',await txt(p,'#fCnt')===''&&(await p.$$('#list .card')).length===2);
 await p.screenshot({path:SP+'/av-filtros.png'});
 ok('Barra sin botón Inicio (5 botones con Ruleta)',(await p.$$eval('nav button',x=>x.map(e=>e.textContent.trim()))).join()==='Evaluados,Ranking,Ruleta,Por ir,Evaluar');await p.click('#backBtn');await p.waitForTimeout(400);ok('Botón Aventuras vuelve al inicio',await txt(p,'#hTitle')==='Nuestras aventuras');
 await p.click('[data-go="mesa"]');await p.waitForTimeout(400);ok('Botón «Aventuras» visible con texto',/Aventuras/.test(await txt(p,'#backBtn'))&&await p.isVisible('#backBtn'));
 await p.click('#t-nuevo');await p.waitForTimeout(400);await p.fill('#pname','enigma BAR');await p.waitForTimeout(100);
 ok('Aviso «¿Es alguno de estos?» al escribir un nombre existente',/Enigma bar/.test(await txt(p,'#dupBox')));
 ok('Link a Google Maps con lo escrito',(await p.$eval('#mapsA',e=>e.href)).includes('enigma%20BAR'));
 await tapStar(p,'comida',.9);await p.click('#saveBtn');await p.waitForTimeout(300);
 ok('No deja crear duplicado sin sucursal',/sucursal/.test(await txt(p,'#toast'))&&!(await p.evaluate(()=>Object.values(__S).some(v=>v.name==='enigma BAR'))));
 await p.fill('#psector','Providencia');await p.click('#saveBtn');await p.waitForTimeout(1500);
 const nw=await p.evaluate(()=>Object.values(__S).find(v=>v.name==='enigma BAR'));ok('Con sucursal sí lo crea',nw&&nw.sector==='Providencia');
 await closeSheet(p);await p.waitForTimeout(400);
 ok('Tarjeta muestra la sucursal',(await p.$$eval('#list .card .meta',x=>x.map(e=>e.textContent))).some(t=>/Providencia/.test(t)));
 await p.fill('#q','provi');await p.waitForTimeout(200);ok('Búsqueda por sucursal y sin tildes',(await p.$$('#list .card')).length===1);await p.fill('#q','');
 await p.click('#t-nuevo');await p.waitForTimeout(300);await p.fill('#pname','Yako');await p.click('#dupBox [data-pickplace="p2"]');await p.waitForTimeout(300);
 ok('Elegir el existente desde el aviso',/Yako/.test(await txt(p,'#placeBox h2'))&&/Evaluando/.test(await txt(p,'#placeBox')));
 await p.click('#editPlace');await p.fill('#psector','Centro');await p.fill('#linkIn','https://maps.app.goo.gl/abc');await tapStar(p,'comida',.5);await p.click('#saveBtn');await p.waitForTimeout(1500);
 const y=await p.evaluate(()=>__S['places/p2']);ok('Editar datos del lugar guarda sucursal y link',y.sector==='Centro'&&y.link==='https://maps.app.goo.gl/abc');
 ok('Detalle: botón al mapa con su link',(await p.$eval('#sheet a.mapl',e=>e.href))==='https://maps.app.goo.gl/abc');
 ok('Sin errores JS',!p.__errs.length,p.__errs.join('|'));await p.close()}
// RULETA, PEDIR/EVITAR, VISITAS, RESUMEN
{const sd=seed();sd['places/w2']={name:'Boragó',city:'Santiago',status:'wish',reason:'Aniversario',createdAt:4};sd['places/w3']={name:'Liguria',city:'Santiago',status:'wish',createdAt:5};sd['places/w4']={name:'Fuente Alemana',city:'Santiago',status:'wish',createdAt:6};
 const p=await page(b,{seed:sd},undefined,'#mesa-ruleta');
 ok('Ruleta: cuenta opciones de Por ir',/4 opciones/.test(await txt(p,'#rlInfo')),await txt(p,'#rlInfo'));
 ok('Ruleta: dibuja la rueda',(await p.$$('#wheelG path')).length===4);
 await p.click('#spinBtn');await p.waitForTimeout(1500);await p.screenshot({path:SP+'/av-ruleta-gira.png'});await p.waitForTimeout(3300);
 const opts=await p.$$eval('#rlOut .opt h3',x=>x.map(e=>e.textContent));
 ok('Ruleta: entrega 3 opciones distintas',opts.length===3&&new Set(opts).size===3,opts.join(', '));
 const ang=await p.evaluate(()=>{const m=getComputedStyle(document.querySelector('#wheelG')).transform.match(/matrix\(([^,]+), ([^,]+)/);let a=Math.atan2(+m[2],+m[1])*180/Math.PI;return (a+360)%360});
 const win=await p.evaluate((a)=>{const n=document.querySelectorAll('#wheelG path').length;const seg=360/n;const top=((360-a)%360);const i=Math.floor(top/seg);return document.querySelectorAll('#wheelG > g text')[i]?.textContent},ang);
 ok('Ruleta: la flecha apunta a la opción 1',opts[0].startsWith((win||'').replace('…','')),`flecha: ${win} / opción 1: ${opts[0]}`);
 await p.click('[data-choose="1"]');await p.waitForTimeout(300);ok('Elegir una opción la destaca',await p.$eval('#rlOut',e=>e.classList.contains('picked'))&&await p.$eval('[data-opt="1"]',e=>e.classList.contains('win')));
 await p.screenshot({path:SP+'/av-ruleta.png'});
 await p.click('[data-pool="repeat"]');await p.waitForTimeout(200);ok('Repetir: nota ≥3,5 por defecto (Enigma 3,9; Yako 3 queda fuera)',/^1 lugar con nota 3,5/.test(await txt(p,'#rlInfo')),await txt(p,'#rlInfo'));
 await p.click('#lBtn');await p.waitForTimeout(400);await p.click('[data-rlmin="3"]');await p.waitForTimeout(200);
 ok('Repetir: bajar la nota mínima a 3 suma a Yako',/^2 lugares con nota 3 o más/.test(await txt(p,'#rlInfo')),await txt(p,'#rlInfo'));
 await p.evaluate(()=>{__S['reviews/p2__j'].again='no';__fire()});await p.waitForTimeout(200);
 ok('Repetir: excluye los marcados «No volvemos»',/^1 lugar/.test(await txt(p,'#rlInfo')),await txt(p,'#rlInfo'));
 await p.evaluate(()=>{__S['reviews/p2__j'].again='si';__fire()});await p.click('[data-rlmin="4"]');await p.waitForTimeout(200);
 ok('Repetir: incluye «Volveríamos» aunque tenga menos nota',/^1 lugar/.test(await txt(p,'#rlInfo'))&&(await p.$$eval('#wheelG text',x=>x.map(e=>e.textContent))).includes('Yako'),await txt(p,'#rlInfo'));
 await p.click('#lBtn');
 // pedir/evitar + nueva visita
 await p.click('#t-lista');await p.waitForTimeout(300);await p.click('.card[data-pid="p2"]');await p.waitForTimeout(400);
 ok('Detalle sin evaluación propia: solo «Agregar mi evaluación»',!(await p.$('[data-revisit]'))&&!!(await p.$('[data-rate="p2"]')));
 await closeSheet(p);await p.click('.card[data-pid="p1"]');await p.waitForTimeout(400);
 await p.click('[data-revisit="p1"]');await p.waitForTimeout(400);
 ok('Nueva visita: formulario limpio con modo «Nueva visita (2ª)»',/Nueva visita \(la 2ª\)/.test(await txt(p,'#placeBox'))&&await p.$eval('.rate[data-k="barra"]',e=>e.getAttribute('aria-valuenow'))==='0');
 await p.fill('#pedirIn','Pisco sour');await p.click('[data-peadd="pedir"]');await p.fill('#evitarIn','Jugo natural');await p.press('#evitarIn','Enter');
 ok('Agregar a pedir y evitar',/Pisco sour/.test(await txt(p,'#pedirL'))&&/Jugo natural/.test(await txt(p,'#evitarL')));
 await tapStar(p,'barra',.99);await tapStar(p,'comida',.99);await p.click('#saveBtn');await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>__S['reviews/p1__a']);
 ok('Guarda la visita anterior en el historial',r.history.length===1&&r.history[0].scores.barra===2&&r.scores.barra===5&&r.pedir[0]==='Pisco sour'&&r.photos[0]==='old1',JSON.stringify(r.history[0].scores));
 const sh=await txt(p,'#sheet');
 ok('Detalle: muestra visitas, promedio y qué pedir/evitar',/2 visitas/.test(sh)&&/Pisco sour/.test(sh)&&/Jugo natural/.test(sh)&&/promedio de sus visitas/.test(sh));
 const pers=await p.$$eval('#sheet .dr',x=>x.map(e=>e.textContent));const bl=pers.find(t=>/^Barra/.test(t.trim()));
 ok('Barra = promedio(Juanjo 2 y 5 → 3,5 ; nota de los dos 2,5) = 3',/^Barra\s*3\s*$/.test(bl.trim()),bl.trim());
 ok('Tarjeta muestra «2 visitas»',/2 visitas/.test(await txt(p,'.card[data-pid="p1"]')));
 await p.screenshot({path:SP+'/av-visitas.png'});
 // editar la última no duplica historial
 await p.click('[data-rate="p1"]');await p.waitForTimeout(400);await tapStar(p,'barra',.7);await p.click('#saveBtn');await p.waitForTimeout(1500);
 const r2=await p.evaluate(()=>__S['reviews/p1__a']);ok('Editar la última no agrega visitas',r2.history.length===1&&r2.scores.barra===3.5);
 await closeSheet(p);
 // resumen
 await p.click('#backBtn');await p.waitForTimeout(400);await p.click('[data-wrap="todo"]');await p.waitForTimeout(500);
 const n=await p.$$eval('#wrBars i',x=>x.length);const s1=await txt(p,'#wrSl');
 ok('Resumen: abre con varias láminas y los nombres',n>=6&&/Juanjo & Lore/.test(s1),`${n} láminas`);
 const seen=[];for(let i=0;i<n+2;i++){const q=await p.$('#wrSl .sl:last-child [data-quiz]');if(q){await q.click();await p.waitForTimeout(300)}seen.push(await txt(p,'#wrSl .sl:last-child'));await p.mouse.click(350,400);await p.waitForTimeout(650)}
 const all=seen.join(' | ');
 ok('Resumen: favorito, mejor salida, lugar, discrepancia y por ir',/Su podio de la mesa/.test(all)&&/Su mejor salida/.test(all)&&/Su lugar en el mapa/.test(all)&&/no se pusieron de acuerdo/.test(all)&&/Por ir/.test(all));
 ok('Resumen: termina con «Ver de nuevo» y «Cerrar»',!!(await p.$('#wrSl .sl:last-child [data-replay]')));await p.click('#wrSl .sl:last-child [data-close]');await p.waitForTimeout(300);
 ok('Resumen: se cierra',!(await p.$eval('#wr',e=>e.classList.contains('on'))));
 await p.click('[data-wrap="anio"]');await p.waitForTimeout(800);await p.screenshot({path:SP+'/av-wrap1.png'});await p.mouse.click(350,400);await p.waitForTimeout(900);await p.screenshot({path:SP+'/av-wrap2.png'});await p.click('#wrX');
 await p.click('[data-wrap="mes"]');await p.waitForTimeout(300);ok('Resumen del mes funciona (aunque haya pocas fechas)',(await p.$$('#wrBars i')).length>=1);await p.click('#wrX');
 // nuevo wrapped: música, auto avance, pausa, quiz, mute
 await p.click('[data-wrap="todo"]');await p.waitForTimeout(400);
 const au=await p.evaluate(()=>({wav:window.__wav,plays:window.__plays,paused:window.__lastMedia?.paused,loop:window.__lastMedia?.loop,dur:window.__lastMedia?.duration}));
 ok('Wrapped: compone la canción como archivo de audio (~34 s, en bucle)',au.wav>1e6&&au.loop===true&&au.dur>30&&au.dur<40,JSON.stringify(au));
 ok('Wrapped: la canción se reproduce al abrir',au.plays>=1&&au.paused===false,JSON.stringify(au));
 const i0=await p.evaluate(()=>[...document.querySelectorAll('#wrBars i b')].findIndex(b=>b.style.width==='100%'&&b.style.transition.includes('linear')));
 await p.waitForTimeout(5200);const adv=await p.$$eval('#wrBars i b',x=>x.filter(b=>b.style.width==='100%').length);
 ok('Wrapped: avanza solo',adv>=2,`barras llenas ${adv}`);
 await p.mouse.move(200,450);await p.mouse.down();await p.waitForTimeout(1500);const t1=await txt(p,'#wrSl .sl:last-child');await p.waitForTimeout(5000);const t2=await txt(p,'#wrSl .sl:last-child');await p.mouse.up();
 ok('Wrapped: mantener presionado pausa',t1===t2);
 let qz=null;for(let k=0;k<14&&!qz;k++){qz=await p.$('#wrSl .sl:last-child [data-quiz]');if(!qz){await p.mouse.click(350,400);await p.waitForTimeout(700)}}
 ok('Wrapped: aparece la pregunta «¿Quién es más exigente?»',!!qz);
 if(qz){const before=await txt(p,'#wrSl .sl:last-child');await p.waitForTimeout(5000);ok('Wrapped: la pregunta espera la respuesta',before===await txt(p,'#wrSl .sl:last-child'));
   await p.click('#wrSl .sl:last-child [data-quiz="a"]');await p.waitForTimeout(400);const rv=await txt(p,'#quizRev');
   ok('Wrapped: revela quién es más exigente con sus promedios',/Es .*(Juanjo|Lore).*★/.test(rv),rv);await p.screenshot({path:SP+'/av-wquiz.png'})}
 await p.click('#wrM');ok('Wrapped: botón para silenciar',/Activar música/.test(await p.$eval('#wrM',e=>e.getAttribute('aria-label')))&&await p.evaluate(()=>window.__lastMedia.muted));await p.click('#wrM');
 await p.click('#wrX');
 ok('Sin errores JS',!p.__errs.length,p.__errs.join('|'));await p.close()}
// DESCUBRIR
{const p=await page(b,{seed:seed()},undefined,'#mesa-ruleta');
 await p.click('[data-pool="disc"]');await p.waitForTimeout(200);
 ok('Descubrir: muestra caja con ganas y ciudad (Santiago por defecto)',await p.isVisible('#discBox')&&await p.$eval('#discCity',e=>e.value)==='Santiago');
 await p.fill('#discQ','bar con terraza');await p.click('#lBtn');await p.waitForTimeout(400);await p.click('[data-rlcost="2"]');await p.waitForTimeout(200);
 await p.click('#discBtn');await p.waitForTimeout(100);
 ok('Descubrir: muestra que está pensando',/pensando/.test(await txt(p,'#rlInfo'))&&await p.$eval('.wheelBox',e=>e.classList.contains('think')));
 await p.waitForTimeout(5200);
 const pr=await p.evaluate(()=>window.__prompts[0].pr);
 ok('Descubrir: el pedido incluye ganas, ciudad, costo, favoritos y excluye conocidos',/bar con terraza/.test(pr)&&/Santiago/.test(pr)&&/\$\$ \(escala/.test(pr)&&/Enigma bar/.test(pr)&&/NO sugieras/.test(pr));
 const op=await p.$$eval('#rlOut .opt h3',x=>x.map(e=>e.textContent));
 ok('Descubrir: gira y entrega opciones nuevas, sin las que ya conocen',op.length===3&&!op.includes('Enigma bar'),op.join(', '));
 ok('Descubrir: texto malicioso de la IA no se ejecuta',await p.evaluate(()=>window.__x)===undefined);
 ok('Descubrir: aviso de verificar en Maps',/confirmen en Maps/.test(await txt(p,'#rlOut')));
 const addB=await p.$('#rlOut [data-addwish]:not([disabled])');const nm=await addB.evaluate(b=>b.closest('.opt').querySelector('h3').textContent);await addB.click();await p.waitForTimeout(400);
 const w=await p.evaluate(n=>Object.values(__S).find(v=>v.name===n),nm);
 ok('Descubrir: «Agregar a Por ir» lo guarda como pendiente',w&&w.status==='wish'&&/^Descubierto/.test(w.reason),nm);
 ok('Descubrir: el botón queda «En Por ir ✓»',/En Por ir/.test(await addB.textContent()));
 await p.screenshot({path:SP+'/av-disc.png'});
 await p.click('#discBtn');await p.waitForTimeout(100);ok('Descubrir: «Buscar otras ideas» pide respuestas nuevas (sin caché)',(await p.evaluate(()=>window.__prompts[1]?.op?.cache))===false);
 ok('Sin errores JS',!p.__errs.length,p.__errs.join('|'));await p.close()}
{const p=await page(b,{seed:seed(),sampleErr:'not_granted'},undefined,'#salidas-ruleta');await p.click('[data-pool="disc"]');await p.click('#discBtn');await p.waitForTimeout(800);
 ok('Descubrir: si no dan permiso lo explica',/permiso/.test(await txt(p,'#rlInfo')));ok('Descubrir salidas: sin errores',!p.__errs.length,p.__errs.join('|'));await p.close()}
{const p=await page(b,{seed:seed(),nosample:true},undefined,'#mesa-ruleta');await p.click('[data-pool="disc"]');await p.waitForTimeout(200);
 ok('Descubrir no disponible: lo dice y desactiva el botón',/no está disponible/.test(await txt(p,'#rlInfo'))&&await p.$eval('#discBtn',e=>e.disabled));await p.close()}
// hash directo
{const p=await page(b,{seed:seed()},undefined,'#salidas-ranking');ok('Link directo a #salidas-ranking',await txt(p,'#hTitle')==='Nuestras salidas'&&await p.$eval('#v-ranking',e=>e.classList.contains('on')));await p.close()}
// fotos
{const p=await page(b,{seed:seed()},undefined,'#salidas-nuevo');
 const big=await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=4032;c.height=3024;const x=c.getContext('2d');for(let i=0;i<3000;i++){x.fillStyle=`hsl(${i%360},70%,60%)`;x.fillRect(Math.random()*4032,Math.random()*3024,80,80)}const b=await new Promise(r=>c.toBlob(r,'image/png'));const a=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode(...a.subarray(i,i+32768));return btoa(s)});
 await p.setInputFiles('#file',[{name:'f.png',mimeType:'image/png',buffer:Buffer.from(big,'base64')},{name:'x.heic',mimeType:'image/heic',buffer:Buffer.from('no')}]);await p.waitForTimeout(2500);
 const up=await p.evaluate(()=>__up);ok('Fotos: se achican y los errores no traban',up.length===1&&Math.max(...up[0].dims)===1600&&!(await p.$('.spin')));await p.close()}
// xss
{const s=seed();s['outings/x']={name:'<img src=x onerror="window.__x=1">',city:'<script>window.__x=2</script>',cat:'<b>',sub:'<img src=x onerror=window.__x=7>',status:'visited',link:'javascript:window.__x=6',ideal:['<svg onload=window.__x=8>'],createdAt:9};s['oreviews/x__a']={pid:'x',slot:'a',scores:{diversion:3},tags:['<b onmouseover=window.__x=3>t</b>'],comment:'<img src=x onerror=window.__x=4>',updatedAt:999};
 const p=await page(b,{seed:s});await p.click('[data-go="salidas"]');await p.waitForTimeout(400);await p.click('.card[data-pid="x"]');await p.waitForTimeout(400);await closeSheet(p);await p.click('#t-ranking');await p.click('#t-nuevo');await p.waitForTimeout(300);
 ok('Texto malicioso no se ejecuta',await p.evaluate(()=>window.__x)===undefined&&!(await p.$('a[href^="javascript"]')));ok('Categoría desconocida no rompe',!p.__errs.length,p.__errs.join('|'));await p.close()}
// vacio / sin db / solo lectura
{const p=await page(b,{seed:{}});ok('Vacía: inicio amable',/Aún nada/.test(await txt(p,'#lastList')));await p.click('[data-go="salidas"]');await p.waitForTimeout(300);ok('Vacía: salidas amable',/Todavía no hay nada/.test(await txt(p,'#list')));ok('Vacía: sin errores',!p.__errs.length,p.__errs.join('|'));await p.close()}
{const p=await page(b,{nodb:true});ok('Sin sesión: lo explica en inicio',/sesión/.test(await txt(p,'#status0')));await p.close()}
{const p=await page(b,{seed:seed(),ro:true});await p.click('[data-go="salidas"]');await p.waitForTimeout(300);await p.click('.card[data-pid="o1"]');await p.waitForTimeout(300);ok('Solo lectura: sin botones de edición',!(await p.$('[data-rate]')));await p.close()}
// tamaños
for(const [w,h] of [[320,640],[390,844],[768,1024],[1280,800]]){const p=await page(b,{seed:seed()},{width:w,height:h});let worst=await overflow(p);
 for(const mod of ['mesa','salidas'])for(const v of ['','-ranking','-por-ir','-nuevo']){await p.evaluate(h=>location.hash=h,mod+v);await p.waitForTimeout(350);worst=Math.max(worst,await overflow(p))}
 if(w===320){await p.evaluate(()=>location.hash='inicio');await p.waitForTimeout(500);await p.screenshot({path:SP+'/av-320.png'})}
 ok(`Pantalla ${w}px: nada se sale de los bordes`,worst<=0,`exceso ${worst}px`);await p.close()}
{const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(mock({seed:seed()}));await p.goto(FILE+'#salidas');await p.waitForTimeout(500);ok('Reducir movimiento: funciona',!errs.length);await ctx.close()}
console.log(results.join('\n'));console.log(results.filter(r=>r.startsWith('PASS')).length+'/'+results.length);await b.close()})();
