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
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const nGet=k=>{try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return {}}};
const nSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const VALID={51:2,56:2}; // 유효기간(년) — 미리보기용 예시값, 출처 확인 후 확정 필요
const PK=[{n:'공기업 사무직 필수 세트',d:'컴활 + 한국사 + 토익',ids:[31,152,51]},{n:'데이터 분석 입문 세트',d:'SQLD + ADsP + 빅데이터분석기사',ids:[21,23,25]}];
const addYears=(iso,n)=>{const d=new Date(iso+'T00:00:00');d.setFullYear(d.getFullYear()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const AGES=[
 {k:'10대',n:'10대 · 고등학생',d:'진로 탐색과 생활기록부에 도움이 되는 입문 자격증',it:[[31,'기초 사무능력, 가장 많이 시작하는 자격증'],[152,'한국사 기본 소양, 입시·진학에 활용'],[41,'디자인 입문, 포트폴리오에 도움'],[3,'IT 진로를 고민한다면 첫 국가기술자격']]},
 {k:'20대 초반',n:'20대 초반 · 대학생',d:'학점 외 스펙을 쌓기 시작하는 시기',it:[[30,'학과 불문 필수로 꼽히는 사무 자격증'],[51,'취업·졸업요건에 널리 쓰이는 어학 성적'],[151,'공기업·공무원 대비 기본기'],[2,'IT 전공자라면 기사 도전 전 징검다리']]},
 {k:'20대 후반',n:'20대 후반 · 취업 준비',d:'지원 직무에 맞춰 선택과 집중이 필요한 시기',it:[[1,'IT 직무 지원 시 가장 대표적인 국가기술자격'],[25,'데이터 직무 준비의 핵심'],[21,'데이터 직무 입문용 실무 자격'],[56,'영어 면접·인사평가 대비']]},
 {k:'30대 이상',n:'30대 이상 · 이직·직장인',d:'업무 전문성과 이직 경쟁력을 높이는 자격증',it:[[23,'비전공자도 접근하기 쉬운 데이터 분석 입문'],[190,'경리·회계 직무 전환에 활용'],[30,'실무 활용도가 높아 이직에도 도움'],[22,'DB 전문가로 성장하려는 경우']]}
];
const pkAll=()=>[...PK.map((p,i)=>({key:'j'+i,i,n:p.n,ids:p.ids})),...AGES.map((a,i)=>({key:'a'+i,i,n:a.n,ids:a.it.map(x=>x[0])}))];
const pkAdded=()=>{const a=nGet('pkAdded'),o={};Object.keys(a).forEach(k=>{o[/^\d+$/.test(k)?'j'+k:k]=true});return o};
const pkMark=key=>{const a=nGet('pkAdded');a[key]=true;nSet('pkAdded',a)};
const S={recTab:'job',age:1,cmp:{on:false,ids:[]},sheet:null,q:'',f:{field:'',sub:'',elig:'',diff:''},sort:'deadline',menu:'',certs:[],status:'loading',dataSource:'J',tab:'home',my:'dday',delMode:false,delSel:[],modal:null,toast:'',failOnce:false,scroll:{}};
// ── 저장소 계층: 모든 목표 D-Day / 취득 상태 읽기·쓰기는 여기만 거칩니다. ──
const SYNC_KEYS=['targetExams','myCertStatus'];
const syncHooks=[];                       // (key, value) => void : 클라우드 저장 함수가 여기에 등록됨
const store={
  get:(k,f)=>lsGet(k,f),
  set(k,v){lsSet(k,v);if(SYNC_KEYS.includes(k))syncHooks.forEach(fn=>{try{fn(k,v)}catch(e){console.warn('sync hook 실패(로컬 저장은 유지)',e)}})}
};
const getT=()=>store.get('targetExams',[]),getS=()=>store.get('myCertStatus',{});
const setT=v=>store.set('targetExams',v),setS=v=>store.set('myCertStatus',v);
const tId=s=>+s.split(':')[0],tR=s=>s.split(':')[1];
const byId=id=>S.certs.find(c=>c.id===id);
// 저장 형식: "id:r1"(회차) · "id:d=2026-06-14"(내가 정한 시험일) · "id:none"(시험일 미정 — 상시·일정 미확인 시험)
const tKind=s=>{const k=s.split(':')[1]||'';return k==='none'?'none':k.startsWith('d=')?'custom':'round'};
const tDate=(s,c)=>{const k=s.split(':')[1]||'';if(k==='none')return null;if(k.startsWith('d='))return k.slice(2);const r=c.rounds.find(x=>x.roundId===k)||nextR(c);return r?r.examDate:null};
const tKey=x=>{const d=tDate(x.s,x.c);if(!d)return 9999;const n=dd(d);return n<0?5000:n};
const nextR=c=>c.rounds.filter(r=>dd(r.examDate)>=0).sort((a,b)=>a.examDate<b.examDate?-1:1)[0];
const dayOf=c=>{const r=nextR(c);return r?dd(r.examDate):9999};
const dDayLabel=c=>{const r=nextR(c);return r?D(dd(r.examDate)):''};
const scheduleLabel = c => {
  const t = c.scheduleType || '';
  const cat = c.displayScheduleCategory || '';
  if (t === 'continuous' || t === 'always_open' || t === 'always_open_or_frequent' || cat === 'ALWAYS_OPEN' || cat === 'CONTINUOUS') return '상시';
  if (t === 'multiple_sessions' || t === 'rolling_submission' || cat === 'MULTIPLE_SESSIONS') return '수시';
  if (t === 'scheduled' || t === 'scheduled_periodic' || t === 'periodic_scheduled' || t === 'institution_schedule' || cat === 'CONFIRMED_ROUND' || cat === 'PERIODIC_SCHEDULED') return '정기';
  if (t === 'not_in_next_round' || t === 'round_ended' || cat === 'ROUND_ENDED') return '당해 회차 종료';
  if (t === 'unverified') return '일정 확인 필요';
  const st = c.researchStatus?.schedule || '';
  if (st.startsWith('상시')) return '상시';
  if (st.startsWith('연중 시험일')) return '수시';
  if (st.includes('종료') || st === '이번 회차 미시행') return '당해 회차 종료';
  if (st.startsWith('정기 일정') || st.startsWith('공식 일정')) return '정기';
  return '일정 확인 필요';
};
const dLabel = c => dDayLabel(c) || scheduleLabel(c);
const sourceIcon = c => `<span class="source-icon ${c.dataSource==='A'?'api':''}" title="${c.dataSource==='A'?'API 응답':'JSON 데이터'}" aria-label="${c.dataSource==='A'?'API 응답':'JSON 데이터'}">${c.dataSource==='A'?'A':'J'}</span>`;
const statusClass = c => {
  const v = scheduleLabel(c);
  return ['상시', '수시'].includes(v) ? 'status-open'
    : v === '정기' ? 'status-regular'
    : v === '당해 회차 종료' ? 'status-pending'
    : 'status-check';
};
const noScheduleText = c => {
  if (c.scheduleNote) return c.scheduleNote;
  const t = c.scheduleType || '';
  if (t === 'always_open' || t === 'continuous' || t === 'always_open_or_frequent') return '상시시험입니다. 지역·시험장별 개설 일정과 접수 가능 여부를 공식 페이지에서 확인하세요.';
  if (t === 'not_in_next_round' || t === 'round_ended') return '당해 연도 정기 회차가 종료되었습니다. 차년도 연간 시험일정 공고 후 공식 페이지에서 확인하세요.';
  if (t === 'multiple_sessions' || t === 'rolling_submission') return '등급·지역별 시험일을 공식 일정표에서 확인하세요.';
  if (t === 'scheduled_periodic' || t === 'periodic_scheduled' || t === 'institution_schedule') return '시행기관의 연간·정기 공고에 따라 회차별 일정이 운영됩니다. 공식 일정 페이지에서 확인하세요.';
  return '아직 확인된 시험일이 없습니다. 공식 시행기관의 일정을 확인해 주세요.';
};

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

function heroH(s,c,multi){
  const ex=tDate(s,c),kind=tKind(s),r=kind==='round'?(c.rounds.find(x=>x.roundId===tR(s))||nextR(c)):null;
  if(!ex){const cont=c.scheduleType==='continuous'||c.scheduleType==='multiple_sessions';
    return `<div class="box hero hero-empty nodate" data-act="open" data-id="${c.id}" role="button" tabindex="0"><div class="hero-top"><span class="t">${c.name}</span><span class="hero-ap">${scheduleLabel(c)}</span></div><div class="dd">D-?</div><div class="hero-bar"><i style="width:0"></i></div><p class="sub" style="margin:12px 0 14px;line-height:1.5">${cont?'상시로 시험을 볼 수 있어요.':'공식 일정이 아직 확인되지 않았어요.'}<br>응시일을 정하면 D-Day가 시작돼요.</p><span class="btn pr">응시일 정하기</span></div>`}
  const n=dd(ex);let ap,info;
  if(r){const a0=dd(r.applyStart),a1=dd(r.applyEnd);
    ap=a1<0?['접수 마감','closed']:a0>0?['접수까지 D-'+a0,'soon']:['접수 중 · 마감 D'+(a1===0?'-DAY':'-'+a1),'open'+(a1<=3?' hot':'')];
    info=`<div><b>시험일</b>${r.examDate}</div><div><b>접수 기간</b>${md(r.applyStart)} ~ ${md(r.applyEnd)}</div>`}
  else{ap=['내가 정한 시험일','soon'];info=`<div><b>시험일</b>${ex}</div><div><b>접수</b>${scheduleLabel(c)}</div>`}
  const pct=Math.min(100,Math.max(4,Math.round((1-n/Math.max(n+30,30))*100)));
  return `<button class="box hero${n<=1?' crit':n<=7?' urg':''}" data-act="open" data-id="${c.id}">
    <div class="hero-top"><span class="t">${c.name}</span><span class="hero-ap ${ap[1]}">${ap[0]}</span></div>
    <div class="dd">${D(n)}</div>
    <div class="hero-bar"><i style="width:${pct}%"></i></div>
    <div class="hero-info">${info}</div>
    ${badgesH(c,true)}
  </button>`}

function renderHome(){
  const TP=getT().map(s=>({s,c:byId(tId(s))})).filter(x=>x.c).sort((a,b)=>tKey(a)-tKey(b)),T=TP.map(x=>x.c);
  let h=`<div class="gr"><div class="gr-t"><h1>안녕하세요!</h1><p>지금, 나에게 맞는<br>자격증을 찾아보세요!</p></div><svg class="gr-art" viewBox="0 0 150 120" aria-hidden="true"><ellipse cx="78" cy="92" rx="62" ry="22" style="fill:var(--ml)"/><path d="M40 62l38-17 38 17-38 17z" style="fill:var(--m)"/><path d="M58 73v14c0 6 40 6 40 0V73l-20 9z" style="fill:var(--md)"/><path d="M110 66v20" style="stroke:var(--m2)" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="90" r="4" style="fill:var(--m2)"/><rect x="82" y="88" width="46" height="14" rx="7" fill="#fff" style="stroke:var(--ml2)" stroke-width="2"/><path d="M122 88v14" stroke="#F89494" stroke-width="3"/><path d="M126 30l6-9M134 38l9-4M118 24l2-9" style="stroke:var(--m2)" stroke-width="3" stroke-linecap="round"/></svg></div>`;
  
  // 1. 내 목표 D-Day
  h+=`<div class="sec" style="margin-top:14px">`;
  if(S.status==='error')h+=`<div class="box sub">자격증 정보를 불러오지 못했습니다. 저장한 목표는 유지됩니다.</div>`;
  else if(S.status==='loading')h+=`<div class="skel"></div>`;
  else if(!T.length)h+=`<div class="box hero hero-empty"><div class="hero-top"><span class="t">나의 목표 D-Day</span><span class="hero-ap">미등록</span></div><div class="dd">D-?</div><div class="hero-bar"><i style="width:0"></i></div><p class="sub" style="margin:12px 0 14px;line-height:1.5">시험일을 등록하면 D-Day와 접수 일정이<br>여기에 한눈에 보여요</p><button class="btn pr" data-act="nav" data-v="list">D-Day 등록하기</button></div>`;
  else if(T.length===1)h+=heroH(TP[0].s,TP[0].c);
  else{
    const rest=TP.slice(1);
    h+=heroH(TP[0].s,TP[0].c,true)+`<div class="next-goals"><div class="ng-h"><span class="t">다음 목표</span><span class="sub">${rest.length}건</span></div>`+rest.map(({s,c})=>{const ex=tDate(s,c);return `<button class="ng-row" data-act="open" data-id="${c.id}"><span class="ng-n"><span class="t">${c.name}</span><span class="sub">시험일 ${ex||'미정'}</span></span><span class="my-dd${ex?'':' sm'}">${ex?D(dd(ex)):dLabel(c)}</span></button>`}).join('')+`</div>`}
  h+=`</div>`;

  // 3 & 4. 임박 시험 및 인기 자격증 리스트
  if(S.status==='ready'&&S.certs.length){
    const urgent=S.certs.slice().sort((a,b)=>dayOf(a)-dayOf(b)).slice(0,4);
    h+=`<div class="sec"><div class="row sp"><div class="t">원서 접수 임박 시험</div><button class="sub" data-act="quick" data-v="" style="text-decoration:underline">전체보기</button></div><div class="sec-list" style="margin-top:8px">${urgent.map(c=>cardH(c)).join('')}</div></div>`;

    const popular=S.certs.slice().sort((a,b)=>popRank(a)-popRank(b)).slice(0,5);
    h+=`<div class="sec"><div class="t">지금 가장 인기있는 자격증</div><div class="rk-list">${popular.map((c,i)=>`<button class="rk-row" data-act="open" data-id="${c.id}"><span class="rk-n">${i+1}</span><span class="rk-t">${c.name}</span><span class="rkd">${dLabel(c)}</span></button>`).join('')}</div></div>`;
  }

  $('#v-home').innerHTML=h;
  const hero=$('#v-home .hero');
  if(hero&&S.homeAnim){S.homeAnim=false;$('#v-home').classList.remove('go');void $('#v-home').offsetWidth;$('#v-home').classList.add('go');countUp(hero.querySelector('.dd'),seenFrom(hero))}
}
// 홈 D-Day 숫자: 0에서 목표 값까지 올라가는 카운트업 (모션 줄이기 설정이면 생략)
// 하루 한 번: 어제 본 D-Day 숫자에서 오늘 숫자로 줄어드는 모션 (처음이면 0에서 올라감)
function seenFrom(hero){const m=/^D-(\d+)$/.exec(hero.querySelector('.dd').textContent.trim());if(!m)return 0;const n=+m[1],id=hero.dataset.id,day=new Date().toDateString(),seen=lsGet('ddSeen',{}),p=seen[id];
  if(!p||p.day!==day){seen[id]={n,day};lsSet('ddSeen',seen)}
  return p&&p.day!==day&&p.n>n?p.n:0}
function countUp(el,from=0){if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const m=/^D-(\d+)$/.exec(el.textContent.trim());if(!m)return;const n=+m[1],t0=performance.now(),dur=Math.min(900,350+Math.abs(n-from)*14);
  const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent='D-'+Math.round(from+(n-from)*e);if(k<1)requestAnimationFrame(step);else el.textContent='D-'+n};requestAnimationFrame(step)}

function menuH(k,label,opts,fmt){const cur=S.f[k];
  return `<button class="chip${cur?' on':''}" data-act="menu" data-k="${k}" aria-expanded="${S.menu===k}">${label}${cur?': '+fmt(cur):''} ▾</button>`}

function renderList(){const el=$('#lb');
  if(S.status==='loading'){el.innerHTML='<div class="skel"></div><div class="skel"></div><div class="skel"></div>';return}
  if(S.status==='error'){el.innerHTML=empty('자격증 데이터를 불러오지 못했습니다','네트워크 상태를 확인해 주세요. 저장한 목표와 취득 상태는 유지됩니다.',`<button class="btn" data-act="retry">다시 시도</button>`);return}
  const L=filtered(),anim=S.anim;S.anim=false;
  const hasF=S.f.field||S.f.elig||S.f.diff||S.q;
  const TABS=[['field','분야',()=>S.f.field?S.f.field+(S.f.sub?' › '+S.f.sub:''):''],['elig','응시자격',()=>S.f.elig],['diff','난이도',()=>S.f.diff?dots(+S.f.diff):'']];
  let h=`<div class="ftabs">${TABS.map(([k,l,v])=>`<button class="ftab${S.f[k]?' set':''}${S.menu===k?' open':''}" data-act="menu" data-k="${k}" aria-expanded="${S.menu===k}"><span class="ft">${v()||l}</span><i class="ftc">▾</i></button>`).join('')}<button class="ftab cmpb${S.cmp.on?' set':''}" data-act="cmpmode" aria-pressed="${S.cmp.on}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M16 4v16M4 8h8M12 16h8"/></svg>비교</button></div>${S.cmp.on?`<div class="cmpbar"><span class="sub">비교할 자격증 2개를 눌러 주세요 (${S.cmp.ids.length}/2)</span></div>`:''}`;
  if(S.menu){const chip=(a,v,on,t)=>`<button class="chip${on?' on':''}" data-act="${a}" data-v="${v}">${t}</button>`;let inner='';
    if(S.menu==='field'){
      inner=`<div class="opts">${['',...FIELDS].map(f=>chip('pick',f,S.f.field===f,f||'전체')).join('')}</div>`;
      if(S.f.field)inner+=`<div class="opts sub2"><span class="ol">세부</span>${['',...subsOf(S.f.field)].map(v=>chip('subf',v,S.f.sub===v,v||'전체')).join('')}</div>`;
    }else{const O=S.menu==='elig'?ELIGS:DIFFS;
      inner=`<div class="opts">${['',...O].map(v=>chip('pick',v,String(S.f[S.menu])===String(v)||(!S.f[S.menu]&&v===''),v===''?'전체':S.menu==='diff'?dots(v):v)).join('')}</div>`}
    h+=`<div class="panel${anim?' anim':''}">${inner}</div>`}
  h+=`<div class="rbar"><span class="sub">결과 ${L.length}건</span><span class="sorts"><button class="${S.sort==='deadline'?'on':''}" data-act="sort" data-v="deadline">마감 임박순</button><button class="${S.sort==='fee'?'on':''}" data-act="sort" data-v="fee">응시료순</button><button class="${S.sort==='pop'?'on':''}" data-act="sort" data-v="pop">인기순</button>${hasF?`<button data-act="reset" class="rs">초기화</button>`:''}</span></div>`;
  h+=L.length?L.map(c=>{let x=S.sort==='pop'&&popRank(c)<POP.length?cardH(c,popRank(c)+1):cardH(c);if(S.cmp.on&&S.cmp.ids.includes(c.id))x=x.replace('class="card"','class="card sel"');return x}).join(''):empty('선택하신 조건에 맞는 자격증이 없습니다','조건을 줄이거나 추천 분야로 다시 찾아보세요',`<button class="btn pr" data-act="reset">필터 초기화</button><div class="sub" style="margin:12px 0 6px">추천 분야</div><div class="chips" style="justify-content:center">${FIELDS.slice(0,3).map(f=>`<button class="chip" data-act="quick" data-v="${f}" data-keep="0">${f}</button>`).join('')}</div>`);
  if(S.cmp.on&&S.cmp.ids.length===2)h+=`<div class="cmpgo"><button class="btn pr" data-act="cmpopen">2개 자격증 비교하기</button></div>`;
  el.innerHTML=h}

function renderMy(){const T=getT().map(s=>({s,c:byId(tId(s))})).filter(x=>x.c).sort((a,b)=>tKey(a)-tKey(b));
  let hSync='';
  if(window.PassPickSync){hSync=`<button class="sync-row${S.syncOpen?' open':''}" data-act="synctog" aria-expanded="${!!S.syncOpen}"><span class="si"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 9.5a3.8 3.8 0 0 1-.5 7.5z"/></svg></span><span class="sr-t"><b>기기 연동</b><small>다른 기기와 목표 D-Day · 취득 상태 동기화</small></span><svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>${S.syncOpen?window.PassPickSync.renderCardHTML():''}`}
  const stS=getS(),nGoal=T.length,nPrep=Object.keys(stS).filter(id=>byId(+id)&&stS[id]==='준비중').length,nPass=Object.keys(stS).filter(id=>byId(+id)&&stS[id]==='합격').length;
  const sb=(v,lab,n,p)=>`<button class="${S.my===v?'on':''}" data-act="mysum" data-v="${v}" aria-pressed="${S.my===v}"><span class="si"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></span><small>${lab}</small><b>${n}개</b></button>`;
  let h=hSync+`<div class="sumcard">${sb('dday','목표 D-Day',nGoal,'<path d="M7 4.5h10v15l-5-3.5-5 3.5z"/>')}${sb('prep','준비중',nPrep,'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>')}${sb('pass','합격',nPass,'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3M12 13v4M8.5 20h7"/>')}</div>`;
  const none=empty('아직 등록된 목표 시험이 없습니다','관심 있는 자격증을 찾아 시험일을 등록해 보세요',`<button class="btn" data-act="nav" data-v="list">자격증 탐색하러 가기</button>`);
  if(S.my==='dday'){
    if(!T.length)h+=none;else{h+=`<div class="row sp"><span class="sub">등록 ${T.length}건</span><button class="sub" data-act="resetAll" style="text-decoration:underline;min-height:34px">전체 초기화</button></div>`;
      const ddRow=({s,c})=>{const ex=tDate(s,c);return `<div class="row sp my-row"><button class="my-name" data-act="open" data-id="${c.id}"><div class="t">${c.name}</div><div class="sub">${ex?(tKind(s)==='custom'?'내가 정한 시험일 ':'시험일 ')+ex:'시험일 미정 · 눌러서 정하기'}</div></button><span class="my-dd${ex?'':' sm'}">${ex?D(dd(ex)):dLabel(c)}</span><button class="xbtn" data-act="del" data-id="${c.id}" aria-label="${c.name} 삭제">×</button></div>`};
      const pa=pkAdded(),used=new Set(),gh=pkAll().map(p=>{if(!pa[p.key])return '';const m=T.filter(({c})=>p.ids.includes(c.id)&&!used.has(c.id));if(!m.length)return '';m.forEach(({c})=>used.add(c.id));const open=!(S.myPkClosed||[]).includes(p.key);return `<div class="pkg${open?' open':''}"><button class="pkg-h" data-act="mypk" data-i="${p.key}" aria-expanded="${open}"><span class="pk-n"><b>${p.n}</b></span><span class="pk-cnt">${m.length}건</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>${open?`<div class="pkg-b">${m.map(ddRow).join('')}</div>`:''}</div>`}).join('');
      h+=gh+T.filter(({c})=>!used.has(c.id)).map(ddRow).join('')}
  }else{const st=getS(),GRP=S.my==='pass'?'합격':'준비중',ids=Object.keys(st).map(Number).filter(byId).filter(id=>st[id]===GRP),dm=S.delMode&&ids.length>0,sel=S.delSel.filter(id=>ids.includes(id));
    if(!ids.length)h+=none;else{
      h+=dm?`<div class="row sp" style="margin:2px 0 4px"><label class="row" style="gap:8px;min-height:36px;cursor:pointer"><input type="checkbox" class="ck" data-act="selall" ${sel.length===ids.length?'checked':''}><span class="t" style="font-size:14px">전체 선택</span></label><button class="sub" data-act="delcancel" style="text-decoration:underline;min-height:34px">취소</button></div>`
        :`<div class="row sp" style="margin:2px 0 4px"><span class="sub">총 ${ids.length}건</span><button class="sub" data-act="delmode" style="text-decoration:underline;min-height:34px">삭제</button></div>`;
      const row=id=>{const c=byId(id);return dm
        ?`<label class="row" style="gap:10px;padding:12px 0;border-bottom:1px dashed var(--line);cursor:pointer"><input type="checkbox" class="ck" data-act="selone" data-id="${id}" ${sel.includes(id)?'checked':''}><span class="t" style="flex:1;min-width:0">${c.name}</span></label>`
        :`<div class="row sp" style="padding:11px 0;border-bottom:1px dashed var(--line)"><div style="flex:1;min-width:0"><span class="t">${c.name}</span>${(()=>{const dt=nGet('certDates')[id];return st[id]==='합격'&&dt&&VALID[id]?`<div class="exp">취득 ${dt} · 만료 ${addYears(dt,VALID[id])}</div><div class="exp"><em>재응시까지 ${D(dd(addYears(dt,VALID[id])))}</em></div>`:''})()}</div><div class="chips" style="flex:0 0 auto;flex-wrap:nowrap">${['준비중','합격'].map(v=>`<button class="chip${st[id]===v?' on':''}" data-act="status" data-id="${id}" data-v="${v}">${v}</button>`).join('')}</div></div>`};
      h+=[GRP].map(g=>{const L=ids.filter(id=>st[id]===g);let gh='',rest=L;if(g==='준비중'){const pa=pkAdded(),used=new Set();gh=pkAll().map(p=>{if(!pa[p.key])return '';const m=p.ids.filter(id=>L.includes(id)&&!used.has(id));if(!m.length)return '';m.forEach(id=>used.add(id));const open=!(S.myPkClosed||[]).includes(p.key);return `<div class="pkg${open?' open':''}"><button class="pkg-h" data-act="mypk" data-i="${p.key}" aria-expanded="${open}"><span class="pk-n"><b>${p.n}</b></span><span class="pk-cnt">${m.length}건</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>${open?`<div class="pkg-b">${m.map(row).join('')}</div>`:''}</div>`}).join('');rest=L.filter(id=>!used.has(id))}return `<div class="grp"><div class="grp-h"><span class="t">${g}</span><span class="sub">${L.length}건</span></div>${gh}${L.length?rest.map(row).join(''):`<div class="sub grp-e">${g==='준비중'?'준비 중인 자격증이 없어요':'아직 합격한 자격증이 없어요'}</div>`}</div>`}).join('');
      if(dm)h+=`<div class="delbar"><button class="btn pr" data-act="delsel" ${sel.length?'':'disabled'}>선택 삭제 (${sel.length})</button></div>`}}
  $('#v-my').innerHTML=h}

function renderModal(){const m=S.modal,el=$('#modal');if(!m){el.innerHTML='';return}
  const c=byId(m.id),T=getT(),reg=T.find(s=>tId(s)===c.id),rs=c.rounds.filter(r=>dd(r.examDate)>=0),rk=reg?tKind(reg):'',rex=reg?tDate(reg,c):null;
  const sel=m.roundId||(rk==='round'?tR(reg):(rs[0]?.roundId)),r=rs.find(x=>x.roundId===sel)||rs[0],shown=rk&&rk!=='round'?rex:(r?r.examDate:null);
  const tab=m.tab||'info',ic=(p)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
  const art=`<svg class="dp-art" viewBox="0 0 220 130" aria-hidden="true"><path d="M20 96c-14-30 10-62 52-66 30-3 40-22 78-14 34 7 56 36 44 66-10 26-40 30-86 30S34 120 20 96z" style="fill:var(--ml)"/><rect x="62" y="22" width="96" height="64" rx="7" fill="#fff" style="stroke:var(--m)" stroke-width="5"/><rect x="70" y="30" width="80" height="48" rx="3" style="fill:var(--ml2)"/><path d="M76 70l18-20 14 14 12-10 20 16z" style="fill:var(--m2)"/><path d="M46 92h128l-10 14H56z" style="fill:var(--m)"/><path d="M175 28l8-10M186 38l12-4M166 18l2-12" style="stroke:var(--m2)" stroke-width="3.5" stroke-linecap="round"/></svg>`;
  const dots=n=>[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('');
  const intro=`<div class="dc"><b class="dh">자격증 소개</b><p class="dn">${c.overview||'소개 정보가 아직 없습니다.'}</p><div class="dtags">${(c.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div></div>`,sched=`<div class="dc"><b class="dh">일정 확인</b><p class="dn">${c.scheduleNote||noScheduleText(c)}</p><a class="btn ln" href="${c.officialUrl}" target="_blank" rel="noopener noreferrer">공식 접수처 바로가기 ↗</a></div>`;
  let body='';
  if(tab==='info'){
    body=`<div class="dc"><div class="dr"><span class="di">${ic('<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M9 3.5v4M15 3.5v4"/>')}</span><div class="dv"><b>시험 일정</b>${rs.length?rs.map(x=>`<label class="rr"><input type="radio" name="rd" value="${x.roundId}" ${x.roundId===r?.roundId&&(!reg||rk==='round')?'checked':''} data-act="round"><span><span class="rt">${x.roundId.replace(/^r/,'')}회차 · 시험일 ${x.examDate} <em>${D(dd(x.examDate))}</em></span><small>접수 ${x.applyStart} ~ ${x.applyEnd}</small></span></label>`).join(''):`<p class="dn">${noScheduleText(c)}</p>`}</div></div>
    <div class="dr"><span class="di">${ic('<circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5c.5-1.3 1.5-1.8 2.7-1.8 1.5 0 2.5.8 2.5 2 0 2.3-3.2 1.8-3.2 4.3M12 17v.1"/>')}</span><div class="dv"><b>응시료</b><p>${won(c.fee)}</p>${c.feeDetails?`<small>${Object.entries(c.feeDetails).map(([k,v])=>`${k} ${won(v)}`).join(' · ')}</small>`:''}${c.feeBasis?`<small>${c.feeBasis}</small>`:''}</div></div>
    <div class="dr"><span class="di">${ic('<path d="M5 19V11M12 19V5M19 19v-6"/>')}</span><div class="dv"><b>난이도</b><p class="dots">${dots(c.difficulty||0)}<span>${c.difficulty||'-'} / 3</span></p></div></div></div>
    ${intro}`}
  else if(tab==='elig'){
    body=`<div class="dc"><b class="dh">응시 자격</b><div class="ck-r"><span class="ckc">${ic('<path d="M6 12.5l4 4 8-9"/>')}</span><span>${c.eligibility}</span></div><p class="dn" style="margin-top:10px">${c.eligibilityText}</p></div>
    ${sched}`}
  else if(!reg){body=`<div class="dc lockc"><span class="lk">${ic('<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>')}</span><b>목표 D-Day를 등록하면 열려요</b><p class="dn">시험 준비 메모와 체크리스트는 목표로 등록한 자격증에서 쓸 수 있어요.</p></div>`}
  else{
    const nt=nGet('certNotes')[c.id]||{},its=nt.items||[];
    body=`<div class="dc"><b class="dh">시험 준비 메모</b><label class="fl">수험번호<input data-note="no" value="${esc(nt.no)}" placeholder="예: 12345678"></label><label class="fl">시험장<input data-note="place" value="${esc(nt.place)}" placeholder="예: OO대학교 공학관 302호"></label><label class="fl">메모<textarea data-note="memo" rows="3" placeholder="준비물 · 인강 · 오답 메모">${esc(nt.memo)}</textarea></label></div>
    <div class="dc"><b class="dh">준비 체크리스트 <small>${its.filter(x=>x.d).length}/${its.length}</small></b>${its.map((x,i)=>`<div class="cki ${x.d?'done':''}"><button class="ckb" data-act="cktog" data-i="${i}" aria-label="완료 표시">${x.d?'<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg>':''}</button><span>${esc(x.t)}</span><button class="ckx" data-act="ckdel" data-i="${i}" aria-label="삭제">×</button></div>`).join('')||'<p class="dn">준비물이나 할 일을 추가해 보세요.</p>'}<div class="ck-add"><input id="ckn" placeholder="예: 기출 3회독" maxlength="40"><button class="btn pr" data-act="ckadd">추가</button></div></div>`}
  el.innerHTML=`<div class="dp" role="dialog" aria-label="${c.name} 상세"><div class="dp-top"><button data-act="close" aria-label="뒤로">${ic('<path d="M15 5l-7 7 7 7"/>')}</button></div>
  <div class="dp-hero">${art}<h2>${c.name}${sourceIcon(c)}</h2><div class="dp-chips"><span class="schedule-tag ${statusClass(c)}">${scheduleLabel(c)}</span><span class="schedule-tag status-check">${c.field}</span><span class="schedule-tag status-check">난이도 ${c.difficulty||'-'}</span>${shown?`<span class="dd">${D(dd(shown))}</span>`:''}</div></div>
  <div class="dp-tabs">${[['info','시험 정보'],['elig','응시 자격'],['guide','준비 가이드']].map(([k,n])=>`<button class="${tab===k?'on':''}${k==='guide'&&!reg?' dis':''}" data-act="dtab" data-v="${k}">${k==='guide'&&!reg?'<svg class="lk-i" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>':''}${n}</button>`).join('')}</div>
  <div class="dp-body">${body}</div>
  <div class="dp-cta">${S.toast?`<div class="toast"><span>${S.toast}</span><span>${shown?D(dd(shown)):dLabel(c)}</span></div>`:''}
  ${reg?`<button class="btn ln" data-act="unsave">✓ ${rk==='none'?'목표로 저장됨':'등록 완료'} · 눌러서 취소</button>`:`<button class="btn pr" data-act="save">${ic('<path d="M7 4.5h10v15l-5-3.5-5 3.5z"/>')}${rs.length?'목표 D-Day 등록':'목표로 저장 (시험일 미정)'}</button>`}</div></div>`}

function renderRec(){const el=$('#v-rec');if(!el)return;
  const seg=`<div class="seg"><button class="${S.recTab==='job'?'on':''}" data-act="rectab" data-v="job">직무별</button><button class="${S.recTab==='age'?'on':''}" data-act="rectab" data-v="age">나이대별</button></div>`;
  if(S.recTab==='job'){el.innerHTML=seg+`<div class="rec-h"><h2>직무별 추천 패키지</h2><p>진로에 맞는 자격증 묶음을 한 번에 준비중으로 담아 보세요.</p></div><div class="sec" style="margin-top:0"><div class="pk-list">${PK.map((p,i)=>{const T0=getT(),all=p.ids.every(id=>T0.some(x=>tId(x)===id));return `<div class="pk"><b>${p.n}</b><small>${p.d}</small><div class="pk-c">${p.ids.map(id=>`<span>${(byId(id)||{}).name||''}</span>`).join('')}</div><button class="btn ${all?'ln':'pr'}" data-act="pkadd" data-i="${i}" ${all?'disabled':''}>${all?'✓ 모두 준비중에 담았어요':'한 번에 준비중에 담기'}</button></div>`}).join('')}</div></div>`;return}
  const g=AGES[S.age],T0=getT(),all=g.it.every(([id])=>T0.some(x=>tId(x)===id));
  el.innerHTML=seg+`<div class="rec-h"><h2>나이대별 추천</h2><p>지금 단계에 맞는 자격증을 골라 보세요.</p></div><div class="chips ag-chips">${AGES.map((a,i)=>`<button class="chip${i===S.age?' on':''}" data-act="agepick" data-i="${i}">${a.k}</button>`).join('')}</div>
  <div class="pk"><b>${g.n}</b><small>${g.d}</small>${g.it.map(([id,why])=>{const c=byId(id);return c?`<button class="ag-row" data-act="open" data-id="${id}"><span class="ag-t"><b>${c.name}</b><small>${why}</small></span><span class="dp-d">${dLabel(c)||'상시'}</span></button>`:''}).join('')}<button class="btn ${all?'ln':'pr'}" data-act="agadd" ${all?'disabled':''} style="margin-top:12px">${all?'✓ 모두 준비중에 담았어요':'이 단계 자격증 한 번에 담기'}</button></div>`}
function refresh(){renderHome();renderMy();renderRec()}
function save(){const m=S.modal,c=byId(m.id),T=getT().filter(s=>tId(s)!==c.id),nr=nextR(c);
  const key=m.custom?'d='+m.custom:nr?(m.roundId||nr.roundId):'none';
  T.push(c.id+':'+key);setT(T);const st=getS();if(!st[c.id]){st[c.id]='준비중';setS(st)}}
let tt;function toast(t){S.toast=t;clearTimeout(tt);tt=setTimeout(()=>{S.toast='';renderModal()},2800)}

function nav(v){const cur=document.querySelector('.view:not([hidden])');if(cur)S.scroll[S.tab]=cur.scrollTop;S.tab=v;const g=$('#gear');if(g)g.hidden=v!=='my';if(v==='home')S.homeAnim=true;
  document.querySelectorAll('.view').forEach(e=>e.hidden=e.id!=='v-'+v);
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  if(v==='home')renderHome();if(v==='my')renderMy();if(v==='rec')renderRec();$('#v-'+v).scrollTop=S.scroll[v]||0}

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
  case'open':if(S.cmp.on&&S.tab==='list'){const id=+d.id,a=S.cmp.ids;S.cmp.ids=a.includes(id)?a.filter(x=>x!==id):[...a,id].slice(-2);renderList();break}S.modal={id:+d.id,roundId:null};S.toast='';renderModal();break;
  case'gear':S.settings=true;renderSettings();break;
  case'setclose':S.settings=false;renderSettings();break;
  case'theme':applyTheme(d.v);renderSettings();break;
  case'ckadd':{const v=($('#ckn').value||'').trim();if(v){const a=nGet('certNotes'),n=a[S.modal.id]||{};n.items=[...(n.items||[]),{t:v,d:false}];a[S.modal.id]=n;nSet('certNotes',a);renderModal()}break}
  case'cktog':case'ckdel':{const a=nGet('certNotes'),n=a[S.modal.id]||{items:[]},i=+d.i;n.items=n.items||[];if(b.dataset.act==='cktog')n.items[i].d=!n.items[i].d;else n.items.splice(i,1);a[S.modal.id]=n;nSet('certNotes',a);renderModal();break}
  case'mysum':S.my=d.v;S.delMode=false;S.delSel=[];renderMy();break;
  case'synctog':S.syncOpen=!S.syncOpen;renderMy();break;
  case'mypk':{const o=S.myPkClosed||[],i=d.i;S.myPkClosed=o.includes(i)?o.filter(x=>x!==i):[...o,i];renderMy();break}
  case'pktog':{const o=S.pkOpen||[],i=+d.i;S.pkOpen=o.includes(i)?o.filter(x=>x!==i):[...o,i];renderRec();break}
  case'pkone':{const id=+d.id,c=byId(id),T=getT(),st=getS();if(c&&!T.some(x=>tId(x)===id)){const nr=nextR(c);T.push(id+':'+(nr?nr.roundId:'none'));setT(T)}if(!st[id]){st[id]='준비중';setS(st)}refresh();break}
  case'rectab':S.recTab=d.v;renderRec();break;
  case'agepick':S.age=+d.i;renderRec();break;
  case'agadd':{const g=AGES[S.age],T=getT(),st=getS();pkMark('a'+S.age);g.it.forEach(([id])=>{const c=byId(id);if(!c)return;if(!T.some(x=>tId(x)===id)){const nr=nextR(c);T.push(id+':'+(nr?nr.roundId:'none'))}if(!st[id])st[id]='준비중'});setT(T);setS(st);refresh();break}
  case'cmpmode':S.cmp.on=!S.cmp.on;S.cmp.ids=[];renderList();break;
  case'cmpopen':S.sheet={t:'cmp'};renderSheet();break;
  case'sheetclose':S.sheet=null;renderSheet();break;
  case'pkadd':{const p=PK[+d.i],T=getT(),st=getS();pkMark('j'+d.i);p.ids.forEach(id=>{const c=byId(id);if(!c)return;if(!T.some(x=>tId(x)===id)){const nr=nextR(c);T.push(id+':'+(nr?nr.roundId:'none'))}if(!st[id])st[id]='준비중'});setT(T);setS(st);refresh();break}
  case'validsave':{const v=($('#vdate')||{}).value;if(v){const a=nGet('certDates');a[S.sheet.id]=v;nSet('certDates',a)}S.sheet=null;renderSheet();renderMy();break}
  case'dtab':S.modal.tab=d.v;renderModal();break;
  case'close':S.modal=null;S.toast='';renderModal();break;
  case'save':{save();toast(nextR(byId(S.modal.id))?'목표 D-Day로 저장되었습니다':'목표로 저장했어요 · 응시일은 나중에 정할 수 있어요');renderModal();refresh();break}
  case'syncCreate':window.PassPickSync?.createNewCode();break;
  case'syncJoin':{const code=prompt('다른 기기에서 발급받은 6자리 연동 코드를 입력하세요:');if(code)window.PassPickSync?.connectWithCode(code);break}
  case'syncPull':window.PassPickSync?.pull().then(ok=>{if(ok)alert('최신 클라우드 데이터를 불러왔습니다.')});break;
  case'syncDisconnect':window.PassPickSync?.disconnect();break;
  case'unsave':{const id=S.modal.id;setT(getT().filter(s=>tId(s)!==id));toast('등록이 취소되었습니다');renderModal();refresh();break}
  case'del':setT(getT().filter(s=>tId(s)!==+d.id));renderMy();renderHome();break;
  case'resetAll':if(confirm('등록된 목표 D-Day를 모두 삭제할까요?')){setT([]);refresh()}break;
  case'mytab':S.my=d.v;S.delMode=false;S.delSel=[];renderMy();break;
  case'delmode':S.delMode=true;S.delSel=[];renderMy();break;
  case'delcancel':S.delMode=false;S.delSel=[];renderMy();break;
  case'delsel':{const n=S.delSel.length;if(n&&confirm('선택한 '+n+'개 자격증의 취득 상태를 삭제할까요?')){const st=getS();S.delSel.forEach(id=>delete st[id]);setS(st);S.delMode=false;S.delSel=[];toast(n+'개의 취득 상태가 삭제되었습니다');renderMy()}break}
  case'status':{const st=getS(),was=st[d.id];if(d.v==='합격'&&was!=='합격'&&VALID[d.id]){S.sheet={t:'valid',id:+d.id};renderSheet()}st[d.id]=d.v;setS(st);const bx=b.getBoundingClientRect();renderMy();if(d.v==='합격'&&was!=='합격')celebrate(bx.left+bx.width/2,bx.top+bx.height/2);break}
  case'retry':load();break;
  case'demoErr':S.failOnce=true;load();break;
  case'resetData':if(confirm('저장된 목표 D-Day와 취득 상태를 모두 지울까요?')){setT([]);setS({});refresh();renderModal()}break}});

