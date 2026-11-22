// Uso: node restaurantes/pruebas/suite.js <carpeta-capturas>
const {chromium}=require('playwright');const SP=process.argv[2]||'.';const FILE='file://'+require('path').resolve(__dirname,'../index.html');
const results=[];const ok=(n,c,extra='')=>results.push(`${c?'PASS':'FAIL'}  ${n}${extra?'  ('+extra+')':''}`);
const mock=(opts)=>`(()=>{const O=${JSON.stringify(opts)};const S=O.seed||{};window.__S=S;window.__up=[];window.__del=[];const subs=[];
const snapC=c=>({docs:Object.entries(S).filter(([k])=>k.split('/')[0]===c&&k.split('/').length===2).map(([k,v])=>({id:k.split('/')[1],exists:true,data:()=>v})),metadata:{fromCache:false}});
const fire=()=>subs.forEach(f=>f());window.__fire=fire;
const doc=path=>({id:path.split('/')[1],set:async d=>{if(O.ro)throw{code:'invalid_argument'};S[path]=JSON.parse(JSON.stringify(d));setTimeout(fire)},update:async d=>{if(!S[path])throw{code:'invalid_argument'};S[path]={...S[path],...d};setTimeout(fire)},delete:async()=>{delete S[path];setTimeout(fire)},onSnapshot(n){const f=()=>n({exists:!!S[path],data:()=>S[path],metadata:{fromCache:false}});subs.push(f);f();return()=>{}}});
let n=0;const db={doc,collection:c=>({doc:id=>doc(c+'/'+(id||'gen'+(++n))),onSnapshot(cb){const f=()=>cb(snapC(c));subs.push(f);setTimeout(f);return()=>{}}})};
const assets={upload:async(b,o)=>{if(O.upFail)throw{code:'upstream_error'};let dims=null;try{const bm=await createImageBitmap(b);dims=[bm.width,bm.height]}catch(e){}window.__up.push({size:b.size,type:o?.type,dims});return{id:'asset'+window.__up.length}},delete:async id=>{window.__del.push(id);return{deleted:true}}};
window.claude={use:async k=>k==='db'?(O.nodb?null:db):k==='assets'?(O.noassets?null:assets):{can:async()=>O.ro?false:true}}})()`;
const seed=()=>({'places/p1':{name:'Enigma bar',city:'Santiago',type:'Bar',status:'visited',createdAt:1},'places/p2':{name:'Yako',city:'Rancagua',type:'Restaurante',status:'visited',createdAt:2},
'places/w1':{name:'Oculto bar',city:'Santiago',status:'wish',type:'',reason:'Recomendacion',link:'',addedBy:'a',createdAt:3},
'reviews/p1__a':{pid:'p1',slot:'a',scores:{atencion:4,ambiente:4,comida:4,barra:2,pc:null,experiencia:5},notes:{barra:'jugos'},price:2,photos:['old1'],tags:['Sushi']},
'reviews/p1__j':{pid:'p1',slot:'j',scores:{atencion:4.5,ambiente:4,comida:4.3,barra:2.5,pc:null,experiencia:4.5},price:2,photos:[],tags:[]},
'reviews/p2__j':{pid:'p2',slot:'j',scores:{atencion:3,ambiente:2,comida:4,barra:3.5,pc:3,experiencia:2.5},price:3,photos:[],tags:['Sushi']},
'config/pareja':{a:'Juanjo',b:'Lore'},'config/pesos':{atencion:1.5,ambiente:1,comida:1,barra:1,pc:1,experiencia:1}});
async function page(b,opts,vp={width:390,height:844}){const p=await b.newPage({viewport:vp});p.__errs=[];p.on('pageerror',e=>p.__errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/Failed to load resource|ERR_FILE/.test(m.text())&&p.__errs.push(m.text()));await p.addInitScript(mock(opts));await p.goto(FILE);await p.waitForTimeout(700);return p}
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
(async()=>{const b=await chromium.launch();
// 1 averages: p1 has a + j -> use [a, j(as b)]; weights atencion 1.5
{const p=await page(b,{seed:seed()});
 const t=await p.$eval('.card[data-pid="p1"] .score b',e=>e.textContent);
 const crit={atencion:(4+4.5)/2,ambiente:4,comida:(4+4.3)/2,barra:(2+2.5)/2,experiencia:(5+4.5)/2};const W={atencion:1.5,ambiente:1,comida:1,barra:1,experiencia:1};
 let sw=0,sv=0;for(const k in crit){sw+=W[k];sv+=W[k]*crit[k]}const exp=(Math.round(sv/sw*10)/10).toString().replace('.',',');
 ok('Promedio ponderado con nota conjunta reemplazando a Lore',t===exp,`muestra ${t}, esperado ${exp}`);
 ok('Por ir no aparece en Evaluados',!(await p.$('.card[data-pid="w1"]')));
 ok('Sin errores JS al cargar',!p.__errs.length,p.__errs.join('|'));
 // 2 edit flow prefill + slot switching
 await p.click('.card[data-pid="p1"]');await p.waitForTimeout(500);await p.click('[data-rate="p1"]');await p.waitForTimeout(400);
 const v1=await p.$eval('.rate[data-k="barra"]',e=>e.getAttribute('aria-valuenow'));
 const note=await p.$eval('[data-noteinput="barra"]',e=>e.value).catch(()=>null);
 ok('Editar: precarga estrellas y notas de Juanjo',v1==='2'&&note==='jugos',`barra=${v1}, nota=${note}`);
 await p.click('[data-slot="b"]');const v2=await p.$eval('.rate[data-k="barra"]',e=>e.getAttribute('aria-valuenow'));
 await p.click('[data-slot="j"]');const v3=await p.$eval('.rate[data-k="barra"]',e=>e.getAttribute('aria-valuenow'));
 await p.click('[data-slot="a"]');const v4=await p.$eval('.rate[data-k="barra"]',e=>e.getAttribute('aria-valuenow'));
 ok('Cambiar quién evalúa recarga su propia nota',v2==='0'&&v3==='2.5'&&v4==='2',`Lore=${v2} ambos=${v3} Juanjo=${v4}`);
 // 3 typed text survives names snapshot
 await p.click('[data-note="comida"]');await p.fill('[data-noteinput="comida"]','texto escrito');await p.fill('#comment','comentario largo');
 await p.evaluate(()=>{__S['config/pareja']={a:'Juanjo',b:'Lorena'};__fire()});await p.waitForTimeout(200);
 ok('Lo que escribes no se borra si tu pareja cambia algo',await p.$eval('[data-noteinput="comida"]',e=>e.value)==='texto escrito'&&await p.$eval('#comment',e=>e.value)==='comentario largo');
 // 4 remove saved photo -> deleted only after save; unsaved deleted right away
 await p.setInputFiles('#file',{name:'a.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64')});await p.waitForTimeout(500);
 await p.click('[data-rmph="old1"]');await p.click('[data-rmph="asset1"]');await p.waitForTimeout(100);
 const delBefore=await p.evaluate(()=>[...__del]);
 await p.click('#saveBtn');await p.waitForTimeout(1500);
 const delAfter=await p.evaluate(()=>[...__del]);const rv=await p.evaluate(()=>__S['reviews/p1__a']);
 ok('Fotos: quitar una no guardada la borra al tiro; una guardada solo al guardar',JSON.stringify(delBefore)==='["asset1"]'&&delAfter.includes('old1'),`antes ${delBefore} después ${delAfter}`);
 ok('Guardar mantiene nota, comentario y pesos de precio',rv.notes.comida==='texto escrito'&&rv.comment==='comentario largo'&&rv.price===2&&rv.photos.length===0);
 ok('Tras guardar abre el detalle del lugar',await p.$eval('#sheet',e=>e.classList.contains('on')));
 // 5 delete place deletes reviews + photos
 await p.evaluate(()=>{__S['reviews/p2__j'].photos=['ph9'];__fire()});await p.waitForTimeout(100);
 await p.click('#scrim',{position:{x:200,y:10}});await p.waitForTimeout(500);await p.click('.card[data-pid="p2"]');await p.waitForTimeout(500);
 await p.click('[data-del="p2"]');await p.click('[data-del="p2"]');await p.waitForTimeout(600);
 const st=await p.evaluate(()=>({pl:!!__S['places/p2'],rv:!!__S['reviews/p2__j'],del:__del}));
 ok('Borrar lugar pide confirmación y borra evaluaciones y fotos',!st.pl&&!st.rv&&st.del.includes('ph9'));
 ok('Sin errores JS en todo el flujo',!p.__errs.length,p.__errs.join('|'));await p.close()}
// 6 wish -> fuimos
{const p=await page(b,{seed:seed()});await p.click('#t-por-ir');await p.waitForTimeout(400);await p.click('[data-went="w1"]');await p.waitForTimeout(400);
 const nm=await p.$eval('#placeBox h2',e=>e.textContent);await p.click('[data-type="Bar"]');
 const r=await p.$('.rate[data-k="comida"]');await r.scrollIntoViewIfNeeded();const bb=await r.boundingBox();await p.mouse.click(bb.x+bb.width*.5,bb.y+bb.height/2);
 await p.click('#saveBtn');await p.waitForTimeout(1500);const w=await p.evaluate(()=>__S['places/w1']);
 ok('Por ir → ¡Fuimos! → guardar lo pasa a evaluados con su tipo',nm==='Oculto bar'&&w.status==='visited'&&w.type==='Bar'&&!!(await p.evaluate(()=>__S['reviews/w1__a'])));
 ok('Media estrella al tocar la mitad',(await p.evaluate(()=>__S['reviews/w1__a'].scores.comida))===2.5);
 // validation: no name / no stars
 await p.click('#scrim',{position:{x:200,y:10}});await p.click('#t-nuevo');await p.waitForTimeout(300);await p.click('#saveBtn');
 ok('No deja guardar sin nombre',await p.$eval('#toast',e=>e.textContent)==='Falta el nombre del lugar');
 await p.fill('#pname','Nuevo');await p.click('#saveBtn');ok('No deja guardar sin estrellas',await p.$eval('#toast',e=>e.textContent)==='Pon al menos una estrella');
 // keyboard rating
 await p.focus('.rate[data-k="atencion"]');await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowRight');
 ok('Estrellas también con teclado',await p.$eval('.rate[data-k="atencion"]',e=>e.getAttribute('aria-valuenow'))==='1');
 ok('Sin errores JS',!p.__errs.length,p.__errs.join('|'));await p.close()}
// 7 big photo compression
{const p=await page(b,{seed:seed()});await p.click('#t-nuevo');
 const big=await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=4032;c.height=3024;const x=c.getContext('2d');for(let i=0;i<4000;i++){x.fillStyle=`hsl(${i%360},70%,60%)`;x.fillRect(Math.random()*4032,Math.random()*3024,80,80)}const b=await new Promise(r=>c.toBlob(r,'image/png'));const a=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode(...a.subarray(i,i+32768));return btoa(s)});
 const buf=Buffer.from(big,'base64');
 await p.setInputFiles('#file',[{name:'foto.png',mimeType:'image/png',buffer:buf},{name:'roto.heic',mimeType:'image/heic',buffer:Buffer.from('nope')}]);await p.waitForTimeout(2500);
 const up=await p.evaluate(()=>__up);const spinners=await p.$$eval('.spin',x=>x.length);
 ok('Foto de 12 MP se achica antes de subir',up[0]&&Math.max(...up[0].dims)===1600&&up[0].type==='image/jpeg',`${(buf.length/1e6).toFixed(1)} MB → ${(up[0]?.size/1e3).toFixed(0)} KB, ${up[0]?.dims}`);
 ok('Archivo ilegible: avisa y no queda cargando',up.length===1&&spinners===0,await p.$eval('#toast',e=>e.textContent));
 await p.close()}
