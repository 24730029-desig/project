const fs = require('fs');

const todayStr = '2026-11-23';

function calcDDay(targetDateStr, baseDateStr) {
  const target = new Date(targetDateStr + 'T00:00:00Z');
  const base = new Date(baseDateStr + 'T00:00:00Z');
  return Math.round((target - base) / (1000 * 60 * 60 * 24));
}

// 1. 기관/종목별 확정 회차 데이터 [["접수시작", "접수마감", "시험일"], ...]
const SCHEDULES = {
  // Q-Net 2026년 정기 기사/산업기사 (필기 1~3회 + 실기 3회)
  QNET_GISA_2026: [
    ["2026-01-12", "2026-01-15", "2026-01-30"],
    ["2026-04-20", "2026-04-23", "2026-05-09"],
    ["2026-07-20", "2026-07-23", "2026-08-07"],
    ["2026-09-21", "2026-09-28", "2026-10-24"]
  ],

  // KPC CAD실무능력평가 (2026년 9~12회 + 2027년 1~11회)
  KPC_CAD: [
    ["2026-08-06", "2026-08-12", "2026-09-12"],
    ["2026-09-10", "2026-09-16", "2026-10-17"],
    ["2026-10-08", "2026-10-14", "2026-11-14"],
    ["2026-11-05", "2026-11-11", "2026-12-12"],
    ["2026-12-03", "2026-12-09", "2027-01-09"],
    ["2027-01-07", "2027-01-13", "2027-02-13"],
    ["2027-02-04", "2027-02-10", "2027-03-13"],
    ["2027-03-04", "2027-03-10", "2027-04-10"],
    ["2027-04-01", "2027-04-07", "2027-05-08"],
    ["2027-05-06", "2027-05-12", "2027-06-12"],
    ["2027-06-03", "2027-06-09", "2027-07-10"],
    ["2027-07-01", "2027-07-07", "2027-08-07"],
    ["2027-07-29", "2027-08-04", "2027-09-04"],
    ["2027-09-09", "2027-09-17", "2027-10-16"],
    ["2027-10-07", "2027-10-13", "2027-11-13"]
  ],

  // 삼일회계법인 (재경관리사, 회계관리 1·2급 122~129회)
  SAMIL_2026: [
    ["2026-01-06", "2026-01-13", "2026-01-31"],
    ["2026-02-26", "2026-03-05", "2026-03-28"],
    ["2026-04-16", "2026-04-23", "2026-05-16"],
    ["2026-05-26", "2026-06-02", "2026-06-20"],
    ["2026-06-30", "2026-07-07", "2026-07-25"],
    ["2026-08-20", "2026-08-27", "2026-09-19"],
    ["2026-10-15", "2026-10-22", "2026-11-14"],
    ["2026-11-24", "2026-12-01", "2026-12-19"]
  ],

  // 대한상공회의소 정기시험
  KORCHAM_SOKGI: [
    ["2026-03-05", "2026-03-11", "2026-03-28"],
    ["2026-08-13", "2026-08-19", "2026-09-05"]
  ],
  KORCHAM_ECOMMERCE: [
    ["2026-05-21", "2026-05-27", "2026-06-13"],
    ["2026-09-24", "2026-09-30", "2026-10-17"]
  ],
  KORCHAM_YUTONG: [
    ["2026-04-16", "2026-04-22", "2026-05-09"],
    ["2026-07-30", "2026-08-05", "2026-08-22"],
    ["2026-10-22", "2026-10-28", "2026-11-14"]
  ],

  // 한국세무사회 (전산세무 1·2급, 전산회계 1·2급, 세무회계 1~3급)
  KACPTA_2026: [
    ["2026-01-02", "2026-01-08", "2026-01-31"],
    ["2026-03-05", "2026-03-11", "2026-04-04"],
    ["2026-04-30", "2026-05-07", "2026-06-06"],
    ["2026-07-02", "2026-07-08", "2026-08-01"],
    ["2026-08-27", "2026-09-02", "2026-10-03"],
    ["2026-11-05", "2026-11-11", "2026-12-05"]
  ],

  // 금융투자협회 (KOFIA)
  KOFIA_STOCK: [
    ["2026-01-12", "2026-01-16", "2026-02-08"],
    ["2026-03-23", "2026-03-27", "2026-04-19"],
    ["2026-09-14", "2026-09-18", "2026-10-18"]
  ],
  KOFIA_FUND: [
    ["2026-02-02", "2026-02-06", "2026-03-08"],
    ["2026-04-27", "2026-04-30", "2026-05-31"],
    ["2026-11-02", "2026-11-06", "2026-11-29"]
  ],
  KOFIA_INVEST: [
    ["2025-12-22", "2025-12-26", "2026-01-18"],
    ["2026-04-13", "2026-04-17", "2026-05-10"],
    ["2026-07-27", "2026-07-31", "2026-08-23"]
  ],

  // 한국어문회 (전국한자능력검정시험 112~115회)
  HANJA_2026: [
    ["2026-01-19", "2026-01-23", "2026-02-28"],
    ["2026-04-20", "2026-04-24", "2026-05-23"],
    ["2026-07-13", "2026-07-17", "2026-08-22"],
    ["2026-10-19", "2026-10-23", "2026-11-21"]
  ],

  // 한국데이터산업진흥원 (DataQ)
  DATAQ_BIGDATA: [
    ["2026-03-03", "2026-03-09", "2026-04-04"],
    ["2026-05-18", "2026-05-22", "2026-06-20"],
    ["2026-08-03", "2026-08-07", "2026-09-05"],
    ["2026-10-26", "2026-10-30", "2026-11-28"]
  ],
  DATAQ_ADP: [
    ["2026-01-05", "2026-01-09", "2026-02-07"],
    ["2026-03-30", "2026-04-03", "2026-05-02"],
    ["2026-07-06", "2026-07-10", "2026-08-08"],
    ["2026-09-14", "2026-09-18", "2026-10-17"]
  ],
  DATAQ_ADSP: [
    ["2026-01-05", "2026-01-09", "2026-02-07"],
    ["2026-04-13", "2026-04-17", "2026-05-17"],
    ["2026-07-06", "2026-07-10", "2026-08-08"],
    ["2026-09-28", "2026-10-02", "2026-10-31"]
  ],
  DATAQ_SQLP: [
    ["2026-02-02", "2026-02-06", "2026-03-07"],
    ["2026-07-20", "2026-07-24", "2026-08-22"]
  ]
};

