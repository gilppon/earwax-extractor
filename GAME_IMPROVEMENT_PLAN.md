# 게임 고도화 계획서

## 목표

현재의 조작 핵심인 **떨리는 도구를 안정시키며 왁스를 뽑아내는 플레이**를 살리고, 화면의 개성과 플레이 선택지를 키운다. 기존 Phaser/React 구조와 현재 저장 데이터를 우선 활용해 작은 단위로 개선한다.

## 현재 상태 요약

- **구성:** React 허브(Expedition, Lab, Ears, Ranks)와 Phaser 3 + Matter 물리 기반 플레이 화면으로 구성된다.
- **게임 모드:** 8개 스테이지, 보스전, 무한 모드가 있다. 스테이지에는 털, 금색/경화 왁스, 고막 근처 위험물, 재채기, 중력 흔들림이 단계적으로 추가된다.
- **진행/보상:** 도구·귀 잠금 해제, 능력 업그레이드, 일일 보상, 마일스톤, 드론, 로컬 랭킹이 이미 있다.
- **시각 자산:** `public`에는 Jua 폰트만 있다. 허브의 귀 통로는 `ui.tsx`의 SVG이고, 왁스·보스 텍스처와 도구는 Phaser Graphics로 생성된다. 따라서 우선순위는 단순히 파일 수를 늘리는 것이 아니라 **그림체와 연출의 일관성, 시각적 피드백의 밀도**다.
- **오디오:** 외부 음원 없이 Web Audio로 ASMR 효과음과 배경 음악을 합성한다.

## 제안 방향

### 1. 아트와 연출 개선

1. **작은 아트 기준표부터 확정**
   - 선 굵기, 명암 단계, 하이라이트 위치, 재질 표현, 색 대비를 정한다.
   - Human/Alien/Cat/Giant 귀 팔레트가 플레이 화면의 벽, 털, 왁스, 허브 카드에 동일하게 반영되도록 기준을 맞춘다.
2. **핵심 오브젝트를 읽기 쉽게 재작업**
   - 일반·금색·경화·파편·보스 왁스를 실루엣과 표면 디테일만으로도 구분되게 한다.
   - 면봉/핀셋/흡입기/보스 진동기의 끝부분과 작동 상태를 명확히 표현한다.
   - 고막 위험 구역, 왁스의 고정 상태와 채굴 진행도를 색상 외에도 모양·아이콘·애니메이션으로 전달한다.
3. **배경과 화면 피드백 추가**
   - 통로 안쪽에 저비용 패럴랙스, 미세한 조직 움직임, 깊이별 색 변화와 제한된 장식 요소를 넣는다.
   - 채굴 완료, 콤보, 위험 회피, 고막 피격, 보스 균열에 서로 구분되는 짧은 이펙트와 화면 반응을 준다.
   - 강한 흔들림·플래시는 옵션으로 줄일 수 있도록 기존 저사양 효과 설정과 연결한다.
4. **제작 순서**
   - 1차는 기존 절차적 그래픽을 정리하고 필요한 스프라이트 몇 종만 교체한다.
   - 새 이미지 팩은 작은 프로토타입에서 해상도·투명 여백·화면 비율을 확인한 뒤 확대한다. 현재 구조는 실행 중 귀 팔레트에 따라 왁스 색이 달라지므로, 고정 색 이미지와 팔레트 틴트 적용 여부를 먼저 시험한다.

### 2. 플레이 선택과 반복 재미 강화

1. **스테이지에 선택형 보너스 목표 추가**
   - 기본 클리어 조건은 유지하면서 `제한 시간`, `고막 피해 제한`, `콤보 유지` 같은 선택 목표 1개를 제시한다.
   - 별/등급 보상은 선택 목표 달성으로 지급하고, 실패해도 진행이 막히지 않게 한다.
2. **스테이지 변주를 조합형으로 확장**
   - 기존 털·재채기·중력 흔들림을 조합하고, 한 스테이지에 대표 기믹 하나를 강조한다.
   - 예: 재채기 예고 중 호흡을 참으면 안전하지만 이동이 느려짐, 특정 털 구간 통과 시 짧은 콤보 보너스.
   - 새 위험은 항상 예고 신호와 회복 가능한 대응 방법을 함께 제공한다.
3. **도구별 플레이 감각 차이 강화**
   - 면봉은 여러 조각을 끌어내는 안정적인 기본 도구, 핀셋은 단일 고가치 조각 정밀 회수, 흡입기는 에너지 관리와 주변 정리에 초점을 둔다.
   - 도구를 바꿨을 때 점수/보상 효율만 바뀌지 않도록, 목표와 상황별 장점을 스테이지에서 보여준다.
4. **보스전 2단계에 패턴 변주 추가**
   - 현재의 진동 충전 후 파편 3개를 제거하는 흐름을 유지한다.
   - 균열 단계별로 파편 위치·고막 위험·짧은 공격 예고를 바꾸고, 반복 숙련으로 대응할 수 있게 한다.
5. **무한 모드의 장기 목표 보강**
   - 깊이 구간마다 환경 이벤트를 넣고, 구간 도달 보상과 최고 기록 갱신을 더 분명하게 보여준다.
   - 기존의 왁스 증가, 막힘, 털·흔들림 난이도 상승과 겹쳐 과도하게 복잡해지지 않도록 이벤트 빈도를 제한한다.

### 3. 진행 화면과 보상 피드백

- 허브 첫 화면에서 다음 스테이지, 장착 도구, 선택 귀, 당장 받을 수 있는 보상을 한눈에 확인하게 한다.
- 결과 화면에 `클리어/실패 원인`, 주요 통계, 달성한 보너스 목표, 다음 해금까지 남은 조건을 묶어서 보여준다.
- 로컬 랭킹임을 유지한다면 라이벌 점수는 기록 경쟁용 연출임을 명확히 하고, 실제 플레이 기록과 혼동되지 않게 구분한다.
- 드론/일일 보상은 접속을 강요하는 구조보다 복귀 시 보상을 간단히 확인하고 수령하는 편의 기능으로 다듬는다.

## 실행 단계

| 단계 | 작업 | 완료 기준 |
|---|---|---|
| 0. 기준선 정리 | 현행 조작, 화면 크기, 터치 입력, 저사양 효과를 기준 장면으로 기록 | 시작/플레이/결과 화면의 기준 스크린샷과 핵심 조작 체크리스트 확보 |
| 1. 시각 시제품 | 일반/금색/경화 왁스, 도구 끝, 고막 위험 표시를 한 장면에서 개선 | 종류를 빠르게 구분하고 기존 귀별 색상과 충돌하지 않음 |
| 2. 피드백 정리 | 채굴 진행, 회수, 콤보, 위험, 보스 균열의 짧은 효과 적용 | 각 상태 변화가 색상만 보지 않아도 식별되고 저사양 옵션에서 효과를 줄일 수 있음 |
| 3. 재미 변주 | 스테이지 보너스 목표 1종과 무한 모드 구간 이벤트 1종을 시제품화 | 기본 클리어를 방해하지 않고, 플레이 방식에 유의미한 선택을 만듦 |
| 4. 진행/보상 연결 | 결과 요약과 다음 해금 안내, 보너스 목표 보상 연결 | 보상 중복 지급이 없고 기존 저장 데이터가 유지됨 |
| 5. 콘텐츠 확대 | 스테이지 조합, 보스 변주, 추가 이미지 팩을 검토 | 시제품 피드백과 성능 확인 후에만 콘텐츠 양을 늘림 |

## 검증 계획

구현 단계에서 다음을 확인한다. 이 계획 작성 시에는 코드를 수정하거나 검증 명령을 실행하지 않았다.

- 데스크톱 마우스와 모바일 터치에서 이동·잡기·호흡 조작이 기존처럼 동작한다.
- 각 왁스 종류, 도구 작동, 고막 위험, 채굴 상태가 저사양 효과 설정에서도 구분된다.
- 일반 귀와 특수 귀를 바꿔도 이미지 색·윤곽·대비가 읽히며, 이미지가 뭉개지거나 잘리지 않는다.
- 새 보너스 목표는 기본 클리어/재도전/다음 스테이지 흐름과 충돌하지 않고 보상을 한 번만 지급한다.
- 무한 모드 이벤트가 물리 성능과 화면 가독성을 해치지 않는다.
- 기존 저장값을 가진 사용자의 진행도·잠금 해제·장착 상태가 유지된다.

## 주요 리스크와 대응

- **아트 스타일 혼합:** 절차적 그림과 새 스프라이트가 어울리지 않을 수 있다. 소수 핵심 오브젝트 시제품을 먼저 만들고 스타일 승인 뒤 확장한다.
- **팔레트 다양성:** 귀마다 색이 달라 단일 색 스프라이트는 특정 귀에서 묻힐 수 있다. 색상별 미리보기와 대비 기준을 먼저 확인한다.
- **가독성/성능 저하:** 파티클과 흔들림이 많아지면 플레이 피로와 저사양 부하가 커진다. 화면당 효과 수를 제한하고 기존 저사양 옵션 및 모션 축소 설정을 고려한다.
- **경제 밸런스:** 보너스 목표 보상은 기존 드론·업그레이드 비용과 상호작용한다. 획득 속도를 비교한 뒤 보상량을 정한다.
- **범위 팽창:** 신규 적/도구/모드를 동시에 추가하면 현재 구조에 비해 검증 범위가 커진다. 1차 목표는 시각 개선 + 보너스 목표 1종으로 제한한다.

## 우선순위 제안

첫 구현 묶음은 **(1) 핵심 오브젝트 아트 시제품, (2) 게임 상태 피드백 개선, (3) 스테이지 보너스 목표 1종**으로 한다. 이 묶음은 이미지 자산의 효과를 빠르게 확인하면서 기존 조작과 모드 구조를 재사용할 수 있다. 이후 플레이 감각과 성능을 확인해 무한 모드 이벤트, 보스 패턴, 추가 아트 팩 순으로 넓힌다.

## 관련 파일

- `src/components/MissionTab.tsx` — 허브의 모드/스테이지 선택
- `src/components/PlayScreen.tsx`, `src/components/Hud.tsx` — 브리핑, 튜토리얼, 플레이 HUD, 결과 화면
- `src/components/ui.tsx` — 귀 아바타와 SVG 허브 일러스트
- `src/game/Textures.ts` — 절차적 왁스·보스 텍스처
- `src/game/SwabController.ts` — 도구 조작과 시각 표현
- `src/game/GameScene.ts` — 스테이지 배치, 무한 모드, 보스전, 게임 중 연출
- `src/game/config.ts` — 귀/도구/업그레이드/스테이지 밸런스
- `src/game/store.ts` — 저장 데이터, 진행도, 보상
- `src/game/AsmrSynth.ts` — 합성 사운드와 배경 음악


## 시각 시제품 점검 (2026-10-03)
- 로컬 브라우저에서 게임을 시작해 1280×720 플레이 화면을 확인했다. 표면 점광이 실제 화면 크기에서 희미하게 보이고, 왁스 실루엣이나 텍스처 경계가 잘리는 현상은 관찰되지 않았다.
- 튜토리얼 오버레이를 진행해 걷히게 한 뒤 화면을 캡처했다: 귀파기/.playwright-cli/page-2026-10-03T11-42-12-240Z.png
- 확인 범위는 현재 해금된 Human Ear, 일반 왁스가 보이는 Stage 1이다. 이 세션에서 금색/경화 타입과 다른 귀 팔레트를 나란히 비교하지 못했으므로, 종류 구분과 팔레트 대비는 완료 판정하지 않는다.
- 콘솔에는 기존 index.html meta CSP의 frame-ancestors 지시문 무시 메시지가 1건 보였다. 이번 텍스처 수정에서 비롯된 렌더 오류는 관찰되지 않았다.
- 다음 확인: 여러 귀 팔레트와 특수 왁스 타입을 같은 화면 크기에서 비교한다. 저장 데이터를 임의 변경하거나 재화를 소비하지 않고 재현할 수 있는 로컬 QA 경로를 먼저 찾는다.


## 보너스 목표 사전 안내 (2026-10-03)
- 무료 QA/debug unlock 경로는 현재 UI와 소스 검색에서 찾지 못했다. 기본 세이브는 Human Ear만 열려 있다. 추가 귀 해금 비용은 Alien 600, Cat 1,500, Giant 3,200 wax다.
- 특수 왁스 출현은 일반 진행에 묶여 있다: Gold는 Stage 3부터, Hard는 Stage 4부터 등장한다. 재화 소비나 저장 조작 없이 비교하려면 실제 진행으로 해금해야 한다.
- MissionTab의 기존 Stage 보너스 규칙을 선택 화면에 미리 표시했다. Flawless는 고막 무피해일 때 스테이지 기본 보상의 50% 왁스와 500점, Speed는 스테이지 par 시간 이내 완주 시 남은 시간에 비례한 왁스/점수다. 보상 계산과 저장 데이터는 변경하지 않았다.
- 검증: 귀파기 npm run build (tsc --noEmit + Vite build) 성공, git diff --check 통과. 브라우저에서 Stage 1의 +20 wax/+500 score, 62s 조건을 확인했다. 1280×1000 및 390×844 스크린샷에서 안내가 선택 카드 위에 보이고 하단 시작 버튼에 가리지 않는 것을 확인했다(모바일은 내용 스크롤 후).
- 캡처: 귀파기/.playwright-cli/page-2026-10-03T12-00-29-376Z.png (데스크톱), 귀파기/.playwright-cli/page-2026-10-03T12-01-30-215Z.png (모바일, 스크롤 후).
- 한계: 현재 화면은 Human Ear/Stage 1만 검사했다. 다른 팔레트와 Stage 3/4 특수 왁스는 자연 진행으로 접근 가능할 때 확인한다.


