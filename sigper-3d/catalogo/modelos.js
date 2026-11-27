/* SIGPER · modelos propios en estilo Majadroid (low-poly, colores planos, metros reales, frente hacia +x) */
(function(){
const T=THREE,MC={};
const P={yel:'#f2b807',red:'#d4402b',blue:'#2465b8',sky:'#7cc4e4',white:'#eceff1',grey:'#a7adb3',dark:'#3b3f44',black:'#232528',orange:'#ef7d14',green:'#4f9a4a',brown:'#8a5a34',wood:'#c99a5b',conc:'#bdbab3',steel:'#8e979f',skin:'#e0b08a',navy:'#2b3a55',sig:'#255A9B'};
const mat=c=>MC[c]||(MC[c]=new T.MeshStandardMaterial({color:new T.Color(P[c]||c).convertSRGBToLinear(),roughness:.85,metalness:0,flatShading:true}));
const add=(m,par,x,y,z,rx,ry,rz)=>{m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=m.receiveShadow=true;par.add(m);return m};
const B=(par,w,h,d,c,x,y,z,rx,ry,rz)=>add(new T.Mesh(new T.BoxGeometry(w,h,d),mat(c)),par,x,y,z,rx,ry,rz);
const Cy=(par,r,h,c,x,y,z,rx,ry,rz,seg=10,r2)=>add(new T.Mesh(new T.CylinderGeometry(r2??r,r,h,seg),mat(c)),par,x,y,z,rx,ry,rz);
const Sp=(par,r,c,x,y,z,seg=8)=>add(new T.Mesh(new T.SphereGeometry(r,seg,Math.max(4,seg/2)),mat(c)),par,x,y,z);
const G=(par,x,y,z,ry)=>{const g=new T.Group();g.position.set(x||0,y||0,z||0);g.rotation.y=ry||0;if(par)par.add(g);return g};
const wheel=(par,x,z,r=.5,w=.4)=>{const g=G(par,x,r,z);Cy(g,r,w,'black',0,0,0,Math.PI/2,0,0,12);Cy(g,r*.5,w+.04,'grey',0,0,0,Math.PI/2,0,0,8);return g};
const link=(par,a,b,r,c)=>{const v=new T.Vector3().subVectors(b,a),m=Cy(par,r,v.length(),c,0,0,0,0,0,0,6);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m};
const V=(x,y,z)=>new T.Vector3(x,y,z);
/* cabina de camión (frente en +x) */
function cab(par,c,x,w=2.5){const g=G(par,x,0,0);B(g,2.1,2.3,w,c,0,2.05,0);B(g,.05,.9,w-.3,'sky',1.06,2.55,0);[w/2+.01,-w/2-.01].forEach(z=>B(g,1.2,.8,.04,'sky',.2,2.55,z));
  B(g,.15,.5,w-.2,'dark',1.1,1.35,0);B(g,.2,.35,w,'grey',1.15,.95,0);[w/2-.35,-(w/2-.35)].forEach(z=>B(g,.06,.2,.35,'white',1.13,1.4,z));B(g,.6,.15,1,'orange',-.4,3.27,0);return g}
function chasis(par,L,x0=0){B(par,L,.35,1.1,'dark',x0,1.0,0)}
const M={};
/* ---- vehículos livianos ---- */
M.camioneta=(o={})=>{const g=G();const c=o.color||'white';B(g,5.3,.75,1.86,c,0,.85,0);B(g,2.5,.75,1.78,c,.55,1.6,0);B(g,2.52,.42,1.8,'sky',.55,1.62,0);B(g,.06,.5,1.6,'sky',1.83,1.6,0,0,0,-.35);
  B(g,2.1,.5,.08,c,-1.55,1.45,.89);B(g,2.1,.5,.08,c,-1.55,1.45,-.89);B(g,.08,.5,1.86,c,-2.62,1.45,0);B(g,.08,.9,1.7,'dark',-.75,1.9,0);B(g,.08,.08,1.7,'dark',-.75,2.35,0);
  B(g,5.32,.12,.02,'sig',0,1.0,.94);B(g,5.32,.12,.02,'sig',0,1.0,-.94);B(g,.15,.3,1.4,'dark',2.65,.85,0);B(g,.2,.12,1.4,'orange',.55,2.03,0);
  [1.65,-1.65].forEach(x=>{wheel(g,x,.85,.42,.32);wheel(g,x,-.85,.42,.32)});
  if(o.mochila){const t=G(g,-1.6,1.25,0);B(t,1.1,.9,1.2,'steel',0,.45,0);Cy(t,.08,.3,'dark',.2,1.05,.3);B(t,.4,.3,.2,'red',-.3,.6,.65)}return g};
/* ---- maquinaria ---- */
M.retro=()=>{const g=G();B(g,2.4,1.0,1.9,'yel',.9,1.35,0);B(g,1.6,.6,1.6,'yel',1.5,2.0,0,0,0,-.1);const c=G(g,-.6,1.85,0);B(c,1.5,1.7,1.7,'sky',0,.85,0);B(c,1.7,.15,1.9,'yel',0,1.75,0);
  [[.72,.82],[-.72,.82],[.72,-.82],[-.72,-.82]].forEach(([x,z])=>B(c,.1,1.7,.1,'dark',x,.85,z));B(g,4.2,.5,1.4,'dark',.2,1.0,0);
  wheel(g,1.6,1.0,.55,.45);wheel(g,1.6,-1.0,.55,.45);wheel(g,-1.0,1.05,.8,.55);wheel(g,-1.0,-1.05,.8,.55);
  [1.0,-1.0].forEach(z=>{B(g,2.3,.2,.2,'yel',2.9,1.25,z,0,0,-.35)});B(g,.8,.8,2.4,'dark',3.9,.55,0);
  const arm=G(g,-1.9,1.5,0);g.userData.arm=arm;B(arm,2.6,.32,.32,'yel',-1.1,.7,0,0,0,-.6);B(arm,2.0,.26,.26,'yel',-2.6,.6,0,0,0,1.1);link(arm,V(-.2,.1,.25),V(-1.6,1.3,.25),.08,'steel');B(arm,.6,.6,.7,'dark',-3.1,-.35,0);
  [1.05,-1.05].forEach(z=>{B(g,.2,1.2,.2,'yel',-1.9,.9,z);B(g,.5,.08,.5,'dark',-1.9,.2,z)});return g};
M.excavadora=(o={})=>{const g=G();[1.3,-1.3].forEach(z=>{B(g,4.5,.9,.8,'black',0,.45,z);[2.25,-2.25].forEach(x=>Cy(g,.45,.8,'black',x,.45,z,Math.PI/2));for(let i=0;i<9;i++)B(g,.18,.95,.82,'dark',-2+i*.5,.45,z)});B(g,3.2,.5,1.8,'dark',0,1.0,0);
  const t=G(g,0,1.25,0);g.userData.turret=t;B(t,3.6,1.15,2.7,'yel',-.3,.6,0);B(t,1.0,1.2,2.6,'dark',-2.3,.65,0);const c=G(t,.85,1.15,.75);B(c,1.3,1.6,1.0,'yel',0,.8,0);B(c,.05,1.0,.8,'sky',.66,1.0,0);B(c,1.0,.8,.05,'sky',.05,1.0,.51);
  const bm=G(t,1.3,1.0,-.45);g.userData.boom=bm;B(bm,5.4,.6,.55,'yel',2.3,1.4,0,0,0,.5);B(bm,3.4,.45,.45,'yel',5.0,1.5,0,0,0,-1.15);link(bm,V(.3,.2,.32),V(2.6,2.3,.32),.12,'steel');
  if(o.martillo){Cy(bm,.22,1.4,'dark',5.75,-.4,0,0,0,0,8);Cy(bm,.07,.7,'steel',5.75,-1.4,0,0,0,0,6,.02)}else{B(bm,1.1,1.0,1.2,'dark',5.8,-.2,0);for(let i=0;i<4;i++)B(bm,.12,.35,.12,'steel',6.25,-.8,-.45+i*.3)}return g};
M.motoniveladora=()=>{const g=G();B(g,7.5,.45,.6,'yel',.3,1.5,0);B(g,2.4,1.2,2.2,'yel',-2.4,1.5,0);const c=G(g,-1.4,2.0,0);B(c,1.6,1.7,1.8,'sky',0,.85,0);B(c,1.8,.15,2.0,'yel',0,1.75,0);
  wheel(g,3.6,.95,.65,.45);wheel(g,3.6,-.95,.65,.45);[-1.9,-3.3].forEach(x=>{wheel(g,x,1.05,.65,.5);wheel(g,x,-1.05,.65,.5)});B(g,.25,.8,3.4,'steel',.8,.55,0,0,.35,0);Cy(g,.9,.2,'dark',.8,1.15,0,0,0,0,12);return g};
M.rodillo=()=>{const g=G();Cy(g,.8,2.1,'steel',1.6,.8,0,Math.PI/2,0,0,14);B(g,.6,.9,2.4,'yel',1.6,1.6,0);B(g,3.0,1.1,1.9,'yel',-.6,1.3,0);const c=G(g,-.6,1.85,0);[[.6,.8],[-.6,.8],[.6,-.8],[-.6,-.8]].forEach(([x,z])=>B(c,.1,1.5,.1,'dark',x,.75,z));B(c,1.4,.12,1.8,'yel',0,1.5,0);
  wheel(g,-1.6,.95,.7,.55);wheel(g,-1.6,-.95,.7,.55);return g};
M.minicargador=()=>{const g=G();B(g,2.4,1.0,1.5,'yel',-.2,.95,0);const c=G(g,-.1,1.45,0);B(c,1.2,1.2,1.2,'sky',0,.6,0);B(c,1.3,.1,1.3,'dark',0,1.25,0);[.75,-.75].forEach(z=>B(g,2.0,.2,.2,'yel',.4,1.6,z,0,0,-.4));B(g,.7,.7,1.9,'dark',1.4,.5,0);
  [.8,-.8].forEach(x=>{wheel(g,x,.8,.4,.3);wheel(g,x,-.8,.4,.3)});return g};
/* ---- camiones especiales ---- */
function camionBase(c,L=6.5){const g=G();chasis(g,L,-L/2+1.6);cab(g,c,1.9);wheel(g,1.9,1.05);wheel(g,1.9,-1.05);[-2.0,-3.3].forEach(x=>{wheel(g,x,1.0,.52,.55);wheel(g,x,-1.0,.52,.55)});return g}
M.pluma=()=>{const g=camionBase('red');B(g,4.2,.3,2.4,'dark',-1.6,1.35,0);const b=G(g,.3,1.5,0);g.userData.boom=b;Cy(b,.35,1.2,'yel',0,.6,0,0,0,0,8);B(b,4.5,.35,.35,'yel',-1.9,1.6,0,0,0,-.25);B(b,3.2,.28,.28,'yel',-4.1,1.3,0,0,0,.1);
  Cy(b,.02,1.6,'dark',-5.6,.5,0,0,0,0,4);B(b,.3,.3,.2,'orange',-5.6,-.35,0);[1.3,-1.3].forEach(z=>{B(g,.25,.9,.25,'yel',.3,.7,z*1.1);B(g,.6,.08,.6,'dark',.3,.05,z*1.1)});return g};
M.aljibe=()=>{const g=camionBase('blue');Cy(g,1.05,4.4,'white',-1.75,2.35,0,0,0,Math.PI/2,14);B(g,4.4,.25,2.0,'dark',-1.75,1.3,0);B(g,.1,.1,2.2,'steel',-4.05,1.2,0);B(g,1.2,.12,.3,'blue',-1.75,3.42,0);return g};
M.bomba=()=>{const g=camionBase('white');B(g,3.6,1.1,2.2,'orange',-1.5,1.75,0);const b=G(g,-.2,2.3,0);g.userData.boom=b;Cy(b,.35,.6,'orange',0,.3,0,0,0,0,8);
  [[4.8,0,.02],[4.6,-.05,.38],[4.2,.05,.0]].forEach(([l,y,z],i)=>B(b,l,.28,.3,i%2?'white':'orange',-2.2,.75+i*.32,z));[1.3,-1.3].forEach(z=>{B(g,.25,1.0,.25,'orange',.2,.6,z*1.15);B(g,.7,.08,.7,'dark',.2,.05,z*1.15)});return g};
M.alzahombre=()=>{const g=camionBase('white');B(g,4.0,.3,2.4,'grey',-1.6,1.35,0);const b=G(g,-2.6,1.6,0);g.userData.boom=b;Cy(b,.3,.5,'orange',0,.25,0);B(b,5.5,.3,.3,'orange',1.6,2.2,0,0,0,.72);
  const k=G(b,3.6,4.3,0);B(k,.9,.9,.9,'orange',0,.45,0);B(k,.92,.05,.92,'yel',0,.95,0);return g};
M.camaBaja=(o={})=>{const g=G();chasis(g,5.5,0);cab(g,'red',2.4);wheel(g,2.4,1.05);wheel(g,2.4,-1.05);[-.6,-1.9].forEach(x=>{wheel(g,x,1.0,.52,.55);wheel(g,x,-1.0,.52,.55)});
  B(g,2.4,.5,2.5,'dark',-1.3,1.55,0);B(g,1.6,.4,2.5,'dark',-3.2,1.2,0,0,0,.45);B(g,9.0,.35,2.6,'dark',-8.4,.85,0);B(g,9.0,.05,2.62,'yel',-8.4,1.04,0);
  [-11.4,-12.4,-13.4].forEach(x=>{wheel(g,x,1.0,.45,.5);wheel(g,x,-1.0,.45,.5)});B(g,1.4,.12,2.4,'dark',-13.6,.55,0,0,0,-.5);
  if(o.carga!==false){const r=M.retro();r.scale.setScalar(.85);r.position.set(-8.2,1.05,0);g.add(r)}return g};
/* ---- equipos menores e instalación de faena ---- */
M.compresor=()=>{const g=G();B(g,2.6,1.3,1.4,'yel',0,1.15,0);B(g,2.62,.1,1.42,'dark',0,1.6,0);for(let i=0;i<5;i++)B(g,.06,.6,.02,'dark',-.8+i*.4,1.15,.71);wheel(g,-.3,.8,.38,.25);wheel(g,-.3,-.8,.38,.25);
  B(g,1.4,.12,.12,'dark',1.9,.55,0,0,0,.2);Cy(g,.06,.5,'dark',-.9,2.0,.3);const h=new T.Mesh(new T.TorusGeometry(.45,.04,6,16),mat('black'));add(h,g,-1.5,.5,.9,Math.PI/2);return g};
M.generador=()=>{const g=G();B(g,2.3,.2,1.1,'dark',0,.1,0);B(g,2.1,1.2,1.0,'green',0,.8,0);B(g,2.12,.08,1.02,'dark',0,1.44,0);Cy(g,.07,.5,'dark',-.7,1.65,.2);B(g,.4,.3,.02,'white',.6,.9,.51);return g};
M.estanque=()=>{const g=G();B(g,4.6,.4,2.6,'conc',0,.2,0);B(g,4.6,.5,.12,'conc',0,.55,1.24);B(g,4.6,.5,.12,'conc',0,.55,-1.24);B(g,.12,.5,2.6,'conc',2.24,.55,0);B(g,.12,.5,2.6,'conc',-2.24,.55,0);
  [1.2,-1.2].forEach(x=>B(g,.3,.6,1.4,'dark',x,.7,0));Cy(g,.85,3.6,'white',0,1.65,0,0,0,Math.PI/2,14);B(g,1.4,.5,.02,'red',0,1.7,.86);Cy(g,.1,.3,'dark',.6,2.6,0);return g};
M.toldo=()=>{const g=G();[[1.9,1.4],[-1.9,1.4],[1.9,-1.4],[-1.9,-1.4]].forEach(([x,z])=>Cy(g,.05,2.6,'steel',x,1.3,z,0,0,0,6));B(g,4.2,.08,3.2,'sig',0,2.6,0,0,0,.04);B(g,2,.8,.9,'wood',0,.4,0);return g};
M.bodega=(o={})=>{const g=G();B(g,3.0,2.4,2.4,o.color||'yel',0,1.2,0);for(let i=0;i<9;i++)B(g,.04,2.3,.04,'dark',-1.4+i*.35,1.2,1.21);B(g,.6,.6,.02,'white',.9,1.6,1.22);B(g,.3,.3,.02,'red',.9,1.6,1.23,0,0,Math.PI/4);return g};
M.cercoPatio=()=>{const g=G();for(let i=0;i<=3;i++){Cy(g,.05,2.6,'steel',-3+i*2,1.3,0,0,0,0,6);B(g,.02,.4,.02,'steel',-3+i*2,2.75,.12,.6)}
  const mm=new T.Mesh(new T.PlaneGeometry(6,2.3,12,5),new T.MeshStandardMaterial({color:0x9aa3ab,wireframe:true}));add(mm,g,0,1.25,0);[2.85,2.95].forEach(y=>B(g,6,.02,.02,'dark',0,y,.15));B(g,.7,.5,.02,'yel',0,1.6,.03);return g};
M.andamio=()=>{const g=G();for(const[x,z]of[[1,.5],[-1,.5],[1,-.5],[-1,-.5]])B(g,.06,4,.06,'steel',x,2,z);[1.3,2.6,3.9].forEach(y=>{B(g,2.1,.08,1.0,'wood',0,y,0);B(g,2.1,.04,.04,'steel',0,y+.9,.5)});B(g,.04,2.6,.04,'steel',0,1.3,.5,0,0,.7);return g};
M.moldaje=()=>{const g=G();for(let i=0;i<3;i++)B(g,1.2,2.4,.1,i%2?'wood':'#b5824a',-1.25+i*1.25,1.2,0);B(g,3.8,.12,.12,'steel',0,.6,.12);B(g,3.8,.12,.12,'steel',0,1.8,.12);return g};
M.enfierradura=()=>{const g=G();for(let i=0;i<6;i++){B(g,.04,2.2,.04,'brown',-1+i*.4,1.1,.5);B(g,.04,2.2,.04,'brown',-1+i*.4,1.1,-.5)}for(let j=0;j<5;j++)B(g,2.1,.04,1.04,'brown',0,.2+j*.45,0);return g};
/* ---- personas (rol = color de casco y chaleco; herramienta opcional) ---- */
const ROL={supervisor:['white','sig'],capataz:['blue','orange'],prevencionista:['green','green'],maestro:['orange','orange'],jornal:['yel','orange'],operador:['red','orange'],chofer:['grey','orange'],rigger:['orange','yel'],topografo:['yel','orange'],soldador:['brown','brown']};
M.persona=(rol='jornal',herr)=>{const[hc,vc]=ROL[rol]||ROL.jornal;const g=G();[.11,-.11].forEach(z=>B(g,.16,.85,.16,'navy',0,.43,z));B(g,.3,.62,.46,vc,0,1.16,0);[1.0,1.26].forEach(y=>B(g,.31,.05,.47,'white',0,y,0));
  [.3,-.3].forEach(z=>B(g,.14,.6,.14,vc,0,1.15,z));B(g,.24,.26,.22,'skin',0,1.62,0);const h=new T.Mesh(new T.SphereGeometry(.17,8,4,0,Math.PI*2,0,Math.PI/2),mat(hc));add(h,g,0,1.72,0);B(g,.4,.03,.38,hc,.02,1.73,0);
  if(herr==='perforadora'){Cy(g,.07,.9,'dark',.35,.6,0,0,0,.2);B(g,.5,.08,.08,'dark',.3,1.1,0)}
  if(herr==='vibrador'){Cy(g,.03,1.2,'black',.4,.6,0,0,0,.9);B(g,.5,.3,.3,'yel',-.6,.15,.4)}
  if(herr==='placa'){B(g,.6,.08,.5,'dark',.7,.05,0);B(g,.4,.35,.35,'yel',.7,.28,0);link(g,V(.7,.4,0),V(.25,1.0,0),.03,'dark')}
  if(herr==='topografo'){[0,2.1,4.2].forEach(a=>link(g,V(.6,1.4,0),V(.6+Math.cos(a)*.35,0,Math.sin(a)*.35),.02,'wood'));B(g,.2,.2,.3,'yel',.6,1.5,0)}
  if(herr==='soldador'){B(g,.05,.25,.22,'dark',.13,1.62,0);B(g,.6,.5,.4,'blue',.8,.25,.4)}
  if(herr==='rigger'){B(g,.03,.4,.25,'red',.2,1.9,.35)}
  if(herr==='supervisor'){B(g,.03,.32,.24,'white',.2,1.2,.25)}return g};
M.ROLES=ROL;
window.SIGPER3D={M,mat,B,Cy,G,P};
})();