document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset&&t.dataset.act==='selall'){const ids=Object.keys(getS()).map(Number).filter(byId);S.delSel=t.checked?ids:[];renderMy();return}
  if(t.dataset&&t.dataset.act==='selone'){const id=+t.dataset.id;S.delSel=t.checked?[...new Set([...S.delSel,id])]:S.delSel.filter(x=>x!==id);renderMy();return}
  if(e.target.name==='rd'){const m=S.modal,c=byId(m.id);m.roundId=e.target.value;m.custom=null;
  if(getT().some(s=>tId(s)===c.id)){save();toast('목표 회차가 변경되었습니다');refresh()}renderModal()}});

document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.note&&S.modal){const a=nGet('certNotes'),n=a[S.modal.id]||{};n[t.dataset.note]=t.value;a[S.modal.id]=n;nSet('certNotes',a)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.settings){S.settings=false;renderSettings();return}if(e.key==='Escape'&&S.modal){S.modal=null;renderModal()}});

// pages/ 폴더의 화면 HTML을 불러온 뒤 앱을 시작합니다. (home → v-home, search → v-list, my → v-my)
const THEMES={mint:{n:'민트',d:'지금 쓰는 차분한 민트'},green:{n:'그린',d:'처음 만든 진한 초록'},blue:{n:'블루',d:'코발트 블루 + 차콜'}};
const getTheme=()=>{try{return localStorage.getItem('theme')}catch(e){return null}};
function applyTheme(t){if(!THEMES[t])t='mint';document.documentElement.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='green'?'#F7FAFC':t==='blue'?'#F5F7FA':'#F7FAFA'}
applyTheme(getTheme());
function renderSettings(){const el=$('#settings');if(!S.settings){el.innerHTML='';return}const cur=document.documentElement.dataset.theme;
  el.innerHTML=`<div class="dp st" role="dialog" aria-label="설정"><div class="dp-top"><button data-act="setclose" aria-label="뒤로"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button></div>
  <div class="st-b"><h2>설정</h2><div class="dc"><b class="dh">테마 색상</b>${Object.entries(THEMES).map(([k,v])=>`<button class="th-o ${cur===k?'on':''}" data-act="theme" data-v="${k}"><span class="th-sw th-${k}"><i></i><i></i><i></i></span><span class="th-t"><b>${v.n}</b><small>${v.d}</small></span><span class="th-c">${cur===k?'<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg>':''}</span></button>`).join('')}</div></div></div>`}