## 플레이 중 보너스 상태 HUD (2026-10-03)
- HudState에 무피해 보너스 상태를 추가했다. GameScene의 최저 고막 체력을 사용해 결과 화면의 Flawless 조건(st.minHp >= 99.5)과 동일하게 판정한다.
- STAGE 모드에서 데스크톱은 Flawless 상태와 par 남은 시간을 헤더에 표시하고, 모바일은 짧은 Clean/Hit 및 카운트다운 배지를 표시한다. 속도 목표 시간이 지나면 Speed lost/Missed로 바뀐다.
- 기존 보너스 지급·pause·광고·세이브 로직은 변경하지 않았다.
- 검증: 귀파기 npm run build 성공, git diff --check 통과. 1280×720 데스크톱과 390×844 모바일 화면에서 배치 및 초기 상태를 확인했다. 실제 입력으로 고막을 건드리자 HUD 접근성 스냅샷이 100%에서 48%로 감소하고 Flawless에서 Damage taken으로 바뀌었으며 속도 남은 시간이 0:03으로 감소하는 것을 확인했다. 이 의도적 검증 입력은 이후 런 실패를 일으켰으므로 게임 밸런스/완주 검증으로 보지 않는다.
- 캡처: 귀파기/.playwright-cli/page-2026-10-03T12-12-13-332Z.png (모바일 시작 상태), 귀파기/.playwright-cli/page-2026-10-03T12-12-36-747Z.png (데스크톱, 튜토리얼 중).
- 다음 검토: 결과 화면에서 보너스 달성 및 미달성 이유를 보여줘 플레이 목표와 결과를 연결한다.


## 결과 화면의 목표 달성 요약 (2026-10-03)
- STAGE 결과에 선택형 목표 2개를 표시한다: Flawless(무피해)와 Speed(par 시간).
- 달성 여부는 기존 GameScene 보상 목록에서 읽는다. 결과 화면에서 새 보상 계산이나 저장값 변경은 없다.
- 실패하면 두 목표를  Not earned · stage not cleared로 표시한다. 클리어 후 Flawless를 놓치면 Eardrum was touched, Speed를 놓치면 par 기준 시간을 표시한다. 달성한 Speed는 실제 완주 시간과 목표 시간을 보여준다.
- 검증: 빌드 및 diff 검사 통과. 390×844 모바일에서 고막 파열 실패 결과를 재현해 두 목표 설명이 표시되고 카드 안에 잘리는 부분이 없는지 확인했다. 성공 결과의 두 분기 카피는 빌드와 기존 보상 데이터 구조로 확인했으며, 실제 클리어 플레이로는 검증하지 않았다.
- 스크린샷: 귀파기/.playwright-cli/page-2026-10-03T12-35-26-282Z.png.
- 다음: 정상 클리어 결과의 Flawless/Speed 달성 및 미달성 분기를 자연 플레이로 확인한다.


### 정상 클리어 분기 검증 현황
- 자동화 브라우저 입력으로 Stage 1을 자연 클리어하지 못했다. 시뮬레이션 시간은 진행됐지만 왁스 추출 입력이 안정적이지 않아 par 초과 상태에 도달했다. 이 결과를 정상 플레이 검증으로 계산하지 않는다.
- 결과 요약 helper는 mode가 STAGE가 아닐 때 null을 반환하므로 Boss/Endless 결과 UI에는 새 패널을 표시하지 않는다. 해당 모드의 기존 보상 경로도 수정하지 않았다.
- 성공한 Stage 결과는 실제 게임 플레이/리뷰 세션에서 확인할 필요가 있다. 세이브 주입이나 런 결과 강제 생성은 사용하지 않는다.

### 정상 클리어 분기 재시도와 인계 (2026-10-03)
- 프로덕션 preview에서 새 Stage 1 런으로 1회 재시도했다. 튜토리얼의 첫 조작 상태까지 확인했으나 자동 포인터가 Swab을 왁스에 안정적으로 붙이지 못했다. 타이머는 2:01까지 진행되어 62초 Speed 목표를 넘겼고, 0/5 추출 상태였다. 이번 런은 성공/보상 검증이 아니다.
- 현재 튜토리얼 오버레이와 실제 입력 타이밍이 함께 있어 자동 좌표 입력으로 정상 클리어 결과를 재현하기 어렵다. 세이브 데이터, 저장소, 런 결과는 조작하지 않았다. 브라우저와 preview는 종료했다.
- 결과 목표 요약의 코드상 판정/지급 매칭, 빌드, 실패 결과 모바일 렌더, STAGE 외 모드 가드는 확인되어 있다. 성공 분기 실렌더만 미확인이다.
- 다음 작업: 성공 결과 렌더 확인은 실제 플레이 검토로 이관하고, 기존 보너스 HUD/결과 UI 변경의 영향 범위를 읽기 검토한 뒤 계획 우선순위상 다음 시제품 단계(짧은 게임 상태 피드백)를 대상으로 한다. 새 효과를 추가하기 전 저사양 효과 토글 경로를 확인한다.

### 저효과 모드의 회수 파티클 조정 (2026-10-03)
- 회수 시 일반 파티클을 14→5개, 금색/파편 스파크를 10→3개로 낮췄다. 전체 효과 모드는 기존 개수를 유지하고 점수 팝업, 콤보 표시, 사운드는 유지한다.
- 변경 파일: `src/game/GameScene.ts`의 `collect` 한 곳. 기존 저효과 모드 플래그를 재사용했고 설정/세이브 형식은 건드리지 않았다.
- 검증: `npm run build` 성공(tsc 및 Vite production build), `git diff --check` 통과. 실제 회수 화면에서 저효과 모드를 켠 런타임 비교는 아직 미실시다.
- 다음: 기존 변경 전반의 회귀 범위를 읽기 검토하고, 다음 시각 피드백 시제품을 선택한다. 모바일 회수 반응과 저효과 모드 비교는 자연 플레이 세션에서 함께 확인한다.

### 저효과 토글 회귀 검토 (2026-10-03)
- 보너스 HUD/결과 요약은 STAGE 전용이며 기존 결과 보너스 배열을 사용한다. `finishRun` 1회 가드와 광고 후 재개 중복 방지도 코드상 확인했다.
- 저효과 안내와 실제 효과 사이 불일치를 수정했다: 카메라 flash/shake와 클리어 폭발 파티클은 lowFx에서 생략. 초기 생성 크럼블 6→2, 일반 회수 크럼블 14→5, 금색 스파크 10→3, 보스 파쇄 크럼블 26→12 및 스파크 8→4, 보스 파편 방출 16→4, 일반 균열 해제 10→4.
- 저장 데이터와 모드 판정/보상 로직은 수정하지 않았다. 플래시·흔들림 대신 배너, 콤보/점수 텍스트, 소리는 남는다.
- QA 조사: 무료 debug/unlock 경로 없음. EarsTab의 잠금 귀 해금은 재화 소비와 선택 귀 저장을 수행하므로 실행하지 않았다. 아바타로 색 계열만 볼 수 있고 Phaser 게임 팔레트/왁스 비교는 불가능하다.
- 검증: 마지막 편집 후 `npm run build` 성공(tsc + Vite, dist 1.587MB), `git diff --check` 통과. 모든 카메라 `flash`/`shake` 호출이 lowFx guard에 있는지, 파티클 방출량이 모드별로 나뉘는지 정적 검색 완료. 브라우저 실렌더 비교는 아직 하지 않았다.
- 다음: 저효과 모드 런타임 비교는 자연 플레이 세션에서 수행한다. 특수 귀와 금색/경화 왁스 비교는 자연 해금 또는 안전한 격리 QA 경로가 생긴 뒤 진행한다.

### 콤보 연결 시간 피드백 시제품 (2026-10-04)
- HUD 콤보 칩에 6초 연결 창의 남은 비율을 얇은 내부 막대로 표시한다. 새 `HudState.comboWindow`는 기존 `comboTimer / 6` 값이며, 0 도달 시 기존 콤보 리셋 로직과 함께 칩도 사라진다.
- 좁은 모바일 HUD 폭을 늘리지 않도록 막대는 기존 칩 배경 안에 겹쳐 그린다. 콤보·점수·보상 판정은 변경하지 않는다.
- 검증: `npm run build` 성공(tsc + Vite, dist 1.588MB). 실제 플레이/모바일 렌더 비교는 미실시다.
- 다음: 폭 390px HUD에서 겹침/잘림을 확인하고, 실제 조작에서 막대 감소·콤보 리셋 타이밍을 검증한다. 저장 진행도를 건드리지 않는 별도 QA harness가 가능한지 검토한다.

### 개발 전용 HUD 미리보기 검증 (2026-10-04)
- `/?qa=hud` 화면으로 개발 세션에서만 HUD를 표시한다. 콤보/시간 버튼은 로컬 React state만 변경하며 정상 게임 `App`은 lazy import로 미리보기 때 로드되지 않는다.
- 1280×720 및 390×844에서 콤보 HUD를 확인했다. 3초에서 절반, 1초에서 약 1/6 표시로 감소하고 콤보 0에서 사라진다. 모바일 화면 잘림·겹침은 관찰되지 않았다.
- 캡처: `output/playwright/hud-desktop.png`, `output/playwright/hud-mobile.png`, `output/playwright/hud-mobile-1s.png`.
- `npm run build`, `git diff --check` 통과. production bundle에서 preview 문구가 빠진 것 확인. 실제 게임 콤보 판정/만료 타이밍은 별도 미검증.
- 다음: 결과 요약도 같은 비저장 미리보기 경로로 모바일 분기 확인하거나, 실제 플레이 세션에서 게임 타이머와 HUD 값을 대조한다.

### 결과 목표 카드 미리보기 검증 (2026-10-04)
- 목표 요약의 실제 렌더 코드를 `StageGoalSummary`로 분리해 운영 화면과 개발 미리보기가 공유한다.
- `/?qa=result`에서 실패, Flawless only, Speed only, 두 목표 달성 네 분기를 390×844에서 확인했다. 320×568에서도 세로 스크롤 후 보상 합계까지 볼 수 있고 가로 잘림은 관찰되지 않았다.
- 캡처: `output/playwright/result-failed-mobile.png`, `result-flawless-mobile.png`, `result-speed-mobile.png`, `result-both-mobile.png`, `result-both-small.png`, `result-both-small-bottom.png`.
- 미리보기는 로컬 상수/React state만 쓰며 저장소를 읽거나 쓰지 않는다. production 번들에서 `DEV RESULT PREVIEW` 문자열이 없음을 확인했다. 기존 meta CSP `frame-ancestors` 안내 외 콘솔 오류는 없었다.
- 검증: `npm run build` 및 `git diff --check` 통과. 실런 성공 보상 지급은 실플레이 결과를 만들지 않았으므로 기존 정적 대조를 넘는 검증은 하지 않았다.
- 다음: Endless 구간 이벤트 1개를 소규모로 설계하거나 자연 플레이 실세션에서 보상/콤보 연결을 검증한다.

### Endless Golden Vein 시제품 (2026-10-04)
- 3의 배수 깊이에 도달하면 `GOLDEN VEIN INCOMING!`을 알리고, 다음 Endless 스폰 1개를 잡기 쉬운 비고정 Gold 덩어리로 바꾼다. 위치 범위는 x=240..620으로 제한한다.
- 새 덩어리를 추가하지 않고 예정된 스폰 1개를 치환해 막힘 유입 속도는 높이지 않는다. 기존 Gold 배수/물리/회수/점수 계산을 재사용하며 저장·보상 규칙은 바꾸지 않는다. 배치 실패 시 pending 표시를 보존해 다음 스폰에서 재시도한다.
- 변경 파일: `src/game/GameScene.ts`.
- 검증: `npm run build` 성공(tsc + Vite, dist 1.591MB), `git diff --check` 통과. depth 3/6/9 예약, 다음 성공 스폰에서 pending 해제, 일반 스폰 경로 보존을 코드로 대조했다. 12회 이상 추출이 필요한 자연 플레이 런타임 연출은 미검증.
- 다음: Endless 실제 플레이에서 레벨업 직후 이벤트 문구, 금색 외형/위치, 추출 난이도와 막힘 흐름을 확인한다. 이벤트를 통과한 뒤에만 추가 변주를 결정한다.

### Endless Golden Vein 실플레이 확인 시도 (2026-10-04)
- 별도 브라우저 세션에서 무한 모드 2판을 실제 포인터/클릭 입력으로 진행. 가짜 결과/세이브 주입은 하지 않았다.
- 두 판 모두 추출 4개, Lv.1에서 종료: 첫 판은 통로 막힘, 둘째 판은 고막 파열. Lv.3 황금 광맥 배너/스폰은 확인하지 못했다.
- 기본 Micro Swab 세션이라 Sonic Vacuum 에너지 바가 잠겨 있었다. 코드상 벽 접촉은 긁힘 소리만 내며 에너지/고막 체력을 차감하지 않는다. 고막 체력은 고막 접촉 및 근거리 진공/진동 공명에서 감소한다. 벽 접촉 단독 동작은 이번에 분리 검증하지 않았다.
- 다음: 일반 조작으로 12개 회수해 Lv.3에 도달하고 이벤트/Gold 외형·추출·막힘 변화를 확인한다. 실제 플레이 전에 막힘 속도와 기본 도구 난이도도 관찰한다.

### 첫 30초 선택 훅 시제품 (2026-10-04)
- 첫 단계가 일반 덩어리만 반복하는 문제를 보완하려 Stage 1에 고막 옆 보너스 Gold 1개를 추가했다. 기존 목표 5개를 유지해 일반 왁스 경로 또는 고위험 Gold 경로를 선택할 수 있다.
- 브리핑은 보너스가 선택 사항이고 고막을 피해야 한다고 알린다. 게임 시작 후 잠깐 `BONUS GOLD BY THE DRUM · 3× WAX` 배너가 뜬다. 골드 보상/고막 위험 공식을 변경하지 않았다.
- 검증: `npm run build` 성공, `git diff --check` 통과. 새 브라우저 저장 세션에서 Stage 1 브리핑 옵션 문구와 실행 화면을 확인했다. Gold 회수 및 결과 점수 차이는 미검증.
- 확인 필요: UI 시작 클릭 직후 HUD에 `Chunks 1/5`가 떠 첫 클릭이 게임 입력으로 전파되는지 조사한다.
- 다음: 첫 30초 직접 플레이로 Gold 위치 가시성, 선택 체감, 시작 입력 격리를 확인하고 그 결과에 따라 다음 훅을 설계한다.

