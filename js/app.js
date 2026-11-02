const $=s=>document.querySelector(s);
const FIELDS=[...new Set((window.CERTIFICATES_DATA||[]).map(c=>c.field))],ELIGS=['제한없음','응시자격 확인 필요'],DIFFS=[1,2,3];
const TODAY=new Date();TODAY.setHours(0,0,0,0);
const p2=n=>String(n).padStart(2,'0');
const isoOff=o=>{const d=new Date(TODAY);d.setDate(d.getDate()+o);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const dd=iso=>Math.round((new Date(iso+'T00:00:00')-TODAY)/864e5);
const D=n=>n===9999?'일정 미정':n===0?'D-DAY':'D-'+n;
const dots=n=>'●'.repeat(n)+'○'.repeat(3-n);
const md=iso=>iso.slice(5).replace('-','.');
const won=n=>n==null?'확인 필요':Number(n).toLocaleString()+'원';
const lsGet=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const S={q:'',f:{field:'',elig:'',diff:''},sort:'deadline',menu:'',certs:[],status:'loading',dataSource:'J',tab:'home',my:'dday',modal:null,toast:'',failOnce:false,scroll:{}};
const getT=()=>lsGet('targetExams',[]),getS=()=>lsGet('myCertStatus',{});
const tId=s=>+s.split(':')[0],tR=s=>s.split(':')[1];
const byId=id=>S.certs.find(c=>c.id===id);
const nextR=c=>c.rounds.filter(r=>dd(r.examDate)>=0).sort((a,b)=>a.examDate<b.examDate?-1:1)[0];
const dayOf=c=>{const r=nextR(c);return r?dd(r.examDate):9999};
const dLabel=c=>{const r=nextR(c);if(r)return D(dd(r.examDate));const st=c.researchStatus?.schedule||'';if(st==='상시')return '상시';if(st.startsWith('연중 시험일'))return '수시';if(st==='이번 회차 미시행')return '다음 회차 확인';if(st==='정기 일정(5·8·11월 등) 확인')return '일정 확인 필요';if(st==='공식 일정 확인 완료')return '다음 일정 발표 전';return '확인 필요'};
const sourceIcon=c=>`<span class="source-icon ${c.dataSource==='A'?'api':''}" title="${c.dataSource==='A'?'API 응답':'JSON 데이터'}" aria-label="${c.dataSource==='A'?'API 응답':'JSON 데이터'}">${c.dataSource==='A'?'A':'J'}</span>`;
const statusClass=c=>{const v=dLabel(c);return ['상시','수시'].includes(v)?'status-open':['일정 발표 전','다음 회차 확인','일정 확인 필요'].includes(v)?'status-pending':v==='확인 필요'?'status-check':''};
const noScheduleText=c=>{const st=c.researchStatus?.schedule||'';if(st==='상시')return '상시시험입니다. 지역·시험장별 개설 일정과 접수 가능 여부를 공식 페이지에서 확인하세요.';if(st==='이번 회차 미시행')return c.scheduleNote||'이번 회차는 시행하지 않습니다. 다음 회차 공지를 확인하세요.';if(st.startsWith('연중 시험일'))return c.scheduleNote||'등급·지역별 시험일을 공식 일정표에서 확인하세요.';return c.scheduleNote||'아직 확인된 시험일이 없습니다. 공식 시행기관의 일정을 확인해 주세요.'};

function load(){S.status='loading';renderList();
  setTimeout(async()=>{
    try{
      if(S.failOnce){S.failOnce=false;throw new Error('network')}
      let raw,source='J';
      // 실제 API URL이 설정된 경우에만 A로 표시합니다. 기본은 로컬 JSON(J)입니다.
      if(window.CERTIFICATES_API_URL){
        const res=await fetch(window.CERTIFICATES_API_URL);
        if(!res.ok)throw new Error(res.status);
        raw=await res.json(); source='A';
      }else{
        try{
          const res=await fetch('./data/certificates.json');
          if(!res.ok)throw new Error(res.status);
          raw=await res.json(); source='J';
        }catch(jsonError){
          if(Array.isArray(window.CERTIFICATES_DATA)){raw=window.CERTIFICATES_DATA;source='J'}
          else throw jsonError;
        }
      }
      S.dataSource=source;
      S.certs=raw.map(c=>({...c, id:Number(c.id), name:c.name, field:c.field, eligibility:c.eligibility, eligibilityText:c.eligibilityText||c.eligibility||'공식 안내를 확인해 주세요.', difficulty:Number(c.difficulty)||({초급:1,중급:2,고급:3}[c.level]||2), fee:c.fee??null, officialUrl:c.officialUrl||c.url||'', dataSource:source, rounds:(c.rounds||[]).map((r,i)=>({roundId:'r'+(i+1),applyStart:r[0],applyEnd:r[1],examDate:r[2]}))}));
      S.status='ready'
    }catch(e){S.status='error'}
    renderList();refresh()},100)}
function filtered(){const q=S.q.trim().toLowerCase();
  let l=S.certs.filter(c=>(!q||c.name.toLowerCase().includes(q))&&(!S.f.field||c.field===S.f.field)&&(!S.f.elig||c.eligibility===S.f.elig)&&(!S.f.diff||c.difficulty===+S.f.diff));
  return l.sort(S.sort==='fee'?(a,b)=>(a.fee??Infinity)-(b.fee??Infinity):(a,b)=>dayOf(a)-dayOf(b))}

const cardH=c=>`<button class="card" data-act="open" data-id="${c.id}"><div class="row sp"><span class="t cert-name">${c.name}${sourceIcon(c)}</span><span class="dd ${statusClass(c)}">${dLabel(c)}</span></div><div class="badges"><span class="badge">${c.field}</span><span class="badge">${c.eligibility}</span><span class="badge">난이도 ${dots(c.difficulty)}</span><span class="badge">${won(c.fee)}</span></div></button>`;
const empty=(t,s,btn)=>`<div class="empty"><p><b>${t}</b>${s}</p>${btn}</div>`;

function renderHome(){
  const T=getT().map(s=>byId(tId(s))).filter(Boolean).sort((a,b)=>dayOf(a)-dayOf(b)).slice(0,3);
  let h=`<div class="t">준비할 자격증, 한 번에 비교</div><div class="sub" style="margin-top:4px">시험 조건과 일정을 모아 보고, 목표 시험까지 남은 날을 확인하세요</div>`;
  
  // 1. 내 목표 D-Day
  h+=`<div class="sec"><div class="sub">내 목표 D-Day</div>`;
  if(S.status==='error')h+=`<div class="box sub">자격증 정보를 불러오지 못했습니다. 저장한 목표는 유지됩니다.</div>`;
  else if(S.status==='loading')h+=`<div class="skel"></div>`;
  else if(!T.length)h+=empty('아직 등록된 목표 시험이 없습니다','관심 있는 자격증의 시험일을 등록해 보세요',`<button class="btn" data-act="nav" data-v="list">자격증 탐색하러 가기</button>`);
  else h+=`<div class="d3">`+T.map(c=>`<button class="box" data-act="open" data-id="${c.id}"><div class="sub">${c.name}</div><div class="dd">${dLabel(c)}</div></button>`).join('')+`</div>`;
  h+=`</div>`;

  // 2. 분야별 빠른 진입
  h+=`<div class="sec"><div class="sub">분야별 빠른 진입</div><div class="chips">${FIELDS.map(f=>`<button class="chip" data-act="quick" data-v="${f}">${f}</button>`).join('')}</div></div>`;

  // 3 & 4. 임박 시험 및 인기 자격증 리스트
  if(S.status==='ready'&&S.certs.length){
    const urgent=S.certs.slice().sort((a,b)=>dayOf(a)-dayOf(b)).slice(0,4);
    h+=`<div class="sec"><div class="row sp"><div class="t" style="font-size:14px">🔥 원서 접수 임박 시험</div><button class="sub" data-act="quick" data-v="" style="text-decoration:underline">전체보기</button></div><div class="sec-list" style="margin-top:8px">${urgent.map(cardH).join('')}</div></div>`;

    const popular=S.certs.slice(0,5);
    h+=`<div class="sec"><div class="t" style="font-size:14px">🏆 대학생 인기 자격증 Top 5</div><div class="sec-list" style="margin-top:8px">${popular.map((c,i)=>`<div class="row" style="gap:10px;margin-bottom:4px"><span style="font-weight:800;color:var(--mark);font-size:15px;width:18px">${i+1}</span>${cardH(c)}</div>`).join('')}</div></div>`;
  }

  h+=`<div class="sec" style="margin-bottom:20px"><button class="btn pr" data-act="quick" data-v="">전체 자격증 보기 →</button></div>`;
  $('#v-home').innerHTML=h
}

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
      h+=T.map(({s,c})=>{const r=c.rounds.find(r=>r.roundId===tR(s));return `<div class="row sp" style="border-bottom:1px dashed var(--line)"><button class="card" style="border:0;flex:1" data-act="open" data-id="${c.id}"><div class="t">${c.name}</div><div class="sub">시험일 ${r?r.examDate:'-'}</div></button><span class="dd">${r?D(dd(r.examDate)):dLabel(c)}</span><button class="chip" data-act="del" data-id="${c.id}" aria-label="${c.name} 삭제">삭제</button></div>`}).join('')}
  }else{const st=getS(),ids=Object.keys(st).map(Number).filter(byId);
    if(!ids.length)h+=none;else h+=ids.map(id=>{const c=byId(id);return `<div class="row sp" style="padding:11px 0;border-bottom:1px dashed var(--line)"><span class="t">${c.name}</span><div class="chips">${['준비중','합격'].map(v=>`<button class="chip${st[id]===v?' on':''}" data-act="status" data-id="${id}" data-v="${v}">${v}</button>`).join('')}</div></div>`}).join('')}
  $('#v-my').innerHTML=h}