// 2. Q-Net 정기기사/산업기사 ID 목록
const QNET_GISA_IDS = new Set([
  1, 2, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 33, 36,
  245, 246, 252, 262, 263, 265, 266, 269, 272, 274, 275,
  276, 277, 278, 279, 284, 285, 286, 287, 289, 290, 291, 292, 293
]);

function getRoundsForCert(cert) {
  const id = cert.id;
  if (QNET_GISA_IDS.has(id)) return SCHEDULES.QNET_GISA_2026;
  if ([47, 48].includes(id)) return SCHEDULES.KPC_CAD;
  if ([185, 186, 187].includes(id)) return SCHEDULES.SAMIL_2026;
  if ([159, 160, 161].includes(id)) return SCHEDULES.KORCHAM_SOKGI;
  if ([171, 172].includes(id)) return SCHEDULES.KORCHAM_ECOMMERCE;
  if ([116, 117, 118, 240].includes(id)) return SCHEDULES.KORCHAM_YUTONG;
  if ([188, 189, 190, 191, 192, 193, 194].includes(id)) return SCHEDULES.KACPTA_2026;
  if (id === 181) return SCHEDULES.KOFIA_STOCK;
  if (id === 180) return SCHEDULES.KOFIA_FUND;
  if (id === 183) return SCHEDULES.KOFIA_INVEST;
  if (id >= 229 && id <= 236) return SCHEDULES.HANJA_2026;
  if (id === 25) return SCHEDULES.DATAQ_BIGDATA;
  if (id === 24) return SCHEDULES.DATAQ_ADP;
  if (id === 23) return SCHEDULES.DATAQ_ADSP;
  if (id === 22) return SCHEDULES.DATAQ_SQLP;
  return null;
}

const SAMIL_URL = 'https://www.samilexam.com/?WG_V=1795397869311';

const certs = JSON.parse(fs.readFileSync('certificates.json', 'utf8'));
let updatedCount = 0;