function renderSheet(){const el=$('#cmp');const sh=S.sheet;if(!sh){el.innerHTML='';return}
  if(sh.t==='cmp'){const [a,b]=S.cmp.ids.map(byId),nx=c=>{const r=nextR(c);return r?r.examDate+' ('+D(dd(r.examDate))+')':'일정 미확인'};
    const rows=[['분야',c=>c.field],['응시료',c=>won(c.fee)],['난이도',c=>'●'.repeat(c.difficulty||0)+'○'.repeat(3-(c.difficulty||0))],['다음 시험일',nx],['응시 자격',c=>c.eligibility]];
    el.innerHTML=`<div class="ov" data-act="sheetclose"></div><div class="sheet2"><div class="s2h"><b>자격증 비교</b><button class="chip" data-act="sheetclose">닫기 ✕</button></div><table class="cmpt"><thead><tr><th></th><th>${a.name}</th><th>${b.name}</th></tr></thead><tbody>${rows.map(([l,f])=>`<tr><th>${l}</th><td>${f(a)}</td><td>${f(b)}</td></tr>`).join('')}</tbody></table></div>`}
  else{const c=byId(sh.id);el.innerHTML=`<div class="ov" data-act="sheetclose"></div><div class="sheet2"><div class="s2h"><b>취득일 입력</b><button class="chip" data-act="sheetclose">나중에</button></div><p class="dn">${c.name}은(는) 유효기간이 ${VALID[c.id]}년이에요. 취득일을 입력하면 만료 예정일과 D-Day를 계산해 드려요.</p><div class="md-row" style="display:flex;gap:8px;margin-top:12px"><input type="date" id="vdate" max="${isoOff(0)}" aria-label="취득일"><button class="btn pr" data-act="validsave">저장</button></div></div>`}}
