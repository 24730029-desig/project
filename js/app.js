const $=s=>document.querySelector(s);
const FIELDS=[...new Set((window.CERTIFICATES_DATA||[]).map(c=>c.field))],ELIGS=['제한없음','응시자격 확인 필요'],DIFFS=[1,2,3];
// 상위 탭(분야) > 하위 탭(세부 분야). 하위 분야는 자격증 이름으로 분류합니다.
const SUBS={
 'IT/컴퓨터':[['보안·네트워크',/정보보안|정보통신|네트워크|무선|방송통신|전파|리눅스/],['데이터',/SQL|데이터|빅데이터/],['개발·SW',/정보처리|전자계산기|SW코딩|게임프로그래밍|웹디자인/],['사무·디자인',/ITQ|컴퓨터활용|워드|GTQ|CAD|멀티미디어|게임그래픽|게임기획|사무자동화|정보기기/]],
 '어학':[['영어',/TOEIC|TOEFL|IELTS|OPIc 영어|G-TELP|FLEX 영어|TEPS|ESPT|PELT/],['일본어',/JPT|JLPT|일본어/],['중국어',/HSK|TSC|중국어/],['기타 외국어',/DELF|DALF|독일어|TestDaF|TORFL|스페인어/]],
 '전문직':[['법·회계·세무',/공인회계|세무사|변리사|노무사|감정평가|관세사|법무사|행정사|가맹거래사|손해사정|보험|지도사/],['부동산·유통',/공인중개|주택관리|물류|유통관리/],['상담·복지·교육',/사회복지|청소년|직업상담|심리|평생교육|보육/],['의료·보건',/간호|치료사|임상병리|방사선|치과위생/]],
 '공기업':[['한국사·국어',/한국사|국어|KBS|글쓰기/],['금융·투자',/신용분석|여신|외환|펀드|증권|파생|투자|금융/],['회계·세무',/회계|세무|재경|전산세무|FAT|TAT|ERP|매경|한경|경영정보/],['사무·무역',/속기|비서|한자|무역|전자상거래/]],
 '사무/자격':[['컴퓨터·OA',/컴퓨터활용|워드|ITQ|GTQ|DIAT|MOS|ICDL|정보보안관리사/],['ERP·실무',/ERP|문서실무|CS|텔레마케팅|비서|유통관리|무역/],['한자',/한자/]],
 '기타':[['자동차',/자동차/],['건설기계',/건설기계|굴착기|지게차|로더|롤러|불도저|크레인|기중기|양화장치/],['기계·설비',/공조|용접|에너지|배관|가스|위험물/],['전기·철도·승강기',/전기|철도|승강기/],['농림·조경',/산림|조경|식물|종자|유기농/]]
};
// 대학생 인기 순위(편집 기준: 취업·졸업요건·응시자 수 등을 고려한 큐레이션). 앞에 있을수록 인기. 목록에 없는 자격증은 뒤로 갑니다.
const POP=["TOEIC", "컴퓨터활용능력 2급", "한국사능력검정시험 심화", "컴퓨터활용능력 1급", "OPIc 영어", "TOEIC Speaking", "정보처리기사", "한국사능력검정시험 기본", "전산회계 1급", "전산세무 2급", "매경TEST", "한경TESAT", "SQL 개발자(SQLD)", "데이터분석 준전문가(ADsP)", "빅데이터분석기사", "공인회계사(CPA)", "공인중개사", "사회복지사 1급", "JLPT N2", "JLPT N1", "HSK 4급", "HSK 5급", "TEPS", "TOEFL iBT", "IELTS Academic", "정보처리산업기사", "정보보안기사", "네트워크관리사 2급", "리눅스마스터 2급", "GTQ 포토샵 1급", "정보기술자격(ITQ) 한글엑셀", "전산회계 2급", "재경관리사", "FAT 1급", "TAT 2급", "투자자산운용사", "펀드투자권유자문인력", "증권투자권유자문인력", "세무사", "공인노무사", "감정평가사", "한자능력검정시험 3급", "유통관리사 2급", "물류관리사", "무역영어 1급", "간호사", "청소년지도사 2급", "전기기능사", "지게차운전기능사", "TOEIC Writing", "G-TELP Level 2", "FLEX 영어", "JLPT N3", "HSK 6급", "DELF B2", "ERP정보관리사 회계", "전자상거래관리사 2급", "직업상담사 2급", "보육교사 2급", "평생교육사 2급", "컴퓨터활용능력 1급(대한상공회의소)", "워드프로세서"];
const popRank=c=>{const i=POP.indexOf(c.name);return i<0?1000+c.id:i};
const subsOf=f=>(SUBS[f]||[]).map(x=>x[0]);
const subOf=(f,n)=>{const h=(SUBS[f]||[]).find(x=>x[1].test(n));return h?h[0]:'기타'};
const TODAY=new Date();TODAY.setHours(0,0,0,0);
const p2=n=>String(n).padStart(2,'0');
const isoOff=o=>{const d=new Date(TODAY);d.setDate(d.getDate()+o);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const dd=iso=>Math.round((new Date(iso+'T00:00:00')-TODAY)/864e5);
const D=n=>n===9999?'일정 미정':n===0?'D-DAY':n<0?'D+'+Math.abs(n):'D-'+n;
const dots=n=>'●'.repeat(n)+'○'.repeat(3-n);
const md=iso=>iso.slice(5).replace('-','.');
const won=n=>n==null?'확인 필요':Number(n).toLocaleString()+'원';
const lsGet=(k,f)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const S={q:'',f:{field:'',sub:'',elig:'',diff:''},sort:'deadline',menu:'',certs:[],status:'loading',dataSource:'J',tab:'home',my:'dday',delMode:false,delSel:[],modal:null,toast:'',failOnce:false,scroll:{}};
const getT=()=>lsGet('targetExams',[]),getS=()=>lsGet('myCertStatus',{});
const tId=s=>+s.split(':')[0],tR=s=>s.split(':')[1];
const byId=id=>S.certs.find(c=>c.id===id);
const nextR=c=>c.rounds.filter(r=>dd(r.examDate)>=0).sort((a,b)=>a.examDate<b.examDate?-1:1)[0];
const dayOf=c=>{const r=nextR(c);return r?dd(r.examDate):9999};
const dDayLabel=c=>{const r=nextR(c);return r?D(dd(r.examDate)):''};
const scheduleLabel=c=>{const t=c.scheduleType||'';if(t==='continuous')return '상시';if(t==='multiple_sessions')return '수시';if(t==='scheduled'||t==='scheduled_periodic')return '정기';if(t==='not_in_next_round')return '일정 발표 전';if(t==='unverified')return '일정 확인 필요';const st=c.researchStatus?.schedule||'';if(st==='상시')return '상시';if(st.startsWith('연중 시험일'))return '수시';if(st==='이번 회차 미시행')return '일정 발표 전';if(st==='정기 일정(5·8·11월 등) 확인')return '정기';if(st==='공식 일정 확인 완료')return '일정 발표 전';return '일정 확인 필요'};
const dLabel=c=>dDayLabel(c)||scheduleLabel(c);
const sourceIcon=c=>`<span class="source-icon ${c.dataSource==='A'?'api':''}" title="${c.dataSource==='A'?'API 응답':'JSON 데이터'}" aria-label="${c.dataSource==='A'?'API 응답':'JSON 데이터'}">${c.dataSource==='A'?'A':'J'}</span>`;
const statusClass=c=>{const v=scheduleLabel(c);return ['상시','수시'].includes(v)?'status-open':v==='정기'?'status-regular':v==='일정 발표 전'?'status-pending':'status-check'};
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
      S.certs=raw.map(c=>({...c, id:Number(c.id), name:c.name, field:c.field, sub:subOf(c.field,c.name), eligibility:c.eligibility, eligibilityText:c.eligibilityText||c.eligibility||'공식 안내를 확인해 주세요.', difficulty:Number(c.difficulty)||({초급:1,중급:2,고급:3}[c.level]||2), fee:c.fee??null, officialUrl:c.officialUrl||c.url||'', dataSource:source, rounds:(c.rounds||[]).map((r,i)=>({roundId:'r'+(i+1),applyStart:r[0],applyEnd:r[1],examDate:r[2]}))}));
      S.status='ready'
    }catch(e){S.status='error'}
    renderList();refresh()},100)}
