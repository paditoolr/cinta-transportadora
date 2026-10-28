/* Calculadora de cintas transportadoras · lógica de cálculo e interfaz.
   Los datos (tablas y materiales) se cargan desde datos.json y las figuras (incrustadas en base64) desde la clave "imagenes" de datos.json.
   Necesita un servidor web local para poder leer datos.json (ver LEEME.md). */
/* RUTA: carpeta desde la que se ha cargado este script. Los datos y las imágenes se buscan
   a partir de ella, de modo que funciona igual servido desde la raíz, desde /static/ de Flask
   o desde una subcarpeta de GitHub Pages. */
const RUTA=document.currentScript.src.replace(/[^/]*$/,"");
const $=i=>document.getElementById(i),G=9.81,LAM=[20,30,35,45];
const mostrarErrorDatos=()=>{document.body.innerHTML='<div style="font:16px/1.6 system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 20px"><h1 style="font-size:22px">No se han podido cargar los datos (datos.json)</h1><p>El navegador no permite leer ese archivo cuando la página se abre haciendo doble clic. Abre la calculadora desde un servidor local:</p><ol><li>Abre una terminal en la carpeta del proyecto.</li><li>Ejecuta: <code>python3 -m http.server 8000</code></li><li>Entra en <b>http://localhost:8000</b></li></ol></div>'};
fetch(RUTA+"datos.json").then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(iniciar,mostrarErrorDatos);
function iniciar(DATOS){
const {seccionTabla:AT,factorK:K2,factorCL:CLT,rodilloCentral3:L3T,anchuraMinimaYvelocidadMaxima:VMAXT,velocidadesNormalizadas:VN,longitudRodillos:FLT,angulosArtesaTabla:SFL,seccionTablaCompleta:SF,pesoPartesMoviles:PMV}=DATOS;
const IMG=DATOS.imagenes,SECIMG=IMG.seccion;
/* Escudo de la cabecera y fondo: se pasan al CSS como variables (sin depender de img/) */
document.documentElement.style.setProperty("--img-logo",`url("${IMG.logo}")`);document.documentElement.style.setProperty("--img-fondo",`url("${IMG.fondo}")`);
const num=t=>{const a=(t||"").match(/\d+(?:,\d+)?/g)||[],f=x=>+x.replace(",",".");return a.length>1?((f(a[0])+f(a[1]))/2).toFixed(2):a.length?f(a[0]).toFixed(2):""};

// ---- Tablas de los apuntes ----
const kTab=x=>{const T=K2;let r;if(x<=0)r=1;else{let i=1;while(i<T.length-1&&x>T[i][0])i++;const[a,b]=T[i-1],[c,d]=T[i];r=b+(d-b)*(x-a)/(c-a)}return Math.max(.5,r)};
const clTab=L=>{if(L<=CLT[0][0])return CLT[0][1];if(L>=500)return 1.05;for(let i=1;i<CLT.length;i++)if(L<=CLT[i][0]){const[a,b]=CLT[i-1],[c,d]=CLT[i];return b+(d-b)*(L-a)/(c-a)}};
const textil=(T,B,Rl)=>{const z=S=>S*T/(B*Rl);let S=11,zz=z(S);if(zz>5){S=12;zz=z(S);if(zz>9){S=13;zz=z(S)}}return{S,z:zz,n:Math.max(S==11?3:S==12?6:10,Math.ceil(zz-1e-9))}};
const fmN=(x,d)=>x.toLocaleString("es-ES",{minimumFractionDigits:d,maximumFractionDigits:d});
function chk(P,o){const r=[],C={1:"#16a34a",0:"#dc2626",w:"#d97706",i:"#64748b"},I={1:"✔",0:"✖",w:"⚠",i:"ℹ"},add=(s,t)=>r.push(`<div style="display:flex;gap:8px"><b style="color:${C[s]};flex:none">${I[s]}</b><span>${t}</span></div>`);
 const{B,v,th,gam,L,tam,gran}=P,V=VMAXT[B],cs=P.cls>0?P.cls:(gam<1?1:gam<1.5?2:gam<=2?3:4),cn="ABCD"[cs-1];
 if(tam>0){
  if(V){const mx=V[gran==0?0:1];add(mx>=tam?1:0,`Tamaño de bulto ${fmN(tam,0)} mm ${mx>=tam?"≤":">"} máximo admitido para B = ${B} mm (${gran==0?"uniforme":"mixto"}, Fig. 2): ${mx} mm`)}
  else add("i",`Sin dato de tamaño máximo en la Fig. 2 para B = ${B} mm`);
  if(gran>0){const fac=(th<=20?[3,5]:[6,10])[gran-1],bmin=fac*tam;add(B>=bmin?1:0,`Criterio de granulometría: B ≥ ${fac} × ${fmN(tam,0)} = ${fmN(bmin,0)} mm ${B>=bmin?"(cumple)":"(no cumple; usar la anchura normalizada siguiente)"}`)}}
 if(V){const vm=V[2][cs-1];add(v<=vm+1e-9?1:0,`Velocidad v = ${fmN(v,2)} m/s ${v<=vm+1e-9?"≤":">"} vmáx = ${fmN(vm,2)} m/s (clase ${cn}, B = ${B} mm, Fig. 2)`)}
 else add("i",`Sin dato de velocidad máxima en la Fig. 2 para B = ${B} mm`);
 const nv=VN.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a);
 if(Math.abs(nv-v)>.005){const lo=[...VN].reverse().find(x=>x<v),hi=VN.find(x=>x>v);add("w",`v = ${fmN(v,2)} m/s no es un valor normalizado (DIN 22101); valores contiguos: ${lo?fmN(lo,2):"–"} y ${hi?fmN(hi,2):"–"} m/s`)}
 else add(1,`v = ${fmN(v,2)} m/s es un valor normalizado (DIN 22101)`);
 if(L<=80)add("w",`L = ${fmN(L,0)} m ≤ 80 m: la expresión simplificada de resistencias solo está justificada para L > 80 m; las resistencias secundarias pueden no ser despreciables`);
 if(o.nr==3&&P.th!=15)add("i",`La sección tabulada de referencia corresponde a θ = 15°; con θ = ${fmN(P.th,0)}° solo es orientativa`);
 if(o.nz>6)add("i",`Con T₁ = ${fmN(o.T1,1)} kN la banda textil exigiría ${o.nz} capas: se recomienda banda de cable de acero (St)`);return r.join("")}