### 통로 벽 접촉 피해 (2026-10-04)
- 도구 끝이 벽에 닿은 채 움직이면 공통 Ear health가 속도·감도에 따라 감소한다(최대 5 HP/초). 아주 느린 스침도 낮은 피해를 받는다. 벽 스침은 콤보를 끊고 `Wall scrape!` 문구를 보여준다. 고막 충돌은 더 큰 즉시 피해로 남는다.
- HUD와 결과 목표 문구를 Ear health / no ear damage로 정리했다. 벽 피해로 체력이 0이면 별도 WALL 실패 사유를 보여준다. 진공 전력은 별도 유지.
- 별도 저장 세션에서 실제 포인터로 벽을 따라 이동했을 때 건강 100%→84%, Wall scrape 알림을 확인했다. 첫 확인에서 벽 피해가 고막 플래시를 켜는 시각 연결을 발견해 제거했다.
- 최종 변경 뒤 `npm run build` 및 `git diff --check` 통과. 플래시 분리 후 화면 재캡처는 미실시.
- 다음: 짧은 스침 피해 밸런스 및 직접 고막 충돌과의 상대 피해를 손 조작으로 재확인한다.

### Stage 1 대형 귀지 플러그 (2026-10-04)
- Stage 1 일반 덩어리 하나를 큰 고정 플러그로 바꿨다. 더 오래 긁으면 균열/부스러기가 나고, 제거 완료 시 일반 조각 3개로 분리된다. 각 조각 회수까지 해야 하며 목표는 파괴 시 5→7로 늘어난다.
- 대형 금색 질감, 플러그 고유 텍스처와 균열, 채굴 중 부스러기, 분리 사운드/파티클/안내를 더했다. Stage 1 파 타임을 90초로 조정했고 브리핑에 조작 목표를 썼다.
- `npm run build` 성공(Vite 번들 1.593MB), `git diff --check` 통과. 별도 브라우저의 Stage 1 브리핑 및 균열형 플러그 렌더를 확인했다. 자동 포인터의 좌표 보정/손떨림 때문에 실제 파괴와 조각 회수는 이번 런에서 확인하지 못했다. `frame-ancestors` meta CSP 안내 1건은 브라우저에서 확인.
- 다음: 손 조작으로 플러그를 깨고 목표 증가, 조각 3개 개별 회수를 확인한다. 실제 체감에 따라 스테이지 제한시간 및 벽 여유 간격을 밸런싱한다.

### 대형 플러그의 실제 점진 축소 (2026-10-04)
- 피드백 확인: 직전 빌드에는 금 간 고정 크기 스프라이트만 있었다. “긁을수록 덩어리 자체가 작아지는 느낌” 요구는 아직 구현되지 않았었다.
- 수정: 채굴 HP 진행도에 따라 스프라이트를 최대 50% 축소. Matter 충돌체 및 게임 판정 반경도 같은 비율로 단계 축소. 그 뒤 기존 3조각 분리 루프 실행.
- 변경 파일: `src/game/GameScene.ts`, `src/game/MicroPhysics.ts`.
- 검증: `rtk npm run build` 통과(tsc + Vite, dist 1.59339MB), `rtk git diff --check` 통과. 실플레이 크기 변화는 아직 확인하지 않았으므로 다음 수동 플레이에서 점검.

### 대형 플러그 실제 조작 확인 (2026-10-04)
- 별도 새 브라우저 세션에서 실제 마우스 입력으로 Stage 1을 진행했다.
- 이미지 대조에서 채굴 도중 플러그가 축소되는 것을 확인. 플러그 제거 시 `Chunks 0/5`가 `Chunks 0/7`로 변경되고, 세 조각 분리 후 회수 입력으로 1/7 및 3/7까지 증가했다.
- 스테이지 전체 클리어는 하지 않았다. 자동화된 빠른 이동은 벽 피해(건강 100%→94%)를 유발했고 Speed lost였다. 자동 세션 타이밍은 인간 플레이 난이도/밸런스 지표로 취급하지 않는다.
- 캡처: `output/playwright/earwax-plug/01-before.png`, `02-partially-scraped.png`, `03-fractured-target-7.png`, `04-three-pieces-extracted.png`.
- 다음: 사용자 손 조작으로 90초 제한 달성 가능성, 조준성과 벽 피해 밸런스를 확인하고 조정한다.

### Expedition 8 → 12 단계 확장 (2026-10-04)
- Stage 9–12 추가: Plugged Passage, Whispering Furstorm, Resonant Drift, Tympanic Core. 점점 높은 덩어리 회수 수와 고정률/털/재채기/중력 흔들림을 사용한다. Stage 9와 11은 대형 플러그 1개, Stage 12는 2개를 포함한다.
- `STAGE_COUNT=12`; 진행 표시, 선택 슬롯, 다음 단계 해금 및 최대 진행 clamp가 상수를 참조한다. 기존 8단계 완료 세이브는 손대지 않아 다음 단계 9를 열도록 동작한다. Stage 12 완료 Milestone 1000 wax 추가.
- 빌드와 diff 검사 통과. 별도 브라우저에서 Progress 0/12 및 stage 선택 버튼 12개를 확인했다.
- 다음: 새 스테이지들을 자연 해금 후 플레이하며 난이도 곡선과 플러그 중복 횟수를 밸런싱한다.

### 보스 3회 균열 패턴 구분 (2026-10-04)
- 요청에 맞춰 12단계 캠페인 확장 이후 수동 밸런스 점검은 보류하고 다음 콘텐츠로 이동.
- 반복되던 Boss 균열에 강도 곡선 추가: 1차 뒤 가벼운 sway/8초 flinch, 2차 뒤 강한 sway/5.5초 flinch. 각 단계 배너로 pulse 경고. 보스 외곽 링은 균열에 따라 굵어지고 붉어짐. Boss가 깨진 뒤 조각 추출 구간에도 흔들림 적용.
- `rtk npm run build` 및 `rtk git diff --check` 통과. 저장 progression상 Boss 접근 조건이 필요해 실제 전투/조각 추출은 미검증.
- 다음: 보스 접근 가능한 저장 세션에서 패턴 경고/난이도 확인. 캠페인 9–12 난이도 조정은 별도 보류.
## 최종 목표와 완료 기준 (2026-10-04)
**최종 목표:** Poki 제출 전 검토 가능한 재미 있고 안정적인 게임. 첫 30초 안에 조작과 위험/보상 선택이 읽히고, 12단계 Expedition·보스·Endless가 반복 플레이 동기를 주며, 저장과 PC·모바일 핵심 루프가 유지된다.

**완료 기준:**
- 12단계 캠페인, 보스, Endless의 진입·진행·결과·보상 경로를 코드와 별도 브라우저에서 확인한다.
- Poki SDK 이벤트와 광고 생명주기를 공식 문서 기준으로 점검한다. 전면 광고는 자연스러운 중단 지점, 보상형은 명시적 선택에서 요청하며 광고 중 오디오/입력이 게임에 간섭하지 않아야 한다.
- 기존 저장의 진행/장착/재화를 보존하고, 사용자 브라우저의 현재 탭과 세이브를 검증에 사용하지 않는다.
- 빌드와 가능한 집중 검증을 통과한다. 사람 플레이 감각이 필요한 잔여 항목은 명시한다.
- 작은 계획→구현→검증 단위마다 이 계획서와 E:/solarena/state.md를 갱신한다. 외부 배포/되돌릴 수 없는 작업/사람 판단이 꼭 필요한 경우에만 질문한다.

### 자율 실험 기록 — 캠페인 다음 단계 이동
- STAGE_COUNT는 12였지만 다음 단계 버튼의 상한이 8로 고정되어 있었다. App.tsx에서 공용 STAGE_COUNT 상수를 사용하게 수정했다.
- 기존 세이브 변경 없음. `rtk npm run build` 성공(tsc + Vite, dist 1.59387MB), `rtk git diff --check` 통과.
- 검증 정정: 처음 접근한 `localhost:5173` 서버는 `E:\deep\escape` 소속이었다. 그 화면 관찰은 이 프로젝트 검증에서 제외한다. 현재 프로젝트 Vite를 5174에 실행해 HTTP 200을 확인했으나 Playwright 브라우저 프로세스가 로컬 포트 접속을 거부해 UI 확인은 미완료.
- 8→9 실 플레이는 테스트 세이브를 조작하지 않아 미실행. 상수 연결과 빌드는 확인했다.

### 자율 실험 기록 — 광고와 브라우저 입력 (2026-10-04)
- Poki/CrazyGames 광고 Promise timeout을 10~20초에서 60초로 늘려, 일반적인 광고 재생 중 게임이 먼저 재개될 가능성을 낮춤. 오디오 mute finally 흐름 유지.
- PlayScreen에서 플레이 중 Space/방향키와 wheel의 페이지 스크롤을 막도록 추가. 게임 키 입력은 전달한다.
- `rtk npm run build` 성공(tsc + Vite, dist 1.59410MB), `rtk git diff --check` 통과. 포털 실 광고와 실제 브라우저의 키/휠 검증은 남음.
- 다음: 격리 브라우저 경로나 Poki Inspector에서 광고/입력 동작 확인 후, 12단계·보스·Endless 핵심 루프 점검.
### 자율 실험 기록 — 재시작과 다음 단계 광고 순서 (2026-10-04)
- Poki 가이드의 자연스러운 중단 순서와 비교해 Retry, Next Stage, pause Restart 경로에서 `commercialBreak()`가 누락된 것을 발견.
- PlayScreen 공용 `continueAfterCommercial`로 세 경로를 감싸고 광고 대기 중 중복 시작/이탈을 막았다. Resume도 같은 busy 표시로 막는다.
- 검증: `rtk npm run build` 성공(tsc + Vite, dist 1.59438MB), `rtk git diff --check` 통과. 포털 실 광고, 브라우저 UI, mock 광고 오버레이는 미검증.
- 다음: 격리 브라우저를 확보해 이벤트 순서를 확인하고, 이어서 저장 보존·보스·Endless 핵심 흐름을 점검한다.

### 자율 검증 — 격리 브라우저 기본 흐름 (2026-10-04)
- 포트 문제를 피해 현재 프로젝트 Vite와 Playwright Chromium을 같은 호스트에서 구동했다. 비영속 브라우저 컨텍스트를 사용했으며 기존 브라우저 탭/세이브는 건드리지 않았다.
- 확인: Expedition 허브 Progress 0/12와 12단계, Stage 1 브리핑, 플레이 HUD, pause→mock ad overlay→resume→quit. Endless 진입/브리핑/Depth·Clog HUD/pause/quit.
- 모바일 390×844에서 가로 스크롤 없음(390px), pageerror 없음. meta CSP `frame-ancestors` 경고 1건은 남음.
- 별도 빈 프로필에서 Boss 잠금 UI 확인: 양 Phase 안내, Micro Tweezers 미소유 시 시작 비활성, Lab 링크 정상. 전투 자체는 잠금을 우회하지 않아 미검증.
- 미검증: 실제 클리어·Retry/Next Stage, 진짜 Poki 광고, Boss 전투/보상, 터치 조작·저효과 렌더링. 플레이 결과/진행도는 생성하지 않았다.
- 설정 검토: Stage 9 target 13 + plug 1(+2 조각), danger 3, flinch 8.6s, sway 0.42. Stage 12 target 16 + plug 2(+4 조각), danger 3, flinch 3.8s, sway 0.72. 고단계 난이도는 실제 플레이 밸런스 확인 전 변경 보류.
- `isMobile + hasTouch` 브라우저에서 pointer coarse/maxTouchPoints=1, 저효과 토글 상태, Grab/Hold 버튼 표시 확인. 390×844에서 가로 넘침 없음, pageerror 없음. 실제 터치 Hold 입력 효과 및 full/lowFx 렌더 차이는 별도 검증 필요.
- 다음: 터치 입력/저효과 시각 비교, 캠페인 후반부 자연 플레이 기록, 정상 해금 후 Boss 전투/보상 검증.

### 자율 실험 기록 — meta CSP 경고
- `<meta>` CSP에서 적용되지 않는 `frame-ancestors` 항목을 제거했다. 배포 서버의 HTTP framing header는 별도 책임이며 이 변경은 iframe 차단 동작을 바꾸지 않는다.
- 실제 Chromium 격리 컨텍스트에서 허브 표시 확인, console error 0 / pageerror 0. `rtk npm run build` 성공(tsc + Vite, dist 1.59436MB), `rtk git diff --check` 통과.
- 서버 응답 헤더와 Poki Inspector 상의 프레이밍/SDK 이벤트 검증은 제출 전 남음.

### 자율 실험 기록 — Poki 콜백 계약과 초기화 경합 (2026-10-04)
- 현재 공식 Poki HTML5 문서는 rewardedBreak 시작 인자를 callback function으로 예시한다. 어댑터의 options object 인자를 callback function으로 수정.
- SDK 초기화 내부 상한은 script 4s + init 5s인데 외부 전체 8s timeout이 더 빨리 반환해 `ready=false` 상태로 `gameLoadingFinished`를 놓칠 수 있었다. 바깥 timeout 제거, 내부 타임아웃 후 ready 상태에서 App의 loading event 완료 보장. timeout helper는 Promise가 먼저 끝나면 timer를 정리.
- Chromium 격리 컨텍스트 + mock Poki SDK에서 3.5s script / 4.8s init 지연 테스트. Loading event 누락 없음; startup 및 pause/resume 이벤트 순서 정상. rewarded callback function type, 광고 중 오디오 mute on/off, 방향키 scroll prevention 통과. localStorage 0/pageerror 0.
- `rtk npm run build` 성공(tsc + Vite, dist 1.59441MB), `rtk git diff --check` 통과. 실제 SDK/광고 delivery는 Poki Inspector에서 추가 확인 필요.

### 자율 실험 기록 — 포털 SDK 실패 fallback
- portal에서 SDK script 실패 시 전면광고 경로가 개발 mock overlay를 띄우던 차이를 수정. Portal은 광고 없이 계속 진행하고, mock은 일반 개발 호스트에서만 유지.
- 격리 브라우저에서 `?poki`/script abort 후 pause-resume은 fake ad 없이 완료; localhost에서는 mock overlay 여전히 사용. 빈 비영속 저장 컨텍스트, pageerror 0.
- `rtk npm run build` 성공(tsc + Vite, dist 1.59442MB), `rtk git diff --check` 통과. Live provider/Inspector 검증은 별도 필요.