function filtered(){const q=S.q.trim().toLowerCase();
  let l=S.certs.filter(c=>(!q||c.name.toLowerCase().includes(q))&&(!S.f.field||c.field===S.f.field)&&(!S.f.sub||c.sub===S.f.sub)&&(!S.f.elig||c.eligibility===S.f.elig)&&(!S.f.diff||c.difficulty===+S.f.diff));
  return l.sort(S.sort==='fee'?(a,b)=>(a.fee??Infinity)-(b.fee??Infinity):S.sort==='pop'?(a,b)=>popRank(a)-popRank(b):(a,b)=>dayOf(a)-dayOf(b))}

const cardH=(c,r)=>`<button class="card" data-act="open" data-id="${c.id}"><div class="row sp"><span class="t cert-name">${r?`<span class="rk">${r}</span>`:''}${c.name}${sourceIcon(c)}</span><span class="card-status"><span class="schedule-tag ${statusClass(c)}">${scheduleLabel(c)}</span>${dDayLabel(c)?`<span class="dd">${dDayLabel(c)}</span>`:""}</span></div>${badgesH(c)}</button>`;
const badgesH=(c,fee)=>`<div class="meta">${c.field} › ${c.sub} · ${c.eligibility} · 난이도 ${dots(c.difficulty)}${fee||S.sort==='fee'?' · '+won(c.fee):''}</div>`;
const empty=(t,s,btn)=>`<div class="empty"><p><b>${t}</b>${s}</p>${btn}</div>`;

