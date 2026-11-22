// Uso: node aventuras/pruebas/suite.js [carpeta-capturas]
const {chromium}=require('playwright');const SP=process.argv[2]||'.';const FILE='file://'+require('path').resolve(__dirname,'../index.html');
const results=[];const ok=(n,c,extra='')=>results.push(`${c?'PASS':'FAIL'}  ${n}${extra?'  ('+extra+')':''}`);
const mock=(opts)=>`(()=>{const O=${JSON.stringify(opts)};const S=O.seed||{};window.__S=S;window.__up=[];window.__del=[];const subs=[];
const snapC=c=>({docs:Object.entries(S).filter(([k])=>k.split('/')[0]===c&&k.split('/').length===2).map(([k,v])=>({id:k.split('/')[1],exists:true,data:()=>v})),metadata:{fromCache:false}});
const fire=()=>subs.forEach(f=>f());window.__fire=fire;
const doc=path=>({id:path.split('/')[1],set:async d=>{if(O.ro)throw{code:'invalid_argument'};S[path]=JSON.parse(JSON.stringify(d));setTimeout(fire)},update:async d=>{if(!S[path])throw{code:'invalid_argument'};S[path]={...S[path],...JSON.parse(JSON.stringify(d))};setTimeout(fire)},delete:async()=>{delete S[path];setTimeout(fire)},onSnapshot(n){const f=()=>n({exists:!!S[path],data:()=>S[path],metadata:{fromCache:false}});subs.push(f);f();return()=>{}}});
let n=0;const db={doc,collection:c=>({doc:id=>doc(c+'/'+(id||'gen'+(++n))),onSnapshot(cb){const f=()=>cb(snapC(c));subs.push(f);setTimeout(f);return()=>{}}})};
const assets={upload:async(b,o)=>{if(O.upFail)throw{code:'upstream_error'};let dims=null;try{const bm=await createImageBitmap(b);dims=[bm.width,bm.height]}catch(e){}window.__up.push({size:b.size,type:o?.type,dims});return{id:'asset'+window.__up.length}},delete:async id=>{window.__del.push(id);return{deleted:true}}};
window.claude={use:async k=>k==='db'?(O.nodb?null:db):k==='assets'?(O.noassets?null:assets):{can:async()=>O.ro?false:true}}})()`;
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
 await p.click('[data-scale="viaje"]');let names=await p.$$eval('#list .card h3',x=>x.map(e=>e.textContent));
 ok('Filtro escala: Viaje',names.join()==='Chiloé',names.join());
 await p.click('[data-scale="general"]');names=await p.$$eval('#list .card h3',x=>x.map(e=>e.textContent));
 ok('Filtro escala: Actividad general',names.join()==='Termas de Colina',names.join());
 await p.click('[data-scale="all"]');await p.click('[data-cat="naturaleza"]');names=await p.$$eval('#list .card h3',x=>x.map(e=>e.textContent));
 ok('Filtro categoría: Naturaleza',names.join()==='Cerro La Campana',names.join());
 await p.click('[data-cat="all"]');
 await p.screenshot({path:SP+'/av-salidas.png'});
 // detalle salidas
 await p.click('.card[data-pid="o1"]');await p.waitForTimeout(600);const sh=await txt(p,'#sheet');
 ok('Detalle salida: categoría, info, link y Δ',/Naturaleza · Cerro \/ trekking · Olmué/.test(sh)&&/Dificultad exigente/.test(sh)&&/7 horas/.test(sh)&&/Ideal: Pareja/.test(sh)&&/maps\.app/.test(sh)&&/Δ 2/.test(sh)&&/Costo/.test(sh));
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
 await p.click('[data-rkcat="viajes"]');const crs=await p.$$eval('#rkCrit .chip',x=>x.map(e=>e.textContent));
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