// 8 upload failure
{const p=await page(b,{seed:seed(),upFail:true});await p.click('#t-nuevo');await p.setInputFiles('#file',{name:'a.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64')});await p.waitForTimeout(600);
 ok('Si falla la subida avisa y se puede seguir',await p.$eval('#toast',e=>e.textContent)==='No se pudo subir una foto'&&!(await p.$('.spin')));await p.close()}
// 9 xss
{const s=seed();s['places/x']={name:'<img src=x onerror="window.__x=1">',city:'"><script>window.__x=2</script>',status:'visited',createdAt:9};s['reviews/x__a']={pid:'x',slot:'a',scores:{comida:3},tags:['<b onmouseover=window.__x=3>t</b>'],comment:'<img src=x onerror=window.__x=4>',notes:{comida:'<svg onload=window.__x=5>'}};s['places/w2']={name:'w',status:'wish',link:'javascript:window.__x=6'};
 const p=await page(b,{seed:s});await p.click('.card[data-pid="x"]');await p.waitForTimeout(400);await p.click('#scrim',{position:{x:200,y:10}});await p.click('#t-ranking');await p.click('#t-por-ir');await p.waitForTimeout(300);
 ok('Texto malicioso no se ejecuta (nombres, notas, links)',await p.evaluate(()=>window.__x)===undefined&&!(await p.$('#wishes a')));await p.close()}