const updatedCerts = certs.map((cert) => {
  const item = { ...cert };

  // Q-Net 정기기사/산업기사 응시료 공통 보완 (미확인인 경우)
  if (QNET_GISA_IDS.has(item.id) && item.researchStatus?.fee === '미확인') {
    item.fee = 42000;
    item.feeDetails = { '필기': 19400, '실기': 22600 };
    item.feeBasis = '필기+실기 응시료 합계 (정기 기사·산업기사 공통 기준)';
    item.feeVerifiedAt = todayStr;
    item.researchStatus = { ...item.researchStatus, fee: '공식 출처 확인 완료' };
  }

  // CAD실무능력평가 1·2급 응시료 보완
  if (item.id === 47) {
    item.fee = 66000;
    item.feeDetails = { '1급': 66000 };
    item.feeBasis = '일반접수 기준 (부가세 포함, 결제대행수수료 1,000원 별도)';
    item.feeVerifiedAt = todayStr;
    item.researchStatus = { ...item.researchStatus, fee: '공식 출처 확인 완료' };
  } else if (item.id === 48) {
    item.fee = 60000;
    item.feeDetails = { '2급': 60000 };
    item.feeBasis = '일반접수 기준 (부가세 포함, 결제대행수수료 1,000원 별도)';
    item.feeVerifiedAt = todayStr;
    item.researchStatus = { ...item.researchStatus, fee: '공식 출처 확인 완료' };
  }

  // 삼일회계법인 3종 URL 교정 및 응시료 보완
  if ([185, 186, 187].includes(item.id)) {
    item.officialUrl = SAMIL_URL;
    item.url = SAMIL_URL;
    item.feeSourceUrl = SAMIL_URL;
    item.scheduleSourceUrl = SAMIL_URL;
    item.feeVerifiedAt = todayStr;
    item.researchStatus = { ...item.researchStatus, fee: '공식 출처 확인 완료' };

    if (item.id === 185) {
      item.fee = 70000;
      item.feeDetails = { '응시료': 70000, '자격증발급': 5000 };
      item.feeBasis = '응시료 70,000원 (자격증 발급 시 5,000원 별도, 총 75,000원)';
    } else if (item.id === 186) {
      item.fee = 50000;
      item.feeDetails = { '응시료': 50000, '자격증발급': 5000 };
      item.feeBasis = '응시료 50,000원 (자격증 발급 시 5,000원 별도, 총 55,000원)';
    } else if (item.id === 187) {
      item.fee = 30000;
      item.feeDetails = { '응시료': 30000, '자격증발급': 5000 };
      item.feeBasis = '응시료 30,000원 (자격증 발급 시 5,000원 별도, 총 35,000원)';
    }
  }

  const rounds = getRoundsForCert(item);
  if (rounds && rounds.length > 0) {
    const examDates = rounds.map((r) => r[2]);
    const upcoming = examDates.filter((d) => d >= todayStr).sort();
    const nextExamDate = upcoming.length > 0 ? upcoming[0] : null;

    item.rounds = rounds;
    item.examDates = examDates;
    item.nextExamDate = nextExamDate;
    item.dDayDaysAtUpdate = nextExamDate ? calcDDay(nextExamDate, todayStr) : null;
    item.dDayCalculatedAt = todayStr;
    item.scheduleVerifiedAt = todayStr;
    item.scheduleCheckedAt = todayStr;
    item.datasetReviewedAt = todayStr;

    if (nextExamDate) {
      item.scheduleType = 'scheduled';
      item.researchStatus = { ...item.researchStatus, schedule: '공식 일정 확인 완료' };
      item.scheduleNote = '공식 시행기관 일정에서 확인한 회차를 반영했습니다. 접수 가능 여부는 공식 페이지에서 다시 확인하세요.';
    } else {
      item.scheduleType = 'not_in_next_round';
      item.researchStatus = { ...item.researchStatus, schedule: '2026년 회차 종료(차년도 대기)' };
      item.scheduleNote = '2026년 정기 회차가 모두 종료되었습니다. 2027년 공식 일정 발표 후 업데이트가 필요합니다.';
    }
    updatedCount++;
  } else if (item.scheduleType === 'scheduled' && item.nextExamDate) {
    item.dDayDaysAtUpdate = calcDDay(item.nextExamDate, todayStr);
    item.dDayCalculatedAt = todayStr;
  }

  return item;
});

fs.writeFileSync('certificates.json', JSON.stringify(updatedCerts, null, 2), 'utf8');
fs.writeFileSync(
  'certificates.js',
  `window.CERTIFICATES_DATA = ${JSON.stringify(updatedCerts)};\n`,
  'utf8'
);

console.log(`완료: 총 ${updatedCount}개 자격증에 공식 일정 및 응시료가 반영되었습니다.`);