const PAGES=['home','search','rec','my'];
async function loadPages(){
  const parts=await Promise.all(PAGES.map(async n=>{const r=await fetch('pages/'+n+'.html');if(!r.ok)throw new Error(n+' '+r.status);return r.text()}));
  $('#pages').innerHTML=parts.join('')}
loadPages().then(()=>{
  $('#q').addEventListener('input',e=>{S.q=e.target.value;if(S.status==='ready')renderList()});
  nav('home');load();
  window.PassPickSync?.init()
}).catch(()=>{$('#pages').innerHTML='<section class="view"><div class="box"><div class="t">화면 파일(pages/)을 불러오지 못했습니다</div><p class="sub" style="margin:8px 0">index.html을 더블클릭해서 열면 보안 때문에 pages/ 폴더를 읽을 수 없습니다. project 폴더에서 <b>python3 -m http.server 8000</b> 실행 후 <b>http://localhost:8000</b> 으로 열어 주세요. (GitHub Pages에서는 그대로 동작합니다.)</p></div></section>'});

// 합격 축하: 눌린 위치에서 색종이가 터지고 축하 문구가 잠깐 떠오릅니다.
function celebrate(x,y){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const app=document.querySelector('.app'),r=app.getBoundingClientRect(),L=document.createElement('div');L.className='cf';
  const CT={mint:['#6FB6BA','#8FCBCE','#F89494'],green:['#2E6E5F','#4A8576','#B7DCD3'],blue:['#4169E1','#547CE8','#7895E8']};const C=CT[getTheme()]||CT.mint;
  for(let i=0;i<28;i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*110,e=document.createElement('i');e.style.cssText=`left:${x-r.left}px;top:${y-r.top}px;background:${C[i%C.length]};--dx:${Math.cos(a)*v}px;--dy:${Math.sin(a)*v-70}px;--rot:${Math.random()*720-360}deg;animation-delay:${Math.random()*.08}s`;if(i%3===0)e.style.borderRadius='50%';L.appendChild(e)}
  const m=document.createElement('div');m.className='cf-msg';m.textContent='합격 축하해요! 🎉';L.appendChild(m);app.appendChild(L);setTimeout(()=>L.remove(),2000)}
// D-Day 카드 터치 리플
document.addEventListener('pointerdown',e=>{const h=e.target.closest('.box.hero');if(!h||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=h.getBoundingClientRect(),d=Math.max(r.width,r.height)*2.2,s=document.createElement('span');s.className='rip';s.style.cssText=`left:${e.clientX-r.left}px;top:${e.clientY-r.top}px;width:${d}px;height:${d}px`;h.appendChild(s);s.addEventListener('animationend',()=>s.remove())});