### Stage 1 보너스 골드 선택 훅 확인 (2026-10-04)
- 시작 버튼만 누르고 아무 입력 없이 대기한 격리 브라우저에서 `Chunks 0/5`, 체력 100% 확인. 이전 기록의 자동 `1/5`는 재현되지 않음.
- 고막 앞 Gold가 일반 Gold와 같은 스프라이트라 선택 위험이 눈에 띄지 않아 Stage 1 보너스에 `3×` 배지를 부착하고 위험 청크의 빨간 글로우/외곽선을 강화. 배지는 청크 이동을 따라가고 제거 시 정리.
- 빌드(tsc + Vite) 및 diff 검사 통과. 캡처: `output/playwright/stage1-bonus-gold-risk.png`.
- 다음 실험은 자연 입력으로 플러그 3조각 목표 증가(5→7), 골드 선택 시 추가 목표/보상, 고막/벽 위험 피드백을 확인. 실제 선택 체감 데이터 전에 밸런스 변경은 보류.

### 보너스 골드가 필수 목표를 대체하는 오류 수정 (2026-10-04)
- `optional` 청크는 `Chunks` 필수 진행도에서 제외. Stage 1 보너스 Gold는 점수/wax 보상을 주지만 Stage 목표 5→7을 대신 채우지 않는다.
- 보너스 Gold를 상단 벽에 고정해 튜토리얼 패널에 가려질 확률을 없앴다. `3×` 표식과 붉은 위험 고리 화면 확인, `Chunks 0/5`, console error 0.
- 실제 접근 시도 1회에서 3초 이내 체력 100%→82%, 벽 긁힘 표시가 있었고 Gold 수집은 실패했다. 이를 근거로 보너스 위험 수치를 바로 바꾸지 않고, 다음 실험에서 회수 조작/피해량을 재확인한다.
- `rtk npm run build` 성공(tsc + Vite, dist 1.59486MB), `rtk git diff --check` 통과. 화면: `output/playwright/stage1-bonus-gold-risk.png`.
- 다음: 필수 플러그 파쇄·조각 회수 및 보너스 골드 별도 획득을 자연 입력으로 검증. 보상 시 필수 목표 카운트는 유지되어야 한다.

### 첫 실행 튜토리얼의 플레이 영역 가림 개선 (2026-10-04)
- 하단에 있던 첫 실행 안내가 떨어진 청크를 가려서 이를 상단 얇은 안내줄로 이동. 칩 레이블을 축약하고 390×844 세로 화면은 회전 권고 아래에 배치.
- 데스크톱 및 모바일 격리 브라우저에서 골드와 하단 청크 가림 없음, 안내문 겹침 없음, console error 0 확인.
- 캡처: `output/playwright/tutorial-overlay-desktop.png`, `output/playwright/tutorial-overlay-mobile.png`. Build와 diff check 통과.
- 자연 회수 재시도는 미완료. `Wall scrape!` 중 체력이 42%까지 하락해 과도한 체류 손상 가능성을 관찰 항목으로 남김. 다음: 정상 입력에서 추출 성공/목표 계산을 재확인하고 체력 손실 속도 판단.

### 3× 보너스 골드 자연 입력 회수 (2026-10-04)
- 새 격리 브라우저에서 코드를 건드리지 않고 연속 mouse hold+drag 입력으로 Gold를 출구 쪽으로 회수. 직후 Esc 정지, HUD 점수 530 / wax 53 / 체력 99% / `Chunks 1/5`; Stage는 계속됐다.
- 추출 경로가 필수 Gold도 지나쳤을 수 있어 `optional`이 카운트에서 빠진 런타임 단독 증거는 아니다. 코드상 필수 카운트는 `!optional` 조건에 있고, 골드만 통과하는 더 좁은 경로를 후속 확인한다.
- 앞서 기록한 HP 82%/42%는 개별 입력 시간이 아니라 CLI 호출 사이 벽 접촉 대기까지 포함했을 수 있어 짧은 조작 손상 측정으로 쓰지 않는다.
- 다음: 단일 보너스만 회수해 카운트 유지 확인 후, 대형 플러그 파쇄와 +2 필수 청크를 검증한다.

### Stage 1 보너스와 큰 플러그 런타임 진행 확인 (2026-10-04)
- 필수 청크가 아래쪽 벽에 있고 bonus Gold가 상단에 있는 판에서 Shift+hold 후 Gold만 지나는 경로로 실제 출구 회수. 점수 360 / wax 36 / 체력 98% / `Chunks 0/5`, Stage 계속. optional 보상은 필수 목표 수에서 제외됨.
- 큰 플러그를 Shift+hold로 18초 긁은 다음 `Chunks 0/7`, 체력 100%, 결과 화면 없음. 파쇄 후 필수 목표 +2가 런타임에서 확인됨.
- 두 흐름 모두 격리 브라우저, 실제 포인터/키 입력, 코드 상태 주입 없음, console errors 0.
- 한계: 파쇄 파편 3개의 화면 등장 및 개별 추출은 확인 전. 다음은 파편별 필수 카운트(0/7→3/7), 이어 Stage 전체 목표를 자연 입력으로 확인한다.

### Stage 1 첫 클리어 — 파쇄 목표와 보상 흐름 (2026-10-04)
- 격리 브라우저에서 실제 mouse/Shift 입력으로 Stage 1 플레이. 플러그 파쇄 시 필수 목표가 0/5→0/7, 이후 HUD 2/7→4/7→5/7→6/7→결과 7/7. 목표 증가와 전부 추출 시 클리어가 확인됐다.
- 결과: score 1,461, health 53%, 4:05, combo 2, Rank #6, Stage 2 unlocked, wax 150. Flawless는 귀 통로 접촉, speed는 목표 1:30 초과로 실패. 캡처 `output/playwright/stage1-first-clear-result.png`.
- 개별 파편과 주변 청크가 함께 움직여 파편 세 개의 카운트 기여를 따로 확정할 수 없다. 조각별 `0/7→3/7` 증거라고 과장하지 않는다. Stage 전체 `7/7` 클리어는 확인.
- 별도 격리 저장 프로필 및 자연 입력 사용. 사용자 브라우저/저장 데이터 미접촉. pause 재개 mock 광고는 개발 호스트 동작. console errors/warnings 0. 코드 변경이 없어 이번 회차 build 생략; 직전 코드 빌드 성공.
- 다음 실험: 이 격리 프로필에서 Stage 2 브리핑/HUD 진입, 초반 위험/목표 가독성 관찰, 자연 플레이로 Stage 2 진행. 별도 제출 전 Poki live SDK/광고 및 사람 재미 평가는 남는다.

### Stage 2 기믹 코드 점검과 다음 검증 조건 (2026-10-04)
- Stage 1 결과 화면에서 Stage 2 해금 확인 후 브라우저 세션을 닫았다. 새 브라우저 세션은 빈 프로필이어서 0/12·wax 60, Stage 2 잠금으로 시작했다. 진행도를 주입하거나 Stage 1을 반복하지 않았다.
- 당시 파악한 값은 목표 6, 위험 청크 1. hair는 전체 설정표 재실행 결과 2개로 정정. Gold/hard/plug/flinch/sway는 없다. 당시에는 stage 식별값이 `Canal`에 전달되지 않았고, 실험 16에서 Stage 2 굴곡을 추가했다.
- 이 차이는 이름과 체감이 어긋나는 고유성 후보지만 실화면 확인 전 수정하지 않는다. 정상 진행 세션에서 Stage 2 브리핑/캔버스/초반 위험을 먼저 확인하고, 뒤 단계도 이름별 기믹이 실제 차이를 만드는지 점검한다.
- Browser/서버 종료, 사용자 저장 미접촉, 이번 회차 코드 변경 없음. `rtk git diff --check` 통과; build 불필요.

### Stage 2 전용 굴곡 구현 및 검증 (2026-10-04)
- `StageParams.canalCurve` 도입. Stage 2 배율 1.8, 다른 단계와 Endless/Boss는 기본 1. `Canal.center()`가 이 값을 반영하므로 시각 벽과 물리 경계 모두 동일한 곡률을 사용한다.
- 격리 브라우저 모듈 비교(Human Ear, x=200/430/600): Stage 1 `[252,292,252]`; Stage 2 `[238,310,238]`. Stage 1 기본값 유지 및 Stage 2 곡률 변화 확인.
- 브라우저에서 Stage 1 briefing→game 시작 확인. `Chunks 0/5`, health 100%, localStorage 0. 캡처 `output/playwright/stage1-curve-regression.png`; console errors 0/warnings 0.
- `rtk npm run build` 성공(tsc + Vite, dist 1.59499MB), `rtk git diff --check` 통과. 실제 Stage 2 전체 런타임과 조작감은 해금된 자연 진행 세션에서 확인해야 함.
- 다음: 12개 단계의 목표/특수 요소 분포를 비교하고 이름과 실제 차이가 약한 다음 단계를 고른다. Stage 2 실플레이에서 굴곡 시인성과 벽 접촉을 검증한다.