function heroH(s,c){
  const r=c.rounds.find(x=>x.roundId===tR(s))||nextR(c);
  if(!r)return `<button class="box hero" data-act="open" data-id="${c.id}"><div class="hero-top"><span class="sub">${c.name}</span></div><div class="dd">${dLabel(c)}</div></button>`;
  const a0=dd(r.applyStart),a1=dd(r.applyEnd),n=dd(r.examDate);
  const ap=a1<0?['접수 마감','closed']:a0>0?['접수까지 D-'+a0,'soon']:['접수 중 · 마감 D'+(a1===0?'-DAY':'-'+a1),'open'];
  const total=Math.max(1,dd(r.examDate)-Math.min(a0,0)),pct=Math.min(100,Math.max(4,Math.round((1-n/Math.max(n+30,30))*100)));
  return `<button class="box hero" data-act="open" data-id="${c.id}">
    <div class="hero-top"><span class="t">${c.name}</span><span class="hero-ap ${ap[1]}">${ap[0]}</span></div>
    <div class="dd">${D(n)}</div>
    <div class="hero-bar"><i style="width:${pct}%"></i></div>
    <div class="hero-info"><div><b>시험일</b>${r.examDate}</div><div><b>접수 기간</b>${md(r.applyStart)} ~ ${md(r.applyEnd)}</div></div>
    ${badgesH(c,true)}
  </button><button class="add-goal" data-act="nav" data-v="list">＋ 비교할 목표 시험 더 추가하기</button>`}

function renderHome(){
  const TP=getT().map(s=>({s,c:byId(tId(s))})).filter(x=>x.c).sort((a,b)=>dayOf(a.c)-dayOf(b.c)).slice(0,3),T=TP.map(x=>x.c);
  let h='';
  
  // 1. 내 목표 D-Day
  h+=`<div class="sec" style="margin-top:0">`;
  if(S.status==='error')h+=`<div class="box sub">자격증 정보를 불러오지 못했습니다. 저장한 목표는 유지됩니다.</div>`;
  else if(S.status==='loading')h+=`<div class="skel"></div>`;
  else if(!T.length)h+=`<div class="box hero hero-empty"><div class="hero-top"><span class="t">나의 목표 D-Day</span><span class="hero-ap">미등록</span></div><div class="dd">D-?</div><div class="hero-bar"><i style="width:0"></i></div><p class="sub" style="margin:12px 0 14px;line-height:1.5">시험일을 등록하면 D-Day와 접수 일정이<br>여기에 한눈에 보여요</p><button class="btn pr" data-act="nav" data-v="list">D-Day 등록하기</button></div>`;
  else if(T.length===1)h+=heroH(TP[0].s,TP[0].c);
  else h+=`<div class="d3">`+T.map(c=>`<button class="box" data-act="open" data-id="${c.id}"><div class="sub">${c.name}</div><div class="dd">${dLabel(c)}</div></button>`).join('')+`</div>`;
  h+=`</div>`;

  // 3 & 4. 임박 시험 및 인기 자격증 리스트
  if(S.status==='ready'&&S.certs.length){
    const urgent=S.certs.slice().sort((a,b)=>dayOf(a)-dayOf(b)).slice(0,4);
    h+=`<div class="sec"><div class="row sp"><div class="t" style="font-size:14px">🔥 원서 접수 임박 시험</div><button class="sub" data-act="quick" data-v="" style="text-decoration:underline">전체보기</button></div><div class="sec-list" style="margin-top:8px">${urgent.map(c=>cardH(c)).join('')}</div></div>`;

    const popular=S.certs.slice().sort((a,b)=>popRank(a)-popRank(b)).slice(0,5);
    h+=`<div class="sec"><div class="t" style="font-size:14px">🏆 대학생 인기 자격증 Top 5</div><div class="sec-list" style="margin-top:8px">${popular.map((c,i)=>cardH(c,i+1)).join('')}</div></div>`;
  }

  $('#v-home').innerHTML=h
}

