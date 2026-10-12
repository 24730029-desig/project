const $=s=>document.querySelector(s);
const FIELDS=['IT/개발','어학','경영/회계','기술/공학','디자인'],ELIGS=['제한없음','학년','전공'],DIFFS=[1,2,3];
const TODAY=new Date();TODAY.setHours(0,0,0,0);
const p2=n=>String(n).padStart(2,'0');
const isoOff=o=>{const d=new Date(TODAY);d.setDate(d.getDate()+o);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const dd=iso=>Math.round((new Date(iso+'T00:00:00')-TODAY)/864e5);
const D=n=>n===0?'D-DAY':'D-'+n;
const dots=n=>'●'.repeat(n)+'○'.repeat(3-n);
const md=iso=>iso.slice(5).replace('-','.');
const won=n=>n.toLocaleString()+'원';
const lsGet=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const S={q:'',f:{field:'',elig:'',diff:''},sort:'deadline',menu:'',certs:[],status:'loading',tab:'home',my:'dday',modal:null,toast:'',failOnce:false,scroll:{}};
const getT=()=>lsGet('targetExams',[]),getS=()=>lsGet('myCertStatus',{});
const tId=s=>+s.split(':')[0],tR=s=>s.split(':')[1];
const byId=id=>S.certs.find(c=>c.id===id);
const nextR=c=>c.rounds.filter(r=>dd(r.examDate)>=0).sort((a,b)=>a.examDate<b.examDate?-1:1)[0];
const dayOf=c=>{const r=nextR(c);return r?dd(r.examDate):9999};
function load(){S.status='loading';renderList();
  setTimeout(async()=>{
    try{if(S.failOnce){S.failOnce=false;throw new Error('network')}
      const res=await fetch('project/data/certificates.json');
      if(!res.ok)throw new Error(res.status);
      const raw=await res.json();
      S.certs=raw.map(c=>({id:c.id,name:c.name,field:c.field,eligibility:c.eligibility,eligibilityText:c.eligibilityText,difficulty:c.difficulty,fee:c.fee,officialUrl:c.officialUrl,
        rounds:c.rounds.map((r,i)=>({roundId:'r'+(i+1),applyStart:isoOff(r[0]),applyEnd:isoOff(r[1]),examDate:isoOff(r[2])}))}));
      S.status='ready'}catch(e){S.status='error'}
    renderList();refresh()},550)}
function filtered(){const q=S.q.trim().toLowerCase();
  let l=S.certs.filter(c=>(!q||c.name.toLowerCase().includes(q))&&(!S.f.field||c.field===S.f.field)&&(!S.f.elig||c.eligibility===S.f.elig)&&(!S.f.diff||c.difficulty===+S.f.diff));
  return l.sort(S.sort==='fee'?(a,b)=>a.fee-b.fee:(a,b)=>dayOf(a)-dayOf(b))}
const cardH=c=>`<button class="card" data-act="open" data-id="${c.id}"><div class="row sp"><span class="t">${c.name}</span><span class="dd">${D(dayOf(c))}</span></div><div class="badges"><span class="badge">${c.field}</span><span class="badge">${c.eligibility}</span><span class="badge">난이도 ${dots(c.difficulty)}</span><span class="badge">${won(c.fee)}</span></div></button>`;
const empty=(t,s,btn)=>`<div class="empty"><p><b>${t}</b>${s}</p>${btn}</div>`;
function renderHome(){const T=getT().map(s=>byId(tId(s))).filter(Boolean).sort((a,b)=>dayOf(a)-dayOf(b)).slice(0,3);
  let h=`<div class="t">준비할 자격증, 한 번에 비교</div><div class="sub" style="margin-top:4px">시험 조건과 일정을 모아 보고, 목표 시험까지 남은 날을 확인하세요</div><div class="sec"><div class="sub">내 목표 D-Day</div>`;
  if(S.status==='error')h+=`<div class="box sub">자격증 정보를 불러오지 못했습니다. 저장한 목표는 유지됩니다.</div>`;
  else if(S.status==='loading')h+=`<div class="skel"></div>`;
  else if(!T.length)h+=empty('아직 등록된 목표 시험이 없습니다','관심 있는 자격증의 시험일을 등록해 보세요',`<button class="btn" data-act="nav" data-v="list">자격증 탐색하러 가기</button>`);
  else h+=`<div class="d3">`+T.map(c=>`<button class="box" data-act="open" data-id="${c.id}"><div class="sub">${c.name}</div><div class="dd">${D(dayOf(c))}</div></button>`).join('')+`</div>`;
  h+=`</div><div class="sec"><div class="sub">분야별 빠른 진입</div><div class="chips">${FIELDS.map(f=>`<button class="chip" data-act="quick" data-v="${f}">${f}</button>`).join('')}</div></div><div class="sec"><button class="btn pr" data-act="quick" data-v="">전체 자격증 보기 →</button></div>`;
  $('#v-home').innerHTML=h}
function menuH(k,label,opts,fmt){const cur=S.f[k];
  return `<button class="chip${cur?' on':''}" data-act="menu" data-k="${k}" aria-expanded="${S.menu===k}">${label}${cur?': '+fmt(cur):''} ▾</button>`}
function renderList(){const el=$('#lb');
  if(S.status==='loading'){el.innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';return}
  if(S.status==='error'){el.innerHTML=empty('자격증 데이터를 불러오지 못했습니다','네트워크 상태를 확인해 주세요. 저장한 목표와 취득 상태는 유지됩니다.',`<button class="btn" data-act="retry">다시 시도</button>`);return}
  const L=filtered(),act=[];
  [['field','분야',x=>x],['elig','응시자격',x=>x],['diff','난이도',x=>dots(+x)]].forEach(([k,l,f])=>{if(S.f[k])act.push(`<button class="chip on" data-act="clear" data-k="${k}">${l}: ${f(S.f[k])} ✕</button>`)});
  const O={field:FIELDS,elig:ELIGS,diff:DIFFS};
  let h=`<div class="chips" style="margin:10px 0">${menuH('field','분야',FIELDS,x=>x)}${menuH('elig','응시자격',ELIGS,x=>x)}${menuH('diff','난이도',DIFFS,x=>dots(+x))}</div>`;
  if(S.menu)h+=`<div class="chips" style="margin-bottom:10px">${O[S.menu].map(v=>`<button class="chip${String(S.f[S.menu])===String(v)?' on':''}" data-act="pick" data-v="${v}">${S.menu==='diff'?dots(v):v}</button>`).join('')}</div>`;
  h+=`<div class="chips">${act.join('')}</div><div class="row sp" style="margin:8px 0"><span class="sub">결과 ${L.length}건</span>${act.length||S.q?`<button class="sub" data-act="reset" style="text-decoration:underline;min-height:34px">필터 초기화</button>`:''}</div>`;
  h+=`<div class="chips" style="margin-bottom:6px"><button class="chip${S.sort==='deadline'?' on':''}" data-act="sort" data-v="deadline">마감 임박순</button><button class="chip${S.sort==='fee'?' on':''}" data-act="sort" data-v="fee">응시료순</button></div>`;
  h+=L.length?L.map(cardH).join(''):empty('선택하신 조건에 맞는 자격증이 없습니다','조건을 줄이거나 추천 분야로 다시 찾아보세요',`<button class="btn pr" data-act="reset">필터 초기화</button><div class="sub" style="margin:12px 0 6px">추천 분야</div><div class="chips" style="justify-content:center">${FIELDS.slice(0,3).map(f=>`<button class="chip" data-act="quick" data-v="${f}" data-keep="0">${f}</button>`).join('')}</div>`);
  el.innerHTML=h}
function renderMy(){const T=getT().map(s=>({s,c:byId(tId(s))})).filter(x=>x.c).sort((a,b)=>dayOf(a.c)-dayOf(b.c));
  let h=`<div class="tabs"><button class="${S.my==='dday'?'on':''}" data-act="mytab" data-v="dday">목표 D-Day</button><button class="${S.my==='status'?'on':''}" data-act="mytab" data-v="status">취득 상태</button></div>`;
  const none=empty('아직 등록된 목표 시험이 없습니다','관심 있는 자격증을 찾아 시험일을 등록해 보세요',`<button class="btn" data-act="nav" data-v="list">자격증 탐색하러 가기</button>`);
  if(S.my==='dday'){
    if(!T.length)h+=none;else{h+=`<div class="row sp"><span class="sub">등록 ${T.length}건</span><button class="sub" data-act="resetAll" style="text-decoration:underline;min-height:34px">전체 초기화</button></div>`;
      h+=T.map(({s,c})=>{const r=c.rounds.find(r=>r.roundId===tR(s));return `<div class="row sp" style="border-bottom:1px dashed var(--line)"><button class="card" style="border:0;flex:1" data-act="open" data-id="${c.id}"><div class="t">${c.name}</div><div class="sub">시험일 ${r?r.examDate:'-'}</div></button><span class="dd">${r?D(dd(r.examDate)):''}</span><button class="chip" data-act="del" data-id="${c.id}" aria-label="${c.name} 삭제">삭제</button></div>`}).join('')}
  }else{const st=getS(),ids=Object.keys(st).map(Number).filter(byId);
    if(!ids.length)h+=none;else h+=ids.map(id=>{const c=byId(id);return `<div class="row sp" style="padding:11px 0;border-bottom:1px dashed var(--line)"><span class="t">${c.name}</span><div class="chips">${['준비중','합격'].map(v=>`<button class="chip${st[id]===v?' on':''}" data-act="status" data-id="${id}" data-v="${v}">${v}</button>`).join('')}</div></div>`}).join('')}
  $('#v-my').innerHTML=h}
function renderModal(){const m=S.modal,el=$('#modal');if(!m){el.innerHTML='';return}
  const c=byId(m.id),T=getT(),reg=T.find(s=>tId(s)===c.id),rs=c.rounds.filter(r=>dd(r.examDate)>=0);
  const sel=m.roundId||(reg?tR(reg):rs[0].roundId),r=rs.find(x=>x.roundId===sel)||rs[0];
  el.innerHTML=`<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-label="${c.name} 상세"><div class="sb"><div class="sh"><span class="t" style="font-size:17px">${c.name}</span><button class="chip" data-act="close">닫기 ✕</button></div>
  <div class="sub">회차별 일정 (목표 회차 선택)</div>${rs.map((x,i)=>`<label class="rr"><input type="radio" name="rd" value="${x.roundId}" ${x.roundId===r.roundId?'checked':''} data-act="round"><span><b>${i+1}회차</b> 접수 ${md(x.applyStart)} ~ ${md(x.applyEnd)}<br>시험일 ${x.examDate} · ${D(dd(x.examDate))}</span></label>`).join('')}
  <div class="sr" style="margin-top:6px"><b>응시 자격</b><span style="text-align:right">${c.eligibilityText}</span></div><div class="sr"><b>응시료</b><span>${won(c.fee)}</span></div></div>
  <div class="bar">${S.toast?`<div class="toast"><span>${S.toast}</span><span>${D(dd(r.examDate))}</span></div>`:''}
  <a class="btn ln" href="${c.officialUrl}" target="_blank" rel="noopener noreferrer">공식 접수처 바로가기 ↗</a>
  ${reg?`<div class="row"><div class="btn" style="flex:2">✓ 등록 완료</div><button class="btn ln" style="flex:1" data-act="unsave">취소</button></div>`:`<button class="btn pr" data-act="save">목표 D-Day 등록</button>`}</div></div>`}
function refresh(){renderHome();renderMy()}
function save(){const m=S.modal,c=byId(m.id),T=getT().filter(s=>tId(s)!==c.id),r=m.roundId||nextR(c).roundId;
  T.push(c.id+':'+r);lsSet('targetExams',T);const st=getS();if(!st[c.id]){st[c.id]='준비중';lsSet('myCertStatus',st)}}
let tt;function toast(t){S.toast=t;clearTimeout(tt);tt=setTimeout(()=>{S.toast='';renderModal()},2800)}
function nav(v){const cur=document.querySelector('.view:not([hidden])');if(cur)S.scroll[S.tab]=cur.scrollTop;S.tab=v;
  document.querySelectorAll('.view').forEach(e=>e.hidden=e.id!=='v-'+v);
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  if(v==='home')renderHome();if(v==='my')renderMy();$('#v-'+v).scrollTop=S.scroll[v]||0}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,d=b.dataset;
  if(b.type!=='radio'&&b.tagName==='INPUT')return;
  switch(a){
  case'nav':nav(d.v);break;
  case'quick':S.f.field=d.v;S.menu='';if(d.keep==='0')S.q='',$('#q').value='';nav('list');renderList();break;
  case'menu':S.menu=S.menu===d.k?'':d.k;renderList();break;
  case'pick':S.f[S.menu]=d.v;S.menu='';renderList();break;
  case'clear':S.f[d.k]='';renderList();break;
  case'reset':S.f={field:'',elig:'',diff:''};S.q='';$('#q').value='';S.menu='';renderList();break;
  case'sort':S.sort=d.v;renderList();break;
  case'open':S.modal={id:+d.id,roundId:null};S.toast='';renderModal();break;
  case'close':S.modal=null;S.toast='';renderModal();break;
  case'save':save();toast('목표 D-Day로 저장되었습니다');renderModal();refresh();break;
  case'unsave':{const id=S.modal.id;lsSet('targetExams',getT().filter(s=>tId(s)!==id));toast('등록이 취소되었습니다');renderModal();refresh();break}
  case'del':lsSet('targetExams',getT().filter(s=>tId(s)!==+d.id));renderMy();renderHome();break;
  case'resetAll':if(confirm('등록된 목표 D-Day를 모두 삭제할까요?')){lsSet('targetExams',[]);refresh()}break;
  case'mytab':S.my=d.v;renderMy();break;
  case'status':{const st=getS();st[d.id]=d.v;lsSet('myCertStatus',st);renderMy();break}
  case'retry':load();break;
  case'demoErr':S.failOnce=true;load();break;
  case'resetData':if(confirm('저장된 목표 D-Day와 취득 상태를 모두 지울까요?')){lsSet('targetExams',[]);lsSet('myCertStatus',{});refresh();renderModal()}break}});
document.addEventListener('change',e=>{if(e.target.name==='rd'){const m=S.modal,c=byId(m.id);m.roundId=e.target.value;
  if(getT().some(s=>tId(s)===c.id)){save();toast('목표 회차가 변경되었습니다');refresh()}renderModal()}});
$('#q').addEventListener('input',e=>{S.q=e.target.value;if(S.status==='ready')renderList()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.modal){S.modal=null;renderModal()}});
nav('home');load();