### 12단계 기믹 분포 및 자동 점검 (2026-10-04)
- 실행 중인 Vite 모듈에서 `stageParams(1..12)`를 조회. Stage 1 plug/선택 Gold; Stage 2 curve 1.8/hair 2/danger 1; Stage 3 hair 3/Gold 1/danger 2; Stage 4 hard 1 추가; Stage 5 flinch 15s 시작; Stage 6 hard 2/Gold 2/danger 3; Stage 7 sway 시작; Stage 8은 기존 요소 강도/목표 증가만; Stage 9 plug 1; Stage 10은 신규 요소 없이 기존 위험 강도 상승; Stage 11 plug 1; Stage 12 plug 2.
- 차별화 후보 Stage 8/10을 표시. stage name이 다른데 고유한 조작/시각 훅은 코드만으로 확정하지 말고 자연 플레이 화면에서 점검 후 결정.
- 보안 자동 점검: 키워드 검색은 `package-lock.json`의 `js-tokens` 이름만 일치, 시크릿 값 발견 없음. `rtk npm audit --omit=dev`는 0 vulnerabilities; 전체 audit는 5건(4 high/1 low), 개발 도구 Vite 7.3.2, esbuild 0.27.7 및 `vite-plugin-singlefile → micromatch → braces@3.0.3`에서 발생. [Vite UNC](https://github.com/advisories/GHSA-v6wh-96g9-6wx3), [Vite path deny](https://github.com/advisories/GHSA-fx2h-pf6j-xcff), [esbuild](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr), [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) 공식 advisory 검토. braces는 취약 ≤3.0.3, 2026-10-02 기준 patched version 없음. `npm audit fix --dry-run`은 변경을 적용하지 않았으며 force 옵션에 breaking Vite plugin downgrade 및 Vite range 이탈을 표시했다.
- `AGENTS.md` 사용자 지침은 package/lock/config 변경에 명시 승인을 요구한다. 의존성 파일은 미수정. Poki 제출 전 보안 검토를 통과할 때까지 배포하지 않는다. 수정 권한을 받은 뒤 안전한 업데이트/대체안을 분리해 빌드와 audit을 재검증한다.

### Stage 8 좁은 협곡 및 기믹 표시 (2026-10-04)
- Stage 8만 `canalWidth=0.9`; `Canal.halfH()`에 반영해 표시 형상과 충돌/도구 경계 모두 10% 축소. 다른 단계, Boss, Endless 기본 폭 유지.
- Stage 선택 정보에 Stage 2 `Winding canal`, Stage 8 `Narrow passage` 칩 추가.
- 빈 격리 브라우저에서 형상 비교: Human Ear의 x=200/430/600 통로 폭 Stage 1 `[216,156,194]`, Stage 8 `[194,140,175]`; 총 면적 비율 0.9. 이건 geometry calculation 확인이며 Stage 8 플레이 테스트는 아님.
- Stage 1 실제 격리 시작 회귀: `Chunks 0/5`, health 100%, localStorage 0, console error/warning 0. 캡처 `output/playwright/stage8-width-regression.png`.
- `rtk npm run build` 성공(tsc + Vite, dist 1.59520MB), `rtk git diff --check` 통과. 사용자 브라우저/저장 데이터 미접촉.
- Stage 8의 고밀도 chunk 배치/실제 위험/모바일 저효과는 정상 해금 run에서 확인해야 한다. 다음 코드 점검: Stage 10의 이름 `Whispering Furstorm`이 오디오·시각 효과에 독자적으로 반영되는지 확인.

### Stage 10 속삭임 바람 사운드 추가 (2026-10-04)
- Stage 10 `whisper=0.6`, 다른 모드는 0. 새 pink-noise loop를 bandpass 1,250Hz/Q0.45 + highpass520으로 통과시키고, stage pulse에 따라 필터 중심을 천천히 이동. 최대 gain은 `level×0.08`, master bus를 거쳐 mute/ad mute 적용.
- MissionTab에 `Whispering wind`를 사전 안내하는 feature pill 추가.
- 격리 Chromium AudioContext 실행 확인. loop 생성, stage10 intensity 0.6 / stage1 0, function call spy에서 active gain target 0.048 및 filter target 예약, zero 입력 시 gain target 0 예약. localStorage 0.
- Stage 1 UI smoke: `Chunks 0/5`, health100%, console error/warning0. 캡처 `output/playwright/stage10-audio-regression.png`. `rtk npm run build` 성공(tsc + Vite, dist 1.59575MB), `rtk git diff --check` 통과.
- Stage 10 실제 플레이와 주관적 청취/피로도 검증은 자연 해금 run에서 필요. 포털 배포 의존성은 0 vulnerabilities; 개발 의존성 5건은 이전 섹션 참조 및 승인 대기.

### 모바일 실제 터치 검증 — Stage 1 격리 세션 (2026-10-04)
- iPhone 15 Playwright device profile: viewport 393×659, `ontouchstart`, `maxTouchPoints=1`, 문서 가로폭 393px. 터치 입력 중 가로 overflow 없음. 세로 모드 회전 권유는 노출.
- Start 버튼의 진짜 touch pointer로 Stage 1 진입. Hold 버튼 touch-and-hold 동안 breath gauge 약 2/3로 줄고, release 뒤 회복. 사용자 저장은 localStorage 0.
- Grab 버튼을 한 손가락으로 유지하며 다른 손가락으로 캔버스 터치 드래그: 캔버스 pointerdown/move/up 수신 확인. 이번 경로에서는 HUD `Chunks 0/5` 그대로, health 100%; 추출 미확인. 접촉한 청크 stuck 여부/Grab state 전달을 분리하기 전 기능 실패로 단정하지 않는다.
- Console errors/warnings 0. 캡처 `output/playwright/mobile-touch/touch-hold-breath.png`, `output/playwright/mobile-touch/mobile-touch-drag-trial.png`. 5174/browser 닫음, 5173 미접촉.
- 다음 실험은 비고정 청크를 골라 터치 hold→pickup→exit까지 단계별 계측한다. 회수가 계속 안 되면 모바일 touchGrab과 Phaser activePointer 연결을 조사/수정한다. low-FX mobile 비교도 필요.

### 모바일 저효과 모드 실험 (2026-10-04)
- 실제 iPhone 15 터치 입력으로 설정을 켜 UI 제목과 격리 저장값 lowFx=true를 확인했다. Stage 1 HUD에 Chunks 0/5, health 100%, Hold/Grab 입력이 표시됐다.
- viewport 393×659, 문서 scrollWidth 393으로 가로 넘침 없음. 세로에서는 landscape 회전 안내가 나타난다. 콘솔 errors 0 / warnings 0.
- 캡처: output/playwright/mobile-lowfx/stage1-lowfx.png. 격리 프로필만 사용했고 사용자 save는 보존했다.
- 회수 조작은 검증하지 않았다. 다음 단계는 청크 하나의 hold → 이동 → exit 통과를 분리 검증하고, 실패 시 입력 연결을 추적하는 것이다. Stage 8/10 실플레이는 정상 잠금 해제 진행 전까지 보류한다.

### 모바일 한 손가락 회수 입력 (2026-10-04)
- GameScene이 캔버스의 touch pointerdown/up을 grab 상태에 연결했다. Grab 버튼도 그대로 동작한다.
- 실제 iPhone 15 격리 플레이에서 Stage 1 회수 1/5 → 2/5, 점수 +80 확인. 콘솔 오류/경고 없음. 한 손가락으로 화면을 눌러 청크에 접근한 뒤 exit까지 끌 수 있다.
- 체력 100% → 94%로 감소했다. 시도 경로가 아래쪽 벽 가까이 지나가 안전 경로는 미검증. 다음은 중앙으로 끌어 벽 피해를 줄일 수 있는지 확인한다.
- 캡처: output/playwright/mobile-lowfx/onefinger-drag-result.png. 빌드 성공, diff 검사 통과. 테스트 프로필만 사용.

### Poki 제출 점검과 광고 중단 검증 (2026-10-04)
- Poki SDK 외 광고 provider 경로와 CSP 호스트를 제거했다. 포털 밖에서만 개발용 광고 mock을 허용한다.
- 격리 mock SDK에서 first input → gameplayStart 단 1회, pause → gameplayStop, resume → commercialBreak → 광고 Promise 완료 뒤 gameplayStart 순서를 확인했다. Promise 대기 중 Paused 화면과 입력 정지 상태를 유지한다.
- 배포 빌드 성공, production dependency audit 0 vulnerabilities. 전체 npm audit은 개발 의존성 5건(High 4, Low 1)으로 실패한다. root package/lock/config는 AGENTS 경계로 건드리지 않았다.
- 남은 공식 점검: 실제 Poki Inspector, 광고 제공 환경, 모바일 태블릿 회전/viewport, 인코그니토 저장, 전체 12 stage의 목표와 보상 hierarchy.
- 다음: Stage 1~12 기믹 구성과 추출·피격 난이도를 데이터 표로 비교하고, 반복 숫자 상승에 그치는 구간을 고유한 오디오/게임플레이 텔레그래프와 상호작용으로 보강한다. 이어 result/reward flow와 실제 저장 없이 우회 가능한 검증 경로를 확인한다.

### Stage 12 Tympanic Core 고유 기믹 (2026-10-04)
- Stage 12 전용 `corePulse`를 추가했다. 첫 파동 12초 전부터 카운트다운하고, 2초 전 경고 배너/이중음/청록 링을 표시한다. 파동은 매 22초마다 발생한다.
- 파동은 풀린 왁스를 왼쪽 출구 방향으로 밀어내는 짧은 정리 기회다. 붙은 왁스와 잡고 있는 왁스는 영향을 받지 않는다.
- 빌드와 격리 Stage 1 진입이 통과했다. 설정 확인은 Stage 12에서만 활성인 것까지 검증했지만, Stage 12 진행은 잠겨 있어 실제 파동은 아직 체험하지 못했다.
- 다음: 정상 진행으로 Stage 12가 해금되면 파동 속도/빈도와 16개 목표의 플레이 템포를 직접 평가한다. 남은 Stage 1~12 목표 차별화, 모바일/태블릿과 결과 보상 흐름을 이어서 점검한다.

### Poki 결과 선택지와 전면 광고 위치 (2026-10-04)
- 실패 결과에서 일반 Retry를 광고 보상 CTA보다 위로 올리고, 같은 전체 너비로 표시한다. Stage 1~11 클리어에서는 전체 너비 `Next stage`가 일반 계속 선택지로 reward 위에 남는다. rewarded 버튼은 🎬 및 비녹색 스타일을 유지한다.
- `commercialBreak()`는 결과 화면 Retry/Next stage에서 호출하지 않는다. 최신 Poki Requirements의 “pause를 나가 gameplay로 돌아갈 때만” 지침에 맞춰 Resume과 Pause→Restart에서만 호출한다. SDK overview 이벤트 표와 이 규칙의 예시가 서로 달라, 실제 Inspector 확인 항목으로 남긴다.
- `npm run build`/TypeScript 및 `git diff --check` 통과. CLI 검색으로 `commercialBreak` 호출이 pause 전이 함수 두 곳으로 제한됨을 확인.
- 다음: pause/resume/restart 및 결과 retry/next/rewarded revive SDK event를 mock Inspector로 순서 검증한다. 이후 모바일 태블릿 강제 터치·전체화면, 저장 인코그니토, 실제 Poki Inspector를 단계적으로 닫는다.

### Poki 광고 전이 mock 검증 (2026-10-04)
- 격리 프로필 localStorage 0에서 SDK mock으로 Pause Resume/Restart와 실제 실패 결과를 확인했다. Pause Resume/Restart는 `stop → commercialBreak → start`; result Retry는 `stop → start`로 전면광고 호출 없음.
- Reward Revive mock 성공은 `rewardedBreak → start`; 실패는 보상/재시작 없이 결과 화면 유지. `gameplayStart/Stop` 연속 중복 없음.
- 실패 화면 Retry와 rewarded Revive가 같은 크기 470×44 px, 같은 전체 폭으로 배치되고 일반 Retry가 먼저 나온다. Reward CTA는 🎬 핑크색. 개발 bundle build/production audit/diff check 통과, 콘솔 오류/경고 0.
- 실제 stage clear→Next stage UI 런타임은 진행도 주입 없이 이번에 만들지 못했으며, 코드상 전면광고 없이 새 Stage를 시작한다. 실제 Poki 광고/Inspector, Stage12의 잠금 해제 후 파동은 남아 있다.
- 다음: Poki의 mobile/tablet 하드 요구사항 검수. 16:9 전체화면·태블릿 터치 제어를 검증하고 회전 권유만으로 충족하지 않는 조건을 필요한 경우 구현한다.

### 태블릿 터치 입력과 landscape 전체 높이 (2026-10-04)
- `useIsTouch`가 primary pointer coarse만 보던 문제를 수정했다. `navigator.maxTouchPoints`와 `any-pointer: coarse`도 지원해 트랙패드/마우스가 우선인 touch tablet에서도 버튼을 띄운다.
- touch landscape에서는 play canvas를 y=0부터 viewport 높이 전체까지 사용하고 HUD를 상단 overlay로 둔다. 16:9 canvas fit은 유지한다.
- iPad-like 844×390 격리 에뮬레이션(`maxTouchPoints=5`, 두 pointer media query false): Grab/Hold 버튼 표시, overflow 없음, canvas 693×390. 이전은 canvas 601×338.
- iPhone-like portrait 393×659에서는 rotate 안내, canvas 393×221, touch controls와 overflow 없음. Portrait gameplay 자체는 지원하지 않고 landscape를 안내한다.
- Build/TypeScript와 `git diff --check` 통과, console errors/warnings 0, 시작 localStorage 0. 사용자 5173/save untouched.
- 다음: Poki 요구의 incognito 저장을 실제 localStorage 제한 상태에서 확인하고 clean production artifact에서 테스트/dev 경로와 허용되지 않은 외부 요청을 검사한다. 실제 tablet hardware/portal Inspector는 남아 있다.

### 인코그니토 저장소 접근 차단 (2026-10-04)
- 격리 browser init script로 `window.localStorage` getter를 SecurityError로 만들었다. 저장소 length 0, 허브 및 Stage 1 플레이 HUD 진입 성공, 콘솔 errors/warnings 0.
- storage write를 사용할 수 없으므로 진행 저장은 되지 않지만 세션 플레이는 가능하다. 실제 사용자 save는 건드리지 않았다.
- `store.ts` load/save의 try/catch 및 crash cleanup 보호가 런타임에서 동작함을 확인했다.
- 다음: 실제 production artifact에 dev HUD/result preview와 test route가 들어가지 않는지, Poki가 차단하는 외부 네트워크 의존성이 없는지 검사한다. 이어 current Poki Inspector 제출 패키지 점검.

### Poki 정적 썸네일 초안 (2026-10-04)
- `output/poki/earwax-miner-thumbnail-static.png`를 만들었다. 실제 플레이의 분홍 통로·큰 금색 plug·면봉 scrape 순간을 보여주는 텍스트 없는 full-bleed 정사각형 구성이다.
- 검사: System.Drawing 1254×1254px, 1.62MB. 공식 기준 628×628 이상/1:1/무문자 구성 충족.
- 공식 animated thumb는 1080×1080+, 50fps+, 4–6초, muted MP4, 100MB 이하, 2–3 gameplay shots가 필요하다. [공식 가이드](https://developers.poki.com/guide/your-game-page).
- 다음: static art에서 일관된 animated thumbnail을 만들고 해상도/fps/duration/audio/file size를 검사한다. 이후 Poki upload/Inspector는 아직 하지 않는다.

### Production 빌드 Poki 이벤트 확인 (2026-10-04)
- production preview에서 첫 입력과 Pause→Resume을 실제 UI로 진행했다. mock SDK 이벤트는 `loadingFinished → gameplayStart → gameplayStop → commercialBreak → gameplayStart`; 콘솔 오류/경고 0건.
- 5174 preview와 격리 브라우저 종료. 사용자 5173은 PID 40472의 `E:\solarena\달리기\...\vite.js`로 확인되어 그대로 유지했다. 이전 메모의 PID 36444는 갱신 전 PID였다.
- 다음: Poki 제출 자산/animated thumbnail 경로와 단계별 최종 플레이 요구사항을 계속 확인한다. Poki Inspector/실기기 테스트와 animated thumbnail은 미완료.

### Poki 썸네일 정합성 및 애니메이션 후보 (2026-10-04)
- 공식 [Your game page](https://developers.poki.com/guide/your-game-page), [Game thumbnail](https://developers.poki.com/guide/game-thumbnail)을 재확인: 영상 1080×1080+, 50fps+, 4–6초, 무음 MP4, 100MB 이하, gameplay 중심 2–3장면, 커서 제거·최소 UI. 정적은 628×628+ 정사각 full-bleed, 게임 실제 비주얼과 일치해야 한다.
- 실제 Stage 1 플레이 캡처를 기준으로 정적 후보를 다시 제작했다. 구 정적은 `earwax-miner-thumbnail-static-concept-v1.png`로 보존. 새 정적 후보 `output/poki/earwax-miner-thumbnail-static.png`는 1254×1254 PNG이며 화면 아트의 분홍 통로/금색 갈라진 왁스/흰 면봉 색과 형태를 맞춘다.
- 격리 브라우저에서 게임을 UI로 시작해 마우스 이동/접촉을 직접 녹화했다. 저장 데이터나 진행도 주입 없음. 녹화 샘플에서 큰 왁스가 면봉 접촉 뒤 작아지는 프레임을 관찰했으나 스테이지 클리어는 하지 않았다.
- `output/poki/build_animated_thumbnail.py`가 정적 artwork 줌→중앙 gameplay→scrape 근접의 3장면 MP4를 생성한다. ffprobe: H.264, 1080×1080, 50fps, 5.02초, 무음, 620,038 bytes. 샘플 contact sheet에서 영상 구성과 중앙 액션을 육안 확인했다.
- 다음: 현재 영상/정적을 Poki hover 프리뷰 또는 제출 도구에서 확인할 수 있을 때 최종 검토한다. 이어 실제 Poki Inspector, 광고 SDK, 전체 캠페인/보스/Endless 자연 플레이 검증을 진행한다.

### 현재 Poki 광고 이벤트 요구사항 재대조 (2026-10-04)
- [Requirements](https://developers.poki.com/guide/requirements-quality)의 hard requirement는 commercial break를 Pause에서 gameplay로 재개할 때만 허용한다. [SDK overview](https://developers.poki.com/guide/sdk-overview)의 예시 순서표에는 다음 레벨/사망 재시작에도 commercial break가 있어 두 페이지가 충돌한다.
- 코드의 상업 광고 호출은 Pause→Resume/Restart 두 곳에만 있고, 결과 진입 시 `gameplayStop`, 재시작/다음 단계에 `gameplayStart`가 이어진다. 하드 요구사항을 우선해 유지했다. 실제 Poki Inspector 및 광고 콜백 검증은 미완료.

### 첫 입력 튜토리얼 조건/보상 경로 수정 (2026-10-04)
- Stage 1 최초 화면에서 Grab 튜토리얼이 입력 전에 완료되던 조건을 찾았다. 초기 에너지 값은 입력 증거가 아니므로 `HudState.grabbing`으로 바꿨다. 저장에 튜토리얼 완료가 기록된 재방문 플레이에는 30 wax 튜토리얼 보상을 반복 지급하지 않게 했다.
- 검증: 격리 빈 프로필에서 입력 전 안내 유지 → 마우스 누르기 250ms → Grab 완료/다음 안내. console 0/0, localStorage 0. `npm run build` 통과.
- 추출은 아직 해결/통과 판정하지 않는다. 첫 수동 드래그 경로가 벽을 스치고 건강이 100→96%, Chunks 0/5에 머물렀다. 청크 접촉을 충분히 기다리지 않은 시도도 있어 원인을 게임 결함으로 단정할 수 없다.
- 다음: 새 Stage 1에서 실제 청크에 Swab 접촉 후 붙잡힘이 보이는지 확인하고, 벽에서 떨어진 중앙 경로로 EXIT까지 끌어 실제 첫 회수 시간과 피해를 측정한다.

### Stage 1 청크 회수 재시도 (2026-10-04)
- 빈 격리 저장에서 튜토리얼 입력 단계가 실제 Grab 입력 뒤 정상 완료됐다. 게임 타이머 0:08 화면에 `Chunks 1/5`, +10 wax가 보였으나 직전 입력은 특정 청크를 겨냥한 드래그가 아니었다. 원인을 단정하지 않고 first-extraction 측정에서 제외한다.
- 직접 지정한 드래그는 연속 회수로 이어지지 않았다. 테스트 대기 중 게임 타이머가 흘렀고 벽 접촉 때 체력이 100→98%로 줄었다. 30초 내 초보 성공을 판정할 증거는 아직 없다.
- 별도 5초 접촉 샘플에서 큰 PLUG가 작아진 화면을 확인했다. 수축 피드백은 보였지만 파쇄와 조각 회수는 미완료.
- 다음: Stage 1 회수/출구 로직과 기존 실제 clear 스크린샷을 대조하고, 접촉 대기/안전 출구를 보여주는 안내 필요성을 판단한다. 이어 정상 UI로 clear→보상/다음/Retry 경로를 재검증한다.



### 다음 실험 — 잡힘 시각 피드백 검증
- 완료 조건: 격리 브라우저에서 일반 왁스를 실제로 잡았을 때 금색 연결선과 조각 테두리가 보이고, 844×390 가로 화면에서도 Stage 1 안내가 읽히며 플레이 영역을 과하게 가리지 않는지 확인한다.
- 현재 확인: Stage 1 안내 상태 변화, 콘솔 오류/경고 0, 빈 localStorage, production build 및 diff 형식 검사 통과.
- 아직 미확인: 연결선/테두리의 실제 화면, 모바일 가로 배치. 안내 패널이 플레이 영역 상단을 가리는 점은 캡처로 확인되어, 모바일 확인 뒤 필요하면 문구/높이를 줄인다.


### 다음 실험 — 첫 30초 접촉/회수 시간 재측정
- 현재 개선: Stage 1에 중앙 고정 스타터 조각을 두고, 실제 조각 부착만 Grab 튜토리얼로 인정한다. held-piece 금색 연결 표시와 EXIT 회수를 격리 브라우저에서 확인했고 체력은 100%였다.
- 미완료 기준: 새 run을 시작한 뒤 첫 접촉 및 첫 회수까지의 게임 시간. 앞선 자동화 세션은 브라우저 조작 사이 대기 시간이 누적돼 타이머 2:23을 표시했으므로 30초 성공 근거로 쓰지 않는다.
- 작은 화면 확인: 844×390에서 HUD/한 줄 안내는 읽혔다. 캔버스 양옆 레터박스와 패널 상단 겹침은 기록하고, 실제 휴대기기 검증은 아직 미완료로 둔다.


### 다음 실험 — Stage 1 전체 루프와 12단계 난이도 확인
- 첫 회수 30초 기준은 새 격리 run에서 18.7초로 통과했다. 테스트 자동화는 실제 화면 버튼과 마우스 입력을 사용했고 localStorage에 진행 상태를 주입하지 않았다.
- 다음 완료 조건: 정상 플레이로 Stage 1의 대형 플러그를 긁어 3개 조각으로 나누기, 5개 목표 달성, 보상/결과 화면/다음 단계 이동을 확인한다. 강제 저장/스테이지 해금은 하지 않는다.
- 이어서 12개 Expedition 단계의 목표/시간/위험 증가 곡선, Boss 해금·전투, Endless 압박/보상과 low-effects 동작을 코드 및 격리 브라우저에서 순차 점검한다. Poki SDK/ad 수명주기와 현재 공식 요구사항 최종 감사도 남아 있다.


### 실험 37 — 플러그 파쇄 확인, 파편 회수 미확인 (2026-10-04)
- 격리 브라우저의 실제 버튼·마우스 입력으로 Stage 1 플러그를 파쇄했다. 목표가 Chunks 0/5에서 Chunks 0/7로 변경되고 세 파편 생성이 화면에서 확인됐다.
- 파편을 붙잡는 데 성공했으나, 하단 벽 근처 파편을 출구까지 끄는 시도는 실패했다. 해당 시도 동안 Ear health가 86%에서 67%로 감소했다. 코드상 벽 스침은 최대 5 HP/초, 면봉 파편 hold slip은 오차 30px 초과가 0.18초 지속될 때 발동한다.
- 자동화 커서의 순간 이동과 조작 난이도를 아직 구별하지 못한다. 일반 청크 회수 18.7초 성공 결과와 합쳐서 판정하지 않는다. 현재 격리 런은 0/7, 체력 67%에서 멈춰 있다.
- 다음 검증: 새 런에서 파쇄 뒤 중앙 높이로 조금씩 이동하고 각 구간 HUD를 확인하며 FRAG 회수를 재시도한다. 파편이 실제로 이탈하거나 벽 피해가 과도하게 재현되면 Stage 1 파편 배치/회수 조작을 수정한 뒤 빌드·브라우저 검증을 한다.


### 실험 38 — Stage 1 파쇄 후 회수 재시도 (2026-10-04)
- 새 격리 세션에서 Stage 1을 Chunks 0/5, health 100%로 시작했다. 큰 플러그를 긁어 0/7로 파쇄하는 장면을 다시 확인했다.
- 정상 포인터 입력 뒤 HUD 2/7, score 240, wax 24까지 진행된 화면을 확인했다. 두 회수 청크가 플러그에서 나온 조각인지 개별 식별할 수 없어 해당 부분은 미확정으로 남긴다.
- 플레이 중 health가 58%까지 줄었고 Wall scrape 안내가 화면에 나타났다. 현재 런은 2/7, Clear 전이다. 화면/기록: output/playwright/stage1-plug-retry-cracked.png, output/playwright/stage1-plug-retry-frag-grab2.png.
- 다음은 Stage 1 플러그 배치와 벽 접촉 감점이 튜토리얼 초반에 의도치 않은 건강 손실을 만드는지 확인한다. 필요하면 Stage 1 전용으로만 조정한 뒤 새 세션에서 파쇄·회수·클리어를 재검증한다.


### Stage 1 큰 플러그 안전 배치 조정 (2026-10-05)
- 초반 플러그가 x=360–620의 임의 위치·임의 벽에 생성되어 통로가 좁은 구간에 놓일 수 있음을 확인했다. 벽 스침은 이동 중 초당 최대 5 HP를 깎아 긁기 조작과 피해가 겹칠 수 있었다.
- Stage 1 플러그만 x=270–350의 위쪽 벽으로 고정하고 반경을 기존의 82%로 낮췄다. 중앙 쪽에서 긁을 공간을 늘리면서 일반 청크/보너스 골드와 다른 스테이지 배치는 유지했다. 스테이지별 피해 규칙은 수정하지 않았다.
- 검증: `npm run typecheck`, production `npm run build`, `git diff --check` 통과. 별도 미리보기 `http://127.0.0.1:5190/`에서 Stage 1 시작 화면과 플러그 배치를 시각 확인했다. 사용자 브라우저의 5173/5189 서버와 저장 데이터는 건드리지 않았다.
- 한계: 자동화/사람 조작으로 새 배치의 실제 벽 피해량, 파쇄 뒤 세 조각 회수, Stage 1 클리어는 아직 측정하지 않았다.
- 다음: 새 배치에서 플러그를 긁고 파쇄한 뒤, 중앙 높이로 끌어 EXIT까지 회수한다. 체력 변화와 필수 목표 카운트를 구간별로 기록하고, 피해가 계속 과하면 Stage 1의 안내/배치만 추가 조정한다.


### Stage 1 파편 안정화 및 전체 클리어 (2026-10-05)
- 첫 격리 런에서 플러그를 중앙 쪽에서 긁어 건강 100%로 파쇄했다. 파편은 서로 가까워 충돌하며 하나가 벽 쪽에 남았다.
- Stage 1에서만 파편을 통로 중심에 더 넓게 배치하고 초기 속도를 0으로 설정했다. Matter `ignoreGravity`를 적용해 사용자가 잡기 전까지 중앙에서 안정적으로 머물게 했다. 다른 단계의 파편 물리는 유지했다.
- 재검증: 파쇄 직후 파편 3개가 중앙에 분리되어 나타났고, 대기 후에도 같은 높이에 유지됐다. 실제 포인터 입력으로 파편과 나머지 청크를 회수해 7/7, CLEAR를 달성했다. 7 extracted, score 1,420, wax 130, Stage 2 unlock 확인.
- 최종 건강 98%라 Flawless 미달. 플러그 긁기 및 파편 회수 구간은 건강 100%; 일반 청크 이동 중 2% 감소가 발생했으나 입력 구간별 원인은 아직 분리하지 못했다. 자동화 벽시계 6:57은 Speed 1:30 보너스 밸런스 판단 근거에서 제외한다.
- 결과 화면에 목표 설명/보상/Retry/Next stage/rewarded 선택지가 표시됐다. `Next stage`로 Stage 2 브리핑 및 실제 곡선 통로·털 2개 진입을 확인하고, HUD 0/6·건강100%에서 일시정지했다.
- 격리 Playwright 프로필만 사용했고 사용자 브라우저/저장은 미접촉. Stage 1 결과의 콘솔 errors 0, warnings 0.
- 캡처: `output/playwright/stage1-plug-crack-v3b.png`, `output/playwright/stage1-fragment-stability-v3.png`, `output/playwright/stage1-fragment-extract-v3.png`.
- 두 편집 뒤 각각 `npm run typecheck`, `npm run build`, `git diff --check` 통과.
- 다음: Stage 2 곡선의 안전 경로와 털 접촉·경고 대응을 확인한다. 일반 청크 회수 중 2% 피해 원인도 분리한다.


### Stage 2 곡선 구간 실제 클리어 (2026-10-05)
- 격리 Playwright 세션에서 Stage 2를 정상 해금 경로로 진행했다. 곡선 통로, 털 2개, tickle 게이지와 재채기 예고, Shift로 숨 참기 반응을 화면에서 확인했다.
- 안전한 중앙 경로로 여러 청크를 회수했다. 드럼 가까운 마지막 청크를 붙잡고 왼쪽으로 끌어 6/6 CLEAR 및 Stage 3 해금을 달성했다.
- 결과 화면: score 1,133, extracted 6, time 12:09, best combo 2, ear health 86%, Rank #8, wax earned 123. Flawless 실패 사유는 `Ear canal was touched`; Speed 목표 1:14 초과로 미달. 자동화 도구 대기시간이 포함돼 12:09를 게임의 사람 기준 속도 성능으로 해석하지 않는다.
- 마지막 회수 때 화면의 중앙을 따라가도록 했지만 커서/Swab이 곡선 하단 벽을 스쳐 건강이 크게 내려갔다. 목표 청크는 회수됐으나 이 자동화 경로는 사람 조작 난이도 기준을 입증하지 않으며, 벽 피해가 조작 허용 범위에 비해 엄격할 가능성이 있다. 기존 요청인 “도구 끝이 벽에 닿으면 에너지 감소” 동작 자체는 재현됐다. 추후 피해 속도·시각 경고·안내를 함께 검토한다.
- 캡처: `output/playwright/stage2-resume.png`, `output/playwright/stage2-final-chunk-route.png`. Stage 2 결과 장면에서 6/6과 다음 단계 unlock 확인.
- 다음: 정상 UI에서 Stage 3 briefing/play를 시작하고, 해당 단계 고유 오브젝트/위험·회수 흐름을 관찰한다. Stage 2 이후 계속 진행하며 각 주요 기믹을 확인한다.


### Stage 3 Fur Forest 실제 클리어 및 접촉 피해 관찰 (2026-10-05)
- Stage 3 briefing은 목표 7개와 Human Ear의 hand shake를 안내했다. 인게임에서 곡선 통로, 세 가닥 모발, 금색 고착 청크를 확인했다. 고착 청크는 도구로 접촉해 `Crack!` 상태로 해제한 뒤 잡아 끌 수 있었다.
- 실제 포인터 조작으로 7/7 CLEAR 및 Stage 4 해금. 결과: score 1,275, extracted 7, time 7:24, best combo 1, ear health left 45%, Rank #7, wax earned 175. Flawless 실패는 `Ear canal was touched`; Speed 목표 1:26 초과.
- 실행은 자동화 도구의 분절된 입력/대기 시간을 포함하므로 7:24를 순수 플레이 타임이나 사람의 숙련도 지표로 해석하지 않는다.
- 최초 두 회수 이후 건강이 69%까지 떨어졌고, 낮은 위치의 목표에 접근하며 49%로 감소한 뒤 최종 45%였다. 숨 참기는 일부 구간에서 자세를 안정시키는 데 보조가 됐지만 게이지가 짧아 지속적인 위험 회피 수단은 아니다. 모발 접촉 시 tickle 발생, 벽 접촉 시 `Wall scrape!` 표시가 나왔다.
- 결과: 3개 스테이지에서 연속으로 Flawless를 놓치고 Stage 3은 종료 건강 45%였다. 일반 손실량(코드상 초당 상한), 통로 벽 판정, 도구 축/끝 위치, 모바일 화면의 조작 정밀도를 대조해 피해가 경고 시간과 학습 곡선에 맞는지 다음 작업에서 검토한다. 자동화 재현만으로 난이도를 단정하지 않는다.
- 캡처: `output/playwright/stage3-start.png`, `output/playwright/stage3-first-extract.png`, `output/playwright/stage3-lower-right-grab.png`, `output/playwright/stage3-top-gold-contact.png`, `output/playwright/stage3-result.png`.
- 다음: 정상 Next Stage로 Stage 4에 진입해 `Lime Strata`의 경화 왁스/고유 목표를 확인한 후, 건강 손실 속도와 경고 구현을 관련 코드에 대조한다.


### Stage 4 Lime Strata 실제 클리어 (2026-10-05)
- Stage 4 briefing은 목표 8개, Human Ear hand shake, 숨 참기, 모발 접촉과 고막 피해 설명을 보여줬다. 게임 장면에서 작은 회색 HARD 덩어리, 금색/일반 덩어리, 흔들리는 모발 여러 개를 확인했다.
- 실제 입력에서 면봉이 근접한 금색+회색 HARD 청크 두 개를 동시에 붙잡아 한 번에 회수했다(Chunks 2/8→4/8). COTTON 도구의 동시 두 개 홀드 동작을 확인했다. 모발에 가까운 마지막 목표에서는 Tickle 게이지가 찬 뒤 `ACHOO!!` 표시가 실제로 발생했다.
- 두 번째 금색 목표는 끌어오는 중 놓쳤지만 EXIT 인근에서 재부착해 회수했고, 정상 UI 경로로 Stage 4 CLEAR 8/8 및 Stage 5 해금을 확인했다.
- 결과: score 1,750, extracted 8, time 5:30, best combo 2, ear health 83%, Rank #6, Wax earned 210. Flawless 실패 사유 `Ear canal was touched`, Speed 목표 1:38 초과. 자동화 및 대기 시간 포함 결과이므로 실제 사람 기준 수행 시간 판단에는 쓰지 않는다.
- Stage 3과 비교해 건강 감소가 45%에서 83%로 적었으나 Flawless는 여전히 실패했다. 터치 여부, 조작 경로와 접촉 피해를 별도 검토할 필요가 있다.
- 캡처: `output/playwright/stage4-start.png`, `output/playwright/stage4-hard-contact.png`, `output/playwright/stage4-double-gold-grab.png`, `output/playwright/stage4-result.png`.
- 다음: Stage 5 `Sneeze Quake` 브리핑/플레이에서 정기 재채기와 Tickle 유발이 구분되는지, 숨 참기 소모율과 회복 타이밍을 확인한다.


### Stage 5 Sneeze Quake 실제 클리어 (2026-10-05)
- Stage 5 briefing은 목표 9개, Human Ear 손 떨림, 숨 참기, 털 접촉 반응을 안내했다. 화면에서 작은 일반/금색 왁스와 회색 경화 조각을 확인했다. 가까운 두 조각은 Cotton 도구 반경 안에 넣어 같이 잡고 한 번에 빼는 전략이 가능했다.
- 머리카락 접촉 시 Tickle 게이지가 올라갔고 `ACHOO!!` 배너가 실제 표시됐다. `doFlinch()` 코드에서 잡고 있는 도구의 재채기 jolt를 0.45배로 완화하며, 숨 참기(기본 3초)는 조준 tremor를 0.12배로 낮춘다. 게이지 회복은 초당 0.75, 사용은 초당 1이라 연속 사용에 한계가 있다.
- 포인터를 이용해 9/9 CLEAR 및 Stage 6 해금을 확인. 결과: score 1,935, extracted 9, time 12:08, best combo 2, result health 99%, Rank #5, Stage reward 100, Wax earned 241. Flawless 실패 사유 `Ear canal was touched`, Speed 목표 1:50 초과. 자동화/대기 시간이 타이머에 포함되므로 사람의 속도 점수로 간주하지 않는다.
- Stage HUD 종료 화면은 건강100%였지만 결과는99%였다. 최소 체력이 99.5% 이하로 내려가 Flawless를 잃었을 가능성이 있지만 정확한 내부 최저값은 읽지 못해 추정으로 기록한다.
- 캡처: `output/playwright/stage5-start.png`, `output/playwright/stage5-central-pair-grab.png`, `output/playwright/stage5-timed-sneeze.png`, `output/playwright/stage5-result.png`.
- 다음: 정상 Next Stage로 Stage 6 `Eardrum Cliff`에 진입하고 고막 근접 패널티, 금색·HARD 조각 밀도 및 시각적 위험 구분을 관찰한다.


### Stage 6 Eardrum Cliff 실제 클리어 (2026-10-05)
- Stage 6 briefing은 목표 10개, 기본 Human Ear 흔들림/면봉/숨 참기 설명을 유지했다. 실제 화면은 여러 금색 청크와 회색 HARD 청크 2개, 다수의 털이 좁은 위치에 겹쳐 난이도가 크게 올라갔다.
- 포인터로 10/10 CLEAR 및 Stage 7 해금을 확인. 회색 HARD 청크 두 개는 근접 hold로 crack되어 회수 가능했다. 여러 털 사이 금색 청크를 회수할 때 숨 참기로 떨림을 줄이고 경로를 수직 중앙으로 뺐다.
- 재채기 경고 노란 HUD 배너 `Sneeze incoming! Hold your breath!` 및 `ACHOO!!`를 포착했다. 정기 flinch와 Tickle에 의한 재채기 경로가 모두 코드상 존재하므로 현재 화면의 경고는 시점에 따라 나타났다 사라진다.
- 결과: score 2,213, extracted10, time39:42, best combo2, ear health98%, Rank #5, stage reward115, Wax earned283. Flawless 실패 이유 `Ear canal was touched`; Speed 목표2:02 초과. 관찰/툴 대기 시간이 게임 타이머에 더해져 속도 지표로 해석하지 않는다.
- 체력 손실은 결과 기준 2%였지만 Flawless를 놓쳤다. 긴 경로에서 접촉을 피하는 학습이 되면 플레이는 완주 가능하다. 미세 접촉 판정과 즉시 피드백은 후속 UX 검토 대상.
- 캡처: `output/playwright/stage6-start.png`, `output/playwright/stage6-upper-middle-contact.png`, `output/playwright/stage6-first-rock-extract.png`, `output/playwright/stage6-result.png`.
- 다음: Stage 7 `Gravity Storm` briefing/play에서 gravity sway가 청크 궤도·면봉 통제에 주는 영향을 검증한다.


### Stage 7 Gravity Storm 플레이 확인 진행 중 (2026-10-05)
- briefing에서 목표 11개와 면봉/숨 참기/접촉 조작은 설명하지만 중력 흔들림 기믹은 안내하지 않는다.
- 첫 시도는 자동 커서의 목표 접근·이탈 과정에서 벽 스침이 반복되어 2/11, 체력62%까지 진행 후 멈췄다. 이를 사람 플레이 피해량으로 일반화할 수는 없다.
- Restart에서 `AD · MOCK` 카운트다운을 거쳐 Stage 7 briefing으로 복귀했다. 정상 UI로 재시작한 뒤 숨 참기로 도구 떨림을 낮추고, 하단 청크를 잡아 낮은 속도로 중앙 높이까지 끌어 1개를 체력 손실 없이 회수했다.
- 금색 고착 청크는 제자리 접촉을 유지하자 `Crack!` 표시가 났고, 이후 천천히 중앙·출구 방향으로 옮겨 회수했다. 이 시점 3/11, 체력100%, Flawless 유지.
- 이어지는 하단 조각 1개는 도구 근접/잡힘 표시가 나타났지만 정지 중 추가 crack은 보이지 않았다. 현재 스테이지는 3/11에서 일시정지 상태라 완료 판정은 미확정이다.
- 시작 화면·파쇄·회수·현재 상태 캡처는 `output/playwright/stage7-start.png`, `stage7-restart-start.png`, `stage7-crack-test.png`, `stage7-cracked-extract.png`, `stage7-retry-paused-3of11.png`에 있다. 자동화 입력의 실제 조작 오차와 사용자의 손 조작을 구분해야 하며, timer는 speed 평가에서 제외한다.
- Stage 7 briefing에는 sway 설명이 없고 HUD에는 방향 표시가 Endless에만 있었다. Stage 7 briefing 안내와 HUD `Drift` 회전 배지를 추가했다. 새 production build reload에서 두 요소를 실제 화면으로 확인했다. 844×390 landscape pause modal은 화면 안에 맞았지만 터치 조작 자체는 미검증이다.
- 격리 save의 1,252 wax로 Lab에서 Micro Tweezers를 게임 UI를 통해 350 wax에 구매했다. 구매 후 wax902. Tweezers Stage 7 새 판은 0/11에서 중단, Stage 7 CLEAR 미완료.
- 현재 상태: Expedition 메뉴, Stage7 unlock, Micro Tweezers equipped. 캡처 `output/playwright/stage7-briefing-new-build.png`, `stage7-hud-new-build.png`, `stage7-tweezer-first-route.png`.
- 다음: Stage 8 좁은 통로로 넘어가 환경 기믹 표시/조작을 code+screen audit한다. Stage7 CLEAR는 새로운 사람 조작 또는 더 정확한 타깃 입력으로 별도 이어가고, 자동화 시간/피해를 사람 난이도 판단 근거로 쓰지 않는다.


### Stage 안내 확장 및 광고 모의 카피 확인 (2026-10-05)
- Stage 7–12 진입 안내를 각 단계의 실제 규칙에 맞춰 추가했다: 중력 sway(7), 좁은 통로(8), plug 파쇄(9), 속삭임 음향(10), 강한 sway와 짧은 재채기 간격(11), plug 두 개와 코어 펄스(12).
- Stage 7+ HUD에 중력 방향을 함께 표시해 흔들리는 왁스와 도구 제어 방향을 읽기 쉽게 했다. Stage 8–12는 현재 격리 CUA 저장에서 잠겨 있어 화면별 표시는 실제 해금 후 확인 대상으로 남긴다.
- `stageParams()` 및 GameScene 구현과 각 안내 문구를 대조했다. TypeScript typecheck, production build, `git diff --check`가 통과했다. Stage 7 새 빌드 briefing/HUD 표시는 앞선 별도 Playwright 세션에서 실제 확인했다.
- 상업 광고 모의 UI의 `Skip (forfeit reward)`를 `Skip ad`로 바꿨다. 보상형 광고는 기존 보상 포기 문구를 유지한다. 별도 브라우저에서 pause → mock ad → skip → 메인 메뉴 복귀를 확인했다.
- 완료 기준은 Stage 7 및 Boss 클리어, Endless 보상 종료, Stage 8–12 수동 플레이, Retry/Next의 Poki lifecycle, 실제 모바일 touch, Poki Inspector/실 SDK, 성능·가독성·저사양·제출물 점검이다. Stage unlock을 강제하지 않고 정상 진행으로 확인한다.


### 벽 스침 피해 학습 안내 (2026-10-05)
- 기존 briefing은 고막·털 접촉만 안내하고 움직이는 도구 끝이 벽을 긁을 때 건강을 잃는 규칙은 설명하지 않았다. Stage 1–6 실제 플레이에서 반복된 피해 원인을 플레이어가 미리 알 수 있도록 한 줄을 추가했다.
- 코드 판정과 문구를 대조했다: 도구 끝이 통로 벽에 닿아 있고 속도 0.5 이상일 때 체력이 초당 최대 5 HP까지 감소하고, 콤보가 초기화되며 `Wall scrape!` 표시가 뜬다.
- 검증: typecheck, production build, `git diff --check` 통과. 최신 격리 브라우저 Stage 1 briefing에서 문구가 표시되고 985×625 화면에서 Start 버튼까지 보이는 것을 확인했다. 좁은 모바일 landscape와 Stage 12 긴 briefing의 실측은 남아 있다.


### 844×390 briefing 시작 버튼 접근성 (2026-10-06)
- 기존 긴 Stage 1 안내는 844×390에서 Start 버튼을 첫 화면 아래에 배치했다. 실제 브라우저에서 휠 스크롤로 버튼까지 갈 수는 있었지만, 시작 CTA가 진입 화면에 드러나지 않는 문제가 있었다.
- 화면 높이 480px 이하일 때 조작/위험 안내를 기본 접힘으로 바꾸고, 목표·필수 플러그 안내·벽 피해·Start를 우선 노출했다. 상세 내용과 optional gold 위험은 펼쳐 읽을 수 있다. 큰 화면에서는 상세 안내를 기본으로 보여준다. resize listener로 기기 회전에도 반응한다.
- 브라우저 확인: 844×390에서 Start 버튼이 첫 화면에 보이고 details 확장 뒤 스크롤로 CTA에 도달한다. 1280×720에서는 details가 기본 펼침이다. resize 중 large→compact 전환 시 다시 접히는 것도 확인했다. console errors/warnings 0.
- `npm run typecheck`, `npm run build`, `git diff --check` 통과. 공급망 read-only 점검 `npm audit --omit=dev` 결과 0 vulnerabilities; 소스의 흔한 하드코딩 secret 패턴 검색 결과 0건.
- 캡처: `output/playwright/stage1-briefing-compact-844x390.png`, `stage1-briefing-controls-expanded-844x390.png`, `stage1-briefing-desktop-1280x720.png`.


### Boss / Endless / Poki 전환 audit (2026-10-05)
- Boss 정상 briefing/start 진입과 Phase 1 `Crack 1/3`→`3/3`, Phase 2 `Pull 0/3` 전환을 확인했다. Tweezers로 첫 조각 회수, Phase 2 HUD `Pull 1/3`, health87%, score790, wax79까지 도달 후 테스트를 종료했다. Boss CLEAR는 아직 아니다. 증거: `output/playwright/boss-briefing.png`, `boss-start.png`, `boss-buzz-first.png`, `boss-second-piece-pull.png`, `boss-first-piece-pull.png`.
- Endless 정상 시작에서 `Depth Lv.1`, `Clog 23%`(3초 관찰), 중력 방향 화살표와 왁스 스폰 확인. 생존 결과/깊이 상승/보상은 미완료다. `output/playwright/endless-sample.png`.
- 공식 [Poki SDK 이벤트 문서](https://developers.poki.com/guide/sdk-overview)와 [HTML5 통합 지침](https://developers.poki.com/guide/sdk-html5)은 `gameLoadingFinished()` 완료 후 첫 사용자 상호작용에서 `gameplayStart()`, 자연스러운 재개 지점마다 `commercialBreak()`를 요구한다. [제출 요건](https://developers.poki.com/guide/requirements-quality)은 localStorage 제한 대응, desktop/mobile/tablet 및 SDK lifecycle 확인을 요구한다.
- 코드에서 SDK 초기화/`gameLoadingFinished` 호출, 시작/정지 상태 중복 방지, 저장 read/write try/catch, 로컬 폰트, 공식 Poki SDK 외 외부 요청 없음은 확인했다. 결과의 Next stage/Retry 경로는 `commercialBreak` 없이 시작해 누락이어서 양쪽 handler를 `continueFromPause()`로 연결했다.
- 수정 후 `npm run typecheck`, `npm run build`(내부 tsc 포함), `git diff --check` 통과. 새 빌드 새로고침 후 앱 메뉴 정상, console/page errors 0. Pause Resume/Restart 광고 모의 UI 동작을 확인했으나 결과 Retry/Next stage 경로 재생, 실제 Poki Inspector/SDK 광고는 아직 검증 전이다.
- 캡처 `output/playwright/endless-mobile-landscape.png`(844×390 pause modal), `post-build-menu.png`. 실제 phone/tablet touch input은 검증 전이다.
- 다음: Retry/Next Stage 결과 경로, incognito 저장 실패, touch control, Poki Inspector를 확인한 뒤 제출 audit을 닫는다.


### Stage 1 재현 및 플러그 파쇄 검증 (2026-10-06)
- 별도 Playwright 저장 프로필에서 Stage 1 정상 시작. 입력 좌표가 브라우저 캔버스 크기와 달라 첫 시도는 회수되지 않았다. 캔버스 실제 위치 (46,52), 크기 1188×668를 확인한 뒤 포인터 이동을 맞췄다.
- 일반 청크를 회수해 HUD가 3/5→4/5, score290→390, wax29→39로 갱신되는 것을 재현했다. 벽 인접 회수 중 체력은 70%→69%로 변했다.
- 상단 부착 플러그를 아랫면에서 지속 접촉해 실제로 파쇄했다. HUD 목표가 4/5→4/7로 증가하고 화면에 파편 3개가 보였다. 이는 큰 덩어리가 조금씩 제거되고 작아지는 플레이 변화가 동작함을 재확인한다.
- 남은 파편은 자동 포인터가 이동하는 동안 빠르게 떠내려가 수차례 포착에 실패했다. 이 프로필에서는 4/7, health69%에서 run을 미완료로 둔다. 사람의 터치 조작 실패로 일반화하지 않는다. 증거: output/playwright/completion-stage1-fourth-extract.png, completion-stage1-plug-fractured.png, completion-stage1-fragment-attempt2.png.
- 기존 이력에 별도로 Stage 1 7/7 CLEAR 결과가 기록돼 있어 기본 완주 자체는 이미 확인된 상태다. 이번 반복 검증은 파쇄·점진적 목표 변경을 재현했으며 결과 Next/Retry 광고 lifecycle 검증은 여전히 미완료다.


### 모바일 터치 에뮬레이션 및 Poki 전환 코드 검토 (2026-10-06)
- Chromium 터치 에뮬레이션에서 pointerType: touch인 Pause pointerdown, Resume 및 광고 모의 Skip ad 입력을 확인했고 게임으로 돌아왔다. 별도 Grab 컨트롤도 touch pointerdown/up 이벤트를 받는다. 실제 iOS/Android 기기 검증은 아니다.
- 844×390 landscape에서 게임 캔버스, Hold/Grab 컨트롤 및 Pause 창 표시를 확인했다. 캔버스는 16:9 FIT로 693×390 크기여서 양옆에 themed 여백이 생긴다. 실제 Poki Inspector 스케일링 QA가 여전히 필요하다. 캡처 output/playwright/mobile-touch-paused-844x390.png.
- 공식 [Poki SDK 이벤트 지침](https://developers.poki.com/guide/sdk-overview), [HTML5 SDK 흐름](https://developers.poki.com/guide/sdk-html5), [요건](https://developers.poki.com/guide/requirements-quality)을 다시 대조했다. 현재 코드에서 첫 상호작용/SDK 준비 경쟁 처리를 두고 gameLoadingFinished 이후 gameplayStart를 요청하며, Pause·결과 전환은 Stop 이후 commercial break를 거쳐 Resume/Retry/Next가 실행된다. Result Retry/Next 경로는 실제 결과 화면에서 아직 재생하지 못해 소스 검토까지만 완료했다.
- Poki Inspector/실 SDK event log는 포털 업로드/검토 세션이 없어 확인할 수 없다. 단순히 로컬 광고 모의 화면이 성공했다고 Poki SDK 적합 판정을 내리지 않는다.
- 검토 중 root config/package 파일은 수정하지 않았다. 
npm run typecheck 통과, production npm run build 통과(인라인 HTML 1,601 KB, gzip 452 KB), git diff --check 통과.


### 로컬 Poki SDK 이벤트 스파이 검증 (2026-10-06)
- 5190 격리 브라우저에서 ?poki로 진입하되 SDK 스크립트 URL을 Playwright route로 가로채고, 외부 접속 없이 호출 기록용 mock API를 주입했다. 실제 SDK/광고 대신 API 호출 순서만 검증한다.
- 기록 이벤트: init → gameLoadingFinished → gameplayStart (사용자의 Start mining 입력), gameplayStop (Pause), commercialBreak → gameplayStart (Resume), 다시 gameplayStop → commercialBreak → gameplayStart (Restart). 연속 중복 start/stop은 관찰되지 않았다.
- Next/Retry 결과 화면은 실제로 만들지 않아 버튼 클릭 이벤트는 검증되지 않았다. 코드상 둘 다 같은 continueFromPause()를 통과하지만 실/mock result 버튼의 실제 동작 및 광고 뒤 전환은 별도 미완료다.
- mock은 Poki Inspector가 아니며 실제 SDK 준비 타이밍·콘솔 이벤트·광고 게재를 검증하지 않는다. 이번에 확인한 범위는 앱이 예상 API를 호출하는 순서뿐이다.


### 광고 API 모의 이벤트 키보드 및 자산 점검 (2026-10-06)
- SDK 호출을 기록하는 local mock으로 Escape 일시정지/재개를 실행했다. Pause 시 gameplayStop; Resume 시 commercialBreak → gameplayStart가 기록됐다. Stage Restart도 gameplayStop → commercialBreak → gameplayStart 순서로 확인했다. 실제 Poki portal SDK 결과와 분리해 해석한다.
- 외부 요청 패턴 점검: src/index.html에서 Poki SDK 스크립트 외 fetch/XHR/WebSocket/외부 이미지·오디오 호출은 찾지 못했다. 게임 글꼴은 public/fonts/jua-subset.woff2; 귀·왁스 등 텍스처는 Phaser 코드에서 생성하고 ASMR은 WebAudio로 합성한다.
- 배포용 현재 dist는 인라인 단일 HTML 1,601,010 bytes(빌드 gzip 보고 452.04 KB)이며 DevHudPreview/DevResultPreview 문자열은 프로덕션 산출물에 포함되지 않았다.
- 현재 작업 폴더에는 Poki 정적/애니메이션 썸네일이 없다. 공식 기준은 정적 full-bleed 정사각형 최소 628×628, 애니메이션은 Soft Release 후 추가하고 Global Release 전에 MP4 1080×1080 이상·50fps 이상·4–6초다([썸네일 안내](https://developers.poki.com/guide/game-thumbnail), [페이지 요구](https://developers.poki.com/guide/your-game-page)). 제출 이미지/영상은 아직 만들지 않았고 제출 메타데이터 audit 미완료로 유지한다.
- npm audit --omit=dev 결과 0 vulnerabilities, git diff --check 통과. 변경 코드의 전체 게임 콘텐츠 검증은 미완료이며 기존 상태표의 Stage7/Boss/Endless 및 잠긴 Stage8–12 플레이가 남아 있다.


### 프로덕션 산출물 브라우저 확인 (2026-10-06)
- 빌드된 dist를 임시 5191 포트에서 직접 열어 Expedition 메뉴와 Stage 1 briefing을 확인했다. 개발 서버 대신 실제 인라인 HTML 프로덕션 파일을 불러왔다.
- 844×390에서 briefing의 필수 안내와 Start 버튼이 첫 화면 안에 보였고 버튼 bounding box는 x154 y327 w536 h56, 문서 scrollHeight와 viewport height 모두 390이었다. 캡처: output/playwright/production-briefing-844x390.png.
- 별도 프로덕션 브라우저 저장은 Stage 1만 해금된 새 프로필이었다. 저장 진행을 수정하거나 강제로 해금하지 않았다. 후반 스테이지 확인은 정상 플레이 완료까지 잠겨 있다.


### 실패 결과 Retry 및 보상 재시도 UI 검증 (2026-10-06)
- Stage 1 격리 프로필에서 고막 접촉으로 정상 실패 결과를 띄웠다. UI에 일반 Retry, +30% eardrum 보상 재시도, 보상 wax 두 배 버튼이 동시에 표시됐다.
- 일반 Retry를 눌러 Stage 1 briefing으로 복귀했고 mock SDK 로그가 gameplayStop → commercialBreak → gameplayStart였다.
- 이어서 실패 후 Watch an ad to retry 버튼을 눌렀다. mock이 성공을 반환한 뒤 briefing으로 돌아왔고 로그가 gameplayStop → rewardedBreak → gameplayStart였다. 저장 데이터나 해금 상태를 직접 변경하지 않았다.
- 실 광고 게재/실 SDK/Inspector는 검증되지 않았고, 성공 결과 후 Next Stage 버튼은 정상 클리어 결과를 만들어야 하므로 미완료다.


### 결과 화면 후속 재생 상태 (2026-10-06)
- 이어진 Stage 1 자동 포인터 run은 1/5, wax6에서 고막 접촉으로 실패했다. 일반 Retry 후 Stage 1 briefing 복귀, 보상 재시도 성공 후에도 Stage 1 briefing 복귀를 각각 UI로 확인했다.
- 실패 결과에서 Retry 및 +30% eardrum 보상 재시도가 함께 표시됐다. 마지막 무보상 0/5 실패에는 wax double 옵션이 표시되지 않아 해당 버튼의 성공 케이스는 아직 검증하지 않았다.
- 자동 포인터로 Stage 1 완주를 반복하지 않는다. 기존 실제 7/7 CLEAR 기록을 기준으로 하며, 결과 Next Stage 실제 클릭은 계속 미완료로 남긴다.


### 모드 보상 대조 및 Poki 썸네일 (2026-10-06)
- Endless 코드 경로 대조: CLOG 종료 기준은 살아 있는 청크 면적 합계 / 통로 면적 14%이며 100%에서 실패한다. 6회수 단위로 Depth가 상승하고 3단계 간격으로 금맥 청크를 예약한다. 실패 시 생존시간과 Depth 점수가 결과에 반영된다. 계산식/결과 저장 연결에서 조건 누락은 찾지 못했지만 실제 종료·보상 화면 재현은 미완료다.
- Boss 코드 경로 대조: Sonic Vibrator로 3회 파쇄한 뒤 Tweezers로 파편 3개를 모두 회수해야 성공한다. Boss 해금은 clear 결과에서만 저장되고, 실패는 회수 왁스의 50%와 파쇄 수 점수를 준다. 결과 저장은 wax/통계/랭킹/해금을 한 번 갱신한다. 실제 Boss clear는 미완료다.
- 정적 Poki 썸네일을 `output/poki/poki-thumbnail.png`로 생성했다. 크기 1254×1254 PNG, 1,468,722 bytes로 공식 최소 628×628을 충족한다. 내장 image_gen으로 생성했으며 메뉴 화면을 색/2D 그림체 참고로만 사용했다. 프롬프트: “full-bleed 1:1 arcade ear-cleaning thumbnail, pink ear canal, turquoise swab scraping a large golden wax boulder into small crumbs, untouched eardrum, bold polished 2D cartoon, no text/logo/UI/watermark”. Poki 포털 업로드와 승인은 미확인이다.
- Poki 지침의 무문자·풀블리드·고대비 권고를 대조했고, 임시 160×160 리사이즈로 작은 타일 판독성을 확인했다. 그 프리뷰 파일은 제거했다.
- 계속 남은 완료 기준: 실제 Poki SDK/Inspector, Stage 8–12 정상 해금 플레이, Boss clear, Endless 결과 보상, 성공 결과 Next 화면 전환.


### Endless 실제 종료 및 보상 UI 확인 (2026-10-06)
- 별도 5190 브라우저에서 메뉴→Endless briefing→Start 순으로 시작하고 입력 없이 생존시켰다. Clog 76%에서 100%까지 증가한 뒤 `MINE COLLAPSED` 결과를 띄워 종료 조건을 실제 화면에서 재현했다.
- 결과: Rank #9, score 508, extracted2, 1:06, Depth Lv.1, health100%, 생존 보너스33 wax, 총54 wax. 메뉴 Endless 타일의 best depth Lv.1 표시도 확인했다.
- 로컬 `?poki` mock 보상 광고를 눌렀다. 결과 UI에서 `2× ad reward claimed!` 표시 및 메뉴 잔액96→204(기본54 + 추가54)를 확인했다. 이건 mock 응답 검증이며 실 SDK/광고가 아니다.
- 캡처: `output/playwright/endless-clog-result-5190.png`. 실제 Depth 상승과 3레벨 금맥 지급/회수는 미검증이며, 다른 남은 기준은 실제 Boss clear, 정상 진행으로 Stage 8–12 도달, 성공 Next, Poki Inspector다.
- Depth2를 보려 두 번째 run에서 중앙 청크로 향하는 자동 커서 경로를 시도했으나, Clog가 36%→79%→98%로 진행되고 `Wall scrape!`가 발생해 체력이 100%→93%→85%로 줄었다. 이 입력은 청크를 회수하지 못했고 Lv.1에서 닫혔다. 자동화 커서 이동 특성 때문에 사람의 난이도 평가는 하지 않는다. 캡처: `output/playwright/endless-depth-attempt-wall-scrape-5190.png`.


### Boss 정상 클리어 및 저장 검증 (2026-10-06)
- 별도 `earwax-completion` 프로필에서 Endless 결과 보상으로 Micro Tweezers 정가350을 정상 구매·장착하고, Boss가 `Ready to fight`로 해금되는 UI를 확인했다. 이 프로필은 Stage0/12였고 Boss clear 외 stage를 강제 해금하지 않았다.
- briefing에서 3회 Sonic Vibrator 파쇄 후 Tweezers로 파편 3개를 회수해 실제 `BOSS DOWN!` 결과 도달. Rank #4, score5658, extracted3, game clock5:54, combo2, ear health79%, wax996(350 boss + 250 first kill + 158 eardrum + recovered chunk payout).
- 결과 Expedition 복귀에서 `Defeated ✔` 저장 UI와 첫 boss kill +500 wax 마일스톤을 확인했다. 수령 뒤 저장 wax1496. 결과: `output/playwright/boss-clear-result-5190.png`.
- 자동화 대기시간을 포함한 시계 수치는 Speed 밸런스 판단에 쓰지 않는다. 다음: Stage7 normal clear, Endless Depth/금맥 진행, Stage8–12 normal unlock, success Next lifecycle, real Poki SDK/Inspector.
