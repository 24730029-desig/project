// js/firebase-sync.js
window.PassPickSync = (function () {
  let db = null;
  let auth = null;
  let isReady = false;
  let status = 'offline'; // 'offline' | 'ready' | 'synced' | 'syncing'
  const CODE_KEY = 'passpick_sync_code';

  const getCode = () => localStorage.getItem(CODE_KEY) || '';
  const setCode = (c) => localStorage.setItem(CODE_KEY, c.trim().toUpperCase());

  // 6자리 연동 코드 생성 (혼동되는 I, O, 0, 1 제외)
  function makeCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  function statusBadgeHTML() {
    if (status === 'synced') return `<span style="color:#0f766e;font-weight:700">● 동기화됨</span>`;
    if (status === 'syncing') return `<span style="color:#2563eb;font-weight:700">↻ 동기화 중...</span>`;
    if (status === 'ready') return `<span style="color:#4b5563;font-weight:600">○ 연결 준비됨 (코드 미등록)</span>`;
    return `<span style="color:#9ca3af">○ 오프라인 (로컬 저장)</span>`;
  }

  // 로컬과 클라우드 데이터 안전 병합 로직
  function mergeData(localT, cloudT, localS, cloudS) {
    // 1. 목표 D-Day 병합 (자격증 ID 기준 중복 제거, 현재 기기 선택 회차 우선)
    const examMap = new Map();
    cloudT.forEach(item => {
      const id = String(item).split(':')[0];
      if (id) examMap.set(id, item);
    });
    localT.forEach(item => {
      const id = String(item).split(':')[0];
      if (id) examMap.set(id, item);
    });
    const mergedT = Array.from(examMap.values());

    // 2. 취득 상태 병합 ('합격' 상태 우선 보존)
    const mergedS = { ...cloudS, ...localS };
    const allIds = new Set([...Object.keys(cloudS), ...Object.keys(localS)]);
    allIds.forEach(id => {
      if (cloudS[id] === '합격' || localS[id] === '합격') {
        mergedS[id] = '합격';
      }
    });

    return { mergedT, mergedS };
  }

  // Firestore에 현재 기기 데이터 저장
  async function push(code = getCode()) {
    if (!isReady || !db || !code) return;
    status = 'syncing';
    if (typeof renderMy === 'function') renderMy();
    try {
      await db.collection('sync').doc(code).set({
        targetExams: lsGet('targetExams', []),
        myCertStatus: lsGet('myCertStatus', {}),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      status = 'synced';
    } catch (e) {
      console.warn('Firestore 저장 실패(로컬은 안전하게 유지됨):', e);
      status = 'offline';
    }
    if (typeof renderMy === 'function') renderMy();
  }

  // Firestore에서 연동 코드 데이터 불러오기 및 로컬 데이터와 합치기
  async function pull(code = getCode(), shouldMerge = false) {
    if (!isReady || !db || !code) return false;
    status = 'syncing';
    if (typeof renderMy === 'function') renderMy();
    try {
      const snap = await db.collection('sync').doc(code).get();
      if (snap.exists) {
        const data = snap.data();
        const cloudT = Array.isArray(data.targetExams) ? data.targetExams : [];
        const cloudS = (data.myCertStatus && typeof data.myCertStatus === 'object') ? data.myCertStatus : {};

        if (shouldMerge) {
          const localT = lsGet('targetExams', []);
          const localS = lsGet('myCertStatus', {});
          const { mergedT, mergedS } = mergeData(localT, cloudT, localS, cloudS);
          lsSet('targetExams', mergedT);
          lsSet('myCertStatus', mergedS);
          status = 'synced';
          if (typeof refresh === 'function') refresh();
          await push(code); // 합쳐진 최신 상태를 클라우드에도 반영
        } else {
          lsSet('targetExams', cloudT);
          lsSet('myCertStatus', cloudS);
          status = 'synced';
          if (typeof refresh === 'function') refresh();
        }
        return true;
      } else {
        await push(code);
        return true;
      }
    } catch (e) {
      console.warn('Firestore 불러오기 실패(로컬 데이터 유지):', e);
      status = 'offline';
      if (typeof renderMy === 'function') renderMy();
      return false;
    }
  }

  // 새 연동 코드 발급 및 즉시 클라우드 업로드
  async function createNewCode() {
    if (!isReady) {
      alert('현재 오프라인 상태입니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.');
      return;
    }
    const newCode = makeCode();
    setCode(newCode);
    await push(newCode);
    alert(`새 연동 코드 [${newCode}]가 생성되어 클라우드에 저장되었습니다.\n다른 기기에서 이 코드를 입력하면 목표 D-Day와 취득 상태가 동기화됩니다.`);
  }

  // 다른 기기에서 발급한 코드 입력 후 데이터 합치기
  async function connectWithCode(inputCode) {
    const clean = (inputCode || '').trim().toUpperCase();
    if (clean.length < 4) {
      alert('올바른 연동 코드를 입력해 주세요.');
      return;
    }
    if (!isReady) {
      alert('현재 오프라인 상태입니다. 인터넷 연결을 확인해 주세요.');
      return;
    }
    try {
      const snap = await db.collection('sync').doc(clean).get();
      if (!snap.exists) {
        alert('존재하지 않는 연동 코드입니다. 코드를 다시 확인해 주세요.');
        return;
      }
      setCode(clean);
      await pull(clean, true); // 최초 연결 시 기존 기기 데이터와 클라우드 데이터 병합
      alert(`[${clean}] 코드와 연결되어 기존 데이터와 클라우드 데이터가 안전하게 합쳐졌습니다!`);
    } catch (e) {
      alert('연동 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  function disconnect() {
    if (!confirm('이 기기의 클라우드 연동을 해제할까요? (현재 기기의 로컬 데이터는 유지됩니다)')) return;
    localStorage.removeItem(CODE_KEY);
    status = isReady ? 'ready' : 'offline';
    if (typeof renderMy === 'function') renderMy();
  }

  // 마이 화면(#v-my) 상단에 들어갈 클라우드 동기화 카드 HTML
  function renderCardHTML() {
    const code = getCode();
    return `
      <div class="box" style="margin-bottom:14px;padding:12px 14px">
        <div class="row sp" style="margin-bottom:6px">
          <span class="t" style="font-size:14px">☁️ 기기 간 데이터 동기화</span>
          <span class="sub" style="font-size:12px">${statusBadgeHTML()}</span>
        </div>
        ${code ? `
          <div class="row sp" style="background:var(--bg,#f8fafc);padding:8px 10px;border-radius:8px;margin-top:6px">
            <div>
              <div class="sub" style="font-size:11px">내 연동 코드</div>
              <div class="t" style="font-size:16px;letter-spacing:2px">${code}</div>
            </div>
            <div class="chips" style="gap:6px">
              <button class="chip" data-act="syncPull">불러오기</button>
              <button class="chip" data-act="syncDisconnect">해제</button>
            </div>
          </div>
        ` : `
          <p class="sub" style="font-size:12px;margin:4px 0 10px;line-height:1.4">
            개인정보 없이 6자리 연동 코드로 다른 기기와 목표 D-Day·취득 상태를 동기화할 수 있습니다.
          </p>
          <div class="row" style="gap:6px">
            <button class="btn pr" style="flex:1;min-height:36px;font-size:13px" data-act="syncCreate">연동 코드 만들기</button>
            <button class="btn ln" style="flex:1;min-height:36px;font-size:13px" data-act="syncJoin">코드 입력하기</button>
          </div>
        `}
      </div>
    `;
  }

  // Firebase SDK 초기화 및 익명 입장권 발급
  async function init() {
    if (!window.FIREBASE_CONFIG || typeof firebase === 'undefined') {
      status = 'offline';
      return;
    }
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      auth = firebase.auth();
      db = firebase.firestore();

      await auth.signInAnonymously();
      isReady = true;
      const savedCode = getCode();
      status = savedCode ? 'synced' : 'ready';

      // app.js의 store.set()이 호출될 때마다 자동으로 클라우드에 반영
      if (Array.isArray(syncHooks)) {
        syncHooks.push(() => { push(); });
      }

      if (savedCode) {
        await pull(savedCode, false);
      } else if (typeof renderMy === 'function') {
        renderMy();
      }
    } catch (e) {
      console.warn('Firebase 초기화/익명 로그인 실패 -> 오프라인 Fallback 전환:', e);
      isReady = false;
      status = 'offline';
    }
  }

  return { init, renderCardHTML, createNewCode, connectWithCode, pull, disconnect };
})();