function renderModal(){const m=S.modal,el=$('#modal');if(!m){el.innerHTML='';return}
  const c=byId(m.id),T=getT(),reg=T.find(s=>tId(s)===c.id),rs=c.rounds.filter(r=>dd(r.examDate)>=0);
  const sel=m.roundId||(reg?tR(reg):(rs[0]?.roundId)),r=rs.find(x=>x.roundId===sel)||rs[0];
  el.innerHTML=`<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-label="${c.name} 상세"><div class="sb"><div class="sh"><span class="t cert-name" style="font-size:17px">${c.name}${sourceIcon(c)}</span><button class="chip" data-act="close">닫기 ✕</button></div>
  <div class="sub">회차별 일정 (목표 회차 선택)</div>${rs.length?rs.map((x,i)=>`<label class="rr"><input type="radio" name="rd" value="${x.roundId}" ${x.roundId===r?.roundId?'checked':''} data-act="round"><span><b>${i+1}회차</b> 접수 ${x.applyStart} ~${x.applyEnd}<br>시험일 ${x.examDate} ·${D(dd(x.examDate))}</span></label>`).join(''):'<div class="box sub">등록된 시험 일정이 없습니다. 공식 시행기관에서 최신 일정을 확인해 주세요.</div>'}
  ${c.overview?`<div class="sr" style="margin-top:8px"><b>소개</b><span>${c.overview}</span></div>`:''}<div class="sr" style="margin-top:6px"><b>응시 자격</b><span style="text-align:right">${c.eligibilityText}</span></div><div class="sr"><b>응시료</b><span>${won(c.fee)}${c.feeDetails?`<div class="sub">${Object.entries(c.feeDetails).map(([k,v])=>`${k} ${won(v)}`).join(" · ")}</div>`:""}${c.feeBasis?`<div class="sub">${c.feeBasis}</div>`:""}${c.feeSourceUrl?`<div class="sub">출처: <a href="${c.feeSourceUrl}" target="_blank" rel="noopener noreferrer">공식 응시료 안내 ↗</a></div>`:''}</span></div><div class="sr"><b>일정 확인</b><span>${c.researchStatus?.schedule|| (c.rounds?.length?'확인 완료':'미확인')}${c.scheduleSourceUrl?`<div class="sub"><a href="${c.scheduleSourceUrl}" target="_blank" rel="noopener noreferrer">공식 일정 안내 ↗</a></div>`:''}</span></div>${c.tags?.length?`<div class="sr"><b>태그</b><span>${c.tags.join(' · ')}</span></div>`:''}</div>
  <div class="bar">${S.toast?`<div class="toast"><span>${S.toast}</span><span>${r?D(dd(r.examDate)):dLabel(c)}</span></div>`:''}
  <a class="btn ln" href="${c.officialUrl}" target="_blank" rel="noopener noreferrer">공식 접수처 바로가기 ↗</a>
  ${reg?`<div class="row"><div class="btn" style="flex:2">✓ 등록 완료</div><button class="btn ln" style="flex:1" data-act="unsave">취소</button></div>`:rs.length?`<button class="btn pr" data-act="save">목표 D-Day 등록</button>`:`<button class="btn pr" disabled title="시험 일정이 등록되지 않았습니다">일정 등록 후 목표 설정 가능</button>`}</div></div>`}

function refresh(){renderHome();renderMy()}
function save(){const m=S.modal,c=byId(m.id),T=getT().filter(s=>tId(s)!==c.id),nr=nextR(c);if(!nr)return;const r=m.roundId||nr.roundId;
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
