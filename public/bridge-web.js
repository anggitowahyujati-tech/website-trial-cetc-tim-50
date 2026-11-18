/* ATLAS bridge (web): sinkron dua arah dengan server lewat SSE + POST */
(function(){var base={S:JSON.stringify(S),K:JSON.stringify(K)},known=S.slice(),last={p:'',n:0,first:1};
var cls=function(s){return /Disetujui|Selesai|Lulus/.test(s)?'cg':/Menunggu|Diterima|Ditangani/.test(s)?'co':'cr'};
function post(t,d){fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:t,data:d,src:'web'})}).catch(function(){toast('Offline: perubahan belum terkirim')})}
function apply(st){var b=JSON.parse(base.S).map(function(r){return st.arrived.indexOf(r[0])>-1&&r[2].indexOf('Besi D19')===0?[r[0],r[1],r[2],'Tiba']:r});
 st.book.forEach(function(x){b.push([x[0],x[1],x[2],'Terjadwal'])});S.length=0;b.forEach(function(r){S.push(r)});known=S.slice();rs();
 K.length=0;st.kadd.map(function(x){return[x[0],x[1],x[2],cls(x[2])]}).concat(JSON.parse(base.K)).forEach(function(r){K.push(r)});rk();
 IR[0][2]=st.irStatus;IR[0][3]=cls(st.irStatus);ri();
 var pj=JSON.stringify(st.p);if(pj!==last.p){P.A5=st.p;if(!last.first)pd('A5');last.p=pj}
 if(!last.first&&st.alerts.length>last.n)toast('Dari lapangan: '+st.alerts[0][1]);last.n=st.alerts.length;last.first=0}
var es=new EventSource('/api/stream');es.onmessage=function(m){apply(JSON.parse(m.data))};
var g=function(i){return document.getElementById(i)};
g('ir').addEventListener('click',function(e){if(e.target.dataset&&e.target.dataset.i!==undefined)post('ir.approved',{id:'IR-0142',status:'Disetujui'})});
g('bk').addEventListener('click',function(){var j=g('bj').value,b=g('bb').value,m=g('bm').value||'Material';if(!known.some(function(s){return s[0]===j&&s[1]===b}))post('slot.booked',{jam:j,bay:b,label:m})},true);
g('kb').addEventListener('click',function(){var t=g('kt').value.trim();if(t)post('complaint.created',{cat:'Web',text:t})},true);
})();