// 10 empty db, no db, read-only, no assets
{const p=await page(b,{seed:{}});const e1=await p.$eval('#list',e=>e.textContent);await p.click('#t-ranking');const e2=await p.$eval('#rank',e=>e.textContent);await p.click('#t-por-ir');const e3=await p.$eval('#wishes',e=>e.textContent);
 ok('Libreta vacía: mensajes amables en las 3 vistas',/vacía/.test(e1)&&/Sin candidatos/.test(e2)&&/Nada pendiente/.test(e3));ok('Sin errores con libreta vacía',!p.__errs.length,p.__errs.join('|'));await p.close()}
{const p=await page(b,{nodb:true});ok('Sin sesión: lo explica',/sesión/.test(await p.$eval('#list',e=>e.textContent)));await p.close()}
{const p=await page(b,{seed:seed(),ro:true});await p.click('.card[data-pid="p1"]');await p.waitForTimeout(400);
 ok('Solo lectura: oculta botones y avisa',!(await p.$('[data-rate]'))&&!(await p.$('[data-went]'))&&/Editor/.test(await p.$eval('#status',e=>e.textContent)));await p.close()}
{const p=await page(b,{seed:seed(),noassets:true});await p.click('#t-nuevo');ok('Sin permiso de fotos: oculta el botón y explica',!(await p.$('#addPh'))&&/Editor/.test(await p.$eval('#phHint',e=>e.textContent)));await p.close()}
// 11 layouts
for(const [w,h] of [[320,640],[390,844],[768,1024],[1280,800]]){const p=await page(b,{seed:seed()},{width:w,height:h});let worst=0;
 for(const t of ['#t-lista','#t-ranking','#t-por-ir','#t-nuevo']){await p.click(t);await p.waitForTimeout(450);worst=Math.max(worst,await overflow(p))}
 await p.click('#t-lista');await p.waitForTimeout(300);await p.click('.card[data-pid="p1"]');await p.waitForTimeout(600);worst=Math.max(worst,await overflow(p));
 const sh=await p.$eval('#sheet',e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1});
 if(w===320)await p.screenshot({path:SP+'/w320.png'});if(w===1280)await p.screenshot({path:SP+'/w1280.png'});
 ok(`Pantalla ${w}px: nada se sale de los bordes`,worst<=0&&sh,`exceso ${worst}px`);await p.close()}
// 12 reduced motion
{const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.addInitScript(mock({seed:seed()}));await p.goto(FILE);await p.waitForTimeout(500);
 await p.click('.card[data-pid="p1"]');await p.waitForTimeout(100);ok('Con «reducir movimiento» funciona sin animaciones',!errs.length&&await p.$eval('#bigN',e=>e.textContent)!=='');await ctx.close()}
console.log(results.join('\n'));await b.close()})();