function menuH(k,label,opts,fmt){const cur=S.f[k];
  return `<button class="chip${cur?' on':''}" data-act="menu" data-k="${k}" aria-expanded="${S.menu===k}">${label}${cur?': '+fmt(cur):''} ▾</button>`}

function renderList(){const el=$('#lb');
  if(S.status==='loading'){el.innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';return}
  if(S.status==='error'){el.innerHTML=empty('자격증 데이터를 불러오지 못했습니다','네트워크 상태를 확인해 주세요. 저장한 목표와 취득 상태는 유지됩니다.',`<button class="btn" data-act="retry">다시 시도</button>`);return}
  const L=filtered(),anim=S.anim;S.anim=false;
  const hasF=S.f.field||S.f.elig||S.f.diff||S.q;
  const TABS=[['field','분야',()=>S.f.field?S.f.field+(S.f.sub?' › '+S.f.sub:''):''],['elig','응시자격',()=>S.f.elig],['diff','난이도',()=>S.f.diff?dots(+S.f.diff):'']];
  let h=`<div class="ftabs">${TABS.map(([k,l,v])=>`<button class="ftab${S.f[k]?' set':''}${S.menu===k?' open':''}" data-act="menu" data-k="${k}" aria-expanded="${S.menu===k}">${v()||l} ▾</button>`).join('')}</div>`;
  if(S.menu){const chip=(a,v,on,t)=>`<button class="chip${on?' on':''}" data-act="${a}" data-v="${v}">${t}</button>`;let inner='';
    if(S.menu==='field'){
      inner=`<div class="opts">${['',...FIELDS].map(f=>chip('pick',f,S.f.field===f,f||'전체')).join('')}</div>`;
      if(S.f.field)inner+=`<div class="opts sub2"><span class="ol">세부</span>${['',...subsOf(S.f.field)].map(v=>chip('subf',v,S.f.sub===v,v||'전체')).join('')}</div>`;
    }else{const O=S.menu==='elig'?ELIGS:DIFFS;
      inner=`<div class="opts">${['',...O].map(v=>chip('pick',v,String(S.f[S.menu])===String(v)||(!S.f[S.menu]&&v===''),v===''?'전체':S.menu==='diff'?dots(v):v)).join('')}</div>`}
    h+=`<div class="panel${anim?' anim':''}">${inner}</div>`}
  h+=`<div class="rbar"><span class="sub">결과 ${L.length}건</span><span class="sorts"><button class="${S.sort==='deadline'?'on':''}" data-act="sort" data-v="deadline">마감 임박순</button><button class="${S.sort==='fee'?'on':''}" data-act="sort" data-v="fee">응시료순</button><button class="${S.sort==='pop'?'on':''}" data-act="sort" data-v="pop">인기순</button>${hasF?`<button data-act="reset" class="rs">초기화</button>`:''}</span></div>`;
  h+=L.length?L.map(c=>S.sort==='pop'&&popRank(c)<POP.length?cardH(c,popRank(c)+1):cardH(c)).join(''):empty('선택하신 조건에 맞는 자격증이 없습니다','조건을 줄이거나 추천 분야로 다시 찾아보세요',`<button class="btn pr" data-act="reset">필터 초기화</button><div class="sub" style="margin:12px 0 6px">추천 분야</div><div class="chips" style="justify-content:center">${FIELDS.slice(0,3).map(f=>`<button class="chip" data-act="quick" data-v="${f}" data-keep="0">${f}</button>`).join('')}</div>`);
  el.innerHTML=h}

function renderMy(){const T=getT().map(s=>({s,c:byId(tId(s))})).filter(x=>x.c).sort((a,b)=>dayOf(a.c)-dayOf(b.c));
  let h=`<div class="tabs"><button class="${S.my==='dday'?'on':''}" data-act="mytab" data-v="dday">목표 D-Day</button><button class="${S.my==='status'?'on':''}" data-act="mytab" data-v="status">취득 상태</button></div>`;
  const none=empty('아직 등록된 목표 시험이 없습니다','관심 있는 자격증을 찾아 시험일을 등록해 보세요',`<button class="btn" data-act="nav" data-v="list">자격증 탐색하러 가기</button>`);
  if(S.my==='dday'){
    if(!T.length)h+=none;else{h+=`<div class="row sp"><span class="sub">등록 ${T.length}건</span><button class="sub" data-act="resetAll" style="text-decoration:underline;min-height:34px">전체 초기화</button></div>`;
      h+=T.map(({s,c})=>{const r=c.rounds.find(r=>r.roundId===tR(s));return `<div class="row sp" style="border-bottom:1px dashed var(--line)"><button class="card" style="border:0;flex:1" data-act="open" data-id="${c.id}"><div class="t">${c.name}</div><div class="sub">시험일 ${r?r.examDate:'-'}</div></button><span class="dd">${r?D(dd(r.examDate)):dLabel(c)}</span><button class="chip" data-act="del" data-id="${c.id}" aria-label="${c.name} 삭제">삭제</button></div>`}).join('')}
  }else{const st=getS(),ids=Object.keys(st).map(Number).filter(byId),dm=S.delMode&&ids.length>0,sel=S.delSel.filter(id=>ids.includes(id));
    if(!ids.length)h+=none;else{
      h+=dm?`<div class="row sp" style="margin:2px 0 4px"><label class="row" style="gap:8px;min-height:36px;cursor:pointer"><input type="checkbox" class="ck" data-act="selall" ${sel.length===ids.length?'checked':''}><span class="t" style="font-size:14px">전체 선택</span></label><button class="sub" data-act="delcancel" style="text-decoration:underline;min-height:34px">취소</button></div>`
        :`<div class="row sp" style="margin:2px 0 4px"><span class="sub">총 ${ids.length}건</span><button class="sub" data-act="delmode" style="text-decoration:underline;min-height:34px">삭제</button></div>`;
      h+=ids.map(id=>{const c=byId(id);return dm
        ?`<label class="row" style="gap:10px;padding:12px 0;border-bottom:1px dashed var(--line);cursor:pointer"><input type="checkbox" class="ck" data-act="selone" data-id="${id}" ${sel.includes(id)?'checked':''}><span class="t" style="flex:1;min-width:0">${c.name}</span><span class="sub">${st[id]}</span></label>`
        :`<div class="row sp" style="padding:11px 0;border-bottom:1px dashed var(--line)"><span class="t" style="flex:1;min-width:0">${c.name}</span><div class="chips" style="flex:0 0 auto;flex-wrap:nowrap">${['준비중','합격'].map(v=>`<button class="chip${st[id]===v?' on':''}" data-act="status" data-id="${id}" data-v="${v}">${v}</button>`).join('')}</div></div>`}).join('');
      if(dm)h+=`<div class="delbar"><button class="btn pr" data-act="delsel" ${sel.length?'':'disabled'}>선택 삭제 (${sel.length})</button></div>`}}
  $('#v-my').innerHTML=h}

function renderModal(){const m=S.modal,el=$('#modal');if(!m){el.innerHTML='';return}
  const c=byId(m.id),T=getT(),reg=T.find(s=>tId(s)===c.id),rs=c.rounds.filter(r=>dd(r.examDate)>=0);
  const sel=m.roundId||(reg?tR(reg):(rs[0]?.roundId)),r=rs.find(x=>x.roundId===sel)||rs[0];
  el.innerHTML=`<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-label="${c.name} 상세"><div class="sb"><div class="sh"><span class="t cert-name" style="font-size:17px">${c.name}${sourceIcon(c)}</span><button class="chip" data-act="close">닫기 ✕</button></div>
  <div class="row sp" style="margin:8px 0"><span class="schedule-tag ${statusClass(c)}">${scheduleLabel(c)}</span>${r?`<span class="dd">${D(dd(r.examDate))}</span>`:""}</div><div class="sub">회차별 일정 (목표 회차 선택)</div>${rs.length?rs.map((x,i)=>`<label class="rr"><input type="radio" name="rd" value="${x.roundId}" ${x.roundId===r?.roundId?'checked':''} data-act="round"><span><b>${i+1}회차</b> 접수 ${x.applyStart} ~${x.applyEnd}<br>시험일 ${x.examDate} ·${D(dd(x.examDate))}</span></label>`).join(''):'<div class="box sub">등록된 시험 일정이 없습니다. 공식 시행기관에서 최신 일정을 확인해 주세요.</div>'}
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
  case'quick':S.f.field=d.v;S.f.sub='';S.menu='';if(d.keep==='0')S.q='',$('#q').value='';nav('list');renderList();break;
  case'top':S.anim=S.f.field!==d.v&&!!d.v;S.f.field=d.v;S.f.sub='';S.menu='';renderList();break;
  case'subf':S.f.sub=d.v;S.menu='';renderList();break;
  case'menu':S.anim=S.menu!==d.k;S.menu=S.menu===d.k?'':d.k;renderList();break;
  case'pick':if(S.menu==='field'){S.f.field=d.v;S.f.sub='';if(!d.v)S.menu=''}else{S.f[S.menu]=d.v;S.menu=''}renderList();break;
  case'clear':S.f[d.k]='';if(d.k==='field')S.f.sub='';renderList();break;
  case'reset':S.f={field:'',sub:'',elig:'',diff:''};S.q='';$('#q').value='';S.menu='';renderList();break;
  case'sort':S.sort=d.v;renderList();break;
  case'open':S.modal={id:+d.id,roundId:null};S.toast='';renderModal();break;
  case'close':S.modal=null;S.toast='';renderModal();break;
  case'save':save();toast('목표 D-Day로 저장되었습니다');renderModal();refresh();break;
  case'unsave':{const id=S.modal.id;lsSet('targetExams',getT().filter(s=>tId(s)!==id));toast('등록이 취소되었습니다');renderModal();refresh();break}
  case'del':lsSet('targetExams',getT().filter(s=>tId(s)!==+d.id));renderMy();renderHome();break;
  case'resetAll':if(confirm('등록된 목표 D-Day를 모두 삭제할까요?')){lsSet('targetExams',[]);refresh()}break;
  case'mytab':S.my=d.v;S.delMode=false;S.delSel=[];renderMy();break;
  case'delmode':S.delMode=true;S.delSel=[];renderMy();break;
  case'delcancel':S.delMode=false;S.delSel=[];renderMy();break;
  case'delsel':{const n=S.delSel.length;if(n&&confirm('선택한 '+n+'개 자격증의 취득 상태를 삭제할까요?')){const st=getS();S.delSel.forEach(id=>delete st[id]);lsSet('myCertStatus',st);S.delMode=false;S.delSel=[];toast(n+'개의 취득 상태가 삭제되었습니다');renderMy()}break}
  case'status':{const st=getS();st[d.id]=d.v;lsSet('myCertStatus',st);renderMy();break}
  case'retry':load();break;
  case'demoErr':S.failOnce=true;load();break;
  case'resetData':if(confirm('저장된 목표 D-Day와 취득 상태를 모두 지울까요?')){lsSet('targetExams',[]);lsSet('myCertStatus',{});refresh();renderModal()}break}});

document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset&&t.dataset.act==='selall'){const ids=Object.keys(getS()).map(Number).filter(byId);S.delSel=t.checked?ids:[];renderMy();return}
  if(t.dataset&&t.dataset.act==='selone'){const id=+t.dataset.id;S.delSel=t.checked?[...new Set([...S.delSel,id])]:S.delSel.filter(x=>x!==id);renderMy();return}
  if(e.target.name==='rd'){const m=S.modal,c=byId(m.id);m.roundId=e.target.value;
  if(getT().some(s=>tId(s)===c.id)){save();toast('목표 회차가 변경되었습니다');refresh()}renderModal()}});

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.modal){S.modal=null;renderModal()}});

// pages/ 폴더의 화면 HTML을 불러온 뒤 앱을 시작합니다. (home → v-home, search → v-list, my → v-my)
const PAGES=['home','search','my'];
async function loadPages(){
  const parts=await Promise.all(PAGES.map(async n=>{const r=await fetch('pages/'+n+'.html');if(!r.ok)throw new Error(n+' '+r.status);return r.text()}));
  $('#pages').innerHTML=parts.join('')}
loadPages().then(()=>{
  $('#q').addEventListener('input',e=>{S.q=e.target.value;if(S.status==='ready')renderList()});
  nav('home');load()
}).catch(()=>{$('#pages').innerHTML='<section class="view"><div class="box"><div class="t">화면 파일(pages/)을 불러오지 못했습니다</div><p class="sub" style="margin:8px 0">index.html을 더블클릭해서 열면 보안 때문에 pages/ 폴더를 읽을 수 없습니다. project 폴더에서 <b>python3 -m http.server 8000</b> 실행 후 <b>http://localhost:8000</b> 으로 열어 주세요. (GitHub Pages에서는 그대로 동작합니다.)</p></div></section>'});