// ---- Ayudas visuales: figuras y tablas ----
const TOUCH={CL:0,qB:0,kov:0,l3:0};
const thumb=(k,t)=>`<div class="th" data-i="${k}" role="button" tabindex="0"><img src="${IMG[k]}" alt=""><span>${t}<br><small>Pulsa para ampliar y ver la explicación</small></span></div>`;
const ib=(k,t)=>`<button class="ib" type="button" data-i="${k}">${t}</button>`;
const GRT=`<details class="gd"><summary>Aclaraciones sobre la granulometría</summary><div class="gx">Factor por el que se multiplica el tamaño máximo de bulto para obtener la anchura mínima de banda (B ≥ factor × tamaño). «Gruesos» son los bultos grandes y «finos» el resto de la mezcla: <b>10 % gruesos / 90 % finos</b> significa que, como mucho, una décima parte del material son bultos grandes; <b>100 % gruesos</b>, que todo el material son bultos grandes.</div><table class="gt" id="gt"><tr><th rowspan="2">Talud dinámico θ</th><th colspan="2">Factor según granulometría</th></tr><tr><th>10 % gruesos<br>90 % finos</th><th>100 % gruesos</th></tr><tr><td>θ ≤ 20°</td><td data-r="0" data-c="1">3</td><td data-r="0" data-c="2">5</td></tr><tr><td>20° ≤ θ ≤ 30°</td><td data-r="1" data-c="1">6</td><td data-r="1" data-c="2">10</td></tr></table><div class="gx">Ejemplo: caliza con θ = 15°, 10 % gruesos y bulto máximo de 250 mm → B ≥ 3 × 250 = 750 mm, es decir, la anchura normalizada siguiente (800 mm). Con granulometría «Uniforme» (todos los bultos de tamaño similar) no se aplica factor.</div></details>`;
const tblh=(head,rows)=>`<table class="mt2"><tr>${head.map(x=>`<th>${x}</th>`).join("")}</tr>${rows.join("")}</table>`;
const curP=()=>LAST&&LAST.P?LAST:null;
const info={
f2:()=>{const c=curP();let cx="";if(c){const P=c.P,V=VMAXT[P.B],cs=P.cls>0?P.cls:(P.gam<1?1:P.gam<1.5?2:P.gam<=2?3:4),cn="ABCD"[cs-1];cx=V?`<div class="mn"><b>Con tus datos:</b> B = ${P.B} mm, clase ${cn} (γ = ${fmN(P.gam,2)} t/m³) → velocidad máxima <b>${fmN(V[2][cs-1],2)} m/s</b>; tamaño máximo admitido: ${V[0]} mm (uniforme) o ${V[1]} mm (mixto).</div>`:`<div class="mn">Para B = ${P.B} mm la tabla no tiene datos.</div>`}
 return["Figura 2 · Anchura mínima de banda y velocidad máxima",`<img src="${IMG.f2}" alt="Figura 2"><p>Cada fila corresponde a una anchura normalizada de banda. Las columnas indican:</p><ul><li><b>Ancho mínimo de banda (mm):</b> la anchura más pequeña que admite el tamaño de bulto indicado.</li><li><b>Tamaños máximos (mm):</b> <i>Uniforme</i> si todos los bultos son de tamaño parecido; <i>Mixto</i> si hay mezcla de bultos grandes y material fino.</li><li><b>Velocidad máxima (m/s):</b> depende de la clase del material (A–D) y de la anchura de banda.</li></ul><p><b>Clases de material:</b></p><ul><li><b>A</b> · ligeros y deslizables, no abrasivos (0,5–1 t/m³).</li><li><b>B</b> · no abrasivos o muy poco abrasivos, de tamaño medio (1–1,5 t/m³).</li><li><b>C</b> · medianamente abrasivos y pesados (1,5–2 t/m³).</li><li><b>D</b> · muy abrasivos, pesados y cortantes (&gt; 2 t/m³).</li></ul><p>Con «Auto» la calculadora elige la clase según la densidad γ; puedes forzar otra si el material es más abrasivo de lo que sugiere su densidad. Conviene elegir la banda más estrecha y la velocidad más alta que permitan estos límites, porque reduce el coste de la instalación.</p>${cx}`]},
f5:()=>{const c=curP(),P=c&&c.P,o=c&&c.o;const rows=Object.keys(SF).map(Number).map(B=>`<tr class="${P&&P.B==B?"hb":""}"><th>${B}${SF[B][0]==null?"*":""}</th>${SF[B].map((s,i)=>`<td class="${P&&P.B==B&&P.lam==SFL[i]?"on":""}">${s==null?"–":fmN(s,4)}</td>`).join("")}</tr>`);
 let cx="";if(o&&P&&o.nr==3&&AT[P.B]){const sf=o.S1+o.S2,st=AT[P.B][LAM.indexOf(P.lam)];cx=`<div class="mn"><b>Con tus datos</b> (B = ${P.B} mm, λ = ${P.lam}°): S con la fórmula (θ = ${fmN(P.th,0)}°) = <b>${fmN(sf,4)} m²</b> · S de la tabla (θ = 15°) = <b>${fmN(st,4)} m²</b>${P.th==15?` (diferencia ${fmN((sf/st-1)*100,1)} %)`:""}.${P.th==15?" La fórmula da una sección menor que la tabla (entre un 8 % y un 18 % según B, λ y l₃): es una diferencia entre los dos métodos, no un error de cálculo.":""}</div>`}
 return["Figura 5 y tabla de secciones · cálculo de S",`<img src="${IMG.f5}" alt="Figura 5"><p>La sección S del material sobre la banda es la suma de S₁ (parte superior, limitada por el talud dinámico θ) y S₂ (parte inferior, sobre la artesa). Depende de la anchura útil b = 0,9·B − 0,05 m, de la longitud del rodillo central l₃, del ángulo de artesa λ y de θ. Con un solo rodillo, λ = 0 y S₂ = 0; con dos rodillos, l₃ = 0.</p><ul><li><b>Fórmula:</b> evalúa las expresiones de la figura para cualquier talud θ y para 1, 2 o 3 rodillos.</li><li><b>Tabla:</b> toma la sección tabulada para θ = 15° y estación de 3 rodillos, útil para contrastar con los datos de fabricante.</li></ul><p><b>Tabla de secciones S (m²) para θ = 15° (3 rodillos).</b> Filas: ancho de banda B (mm); columnas: ángulo de artesa λ. La capacidad volumétrica a 1 m/s es 3600 · S (m³/h).</p>${tblh(["B \\ λ",...SFL.map(x=>x+"°")],rows)}<p style="font-size:12px;color:var(--mu)">* B = 300 y 400 mm no figuran en la tabla original: los valores se han estimado a partir de las capacidades volumétricas del fabricante.</p>${cx}`]},
f6:()=>{const c=curP(),P=c&&c.P,F=P&&FLT[P.B];const cx=P?(F?`<div class="mn"><b>Con tus datos</b> (B = ${P.B} mm): plano ${F[0]} mm · 2 rodillos ${F[1]} mm · 3 rodillos, rodillo central l₃ = <b>${F[2]==null?"sin dato":F[2]+" mm"}</b>.</div>`:`<div class="mn">Para B = ${P.B} mm no hay dato en la tabla.</div>`):"";
 return["Figura 6 · Longitud de los rodillos",`<img src="${IMG.f6}" alt="Figura 6"><p>Longitud de los rodillos (mm) según el ancho de banda B, para una estación plana (1 rodillo), de 2 rodillos en V y de 3 rodillos en artesa. En las estaciones de 3 rodillos, el rodillo central tiene longitud <b>l₃</b>, que interviene en el cálculo de la sección (S₁ y S₂). En estaciones de 1 o 2 rodillos, l₃ = 0.</p>${cx}`]},
cl:()=>{const c=curP(),L=c&&c.P.L;let b=[];if(L!=null){if(L>=500)b=[22];else if(L<=3)b=[0];else{let i=1;while(CLT[i][0]<L)i++;b=CLT[i][0]==L?[i]:[i-1,i]}}
 const mk=a=>tblh(["L (m)",...a.map(x=>x[0])],[`<tr><th>CL</th>${a.map(x=>`<td class="${b.includes(CLT.indexOf(x))?"on":""}">${x[1]}</td>`).join("")}</tr>`]);
 return["Factor de corrección de la longitud CL",`<p>Las bandas de poca longitud necesitan proporcionalmente mayores esfuerzos para vencer la fricción que las bandas largas. Por eso se usa una longitud corregida <b>Lc = CL · L</b>, y las resistencias principales y secundarias quedan <b>FH + FN = f · CL · L · g · [qRO + qRU + (2·qB + qG) · cos δ]</b>.</p>${mk(CLT.slice(0,12))}${mk(CLT.slice(12))}<p>Entre dos valores de la tabla se interpola linealmente; para L ≥ 500 m se toma CL = 1,05.</p>${L!=null?`<div class="mn"><b>Con tus datos:</b> L = ${fmN(L,0)} m → CL = <b>${fmN(clTab(L),2)}</b>.</div>`:""}`]},
k:()=>{const c=curP(),d=c&&c.o.d,T=K2.filter(x=>x[0]>=2);let b=[];if(d!=null){if(d<=2)b=[0];else if(d>=20)b=[T.length-1];else{let i=1;while(T[i][0]<d)i++;b=T[i][0]==d?[i]:[i-1,i]}}
 return["Factor de reducción k por inclinación (Tabla 2)",`<p>La capacidad de transporte se penaliza con la inclinación de la banda: <b>Qmáx = 3600 · v · S · γ · k</b>. El factor k (adimensional) disminuye al aumentar el ángulo δ = arctan(H / L).</p>${tblh(["Inclinación (°)",...T.map(x=>x[0])],[`<tr><th>k</th>${T.map((x,i)=>`<td class="${b.includes(i)?"on":""}">${fmN(x[1],2)}</td>`).join("")}</tr>`])}<p>Entre dos valores se interpola linealmente.</p>${d!=null?`<div class="mn"><b>Con tus datos:</b> δ = ${fmN(d,2)}° → k = <b>${fmN(kTab(d),3)}</b>.</div>`:""}`]},
qb:()=>{const c=curP(),P=c&&c.P,o=c&&c.o;const rows=Object.keys(PMV).map(Number).map(B=>`<tr><th>${B}</th>${PMV[B].map(x=>`<td>${x==null?"–":x}</td>`).join("")}</tr>`);
 const cx=P&&o?`<div class="mn"><b>Con tus datos:</b> qB = ${fmN(P.qB,2)} kg/m (${P.qBauto?"estimación 0,0145 · B":"valor introducido"}); qRO + qRU + 2·qB = ${fmN(o.qRO+o.qRU+2*P.qB,1)} kg/m de partes móviles.</div>`:"";
 return["Peso de la banda qB",`<p><b>qB</b> es la masa de la banda por metro de longitud (kg/m). Lo más fiable es tomarlo del catálogo del fabricante de la banda elegida (número de capas, espesor de los recubrimientos). Como valor inicial la calculadora usa la estimación <b>qB ≈ 0,0145 · B</b> (B en mm), por ejemplo 14,5 kg/m para B = 1000 mm. Referencia: una banda textil de 3 capas y B = 400 mm tiene 3,8 kg/m (la estimación daría 5,8 kg/m).</p><p>Como comprobación de orden de magnitud, la tabla siguiente da el peso de las partes móviles por unidad de longitud (kg/m), que en la fórmula de resistencias equivale a <b>qRO + qRU + 2·qB</b>:</p>${tblh(["Ancho de banda (mm)","Banda ligera, rodillos 102 mm","Banda moderada, rodillos 127 mm","Banda pesada, rodillos 152 mm","Banda de cables de acero, rodillos 152 mm"],rows)}${cx}`]}
};
const openInfo=k=>{const r=info[k]();$("mt").textContent=r[0];$("mc").innerHTML=r[1];$("md").hidden=false;$("md").querySelector(".mb").scrollTop=0};
document.addEventListener("click",e=>{const t=e.target.closest(".th,.ib");if(t&&info[t.dataset.i]){openInfo(t.dataset.i);return}if(e.target===$("md")||e.target.closest(".mx"))$("md").hidden=true});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("md").hidden=true;if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("th")){e.preventDefault();openInfo(e.target.dataset.i)}});
function autoFill(){const L=parseFloat($("L").value),H=parseFloat($("H").value),B=parseFloat($("B").value);if(!(L>0&&B>0&&H>=0))return;const d=Math.atan(H/L)*180/Math.PI,set=(k,v)=>{if(!TOUCH[k])$(k).value=v};set("CL",+clTab(L).toFixed(2));set("qB",+(.0145*B).toFixed(2));set("kov",+kTab(d).toFixed(3));if(parseFloat($("nr").value)==3)set("l3",L3T[B]||Math.round(B/3))}
const LIB=[],MAT=[];
DATOS.materiales.forEach(l=>{if(l[0]=="#"){const q=l.slice(1).split("|");LIB.push({k:q[0],n:q[1],r:[]});return}const c=l.split("|"),ti=LIB.length-1,T=LIB[ti];MAT.push([c[0]+(T.k=="a"&&c[1]?" · "+c[1]:""),num(c[T.k=="a"?2:1]),ti]);c.i=MAT.length-1;T.r.push(c)});
const D={mat:MAT.findIndex(m=>m[0]=="Caliza fragmentada"),Q:1500,gam:1.4,L:805,H:150,B:1000,lam:35,nr:3,th:15,l3:"",v:3.35,phi:210,mu:.35,f:.02,eta:.88,ml:21.6,l0:1.2,mi:24,lu:3,CL:"",kov:"",qB:"",tam:250,gran:1,cls:0,Rl:200,sm:0};
const F=(i,l,u,s)=>`<div class="fl"><label>${l} <small>${u}</small></label><input id="${i}" type="number" step="${s}" min="0"></div>`;
const sel=(i,l,o)=>`<div class="fl"><label>${l}</label><select id="${i}">${o}</select></div>`;
const MS=LIB.map((T,ti)=>`<optgroup label="${T.n}">${MAT.map((m,i)=>m[2]==ti?`<option value="${i}">${m[0]}</option>`:"").join("")}</optgroup>`).join("");
const IN=[`<h2>Material y caudal</h2><div class="fl"><label>Material</label></div><select id="mat" class="w" style="margin-bottom:8px">${MS}</select>`+F("Q","Caudal másico Q","t/h",10)+F("gam","Densidad aparente γ","t/m³",.01)+F("tam","Tamaño máximo de bulto (0 = no comprobar)","mm",10)+sel("gran","Granulometría (% de gruesos)",'<option value="0">Uniforme</option><option value="1">10 %</option><option value="2">100 %</option>')+GRT+sel("cls","Clase de material (A ligero · B poco abrasivo · C abrasivo y pesado · D muy abrasivo)",'<option value="0">Auto (γ)</option><option value="1">A</option><option value="2">B</option><option value="3">C</option><option value="4">D</option>')+thumb("f2","Figura 2 · anchura mínima y velocidad máxima"),
`<h2>Geometría</h2>`+F("L","Longitud entre centros L","m",5)+F("H","Desnivel H","m",1)+sel("B","Ancho de banda B (mm)",Object.keys(AT).map(b=>`<option>${b}</option>`).join(""))+sel("lam","Ángulo de artesa λ (°)",LAM.map(l=>`<option>${l}</option>`).join(""))+sel("nr","Rodillos de la estación portante",[1,2,3].map(x=>`<option>${x}</option>`).join(""))+F("th","Talud dinámico θ","°",1)+sel("sm","Sección S: fórmula o tabla (θ = 15°)",'<option value="0">Fórmula</option><option value="1">Tabla</option>')+thumb("f5","Figura 5 y tabla de secciones")+F("l3","Rodillo central l3 (Fig. 6; editable)","mm",10)+thumb("f6","Figura 6 · longitud de los rodillos"),
`<h2>Banda y accionamiento</h2>`+F("v","Velocidad v","m/s",.05)+F("phi","Ángulo de abrace φ","°",5)+F("mu","Coef. rozamiento tambor μ","",.01)+F("f","Factor fricción rodillos f","",.001)+F("eta","Rendimiento motriz η","",.01)+F("Rl","Resistencia nominal por capa Rl (banda textil)","N/mm",10),
`<h2>Rodillos y factores</h2>`+F("ml","Masa estación portante","kg",.5)+F("l0","Paso rodillos portantes","m",.1)+F("mi","Masa estación retorno","kg",.5)+F("lu","Paso rodillos retorno","m",.1)+F("CL","Factor longitud CL (de tabla; editable)","",.01)+ib("cl","📋 Ver tabla de CL")+F("qB","Peso de banda qB (estimado; editable)","kg/m",.1)+ib("qb","📋 Cómo obtener qB")+F("kov","k pendiente (Tabla 2; editable)","",.01)+ib("k","📋 Ver tabla de k")+'<div class="gx">Los tres valores se calculan automáticamente; si los modificas se respeta tu dato. Para volver al valor de tabla, borra el campo.</div>'];
const R=[["Geometría y capacidad",[["d","Ángulo de inclinación","δ","°",2],["c","cos(δ)","","",4],["k","Factor por pendiente","k","",2],["A","Sección transversal del material","S","m²",4],["Qm","Capacidad máxima","Qmáx","t/h",1],["ut","Utilización","Q/Qmáx","%",1]]],
["Cargas lineales",[["qG","Material","qG","kg/m",2],["qB","Banda","qB","kg/m",2],["qRO","Rodillos portantes","qRO","kg/m",2],["qRU","Rodillos retorno","qRU","kg/m",2]]],
["Esfuerzos y resistencias",[["CLv","Factor de longitud","CL","",2],["FH","Rodadura principal","FH","N",0],["FN","Resistencias secundarias","FN","N",0],["FSt","Por desnivel","FSt","N",0],["Fu","Esfuerzo tangencial","Fu","N",0],["FuK","Esfuerzo tangencial","Fu","kN",2]]],
["Potencia de accionamiento",[["PA","En eje del tambor","PA","kW",1],["Pm","Motor eléctrico","Pm","kW",1],["CV","Equivalente","Pm","CV",1]]],
["Tensiones (Euler-Eytelwein)",[["ph","Ángulo de abrace","φ","rad",3],["e","Factor de adherencia","e^(μ·φ)","",3],["T2","Ramal flojo","T₂","kN",2],["T1","Ramal tenso","T₁","kN",2]]],
["Selección de componentes",[["tb","Tensión unitaria","T₁/B","N/mm",1],["cls","Banda recomendada (cable de acero)","St","",0],["Dm","Tambor motriz mín.","D","mm",0],["Dr","Tambor de reenvío mín.","D","mm",0],["l0m","Separación máx. portantes","l0máx","m",2],["luM","Separación máx. retorno","lumáx","m",2],["Sz","Banda textil: coef. de seguridad","S","",0],["zt","Banda textil: capas calculadas","z","",2],["nz","Banda textil: nº de capas","z","",0]]]];
const CAP=`<div class="cd"><h2>Verificación de capacidad</h2><div style="display:flex;justify-content:space-between;align-items:center"><span>Grado de utilización Q / Qmáx</span><span class="bd" id="bg"></span></div><div class="bar"><span id="ub"></span></div><div id="chk" style="margin-top:12px;font-size:13px;line-height:1.5"></div></div>`;
const FRC=`<div class="cd"><h2>Reparto del esfuerzo tangencial Fu</h2><div class="bar"><span id="b1" style="background:#2563eb"></span><span id="b2" style="background:#f59e0b"></span><span id="b3" style="background:#16a34a"></span></div><div class="lg"><span><u style="background:#2563eb"></u>Rodadura FH</span><span><u style="background:#f59e0b"></u>Secundarias FN</span><span><u style="background:#16a34a"></u>Elevación FSt</span></div></div>`;
const rc=([t,rows])=>`<div class="cd"><h2>${t}</h2>${rows.map(([k,l,s,u])=>`<div class="r"><span>${l}<i>${s}</i></span><b><output id="o_${k}">–</output> <small>${u}</small></b></div>`).join("")}</div>`;
const TB=[["1 · Material y caudal",[1],""],["2 · Geometría",[0],CAP],["3 · Banda y accionamiento",[3,4],""],["4 · Rodillos y factores",[2,5],FRC]];
$("pn").innerHTML=TB.map(([,ix,ex],i)=>`<div class="pn" role="tabpanel"${i?" hidden":""}><div class="cd">${IN[i]}</div><div class="pr">${ex}${ix.map(j=>rc(R[j])).join("")}</div></div>`).join("");
$("tb").innerHTML=TB.map((t,i)=>`<button role="tab" data-i="${i}" class="${i?"":"on"}">${t[0]}</button>`).join("");
const CT=["Cálculos material y caudal","Cálculos geometría","Cálculos banda y accionamiento","Cálculos rodillos y factores"];
$("pc").innerHTML=CT.map((t,i)=>`<div class="pn cp" id="c${i}" hidden></div>`).join("");
$("tc").innerHTML=CT.map((t,i)=>`<button role="tab" data-i="${i}">${t}</button>`).join("");
$("c0").innerHTML=`<nav class="tb" id="ts"><button class="on">🧮 Cálculos</button><button>📚 Biblioteca de propiedades de materiales</button></nav><div id="c0a"></div><div id="c0b" hidden></div>`;
const HA=["Material","Estado y tamaño (mm)","Peso específico (t/m³)","Reposo α","Incl. máx. banda δ","Fluidez","Otras propiedades"],HB=["Tipo","Peso específico aparente (t/m³)","lbs/ft³","Ángulo de reposo","Abrasividad","Corrosividad"];
$("c0b").innerHTML=`<div class="cd" id="lsel"></div>`+LIB.map(T=>`<div class="cd"><h2>${T.n}</h2><div class="tw"><table class="lt"><thead><tr>${(T.k=="a"?HA:HB).map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${T.r.map(c=>`<tr data-i="${c.i}">${(T.k=="a"?HA:HB).map((_,j)=>`<td>${c[j]||"–"}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`).join("");
$("ts").onclick=e=>{const b=e.target.closest("button");if(!b)return;[...$("ts").children].forEach(x=>x.classList.toggle("on",x===b));const lib=b!==$("ts").children[0];$("c0a").hidden=lib;$("c0b").hidden=!lib;if(lib)hl(1)};
function hl(sc){const i=$("mat").value;document.querySelectorAll(".lt tr.sel").forEach(r=>r.classList.remove("sel"));const r=document.querySelector(`.lt tr[data-i="${i}"]`);if(r){r.classList.add("sel");if(sc&&!$("c0b").hidden)r.scrollIntoView({block:"center",behavior:"smooth"})}$("lsel").innerHTML=`<b>Material seleccionado:</b> ${MAT[i][0]} · γ adoptado = ${fm(+$("gam").value,2)} t/m³ <small style="color:var(--mu)">(media del rango de la tabla; editable en «Material y caudal»)</small>`}
function show(k,i){const q=x=>document.querySelectorAll(x);q("#tb button").forEach((b,j)=>b.classList.toggle("on",k==0&&j==i));q("#tc button").forEach((b,j)=>b.classList.toggle("on",k==1&&j==i));q("#pn .pn").forEach((p,j)=>p.hidden=!(k==0&&j==i));q("#pc .pn").forEach((p,j)=>p.hidden=!(k==1&&j==i));$("dwc").hidden=k==1}
$("tb").onclick=e=>{const b=e.target.closest("button");if(b)show(0,+b.dataset.i)};
$("tc").onclick=e=>{const b=e.target.closest("button");if(b)show(1,+b.dataset.i)};
function txt(o,P){hl(0);LAST={o,P};const n=fm,Lg=P.L,{Q,gam,H,B,lam,v,phi,mu,f,eta,ml,l0,mi,lu,CL}=P,N=x=>n(x*1000,0);
 const K=(t,s,fo,sb,r,u)=>`<div class="cl"><div class="ct">${t}<i>${s}</i></div><div class="fo">${fo}</div><div class="sb">${sb} = <b>${r}${u?" "+u:""}</b></div></div>`;
 const C=(t,a)=>{CD[t]=a.join("");return `<div class="cd"><h2>${t}</h2>${a.join("")}</div>`};
 $("c0a").innerHTML=C("Cargas lineales",[
  K("Carga lineal del material","qG","qG = Q / (3,6 · v)",`${n(Q,0)} / (3,6 · ${n(v,2)})`,n(o.qG,2),"kg/m"),
  K("Carga lineal de la banda","qB",P.qBauto?"qB ≈ 0,0145 · B  (estimación; editable)":"qB introducido manualmente",P.qBauto?`0,0145 · ${B}`:"qB",n(o.qB,2),"kg/m"),
  K("Rodillos portantes (superiores)","qRO","qRO = m_estación / l0",`${n(ml,1)} / ${n(l0,1)}`,n(o.qRO,2),"kg/m"),
  K("Rodillos de retorno (inferiores)","qRU","qRU = m_estación / lu",`${n(mi,1)} / ${n(lu,1)}`,n(o.qRU,2),"kg/m")]);
 $("c1").innerHTML=`<div class="cd"><h2>Sección transversal del material sobre la cinta</h2><img class="sx" src="${SECIMG}" alt="Esquema de la sección transversal S = S1 + S2"></div>`+C("Geometría y verificación de capacidad",[
  K("Ángulo de inclinación","δ","δ = arctan(H / L)",`arctan(${n(H,1)} / ${n(Lg,0)})`,n(o.d,2),"°"),
  K("Coseno del ángulo","cos δ","cos(δ)",`cos(${n(o.d,2)}°)`,n(o.c,4),""),
  K("Factor de reducción por pendiente","k",P.kM?"k introducido manualmente":"k interpolado de la Tabla 2 (según δ)",P.kM?"k":`Tabla 2 (δ = ${n(o.d,2)}°)`,n(o.k,2),""),
  K("Anchura útil de la banda","b",B<=2000?"b = 0,9 · B − 0,05  (B ≤ 2 m)":"b = B − 0,2  (B > 2 m)",B<=2000?`0,9 · ${n(B/1000,3)} − 0,05`:`${n(B/1000,3)} − 0,2`,n(o.bm,3),"m"),
  K("Rodillo central de la estación","l3",o.nr==3?(P.l3M?"l3 introducido manualmente":L3T[B]?"l3 = longitud normalizada del rodillo central (Fig. 6)":"l3 = B / 3  (sin dato en la Fig. 6)"):o.nr==2?"l3 = 0  (2 rodillos, sin rodillo central)":"l3 = 0  (rodillo único, λ = 0)",o.nr==3?(P.l3M?"valor introducido":L3T[B]?`Fig. 6: B = ${B} mm → ${L3T[B]} mm`:`${n(B/1000,3)} / 3`):"–",n(o.l3,3),"m"),
  K("Sección superior (talud dinámico)","S1","S1 = (l3 + (b − l3) · cos λ)² · tg θ / 6",`(${n(o.l3,3)} + (${n(o.bm,3)} − ${n(o.l3,3)}) · cos ${n(o.nr==1?0:lam,0)}°)² · tg ${n(P.th,0)}° / 6`,n(o.S1,4),"m²"),
  K("Sección inferior (artesa)","S2","S2 = (l3 + (b − l3) / 2 · cos λ) · ((b − l3) / 2 · sin λ)",`(${n(o.l3,3)} + (${n(o.bm,3)} − ${n(o.l3,3)}) / 2 · cos ${n(o.nr==1?0:lam,0)}°) · ((${n(o.bm,3)} − ${n(o.l3,3)}) / 2 · sin ${n(o.nr==1?0:lam,0)}°)`,n(o.S2,4),"m²"),
  K("Sección transversal total","S",P.sm==1&&o.nr==3?"S = valor de la tabla (θ = 15°)":"S = S1 + S2",P.sm==1&&o.nr==3?`B = ${B} mm, λ = ${lam}°`:`${n(o.S1,4)} + ${n(o.S2,4)}`,n(o.A,4),"m²"),
  ...(o.nr==3?[K("Referencia: sección tabulada (θ = 15°)","A tabla","A = tabla de sección para θ = 15° (B, λ);  S fórmula / A tabla − 1 = "+n((o.A/o.Atab-1)*100,1)+" %",`B = ${B} mm, λ = ${lam}°`+(P.th==15?"":` (comparación válida solo con θ = 15°; aquí θ = ${n(P.th,0)}°)`),n(o.Atab,4),"m²")]:[]),
  K("Capacidad máxima admisible","Qmáx","Qmáx = 3600 · v · S · γ · k",`3600 · ${n(v,2)} · ${n(o.A,4)} · ${n(gam,2)} · ${n(o.k,2)}`,n(o.Qm,1),"t/h"),
  K("Grado de utilización","Q / Qmáx","Q / Qmáx",`${n(Q,0)} / ${n(o.Qm,1)}`,n(o.ut,1),"%"),
  K("Criterio de no desbordamiento","Q ≤ Qmáx","Q ≤ Qmáx",`${n(Q,0)} ${o.ut<=100?"≤":">"} ${n(o.Qm,1)}`,o.ut<=100?"VERIFICADO":"SOBRECARGA","")]);
 $("c2").innerHTML=C("Potencia de accionamiento",[
  K("Potencia en el eje del tambor","PA","PA = (Fu · v) / 1000",`(${n(o.Fu,0)} · ${n(v,2)}) / 1000`,n(o.PA,1),"kW"),
  K("Potencia del motor eléctrico","Pm","Pm = PA / η",`${n(o.PA,1)} / ${n(eta,2)}`,n(o.Pm,1),"kW"),
  K("Equivalente en caballos","Pm (CV)","Pm / 0,736",`${n(o.Pm,1)} / 0,736`,n(o.CV,1),"CV")])+
  C("Tensiones de la banda (Euler-Eytelwein)",[
  K("Ángulo de abrace","φ","φ = φ(°) · π / 180",`${n(phi,0)} · π / 180`,n(o.ph,3),"rad"),
  K("Factor de adherencia","e^(μ·φ)","e^(μ · φ)",`e^(${n(mu,2)} · ${n(o.ph,3)})`,n(o.e,3),""),
  K("Tensión en ramal flojo","T₂","T₂ = Fu / [e^(μ·φ) − 1]",`${n(o.Fu,0)} / (${n(o.e,3)} − 1)`,`${N(o.T2)} N = ${n(o.T2,2)} kN`,""),
  K("Tensión en ramal tenso","T₁","T₁ = Fu + T₂",`${n(o.Fu,0)} + ${N(o.T2)}`,`${N(o.T1)} N = ${n(o.T1,2)} kN`,"")]);
 $("c3").innerHTML=C("Esfuerzos y resistencias",[
  K("Resistencias principales de rodadura","FH","FH = f · L · g · [qRO + qRU + (2·qB + qG) · cos δ]",`${n(f,3)} · ${n(Lg,0)} · 9,81 · [${n(o.qRO,2)} + ${n(o.qRU,2)} + (2 · ${n(o.qB,2)} + ${n(o.qG,2)}) · ${n(o.c,4)}]`,n(o.FH,0),"N"),
  K("Resistencias secundarias","FN","FN = (CL − 1) · FH  (CL "+(P.CLauto?"interpolado de la tabla según L":"introducido")+")",`(${n(CL,2)} − 1) · ${n(o.FH,0)}`,n(o.FN,0),"N"),
  K("Resistencia por desnivel","FSt","FSt = qG · H · g",`${n(o.qG,2)} · ${n(H,1)} · 9,81`,n(o.FSt,0),"N"),
  K("Esfuerzo tangencial total","Fu","Fu = FH + FN + FSt",`${n(o.FH,0)} + ${n(o.FN,0)} + ${n(o.FSt,0)}`,`${n(o.Fu,0)} N = ${n(o.FuK,2)} kN`,"")])+
  C("Selección de componentes",[
  K("Tensión lineal unitaria","T₁ / B","T₁ / B",`${N(o.T1)} / ${B}`,n(o.tb,1),"N/mm"),
  K("Banda recomendada (cable de acero)","St","Clase St ≥ 8 · T₁/B (coeficiente de seguridad 8)",`8 · ${n(o.tb,1)} = ${n(o.tb*8,0)} N/mm`,o.cl?"St "+o.cl:"> St 5000 (revisar)",""),
  K("Diámetro mínimo del tambor motriz","D","Según clase de banda (tabla orientativa)",o.cl?"Clase St "+o.cl:"Clase > St 5000",n(o.Dm,0),"mm"),
  K("Diámetro mínimo del tambor de reenvío","D","D_reenvío ≈ 0,8 · D_motriz",`0,8 · ${n(o.Dm,0)}`,n(o.Dr,0),"mm"),
  K("Separación máxima rodillos portantes","l0máx","l0máx = 0,08 · T₂ / [(qB + qG) · g]  (flecha ≤ 1 %)",`0,08 · ${N(o.T2)} / [(${n(o.qB,2)} + ${n(o.qG,2)}) · 9,81]`,n(o.l0m,2),"m"),K("Separación máx. rodillos de retorno","lumáx","lumáx = 0,08 · T₂ / (qB · g)  (flecha ≤ 1 %)",`0,08 · ${N(o.T2)} / (${n(o.qB,2)} · 9,81)`,n(o.luM,2),"m"),K("Coeficiente de seguridad de la banda textil","S","S = 11 (3–5 capas) · 12 (6–9) · 13 (>9)",`z con S = ${o.Sz}`,n(o.Sz,0),""),K("Número de capas de la banda textil","z","z = S · T₁ / (B · Rl)",`${o.Sz} · ${N(o.T1)} / (${B} · ${n(P.Rl,0)})`,`${n(o.zt,2)} → ${n(o.nz,0)} capas`,"")])}
const fm=(x,d)=>x.toLocaleString("es-ES",{minimumFractionDigits:d,maximumFractionDigits:d});
function tw(el,to,d){const f=el._v||0,t0=performance.now();el._v=to;el._t=t0;(function s(t){if(el._t!==t0)return;const p=Math.min(1,(t-t0)/500),e=1-Math.pow(1-p,3);el.textContent=fm(f+(to-f)*e,d);if(p<1)requestAnimationFrame(s)})(t0)}
function load(){for(const k in D)$(k).value=D[k];$("gam").value=MAT[D.mat][1]}
function calc(){autoFill();const P={};for(const k in D)P[k]=parseFloat($(k).value);$("lam").disabled=P.nr==1;$("l3").disabled=P.nr!=3;
 if([P.Q,P.gam,P.L,P.B,P.v,P.mu,P.eta,P.l0,P.lu,P.phi,P.th].some(x=>!(x>0))||!(P.H>=0))return;const CLauto=!TOUCH.CL||!(P.CL>0);if(CLauto)P.CL=clTab(P.L);const qBauto=!TOUCH.qB||!(P.qB>0);if(qBauto)P.qB=.0145*P.B;P.kM=!!TOUCH.kov&&P.kov>0;P.l3M=!!TOUCH.l3&&P.l3>0;if(!P.l3M)P.l3=NaN;if(!(P.Rl>0))P.Rl=200;P.CLauto=CLauto;P.qBauto=qBauto;const{Q,gam,L,H,B,lam,v,phi,mu,f,eta,ml,l0,mi,lu,CL,kov}=P;
 
 const nr=P.nr,la=nr==1?0:lam*Math.PI/180,Bm=B/1000,bm=B<=2000?.9*Bm-.05:Bm-.2,l3=nr==3?Math.min(bm,P.l3>0?P.l3/1000:(L3T[B]?L3T[B]/1000:Bm/3)):0,tg=Math.tan(P.th*Math.PI/180),aa=l3+(bm-l3)*Math.cos(la),S1=aa*aa*tg/6,S2=(l3+(bm-l3)/2*Math.cos(la))*((bm-l3)/2*Math.sin(la)),S=S1+S2,h1=aa*tg/4,dd=(bm-l3)/2*Math.sin(la),hv=h1+dd;
 const al=Math.atan(H/L),d=al*180/Math.PI,c=Math.cos(al),k=P.kM?kov:kTab(d),A=(P.sm==1&&nr==3&&AT[B]?AT[B][LAM.indexOf(lam)]:S),Qm=3600*v*A*gam*k,ut=Q/Qm;
 const qG=Q/(3.6*v),qB=P.qB,qRO=ml/l0,qRU=mi/lu;
 const FH=f*L*G*(qRO+qRU+(2*qB+qG)*c),FN=(CL-1)*FH,FSt=qG*H*G,Fu=FH+FN+FSt;
 const PA=Fu*v/1000,Pm=PA/eta,ph=phi*Math.PI/180,e=Math.exp(mu*ph),T2=Fu/(e-1),T1=Fu+T2,tb=T1/B;
 const cl=[630,800,1000,1250,1600,2000,2500,3150,3500,4000,4500,5000].find(x=>x>=tb*8),Dm=!cl?1600:cl<=1000?630:cl<=1600?800:cl<=2500?1000:cl<=3500?1250:1600,tx=textil(T1,B,P.Rl);
 const o={nr,la,bm,l3,S1,S2,hv,h1,dd,Atab:AT[B][LAM.indexOf(lam)],cl,d,c,k,A,Qm,ut:ut*100,qG,qB,qRO,qRU,FH,FN,FSt,Fu,FuK:Fu/1000,PA,Pm,CV:Pm/.736,ph,e,T2:T2/1000,T1:T1/1000,tb,Dm,Dr:.8*Dm,l0m:.08*T2/((qB+qG)*G),luM:.08*T2/(qB*G),CLv:CL,Sz:tx.S,zt:tx.z,nz:tx.n};
 R.forEach(([,rows])=>rows.forEach(([key,,,,dc])=>{const el=$("o_"+key);if(key==="cls")el.textContent=cl?"St "+cl:"> St 5000 (revisar)";else tw(el,o[key],dc)}));
 const ok=ut<=1,col=ut>1?"var(--ba)":ut>.9?"var(--wa)":"var(--ok)";
 $("bg").textContent=ok?"VERIFICADO · "+fm(ut*100,1)+" %":"SOBRECARGA · "+fm(ut*100,1)+" %";$("bg").style.background=col;
 $("ub").style.width=Math.min(100,ut*100)+"%";$("ub").style.background=col;
 $("b1").style.width=FH/Fu*100+"%";$("b2").style.width=FN/Fu*100+"%";$("b3").style.width=FSt/Fu*100+"%";
 document.querySelectorAll("#gt td[data-c]").forEach(td=>td.classList.toggle("on",P.gran>0&&+td.dataset.c==P.gran&&+td.dataset.r==(P.th<=20?0:1)));$("chk").innerHTML=chk(P,o);draw(o,P,ut,H,L);draw2(o,P,ut);txt(o,P)}
function draw(o,P,ut,H,L){
 const v=P.v,sp=v*30,r=24,dx=600,dy=dx*Math.min(H/L,.3),al=Math.atan(dy/dx),ad=al*180/Math.PI,ca=Math.cos(al),sa=Math.sin(al),Ld=Math.hypot(dx,dy),Tx=80,Ty=318,Hx=Tx+dx,Hy=Ty-dy,GY=392,f=fm,h=Math.max(6,Math.min(46,o.hv*110*(.45+.55*Math.min(ut,1.15))));
 const an=n=>`animation:dm ${(n/sp).toFixed(2)}s linear infinite;--n:-${n}`,sd=q=>`animation-duration:${(6.283*q/sp).toFixed(2)}s`;
 const rl=(x,y,q,rv)=>`<g transform="translate(${x},${y})"><g class="sp${rv?" rv":""}" style="${sd(q)}"><circle r="${q}" fill="url(#gd)" stroke="#475569" stroke-width=".8"/><line x1="${-q}" x2="${q}" stroke="#475569"/></g></g>`;
 const dr=x=>`<g transform="translate(${x},0)"><circle r="${r}" fill="url(#gd)" stroke="#475569" stroke-width="2"/><g class="sp" style="${sd(r)}"><circle r="${r-9}" fill="none" stroke="#64748b"/><path d="M${9-r} 0H${r-9}M0 ${9-r}V${r-9}" stroke="#64748b" stroke-width="2"/>${[0,1,2,3,4,5].map(k=>`<circle cx="${((r-4.5)*Math.cos(k*1.0472)).toFixed(1)}" cy="${((r-4.5)*Math.sin(k*1.0472)).toFixed(1)}" r="2" fill="#374151"/>`).join("")}</g><circle r="6" fill="#334155"/></g>`;
 const gd=(id,a,b)=>`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
 let s=`<defs>${gd("gs","#dbe3ec","#5f6d80")}${gd("gm","#c9ad84","#8a6d4b")}${gd("gr","#f87171","#b91c1c")}${gd("gb","#60a5fa","#1e40af")}<radialGradient id="gd"><stop offset="0" stop-color="#e5e7eb"/><stop offset="1" stop-color="#6b7280"/></radialGradient></defs>`;
 const pe=r+34;
 for(let i=0;i<=8;i++){const x=Tx+dx*i/8,yb=Ty-dy*i/8+pe/ca;s+=`<rect x="${x-3}" y="${yb}" width="6" height="${GY-yb}" fill="url(#gs)" stroke="#475569" stroke-width=".8"/><rect x="${x-11}" y="${GY-5}" width="22" height="5" rx="1" fill="#9ca3af"/>`;
  if(i<8){const x2=Tx+dx*(i+1)/8,y2=Ty-dy*(i+1)/8+pe/ca;if(Math.min(GY-yb,GY-y2)>45)s+=`<path d="M${x} ${yb+6}L${x2} ${GY-9}M${x2} ${y2+6}L${x} ${GY-9}" stroke="#64748b" stroke-width="1.4" fill="none"/>`}}
 s+=`<path d="M${Hx} ${GY}Q${Hx+34} ${GY-72} ${Hx+68} ${GY}Z" fill="url(#gm)" stroke="#6b5136" stroke-width=".8"/>`;
 s+=`<path class="dm" d="M${Hx+130} ${Hy-40}H832M${Hx+130} ${Ty}H832M826 ${Hy-40}V${Ty}"/><text transform="translate(848,${(Hy+Ty)/2-20}) rotate(-90)" text-anchor="middle">H = ${f(P.H,0)} m</text>`;
 s+=`<path class="dm" d="M${Tx} 398V414M${Hx} 398V414M${Tx} 408H${Hx}"/><text x="${(Tx+Hx)/2}" y="405" text-anchor="middle">L = ${f(P.L,0)} m</text>`;
 s+=`<g transform="translate(${Tx},${Ty}) rotate(${-ad})">`;
 s+=`<rect x="-14" y="${r+14}" width="${Ld+28}" height="4" fill="url(#gs)"/><rect x="-14" y="${r+32}" width="${Ld+28}" height="4" fill="url(#gs)"/>`;
 let z=`M-14 ${r+32}`;for(let x=-14;x<Ld+14;x+=30)z+=`L${x+15} ${r+18}L${x+30} ${r+32}`;
 s+=`<path d="${z}" fill="none" stroke="#64748b" stroke-width="1.6"/>`;
 s+=`<rect x="${Ld-22}" y="-22" width="44" height="44" rx="9" fill="#475569"/>`;
 const n=Math.floor(Ld/42);
 for(let i=1;i<=n;i++){const x=i*Ld/(n+1);s+=`<line x1="${x}" y1="${-r+9}" x2="${x}" y2="${r+14}" stroke="#94a3b8" stroke-width="3"/>`;if(i%3==1)s+=`<line x1="${x}" y1="${r+8}" x2="${x}" y2="${r+14}" stroke="#94a3b8" stroke-width="3"/>`}
 const bp=`M0 ${-r}H${Ld}A${r} ${r} 0 0 1 ${Ld} ${r}H0A${r} ${r} 0 0 1 0 ${-r}Z`;
 s+=`<path d="${bp}" fill="none" stroke="#111827" stroke-width="6"/><path d="${bp}" fill="none" stroke="#4b5563" stroke-width="1.6" stroke-dasharray="14 10" style="${an(24)}"/>`;
 for(let i=1;i<=n;i++){const x=i*Ld/(n+1);s+=rl(x,-r+9,6,0);if(i%3==1)s+=rl(x,r+8,5,1)}
 let pd=`M66 ${-r-3}`;for(let x=66;x<=Ld-14;x+=6){const e=Math.min(1,(x-66)/55,(Ld-14-x)/45+.05);pd+=`L${x} ${(-r-3-h*Math.max(.04,e)*(.8+.14*Math.sin(x*.33)+.06*Math.sin(x*.91))).toFixed(1)}`}pd+=`L${Ld-14} ${-r-3}Z`;
 const tx=(y,w,c,d,k,op)=>`<line x1="60" x2="${Ld}" y1="${-r-3-y}" y2="${-r-3-y}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${d}" stroke-linecap="round" opacity="${op}" style="${an(k)}"/>`;
 s+=`<clipPath id="mc"><path d="${pd}"/></clipPath><path d="${pd}" fill="${ut>1?"url(#gr)":"url(#gm)"}" stroke="#6b5136" stroke-width=".8"/><g clip-path="url(#mc)">${tx(h*.25,h*.35,"#6f553a","7 11 4 9 10 6",47,.5)}${tx(h*.62,h*.3,"#ecdcc0","5 14 9 7 3 12",50,.6)}${tx(h*.45,3,"#3f2f1f","1 9 1 14 1 7",32,.9)}</g>`;
 s+=`<path d="M${Ld} ${-r-10}A${r+10} ${r+10} 0 ${P.phi>180?1:0} 1 ${(Ld+(r+10)*Math.sin(P.phi*Math.PI/180)).toFixed(1)} ${(-(r+10)*Math.cos(P.phi*Math.PI/180)).toFixed(1)}" fill="none" stroke="var(--ac)" stroke-width="2" stroke-dasharray="4 3"/>`;
 s+=dr(0)+dr(Ld);
 s+=`<rect x="-48" y="-5" width="30" height="10" rx="2" fill="url(#gs)" stroke="#475569"/><line x1="-48" x2="-18" y1="0" y2="0" stroke="#475569" stroke-dasharray="2 2"/><text x="-30" y="${r+56}" text-anchor="middle" style="fill:var(--mu)">Cola · tensor</text>`;
 s+=`<g transform="translate(70,${-r}) rotate(${ad})"><path d="M-50 -128H50L16 -36H-16Z" fill="url(#gs)" stroke="#475569" stroke-width="1.5"/><rect x="-18" y="-38" width="36" height="6" fill="#64748b"/>`;
 for(let i=0;i<5;i++)s+=`<circle cx="${-8+i*4}" cy="-34" r="2.8" fill="#8a6d4b" style="animation:fx .55s linear infinite;animation-delay:${i*.11}s"/>`;
 s+=`</g>`;
 s+=`<text x="${Ld-36}" y="${-r-h-26}" text-anchor="end" style="font-weight:700">T₁ = ${f(o.T1,1)} kN →</text><text x="${Ld+8}" y="${r+56}" text-anchor="end">← T₂ = ${f(o.T2,1)} kN</text><text x="${Ld+8}" y="${r+72}" text-anchor="end" style="fill:var(--ac)">abrace φ = ${f(P.phi,0)}°</text></g>`;
 s+=`<path d="M${(Hx-34*ca-(r+12)*sa).toFixed(1)} ${(Hy+34*sa-(r+12)*ca).toFixed(1)}Q${Hx+6} ${Hy-r-24} ${Hx+36} ${Hy-6}V${Hy+12}" fill="none" stroke="#64748b" stroke-width="3"/>`;
 for(let i=0;i<6;i++)s+=`<circle cx="${Hx+26+(i%3)*5}" cy="${Hy-4}" r="2.6" fill="#8a6d4b" style="animation:fy .85s linear infinite;animation-delay:${i*.14}s;--d:${GY-Hy-34}px"/>`;
 s+=`<rect x="${Hx+20}" y="${Hy-5}" width="32" height="10" fill="url(#gs)" stroke="#475569"/><rect x="${Hx+50}" y="${Hy-17}" width="66" height="34" rx="6" fill="url(#gb)" stroke="#1e3a8a"${ut>1?' class="pu"':''}/><path d="${[0,1,2,3,4,5].map(k=>`M${Hx+58+k*9} ${Hy-14}V${Hy+14}`).join("")}" stroke="#fff" stroke-opacity=".35"/><rect x="${Hx+114}" y="${Hy-12}" width="10" height="24" fill="#1e3a8a"/><rect x="${Hx+54}" y="${Hy+17}" width="58" height="5" fill="url(#gs)"/><rect x="${Hx+76}" y="${Hy-24}" width="20" height="7" fill="#475569"/><text x="${Hx+84}" y="${Hy+40}" text-anchor="middle" style="font-weight:700">Pm = ${f(o.Pm,0)} kW</text>`;
 s+=`<text x="24" y="30" style="font-size:14px;font-weight:700">v = ${f(v,2)} m/s · B = ${P.B} mm · δ = ${f(o.d,2)}°</text><text x="24" y="50" style="fill:var(--mu)">Q = ${f(P.Q,0)} t/h · ${MAT[$("mat").value][0]}</text>`;
 s+=`<text x="836" y="30" text-anchor="end" style="font-weight:700;fill:${ut>1?"#dc2626":"#16a34a"}">${ut>1?"SOBRECARGA":"VERIFICADO"} · ${f(ut*100,1)} %</text>`;
 $("dw").innerHTML=s}
var LAST,CD={};
function sty(t){
 const SB={qRO:["q","RO"],qRU:["q","RU"],qG:["q","G"],qB:["q","B"],FSt:["F","St"],FH:["F","H"],FN:["F","N"],Fu:["F","u"],PA:["P","A"],Pm:["P","m"],"Qmáx":["Q","máx"],"l0máx":["l","0máx"],l0:["l","0"],lu:["l","u"],"m_estación":["m","est."],"D_reenvío":["D","reenvío"],"D_motriz":["D","motriz"],CL:["C","L"],S1:["S","1"],S2:["S","2"],l3:["l","3"]};
 return t.replace(/(?<![\p{L}\p{N}])([QvAkfLHgBDTSbγδφλημθ])(?![\p{L}\p{N}])/gu,"<i>$1</i>")
  .replace(/(?<![\p{L}\p{N}])(qRO|qRU|qG|qB|FSt|FH|FN|Fu|PA|Pm|Qmáx|l0máx|l0|lu|m_estación|D_reenvío|D_motriz|CL|S1|S2|l3)(?![\p{L}\p{N}])/gu,m=>`<i>${SB[m][0]}</i><sub>${SB[m][1]}</sub>`)
  .replace(/T([₁₂])/g,(m,d)=>`<i>T</i><sub>${d=="₁"?1:2}</sub>`)
  .replace(/e\^\(([^)]*)\)/g,"e<sup>$1</sup>")}
function mf(t){const nt=(t.match(/\s{2}\(.*\)$/)||[""])[0];t=t.slice(0,t.length-nt.length);let l="",r=t;const q=t.indexOf(" = ");if(q>0){l=t.slice(0,q);r=t.slice(q+3)}
 let d=0,ix=-1,c=0;for(let i=0;i<r.length;i++){const ch=r[i];if("([".includes(ch))d++;else if(")]".includes(ch))d--;else if(!d&&ch=="/"&&r[i-1]==" "&&r[i+1]==" "){c++;ix=i}}
 const un=x=>{x=x.trim();if(!/^[(\[].*[)\]]$/.test(x))return x;let k=0;for(let i=0;i<x.length;i++){if("([".includes(x[i]))k++;else if(")]".includes(x[i])){k--;if(!k&&i<x.length-1)return x}}return x.slice(1,-1)};
 const rr=c==1?`<span class="fr"><span>${sty(un(r.slice(0,ix)))}</span><span>${sty(un(r.slice(ix+1)))}</span></span>`:sty(r);
 return(l?sty(l)+" = ":"")+rr+(nt?`<span class="nt">${nt.trim()}</span>`:"")}
function pretty(h){return h.replace(/<div class="ct">([^<]*)<i>([^<]*)<\/i><\/div>/g,(m,a,b)=>`<div class="ct"><span>${a}</span><span class="sy">${sty(b)}</span></div>`).replace(/<div class="fo">([^<]*)<\/div>/g,(m,a)=>`<div class="fo">${mf(a)}</div>`).replace(/<div class="sb">([^<]*) = <b>/g,(m,a)=>`<div class="sb">${mf(a)} = <b>`)}
function buildRep(){const{o,P}=LAST,n=fm,ut=o.ut,ok=ut<=100,bg=getComputedStyle(document.querySelector("header"),"::after").backgroundImage,logo=(bg.match(/url\("?([^")]+)"?\)/)||[])[1]||"";
 const I=[["Material transportado","",MAT[$("mat").value][0],""],["Caudal másico demandado","Q",n(P.Q,0),"t/h"],["Densidad aparente del material","γ",n(P.gam,2),"t/m³"],["Longitud entre centros de tambores","L",n(P.L,0),"m"],["Desnivel geométrico de elevación","H",n(P.H,1),"m"],["Ancho normalizado de la banda","B",P.B,"mm"],["Velocidad lineal de la banda","v",n(P.v,2),"m/s"],["Rodillos de la estación portante","n",P.nr,"–"],["Ángulo de inclinación de artesa","λ",P.nr==1?"0 (plano)":P.lam,"°"],["Talud dinámico del material","θ",n(P.th,0),"°"],["Ángulo de abrace en tambor motriz","φ",n(P.phi,0),"°"],["Coeficiente de rozamiento del tambor","μ",n(P.mu,2),"–"],["Factor de fricción en rodillos","f",n(P.f,3),"–"],["Rendimiento del grupo motriz","η",n(P.eta,2),"–"],["Masa de la estación portante","m_est",n(P.ml,1),"kg"],["Paso de rodillos portantes","l0",n(P.l0,1),"m"],["Masa de la estación de retorno","m_est",n(P.mi,1),"kg"],["Paso de rodillos de retorno","lu",n(P.lu,1),"m"],["Factor de longitud","CL",n(P.CL,2),"–"],["Peso de la banda","qB",n(P.qB,2),"kg/m"],["Resistencia nominal por capa","Rl",n(P.Rl,0),"N/mm"],["Factor de pendiente ("+(P.kM?"manual":"automático")+")","k",n(o.k,2),"–"]];
 const S=[["Grado de utilización","Q / Qmáx",n(ut,1),"%"],["Capacidad máxima","Qmáx",n(o.Qm,1),"t/h"],["Esfuerzo tangencial total","Fu",n(o.FuK,2),"kN"],["Potencia en el eje del tambor","PA",n(o.PA,1),"kW"],["Potencia del motor eléctrico","Pm",n(o.Pm,1)+" ("+n(o.CV,1)+" CV)","kW"],["Tensión en ramal tenso","T₁",n(o.T1,2),"kN"],["Tensión en ramal flojo","T₂",n(o.T2,2),"kN"],["Banda recomendada (cable de acero)","St",o.cl?"St "+o.cl:"> St 5000 (revisar)","–"],["Tambor motriz / de reenvío","D",n(o.Dm,0)+" / "+n(o.Dr,0),"mm"],["Separación máx. rodillos portantes","l0máx",n(o.l0m,2),"m"],["Separación máx. rodillos de retorno","lumáx",n(o.luM,2),"m"],["Banda textil (nº de capas)","z",n(o.nz,0)+" (S = "+o.Sz+", z = "+n(o.zt,2)+")","–"]];
 const tb=(h,r)=>`<table class="rt"><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr>${r.map(c=>`<tr>${c.map((x,j)=>`<td${j==1?' class="sy"':j==2?' class="nv"':""}>${j==1?sty(x):x}</td>`).join("")}</tr>`).join("")}</table>`;
 const sec=(i,t)=>`<h3>${i}. ${t}</h3>${pretty(CD[t]||"")}`;
 return `<div class="rh"><div><h1>Memoria de cálculo y dimensionamiento de cinta transportadora</h1><div class="sub">Normativa de referencia: DIN 22101 / UNE 58-204-92 · Fecha: ${new Date().toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})}</div></div>${logo?`<img src="${logo}">`:""}</div>
<div class="mt"><div><span>Normativa</span>DIN 22101 / UNE 58-204-92</div><div><span>Material</span>${MAT[$("mat").value][0]}</div><div><span>Caudal · Velocidad</span>${n(P.Q,0)} t/h · ${n(P.v,2)} m/s</div></div>
<h3>1. Datos de entrada y condiciones de operación</h3>${tb(["Concepto","Símbolo","Valor","Unidad"],I)}
<h3>2. Geometría y verificación de capacidad</h3><div class="fg"><img src="${SECIMG}"><div>Sección transversal del material sobre la cinta (esquema de cálculo)</div></div>${pretty(CD["Geometría y verificación de capacidad"]||"")}${sec(3,"Cargas lineales")}${sec(4,"Esfuerzos y resistencias")}${sec(5,"Potencia de accionamiento")}${sec(6,"Tensiones de la banda (Euler-Eytelwein)")}${sec(7,"Selección de componentes")}
<h3>8. Resumen de resultados</h3>${tb(["Concepto","Símbolo","Valor","Unidad"],S)}
<div class="vd" style="border-color:${ok?"#16a34a":"#dc2626"};color:${ok?"#166534":"#991b1b"}">${ok?"CAPACIDAD VERIFICADA":"SOBRECARGA: CAPACIDAD NO VERIFICADA"} · Q / Qmáx = ${n(ut,1)} %</div>
<h3>9. Hipótesis y observaciones</h3><ul><li>Factor de pendiente k: ${P.kM?"valor introducido manualmente.":"aproximación k ≈ 1 − 0,0085·δ (calibrada con el ejemplo resuelto)."}</li><li>Factor de longitud CL: valor introducido (por defecto 1,05).</li><li>Sección transversal S = S₁ + S₂ según la geometría de la estación portante (1, 2 o 3 rodillos), con anchura útil b y talud dinámico θ.</li><li>Densidad γ: media del rango de la tabla de materiales, editable.</li><li>Clase de banda St con coeficiente de seguridad 8 sobre T₁/B; diámetros de tambor según tabla orientativa.</li><li>Resultados orientativos: deben contrastarse con la norma y con el catálogo del fabricante.</li></ul><div class="sg"><div>Elaborado por:</div><div>Revisado por:</div><div>Fecha y firma:</div></div>`}
function pr(){$("prt").className="rp";$("prt").innerHTML=buildRep();window.print()}
$("pdf").onclick=async()=>{const st=t=>$("pst").textContent=t;let dl=null;try{dl=window.claude?await window.claude.use("downloads"):null}catch(e){}
 if(window.html2pdf&&dl){st("Generando PDF…");const el=document.createElement("div");el.id="rep";el.className="rp";el.innerHTML=buildRep();
  try{const blob=await html2pdf().set({margin:[12,12,14,12],image:{type:"jpeg",quality:.96},html2canvas:{scale:2,useCORS:true,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cl","tr","h3"]}}).from(el).toPdf().get("pdf").then(pdf=>{const N=pdf.internal.getNumberOfPages(),W=pdf.internal.pageSize.getWidth(),Hh=pdf.internal.pageSize.getHeight();for(let k=1;k<=N;k++){pdf.setPage(k);pdf.setFontSize(8);pdf.setTextColor(110);pdf.text("Memoria de cálculo · Cinta transportadora · DIN 22101 / UNE 58-204-92",12,Hh-7);pdf.text("Página "+k+" de "+N,W-12,Hh-7,{align:"right"})}}).outputPdf("blob");
   await dl.save({filename:"memoria-calculo-cinta-transportadora.pdf",data:blob});st("PDF listo ✔")}catch(e){if(e&&e.code=="declined")st("Descarga cancelada");else{st("No se pudo generar el PDF; abriendo impresión…");pr()}}}
 else{st("Abriendo impresión…");pr()}};
function draw2(o,P,ut){
 const B=P.B,nr=o.nr,la=o.la,sn=Math.sin(la),cs=Math.cos(la),ld=la*180/Math.PI,sc=Math.min(.32,380/B),d=22,k=d/2+2,cx=225,cy=170,f=fm,q=n=>n.toFixed(1),by=cy+d/2+16,m=x=>2*cx-x;
 const bmm=o.bm*1000,l3=o.l3*1000,ch=(nr==1?B:nr==3?l3:0)*sc/2,wl=(nr==1?0:nr==2?B/2:(B-l3)/2)*sc;
 const rc=(x,y,len,ang)=>`<g transform="translate(${q(x)},${q(y)}) rotate(${ang})"><rect x="0" y="${-d/2}" width="${q(len)}" height="${d}" rx="4" fill="url(#gs)" stroke="#475569"/><rect x="-5" y="-4" width="5" height="8" fill="#334155"/><rect x="${q(len)}" y="-4" width="5" height="8" fill="#334155"/><path d="M${q(len*.2)} ${-d/2}V${d/2}M${q(len*.8)} ${-d/2}V${d/2}" stroke="#475569" stroke-opacity=".6"/></g>`;
 const Sx=cx+ch,Ex=Sx+wl*cs,Ey=cy-wl*sn,tp=(x,y)=>[x-k*sn,y-k*cs],RS=tp(Sx,cy),RE=tp(Ex,Ey);
 const cm=(nr==1?bmm:l3)*sc/2,dm=(nr==1?0:(bmm-l3)/2)*sc,RM=tp(cx+cm+dm*cs,cy-dm*sn),LM=[m(RM[0]),RM[1]],pk=RM[1]-o.h1*1000*sc,top=Math.min(pk,RE[1])-14;
 const ap=[cx,cy-k/(cs||1)],LJ=nr==2?ap:[cx-cm,cy-k],RJ=nr==2?ap:[cx+cm,cy-k];
 let s=`<text x="435" y="22" text-anchor="middle" style="font-weight:700;font-size:14px">Vista frontal de los rodillos</text><text x="435" y="40" text-anchor="middle" style="fill:var(--mu)">⊙ la banda avanza hacia el observador</text>`;
 s+=`<rect x="${q(cx-Math.max(ch+wl*cs,40)-12)}" y="${by}" width="${q(2*Math.max(ch+wl*cs,40)+24)}" height="6" rx="2" fill="url(#gs)" stroke="#475569"/>`;
 const ps=nr==2?[[cx,cy]]:[[cx-ch,cy],[cx+ch,cy]];if(wl>0)ps.push([Ex,Ey],[m(Ex),Ey]);
 ps.forEach(a=>s+=`<line x1="${q(a[0])}" y1="${q(a[1])}" x2="${q(a[0])}" y2="${by}" stroke="#94a3b8" stroke-width="4"/>`);
 if(ch>0)s+=rc(cx-ch,cy,2*ch,0);if(wl>0)s+=rc(Sx,cy,wl,-ld)+rc(cx-ch,cy,wl,180+ld);
 s+=`<g style="animation:bn 1.1s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%"><path d="M${q(LM[0])} ${q(LM[1])}L${q(LJ[0])} ${q(LJ[1])}L${q(RJ[0])} ${q(RJ[1])}L${q(RM[0])} ${q(RM[1])}Q${cx} ${q(2*pk-RM[1])} ${q(LM[0])} ${q(LM[1])}Z" fill="${ut>1?"url(#gr)":"url(#gm)"}" stroke="#6b5136"/></g>`;
 const pts=nr==2?[[m(RE[0]),RE[1]],ap,RE]:[[m(RE[0]),RE[1]],[m(RS[0]),RS[1]],[cx-ch,cy-k],[cx+ch,cy-k],RS,RE];
 s+=`<polyline points="${pts.map(a=>q(a[0])+","+q(a[1])).join(" ")}" fill="none" stroke="#111827" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
 s+=`<path class="dm" d="M${q(m(RE[0]))} ${q(top)}H${q(RE[0])}M${q(m(RE[0]))} ${q(top-5)}V${q(top+5)}M${q(RE[0])} ${q(top-5)}V${q(top+5)}"/><text x="${cx}" y="${q(top-5)}" text-anchor="middle">B = ${B} mm · b = ${f(bmm,0)} mm</text>`;
 if(nr>1)s+=`<path d="M${q(Sx+34)} ${cy}A34 34 0 0 0 ${q(Sx+34*cs)} ${q(cy-34*sn)}" fill="none" stroke="var(--ac)" stroke-width="2"/><text x="${q(Sx+40)}" y="${cy+16}" style="fill:var(--ac);font-weight:700">λ = ${f(P.lam,0)}°</text>`;
 s+=`<text x="${cx}" y="228" text-anchor="middle" style="font-weight:700">Estación portante · ${nr} rodillo${nr>1?"s":""}</text><text x="${cx}" y="244" text-anchor="middle" style="fill:var(--mu)">${nr==3?"l3 = "+f(l3,0)+" mm · ":""}θ = ${f(P.th,0)}° · S = ${f(o.A,4)} m² · l0 = ${f(P.l0,1)} m</text>`;
 const c2=645,yr=156,b2=B*sc;
 s+=`<rect x="${q(c2-b2/2-12)}" y="${by}" width="${q(b2+24)}" height="6" rx="2" fill="url(#gs)" stroke="#475569"/>`;
 [c2-b2/2,c2+b2/2].forEach(x=>s+=`<line x1="${q(x)}" y1="${yr}" x2="${q(x)}" y2="${by}" stroke="#94a3b8" stroke-width="4"/>`);
 s+=rc(c2-b2/2,yr,b2,0)+`<line x1="${q(c2-b2/2-14)}" x2="${q(c2+b2/2+14)}" y1="${yr-k}" y2="${yr-k}" stroke="#111827" stroke-width="5" stroke-linecap="round"/>`;
 s+=`<text x="${c2}" y="228" text-anchor="middle" style="font-weight:700">Estación de retorno · 1 rodillo plano</text><text x="${c2}" y="244" text-anchor="middle" style="fill:var(--mu)">paso lu = ${f(P.lu,1)} m</text>`;
 $("dw2").innerHTML=s}
$("mat").onchange=e=>{const g=MAT[e.target.value][1];if(g)$("gam").value=g;calc();hl(1)};
$("rs").onclick=()=>{for(const k in TOUCH)TOUCH[k]=0;load();calc()};
document.addEventListener("input",e=>{const k=e.target.id;if(k in TOUCH)TOUCH[k]=e.target.value!==""?1:0;calc()});
load();calc();
}
