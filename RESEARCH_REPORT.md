# GetPass 일정 재조사 보고서

갱신일: 2026-11-02

## 반영한 내용
- 300개 자격증 모두 `scheduleSourceUrl`, `scheduleCheckedAt`, `scheduleType`, `researchStatus.schedule`, `scheduleNote` 필드를 갖도록 정리했습니다.
- 공식 시행기관에서 상시 시행으로 안내하는 종목만 `상시`로 표시했습니다. 상시시험은 시험장·지역별 개설 상황과 잔여 좌석에 따라 실제 접수 가능 일정이 달라지므로 고정 D-Day를 임의로 만들지 않습니다.
- 일부 자격증은 상시라는 표현이 있어도 연중 상시 접수가 아니라 특정 월에만 열리는 일정이어서 `정기 일정(5·8·11월 등) 확인`으로 분리했습니다.
- 공식 페이지에서 확인한 미래 회차를 JSON에 반영했습니다: TOEIC(2026-11-08, 11-15, 11-29, 12-13, 12-27), JLPT N1~N5(2026-12-06), SQLD(2026-11-14), 한국사능력검정 심화(2026-11-28), KPC ITQ/SW코딩(2026-12-12), GTQ/GTQi/GTQid(2026-11-28, 12-19), ERP정보관리사(2026-11-28), 리눅스마스터 1급(2026-11-14)·2급(2026-12-12), HSK/회화(2026-12-13), TESAT(2026-12-19), 매경TEST(2026-12-05).
- 한국사능력검정 기본은 2026년 제81회가 심화만 시행하므로 `이번 회차 미시행`으로 구분했습니다.
- 화면에서 시험일이 등록되지 않은 경우 `상시`, `수시`, `다음 일정 확인`, `확인 필요` 등으로 상태를 나눴습니다.

## 공식 출처
- Q-Net 상시시험: https://www.q-net.or.kr/crf021.do?gId=99&gSite=Q&id=crf02101&tabGb=sang
- 대한상공회의소 상시시험 FAQ: https://license.korcham.net/customer/faq.do?bigCate=11&pg=3&searchType=title&searchWord=
- 대한상공회의소 2026년 일부 월 시행 안내: https://license.korcham.net/customer/noticeview.do?num=254626&pg=1
- 한국생산성본부 2026 일정: https://license.kpc.or.kr/nasec/rceptexmncnfirm/selectExprschdul.do?year=2026
- TOEIC 공식 일정: https://exam.toeic.co.kr/receipt/examSchList.php
- JLPT 공식 사이트: https://www.jlpt.or.kr/
- 한국사능력검정시험 공식 일정: https://www.historyexam.go.kr/pageLink.do?link=examSchedule
- 데이터자격검정: https://www.dataq.or.kr/
- Goethe-Institut 한국 일정: https://www.goethe.de/ins/kr/ko/spr/prf/tui.html
- KAIT 리눅스마스터: https://ihd.or.kr/guidecert1.do
- HSK 공식 일정: https://old.chinesetest.cn/gonewcontent.do?flag=kdnew&id=50278976
- TESAT 공식 일정: https://www.tesat.or.kr/app.frm.general.exam/schedule.regular
- 매경TEST 공식 일정: https://exam.mk.co.kr/online_intro.php

## 정확성 범위
300개 항목에 시행기관별 일정 안내 페이지를 연결했지만, **300개 전부의 개별 종목·등급·지역별 다음 시험일을 모두 공식 공고와 대조해 확정한 것은 아닙니다.** 현재 상시 표시는 15개, 구체적인 회차 일정이 들어 있는 항목은 49개, 정기/월별 일정 페이지에서 다음 회차 확인이 필요한 항목은 9개, 다음 시험일이 확인되지 않은 항목은 220개입니다. 날짜를 확인하지 못한 종목은 임의 날짜를 만들지 않고 `확인 필요`로 남겼습니다. 이는 시험이 없다는 뜻이 아니라, 데이터에 검증된 다음 날짜가 없다는 뜻입니다.
