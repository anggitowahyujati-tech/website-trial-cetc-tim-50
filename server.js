// ATLAS Data Hub (demo): satu sumber data untuk web Control Tower + mobile. Tanpa dependensi.
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,F=process.env.DATA_FILE||path.join(__dirname,'data.json'),PUB=path.join(__dirname,'public');
const init=()=>({book:[],arrived:[],irStatus:'Menunggu MK',p:{b:100,k:65,c:0},kadd:[],alerts:[],n:31,ver:0});
let st;try{st=JSON.parse(fs.readFileSync(F,'utf8'))}catch(_){st=init()}
const clients=new Set(),cut=(a,n)=>a.length>n&&a.splice(n);
function push(){st.ver++;fs.writeFile(F,JSON.stringify(st),()=>{});const m='data: '+JSON.stringify(st)+'\n\n';clients.forEach(r=>r.write(m))}
function reduce(e){const d=e.data||{};switch(e.type){
 case'slot.booked':if(!st.book.some(b=>b[0]===d.jam&&b[1]===d.bay))st.book.push([d.jam,d.bay,String(d.label||'Besi D19 · '+(d.veh||'Truk')).slice(0,60)]);break;
 case'truck.accepted':if(!st.arrived.includes(d.slot))st.arrived.push(d.slot||'09:30');break;
 case'truck.rejected':st.alerts.unshift(['r','Pengiriman ditolak '+(d.po||''),'Gerbang']);break;
 case'progress.submitted':st.p={b:+d.b||0,k:+d.k||0,c:+d.c||0};break;
 case'ir.decided':case'ir.approved':st.irStatus=['Disetujui','Ditolak','Menunggu MK'].includes(d.status)?d.status:'Disetujui';break;
 case'complaint.created':st.kadd.unshift(['#K-0'+(++st.n),((d.cat?d.cat+' · ':'')+String(d.text||'').slice(0,120)),'Diterima']);break;
 case'issue.created':st.alerts.unshift([d.sev==='Tinggi'||d.type==='Bahaya'?'r':'o',(d.type||'Isu')+': '+(String(d.text||'').slice(0,80)||'tanpa deskripsi'),d.loc||'']);break;
 case'preuse.submitted':if((d.items||[]).some(i=>!i[1]))st.alerts.unshift(['r','Pre-use '+(d.unit||'')+' ada masalah','Fleet']);break;
 case'alert.new':st.alerts.unshift([d.lv||'o',String(d.title||'').slice(0,80),d.note||'']);break;
 default:return false}cut(st.alerts,20);cut(st.kadd,30);cut(st.book,30);return true}
const T={'.html':'text/html;charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((q,s)=>{const u=new URL(q.url,'http://x'),p=u.pathname;
 if(p==='/api/state'){s.writeHead(200,{'content-type':'application/json'});return s.end(JSON.stringify(st))}
 if(p==='/api/stream'){s.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','connection':'keep-alive','x-accel-buffering':'no'});s.write('data: '+JSON.stringify(st)+'\n\n');clients.add(s);const h=setInterval(()=>s.write(': ping\n\n'),25000);q.on('close',()=>{clearInterval(h);clients.delete(s)});return}
 if(p==='/api/event'&&q.method==='POST'){let b='';q.on('data',c=>{b+=c;if(b.length>1e5)q.destroy()});q.on('end',()=>{try{reduce(JSON.parse(b))&&push();s.writeHead(204);s.end()}catch(_){s.writeHead(400);s.end()}});return}
 if(p==='/api/reset'&&q.method==='POST'){if(process.env.ADMIN&&q.headers['x-admin']!==process.env.ADMIN){s.writeHead(403);return s.end()}st=Object.assign(init(),{ver:st.ver});push();s.writeHead(204);return s.end()}
 const f=p==='/'?'index.html':p==='/mobile'?'mobile.html':p.slice(1),fp=path.join(PUB,path.normalize(f));
 if(!fp.startsWith(PUB)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){s.writeHead(404);return s.end('Not found')}
 s.writeHead(200,{'content-type':T[path.extname(fp)]||'application/octet-stream','cache-control':/\.(html|js|webmanifest)$/.test(fp)?'no-cache':'public,max-age=86400'});fs.createReadStream(fp).pipe(s)
}).listen(PORT,()=>console.log('ATLAS jalan di http://localhost:'+PORT+'  (web: /  · mobile: /mobile)'));
