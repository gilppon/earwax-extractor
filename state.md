# 진행 상태

## 프로젝트
- 경로: `E:\solarena\귀파기`
- 목표: 귀 파기 게임의 첫 플레이 이해도, 단계별 플레이 차이, 시각·음향 피드백을 개선하고 Poki 제출 요구사항을 확인한다.
- 상세 실험 기록: [GAME_IMPROVEMENT_PLAN.md](./GAME_IMPROVEMENT_PLAN.md)

## 전체 검증 최신 요약 (2026-10-06)
- Stage 1–12: 별도 Playwright 저장 프로필에서 Stage 1부터 순서대로 해금하고 모두 정상 CLEAR했다. Stage 11은 첫 시도 실패 후 일반 Retry로 CLEAR, Stage 12 최종 CLEAR와 Flawless까지 확인했다. 결과 캡처는 아래 단계별 기록을 참조한다.
- Boss: 3회 파쇄 → 파편 3개 회수 → `BOSS DOWN!` 결과, 보상 저장, Expedition의 `Defeated` 표시까지 완료 기록이 있다([boss-clear-result-5190.png](output/playwright/boss-clear-result-5190.png)).
- Endless: 정상 Clog 붕괴 결과·보상과 최고 깊이 Lv.9 갱신 확인. 두 결과: Lv.6/34개/589 wax 및 Lv.9/50개/716 wax. Golden Vein 전용 알림/보상은 아직 직접 포착하지 못했다.
- 결과 전환: Stage 1 CLEAR 화면의 `Next stage`로 Stage 2 briefing 진입, Endless 붕괴 결과의 `Retry`로 Endless briefing 재진입을 실제 클릭으로 확인했다. 로컬 Next 전환은 동작했으나 실제 Poki SDK/광고는 포털 세션에서만 최종 확인 가능하다.
- WebGL: `createGame.destroy()`에 컨텍스트 조기 해제를 추가했다. 재로드 뒤 Stage 12 Pause→Restart→Start를 반복해 경고 재발 없음, 캔버스 1개·WebGL 1개를 확인했다.
- 저사양 효과 스위치를 켜 Stage 실행 후 원래 값(Full effects)으로 복원했다. 실제 저사양 기기의 FPS/발열 비교는 아직 없다. 모바일은 과거 Chromium touch emulation에서 입력을 확인했으며 실물 기기 확인은 아니다.
- 최신 결과 화면에서 Stage 1 `Next stage`를 눌러 Stage 2 브리핑에 진입했고, Endless `Retry`로 같은 모드 브리핑에 복귀했다. 두 결과 경로의 화면 동작을 확인했다.
- 기본 효과 상태의 브라우저 `requestAnimationFrame` 표본은 2초간 119.5fps였다. 로컬 PC/Chromium 표본이라 저사양 성능 판단 근거로 쓰지 않는다.
- 보안 마이크로 점검에서 흔한 하드코딩 credential 패턴 일치 0건, `npm audit --omit=dev` 취약점 0건, `git diff --check` 통과. 수정은 런타임 WebGL context 정리 코드이며 외부 입력·인증을 다루지 않는다.
- Endless Golden Vein: 실제 런에서 Depth Lv.3, 귀 건강 100%, 16개 회수, Wax 281 결과를 확인했다([endless-golden-collect-5190.png](output/playwright/endless-golden-collect-5190.png)). 플레이 캡처에 금색 청크와 `+180 ×2.25` 팝업도 보이나 Golden Vein 전용분임을 UI에서 분리 식별하지 못했다. 코드상 Lv.3 진입 시 `GOLDEN VEIN INCOMING!` 및 다음 생성용 GOLD 대기가 설정되고, 다음 Endless spawn은 고정형 GOLD로 배치된다. 트리거와 결과는 확인, 배너 순간·전용 청크 단독 회수는 화면 증거 미완료로 기록한다. 참고 캡처: [endless-depth3-observation-5190.png](output/playwright/endless-depth3-observation-5190.png).
- 저효과 설정 플레이 중 Chromium `requestAnimationFrame` 2초 표본은 112.3fps였다(기존 기본효과 표본 119.5fps). 같은 기기·브라우저의 짧은 표본이라 차이를 성능 우위/열위로 해석할 수 없고, 실제 저사양 기기 비교는 미완료다. 검증 뒤 설정을 `Full effects`로 복원했다.
- 기존 Poki 썸네일 후보도 업로드 기술 규격(정적 PNG 1254×1254, 무음 애니메이션 MP4 1080×1080·50fps·5.02초·약620KB)은 충족한다. 다만 이전 자산은 면봉을 강조해 기본 장비 Sonic Vacuum과 맞지 않았으며 아래 v3/v2 후보를 새로 만들었다. 참고: [Poki 썸네일 가이드](https://developers.poki.com/guide/game-thumbnail), [게임 페이지 영상 요건](https://developers.poki.com/guide/your-game-page).
- 기본 Sonic Vacuum에 맞춘 정적 썸네일 후보 v3를 생성했다: [earwax-miner-thumbnail-static-v3.png](output/poki/earwax-miner-thumbnail-static-v3.png), 1254×1254. 기존 후보는 보존했고 v3은 아직 업로드/선정하지 않았다. 현재 애니메이션에는 면봉 장면이 있어 프리뷰도 vacuum 중심으로 다시 구성해야 한다.
- Sonic Vacuum 실제 플레이 녹화에서 선택한 구간으로 무음 프리뷰 후보 v2를 재생성했다: [earwax-miner-thumbnail-animated-v2.mp4](output/poki/earwax-miner-thumbnail-animated-v2.mp4), H.264 1080×1080·50fps·5.02초·746KB, 오디오 스트림 없음. 재현 스크립트는 [build_animated_thumbnail_vacuum.py](output/poki/build_animated_thumbnail_vacuum.py). 연락 시트와 256px 타일 미리보기에서 정적 후보 및 실플레이 모두 기본 진공 도구가 알아보이게 표시됨을 확인했다. Poki에 업로드하거나 기존 파일을 덮어쓰지 않았다.
- Poki 기술 기준 대조: 저장소 localStorage 접근에 예외 처리가 있고, 브라우저 스크롤/캔버스 터치 동작을 막는 설정 및 로컬 폰트가 있다. CSP는 Poki SDK CDN 외 외부 요청을 허용하지 않는다. 실제 Inspector 합격 여부는 아직 미확인이다. 참고: [Poki 요구사항](https://developers.poki.com/guide/requirements-quality).
- 최신 로컬 출시 게이트(2026-10-06): `npm run build` 성공(TypeScript 검사 포함, Vite production build 완료), `git diff --check` 오류 없음, 격리 브라우저 콘솔 errors 0 / warnings 0. 이번 검증에서 `package.json`, lockfile, `vite.config.ts`, `tsconfig.json` 변경 없음.
- Solarena 바이럴 훅 감사에서 큰 PLUG 크기 변화는 이미 코드에 있음을 재확인했다. 격리 브라우저 실제 입력으로 1·3·5초 스크린샷을 캡처했고, 덩어리가 대략 절반까지 줄어든 뒤 파쇄되어 3개 파편이 생겼다. 파편 회수로 진행 1/7→3/7, 점수 80→525·콤보 ×1.25, 건강 100→86 확인. 이미지: `output/playwright/plug-check-start.png`, `plug-check-1s.png`, `plug-check-3s.png`, `plug-check-5s.png`, `plug-check-after-scrape.png`, `plug-check-extracted.png`.
- 무한 모드에서 봉 끝을 아래 벽에 접촉시킨 플레이 캡처에 `Wallscrape!`가 표시됐고 귀 건강이 96%에서 76%로 감소했다([golden-sweep-target-5190.png](output/playwright/golden-sweep-target-5190.png)). 벽 접촉 페널티 동작은 확인했다.
- Golden Vein 배너 직접 포착을 위해 자동 프레임 캡처를 두 번 시도했으나, 한 번은 이미 종료 뒤였고 한 번은 Lv.3 플레이 구간만 담겼다. 배너는 아직 직접 캡처되지 않았다.
- 남은 항목: Golden Vein 전용 청크와 회수 보상 직접 확인, 제한된 성능/저사양 기기 측정, 실제 Poki SDK/Inspector·실물 기기 QA. 포털/실기기 항목은 해당 접근이 있어야 닫을 수 있다.

## 현재까지
- Stage 1 첫 회수: 격리 브라우저의 실제 입력에서 18.7초 기록.
- Stage 1 큰 플러그 파쇄: HUD 목표가 0/5에서 0/7로 늘고 파편 3개가 나타나는 것 확인.
- 기존 Stage 1 파쇄 후 회수 중 벽 접촉으로 체력이 크게 감소한 관찰이 반복됨. 자동화 커서 특성과 실제 조작 난이도는 완전히 분리하지 못함.
- 2026-10-05: Stage 1 플러그만 x=270–350 상단 벽, 반경 82%로 조정. 다른 스테이지 배치와 피해는 유지.
- 같은 날: Stage 1 파쇄 파편 3개를 중앙 높이로 벌려 생성하고 초기 속도 0, Matter `ignoreGravity`를 적용. 실제 화면에서 중앙 위치가 짧은 대기 후에도 유지되는 것을 확인했다.
- 격리 브라우저의 실제 포인터 입력으로 Stage 1 플러그 긁기→파쇄(0/5→0/7)→파편 3개 회수→7/7→CLEAR 결과까지 확인. 결과: score 1,420, wax 130, Stage 2 해금. 파쇄와 파편 회수 중 건강 100%, 일반 청크 회수 중 2% 손실, 최종 98%. 자동화 벽시계 6:57은 Speed 밸런스 판정으로 사용하지 않는다.
- Stage 2에서 곡선 통로·털 2개와 재채기 예고/숨 참기 반응을 확인했다. 실제 입력으로 6/6 CLEAR 및 Stage 3 해금을 확인. 결과: score 1,133, wax 123, 최종 건강 86%, combo 2, Rank #8. 벽 접촉 피해가 나타나 Flawless 실패; 자동화 세션 시간 12:09는 Speed 밸런스 근거로 사용하지 않는다.
- Stage 2의 마지막 드럼 인접 청크를 회수하려고 화면 중앙 경로를 이용했지만, 실제 포인터/툴 끝이 벽과 스치는 동안 건강이 100%→86%로 감소했다. 청크는 최종 회수되어 6/6을 달성했으나 자동화 커서 경로는 사람의 난이도 기준이 아니다. 안전 경로 안내 또는 튜토리얼 개선 여부를 다음 단계에서 평가한다.
- Stage 3 Fur Forest 7/7 CLEAR 및 Stage 4 해금을 실제 입력으로 확인. 금색 고착 청크에 도구를 가까이 대면 `Crack!`으로 풀린 뒤 회수 가능했다. 결과: score 1,275, wax 175, Rank #7, 게임 타이머 7:24, 종료 건강 45%; Flawless 실패 사유 `Ear canal was touched`, Speed 목표 1:26 초과. 화면에서 시각적 금색 경화/고착 오브젝트와 손 떨림 추가를 확인했다.
- Stage 3은 첫 두 청크에서 health100→69로 하락했고, 이후 숨 참기 중 health 유지, 하단 벽 근처 접근 중 69→49, 최종 45%까지 감소했다. 일부 입력은 목표 조각을 붙잡기보다 벽 또는 모발에 먼저 닿았다. 실제 사용자 입력 난이도는 별도 사람 검증 전 단정하지 않으며, 세 단계 연속 Flawless 실패와 큰 피해는 벽 접촉 피해 속도/도구 경로 가시성 재검토 항목으로 올린다.
- Stage 2·3 캡처: `output/playwright/stage2-final-chunk-route.png`, `output/playwright/stage3-start.png`, `output/playwright/stage3-first-extract.png`, `output/playwright/stage3-top-gold-contact.png`, `output/playwright/stage3-result.png`.
- Stage 4 Lime Strata 8/8 CLEAR, Stage 5 해금을 확인. 회색 HARD 청크와 근처 금색 조각을 면봉으로 동시에 잡아 한 경로로 회수했고, 한 번 놓친 마지막 하단 청크는 EXIT 가까이에서 다시 잡아 회수했다. 모발 가까운 금색 청크에서는 Tickle이 차고 재채기 `ACHOO!!`가 발생했지만 목표 회수는 계속됐다.
- 결과: score 1,750, wax 210, Rank #6, 게임 타이머 5:30, 종료 건강 83%, best combo 2. Flawless 실패 사유 `Ear canal was touched`; Speed 목표 1:38 초과. 테스트 대기 시간을 포함하므로 이 타이머는 사람 기준 속도 지표가 아니다.
- 캡처: `output/playwright/stage4-start.png`, `output/playwright/stage4-hard-contact.png`, `output/playwright/stage4-double-gold-grab.png`, `output/playwright/stage4-result.png`.
- Stage 5 Sneeze Quake 9/9 CLEAR 및 Stage 6 해금을 확인했다. 도구가 모발에 닿아 Tickle 게이지가 오르면 `ACHOO!!`가 표시되는 것을 관찰했다. 정기 재채기(15초 간격)는 반복 조작/대기 중 발생 시점 예측이 어려워 별도 타이밍 계측은 미완료로 둔다. 플레이 중 체력은 대부분 유지됐다.
- 결과: score 1,935, wax 241, Rank #5, extracted 9, best combo 2, 타이머 12:08, 결과 건강99%, Stage clear 보상100. Flawless 실패 사유는 `Ear canal was touched`; Speed 목표 1:50 초과. HUD에서는 종료 직전 100%로 표시됐으나 결과는 99%여서 0.5% 문턱 기준에 걸렸을 수 있다. 정확한 최소 체력은 HUD만으로 알 수 없어 미세 피해가 있었다고 추정만 한다.
- 캡처: `output/playwright/stage5-start.png`, `output/playwright/stage5-central-pair-grab.png`, `output/playwright/stage5-timed-sneeze.png`, `output/playwright/stage5-result.png`.
- Stage 6 Eardrum Cliff 10/10 CLEAR 및 Stage 7 해금 확인. 회색 HARD 두 개를 접촉해 `Crack!` 상태로 놓이게 한 뒤 회수했다. 오른쪽의 모발 두 가닥 사이 금색 조각도 숨 참기로 안정화해 빼냈다. Tickle와 정기 재채기 경고(`Sneeze incoming! Hold your breath!`), 실제 `ACHOO!!` 배너를 모두 확인했다.
- 결과: score 2,213, wax 283, Rank #5, extracted10, time39:42, best combo2, health98%, Stage6 보상115. Flawless 실패 사유 `Ear canal was touched`; Speed 목표2:02 초과. 자동화 및 스테이지 관찰 시간이 포함되므로 Speed 평가에 사용하지 않는다.
- Stage6 경화·밀집 구간에서도 건강 손실은 소폭이었고(시작100%, 결과98%) 조작 경로/숨 참기 사용법을 파악하면 긴 스테이지도 클리어 가능했다. 벽/모발 접촉 유무는 HUD의 Flawless 배지가 민감하게 반영한다.
- 캡처: `output/playwright/stage6-start.png`, `output/playwright/stage6-upper-middle-contact.png`, `output/playwright/stage6-first-rock-extract.png`, `output/playwright/stage6-result.png`.
- Stage 1 결과 브라우저 콘솔: errors 0, warnings 0. Stage 2 결과 UI와 Next stage 진입 경로 확인. 스크린샷: `output/playwright/stage2-resume.png`, `output/playwright/stage2-final-chunk-route.png`.
- TypeScript 검사, production 빌드, `git diff --check` 통과. 별도 미리보기는 `http://127.0.0.1:5190/`; 5173/5189와 사용자 저장은 미접촉.

## 다음 작업
1. Golden Vein 배너 순간과 전용 GOLD 청크 단독 회수를 캡처한다. 이번 런에서는 Lv.3, GOLD 청크·`+180 ×2.25` 팝업, 결과까지 확인했지만 전용분 식별은 아직 직접 분리하지 못했다. 연속 프레임 시도는 알림을 놓쳐 추가 재현이 필요하다.
2. 썸네일 v3/애니메이션 v2 후보의 작은 타일 가독성을 최종 확인하고 실제 P4D Preview/Inspector에서 대조한다. 후보는 현재 로컬 output에만 저장했다.
3. 실제 저사양 기기 또는 사용자가 지정한 대표 기기에서 성능을 비교한다. 로컬 Chromium 표본은 비교 기준으로 부족하다.
4. Poki portal/Inspector 세션과 실물 터치 기기로 SDK 이벤트·광고·화면 비율을 검증한다.
4. 이 항목 외 Stage 1–12, Boss, Endless collapse/reward, 결과 Next/Retry, WebGL context 반복 정리는 현재 격리 프로필에서 확인했다.

## 경계와 주의
- 저장 데이터를 강제로 수정하거나 Stage를 해금하지 않는다.
- 5173/5189는 기존 프로젝트 미리보기 서버다. 현재 변경 확인은 5190 별도 출처를 사용한다.
- root `package.json`, lockfile, `*.config.*`는 명시 승인 전 수정하지 않는다. 개발 의존성 audit 이슈는 계획서에 기록되어 있다.

### Stage 7 Gravity Storm 진행 중 (2026-10-05)
- 격리 Playwright 세션에서 Stage 7에 정상 진입했다. briefing은 11개 목표와 기본 조작만 안내하고 Gravity Storm의 위치 흔들림은 따로 설명하지 않았다.
- 첫 시도는 자동 포인터 경로에서 벽 스침 피해가 커져 2/11, 건강 62%까지 진행 후 일시정지했다. 입력이 목표 위치에 늦게 따라간 구간이 포함되어 사람 플레이 난이도로 일반화하지 않는다.
- Restart가 보상 광고 모의 화면을 거쳐 Stage 7 briefing으로 돌아오는 동작 확인. 별도 저장 데이터 수정 없이 정상 Restart 경로를 사용했다.
- 두 번째 시도는 숨 참기로 조준을 안정시키고, 하단 금색 청크를 가까이서 잡아 천천히 중앙으로 이동해 회수했다. `Crack!` 표시 후 경화 청크도 풀어 회수했다. 스크린샷 시점 3/11, 체력100%, Flawless 유지; 게임 타이머 8:03이며 자동화 도구 대기/입력 포함이라 Speed 평가에는 쓰지 않는다.
- 중력 효과로 보이는 청크 이동/초기 이탈은 관찰했으나, sway가 직접 원인인지 별도 분리하지 못했다. 숨 참기 보유량과 위치 고정, 저속 끌기가 안전 회수에 도움이 됐다.
- 화면 증거: `output/playwright/stage7-start.png`, `stage7-sway-2s.png`, `stage7-restart-start.png`, `stage7-crack-test.png`, `stage7-cracked-extract.png`, `stage7-retry-paused-3of11.png`.
- 중력 안내 브리핑과 회전 방향 `Drift` 배지를 추가했다. production build 재생성 뒤 격리 브라우저를 새로고침해 브리핑 문구와 Stage 7 HUD 배지를 실제 표시로 확인했다. 844×390 landscape에서는 pause modal이 화면 안에 맞았으나 터치 디바이스 입력은 아직 검증하지 않았다.
- 최신 브라우저 런은 Micro Tweezers를 Lab에서 정상 가격 350 wax로 구매한 뒤 시작했다(저장 wax 1,252→902). Stage 7 Tweezers 실험은 0/11에서 중단했고, 현재는 격리 세션 메뉴로 돌아왔다. Stage 7 CLEAR 미완료.
- Boss: 정상 해금 후 Sonic Vibrator Phase 1에서 3/3 파쇄, Tweezers Phase 2에서 1/3 회수를 확인했다. 건강87%, score790, wax79 시점에 종료하고 mode audit으로 전환했다. Boss CLEAR 미완료.
- Endless: Depth Lv.1 진입 후 3초 시점 Clog23%와 중력 방향 화살표 표시 확인. 생존 종료/깊이 상승/결과 보상은 미확인.
- Poki 공식 문서 대조: `gameLoadingFinished` 뒤 `gameplayStart`, pause/level transition에서 stop→commercial break→start 순서를 요구한다. 저장소는 localStorage read/write를 try/catch한다. 결과 화면 Next stage/Retry가 바로 `gameplayStart`를 호출해 commercial break를 건너뛰는 경로를 발견해 `continueFromPause`를 통하게 수정했다. 이 두 버튼의 실제 결과 화면 클릭 검증은 아직 미완료.
- 광고 모의 화면은 Pause Resume/Restart에서 확인했다. 실제 Poki SDK/Inspector는 포털 세션이 아니어서 검증하지 않았다. 현재 결과 전환 수정 뒤 typecheck, production build, `git diff --check` 통과; 새 빌드 메뉴 새로고침 시 console/page error 0.
- 최신 캡처: `output/playwright/stage7-briefing-new-build.png`, `stage7-hud-new-build.png`, `boss-start.png`, `boss-buzz-first.png`, `boss-first-piece-pull.png`, `endless-sample.png`, `endless-mobile-landscape.png`, `post-build-menu.png`.
- 지금은 격리 세션의 Expedition 메뉴. 다음은 실제 결과 전환을 정상 UI에서 재현 가능한 경로로 확인한 뒤 Stage 8/10/12 기믹 audit, Boss/Endless, mobile touch, Poki Inspector를 마감한다.

### Stage 안내·광고 모의 화면 후속 (2026-10-05)
- Stage 7–12 briefing에 각 기믹별 한 줄 안내를 추가했다. 7 sway, 8 좁은 통로, 9 plug 파쇄, 10 속삭임 음향, 11 강한 sway·잦은 재채기, 12 이중 plug·CORE PULSE 안내다. Stage 7 HUD 중력 방향 표식을 7+ 전체 단계에 보이도록 확대했다.
- 코드 대조: `stageParams()`의 canalWidth(8), plugs(9·11·12), whisper(10), sway(7+), corePulse(12) 값 및 GameScene 동작을 대조해 안내가 구현과 맞는지 확인했다. 12단계 코어 경고 배너는 `CORE PULSE · LOOSE WAX WILL SURGE LEFT`다.
- 최신 `npm run typecheck`, `npm run build`, `git diff --check` 통과. Stage 7 HUD/briefing은 이전 새 빌드에서 실제 표시를 확인했다. 이번 CUA 브라우저의 별도 저장에는 Stage 1만 해금되어 있어 Stage 8–12의 briefing 화면은 확인하지 않았다. 해금을 조작하거나 저장을 바꾸지 않는다.
- 광고 모의 화면의 상업 광고 건너뛰기 문구를 `Skip ad`로 수정하고 별도 브라우저에서 Pause → 광고 모의 화면 → 건너뛰기 → 메인 화면 복귀를 확인했다. 보상형 광고의 `Skip (forfeit reward)` 문구는 유지된다.
- 초반 브리핑에 없던 벽 스침 피해를 명시했다. 코드 판정은 도구 끝이 벽에 닿은 상태에서 속도 0.5 이상일 때 건강을 깎고(속도에 따라 초당 최대 5 HP), 콤보를 끊고 `Wall scrape!`를 띄운다. Stage 1 최신 빌드 briefing에 경고 문장이 표시되는 것을 격리 브라우저에서 확인했다.
- 최신 briefing 전체가 985×625 화면에서 버튼까지 한 화면에 표시됐다. 짧은 landscape 화면에서 긴 Stage 12 문구까지의 실측은 아직이며, briefing 바깥 wrapper는 `overflow-y-auto`다.
- 현재 CUA 탭 `http://127.0.0.1:5190/`은 Stage 1만 해금된 별도 저장 상태이며, 이전 Playwright 감사 프로필과 다른 저장소다. 사용자 미리보기 5173/5189 및 저장은 계속 건드리지 않았다.
- 남은 완료 기준: Stage 7 실제 클리어, Stage 8–12 실제 플레이·화면, Boss CLEAR, Endless 결과 보상, Retry/Next 광고 lifecycle, 실제 터치, 실제 Poki SDK/Inspector, 성능·저사양·제출 자산 audit.

### 짧은 화면 브리핑 압축 (2026-10-06)
- 844×390에서 Stage 1 브리핑이 시작 버튼을 화면 아래로 밀어내는 것을 재현했다. 스크롤로 버튼은 찾을 수 있었지만 첫 화면에서 시작 동작이 보이지 않았다.
- 화면 높이 480px 이하에서는 `Controls & hazards`를 접고, 필수 목표·플러그 조작·벽 피해와 Start 버튼을 우선 표시한다. 선택 보상과 상세 조작은 펼쳐 볼 수 있다. 높이가 480px보다 크면 상세 내용을 기본으로 펼치며 창 크기 변경에도 상태를 갱신한다.
- 844×390에서 Start 버튼이 처음부터 보이고, controls 펼치기/스크롤 뒤에도 CTA에 도달하는 것을 확인했다. 1280×720에서 전체 상세가 펼쳐져 보인다. console errors 0, warnings 0.
- 최신 TypeScript 검사, production build, `git diff --check` 통과. `npm audit --omit=dev` 결과 0 vulnerabilities. 소스 내 흔한 하드코딩 secret 패턴 검색 결과 0건.
- 화면 증거: `output/playwright/stage1-briefing-compact-844x390.png`, `stage1-briefing-controls-expanded-844x390.png`, `stage1-briefing-desktop-1280x720.png`.
- 후반 스테이지/Boss/Endless 플레이와 모바일 실제 터치, 실 Poki Inspector는 아직 남아 있다.


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


### 모드 보상 경로 대조 및 Poki 썸네일 (2026-10-06)
- Endless 종료 조건은 살아 있는 청크의 원 면적 합계를 통로 면적의 14% 기준으로 나누어 계산하고, 100%에 도달하면 CLOG 실패를 호출한다. 회수 시 6개 단위로 Depth가 오르며 3·6·9… 단계에서 금맥 청크를 예약하고, 실패 결과에 생존시간·Depth 점수가 붙는다. 코드에서 조건 누락은 찾지 못했으나 실제 생존 종료/보상 UI는 아직 미검증이다.
- Boss는 진동으로 3회 파쇄 후 tweezers로 파편 3개를 회수하며, clear 결과만 Boss 해금 저장에 반영된다. 실패는 회수 왁스 50%와 파쇄 점수를 준다. 저장 `finishRun()`은 run 보상·통계·랭킹·스테이지/Boss 해금을 한 번 반영하도록 연결돼 있다. 실제 Boss clear/결과 보상은 미검증이다.
- 제출 자산 공백을 채우기 위해 게임 메뉴 화면의 색과 2D 질감을 스타일 참고로 한 Poki 정적 썸네일을 생성했다. 큰 금색 플러그를 터키색 도구로 긁고 작은 조각이 빠져나가는 장면, 보존된 고막, 글자 없는 정사각형 구성이다.
- 산출물: `output/poki/poki-thumbnail.png` — PNG 1254×1254, 1,468,722 bytes. 공식 정적 썸네일 최소 628×628을 충족한다. 생성 도구는 내장 image_gen이며 프롬프트는 “full-bleed 1:1 arcade ear-cleaning thumbnail, pink ear canal, turquoise swab scraping a large golden wax boulder into small crumbs, untouched eardrum, bold polished 2D cartoon, no text/logo/UI/watermark”였다. 실제 Poki 포털 업로드나 썸네일 승인까지 확인한 것은 아니다.
- Poki 공식 썸네일 지침의 텍스트 회피·풀블리드·정사각형·대비 기준과 대조했고, 임시 160×160 축소 프리뷰에서도 귀·덩어리·도구의 핵심 실루엣이 구분됐다. 임시 프리뷰는 산출물 폴더에서 제거했다.
- 남은 검증은 실제 Poki SDK/Inspector, 후반 스테이지 정상 해금 플레이, Endless Depth/금맥 progression, 성공 결과 Next 흐름이다. Boss clear는 별도 격리 프로필에서 확인했다.


### Endless 실제 종료 및 보상 재생 (2026-10-06)
- 5190 격리 Playwright 세션에서 Expedition → Endless → briefing → Earphones on — Start 경로로 실행했다. 사용자 미리보기 5173/5189와 별도 저장이다.
- 입력하지 않고 두어 통로 막힘이 76%에서 100%로 진행한 뒤 결과 화면의 `MINE COLLAPSED` / `The canal is now 100% earwax!` 문구로 종료됐다. 결과는 Rank #9, score 508, extracted 2, time 1:06, Depth Lv.1, health100%, survival bonus33 wax, 총 wax54였다.
- 결과 화면은 보상 두 배 버튼에 `+54`를 표시했다. `?poki`에 연결된 로컬 SDK mock의 rewarded 성공을 눌렀고, 결과에서 `2× ad reward claimed!`를 확인했다. Expedition 메뉴 wax가 실행 전96에서 종료 후204로 늘었다(기본 결과54 + 추가54). Endless 타일은 최고 Depth Lv.1을 표시해 저장 갱신도 확인했다. 실제 Poki 광고/API 검증은 아니다.
- 결과 캡처: `output/playwright/endless-clog-result-5190.png`. 파일 용량 162,640 bytes. 결과·저장·보상 UI 경로를 실제 브라우저에서 확인했으며 코드 수정은 없었다. Endless Depth 상승/금맥 보상은 아직 미검증이다.
- Depth 상승을 추가 확인하려고 두 번째 Endless run에서 커서를 중앙 청크 쪽으로 옮겨 회수 경로를 한 번 시도했다. Clog가 36%→79%→98%로 빨리 진행된 동안 자동 포인터가 곡선 통로를 가로질렀고 `Wall scrape!`와 체력100%→93%→85%가 나타났다. 이번 경로에서는 추가 회수가 성립하지 않아 2 extracted/Depth Lv.1로 종료했다. 자동화 속도와 이동 경로가 포함됐으므로 사람 난이도 판정에 쓰지 않는다. 증거: `output/playwright/endless-depth-attempt-wall-scrape-5190.png`.


### Boss 정상 클리어 및 보상 저장 확인 (2026-10-06)
- `earwax-completion` 격리 프로필의 정상 플레이 보상(Endless 결과·모의 두 배 지급)으로 wax 350을 모은 뒤 Lab에서 Micro Tweezers를 정가 350 wax로 구매했다. 도구가 자동 장착됐고 메뉴 Boss가 `Ready to fight`로 바뀌는 것을 확인했다. 저장은 이 격리 프로필에만 해당한다.
- Boss briefing에서 3회 파쇄와 Tweezers 파편 3개 회수 목표·조작 경고가 표시됐다. 중심선을 따라 진동 도구를 접근시켜 Phase1 3/3 파쇄; 파편 회수 구간으로 전환 후 마지막 파편까지 출구로 당겨 `BOSS DOWN!` 결과를 띄웠다.
- 결과: Rank #4, score 5,658, extracted3, game clock 5:54, combo2, eardrum health79%. 결과 wax996 = Boss defeated350 + First blood250 + Eardrum spared158 + 회수한 조각의 기본 보상. 보스 종료 보상 표기와 저장을 결과 화면에서 확인했다.
- Expedition 복귀 메뉴에서 Boss `Defeated ✔`를 확인했다. 첫 보스 처치 마일스톤 +500 wax를 수령한 후 메뉴 잔액은 1,496이었다. 단계 진행은 0/12 그대로라 Stage 해금을 직접 바꾸지 않았다. Boss 결과 캡처: `output/playwright/boss-clear-result-5190.png`.
- 자동화 세션의 게임시계에는 입력 대기와 브라우저 작업 시간이 포함돼 Speed 밸런스 근거로 쓰지 않는다. 포털의 실제 SDK/광고는 사용하지 않았다.

## 전체 검증 진행 기준 (2026-10-06)
- 사용자 요청에 따라 완료 기준을 전체 검증으로 고정했다. 기존 Codex goal이 paused 상태라 goal 도구로 새 goal을 만들지 못했으며, 이 파일의 완료 체크리스트를 현재 실행 기준으로 사용한다.
- 새 격리 Playwright 프로필에서 정상 재화 1,400 wax로 Sonic Vacuum을 구매하고 Stage 1을 진행했다. 정상 흡입으로 일반 조각을 모으고, 큰 플러그에 가까운 안전한 위치에서 흡입해 균열·파쇄 조각 2개를 회수했다. HUD 7/7, CLEAR, Stage 2 unlocked 확인.
- Stage 1 결과: score 1,663, extracted 7, time 4:59, best combo 3, ear health 90%, wax earned 137, Rank #6. 벽 접촉으로 피해를 받아 Flawless 미달, 1:30 목표 초과로 Speed 보너스 미달. 자동화 세션 시간은 사람의 플레이 난이도/속도 지표로 해석하지 않는다.
- 결과 화면의 Next stage 버튼을 실제로 눌러 Stage 2 · Curvy Section 브리핑까지 정상 이동했다. 브라우저 콘솔 errors 0, warnings 0. 캡처: output/playwright/stage1-clear-next-stage-5190.png.
- ?poki 개발 경로로 UI를 실행했지만 이번 Next 이동에서 실제 SDK/Inspector 이벤트는 확인하지 않았다. 실제 Poki 포털/SDK와 실기기 터치 검증은 계속 별도 미완료다.
- 전체 완료까지 남은 항목: 일반 UI 경로로 Stage 7까지 정상 진행/해금 증거 확보, Stage 8–12 정상 해금과 핵심 플레이 확인, Endless Depth 2 이상 및 금맥 보상 경로, 성능·저사양 효과·가독성 점검 마무리, 가능 시 실제 Poki SDK/Inspector 및 실기기 터치 확인. 기존 Boss CLEAR와 Endless Depth 1 collapse/보상 검증은 완료 기록을 유지한다.
## 전체 검증 진행 기준 (2026-10-06)
- 사용자 요청에 따라 완료 기준을 전체 검증으로 고정했다. 기존 Codex goal이 paused 상태라 goal 도구로 새 goal을 만들지 못했으며, 이 파일의 완료 체크리스트를 현재 실행 기준으로 사용한다.
- 새 격리 Playwright 프로필에서 정상 재화 1,400 wax로 Sonic Vacuum을 구매하고 Stage 1을 진행했다. 정상 흡입으로 일반 조각을 모으고, 큰 플러그에 가까운 안전한 위치에서 흡입해 균열·파쇄 조각 2개를 회수했다. HUD 7/7, CLEAR, Stage 2 unlocked 확인.
- Stage 1 결과: score 1,663, extracted 7, time 4:59, best combo 3, ear health 90%, wax earned 137, Rank #6. 벽 접촉으로 피해를 받아 Flawless 미달, 1:30 목표 초과로 Speed 보너스 미달. 자동화 세션 시간은 사람의 플레이 난이도/속도 지표로 해석하지 않는다.
- 결과 화면의 Next stage 버튼을 실제로 눌러 Stage 2 · Curvy Section 브리핑까지 정상 이동했다. 브라우저 콘솔 errors 0, warnings 0. 캡처: `output/playwright/stage1-clear-next-stage-5190.png`.
- `?poki` 개발 경로로 UI를 실행했지만 이번 Next 이동에서 실제 SDK/Inspector 이벤트는 확인하지 않았다. 실제 Poki 포털/SDK와 실기기 터치 검증은 계속 별도 미완료다.
- 전체 완료까지 남은 항목: 일반 UI 경로로 Stage 7까지 정상 진행/해금 증거 확보, Stage 8–12 정상 해금과 핵심 플레이 확인, Endless Depth 2 이상 및 금맥 보상 경로, 성능·저사양 효과·가독성 점검 마무리, 가능 시 실제 Poki SDK/Inspector 및 실기기 터치 확인. 기존 Boss CLEAR와 Endless Depth 1 collapse/보상 검증은 완료 기록을 유지한다.

## Stage 2 정상 해금·클리어 (2026-10-06)
- Stage 1 결과의 Next stage를 눌러 Stage 2 · Curvy Section briefing, 이어서 Start를 눌러 플레이 화면을 확인했다.
- Sonic Vacuum으로 자연 회수하여 HUD 6/6 CLEAR 및 Stage 3 unlocked 확인. 결과: score 1,160, extracted 6, time 4:53, best combo 2, ear health 87%, wax earned 125, Rank #8.
- 결과에는 `Ear canal was touched` 및 `Not earned · exceeded 1:14 target`가 표시됐다. 중앙 쪽으로 조작했지만 흡입 중 도구/조각 경로가 위험 구역에 닿을 수 있어 Flawless를 달성하지 못했다. 전체 Stage 완료가 우선이며 보너스 파 목표는 다음 밸런스 검토 항목이다.
- 결과 캡처는 `output/playwright/stage2-clear-result-5190.png`로 보관. 실제 Poki SDK/Inspector 검증은 이번에도 수행하지 않았다.

## Stage 3 정상 해금·클리어 (2026-10-06)
- Stage 2 결과의 Next stage를 눌러 Stage 3 · Fur Forest briefing으로 이동한 뒤 정상 시작했다.
- Sonic Vacuum으로 7/7 회수, CLEAR, Stage 4 unlocked 확인. 결과: score 1,595, extracted 7, time 4:53, best combo 3, ear health 99%, wax earned 168, Rank #7.
- 털을 스쳐 Tickle 게이지가 상승했으며 최종 결과에는 `Ear canal was touched`가 기록됐다. 건강은 99%로 끝났다. Speed 보너스 기준 1:26보다 오래 걸렸다.
- Stage 2–3은 자연스러운 다음 단계 버튼과 해금 흐름이 연속 동작함을 확인했다. 별도 포털 SDK 동작과는 구분한다.

## Stage 4 정상 해금·클리어 (2026-10-06)
- Stage 3 결과에서 Next stage를 눌러 Stage 4 · Lime Strata에 진입했다. briefing 목표 8개를 확인했다.
- Sonic Vacuum으로 일반 조각과 회색 단단한 조각을 흡입/제거해 8/8 CLEAR, Stage 5 unlocked를 확인했다. 결과: score 2,365, extracted 8, time 7:06, best combo 3, ear health 100%, Rank #5, wax earned 248.
- `Flawless · no ear damage` 달성으로 43 wax 보너스가 별도 표기됐다. Speed 보너스는 1:38 목표 초과로 미달.
- 캡처: `output/playwright/stage4-clear-result-5190.png`.

## Stage 5 정상 해금·클리어 (2026-10-06)
- Stage 4 Next stage에서 Stage 5 · Sneeze Quake에 진입해 9/9 CLEAR 및 Stage 6 unlocked 확인. 결과: score 1,635, extracted 9, time 8:25, best combo 2, Rank #8, wax earned 238.
- `Sneeze incoming! Hold your breath!` 경고를 확인하고 Shift를 눌렀다. 경고가 사라진 후 남은 조각을 이어서 회수해 런을 완성했다.
- 후반 오른쪽에서 Vacuum 흡입 중 건강이 크게 떨어졌다. 8/9 상태에서 보였던 67%가 완료 시 31%가 됐으며 Flawless 미달로 끝났다. 공명 경계의 피해 강도/플레이어가 피해 원인을 알아차릴 수 있는 피드백을 추후 밸런스 검토 대상으로 둔다.
- Speed 보너스는 1:50 목표를 넘어 미달. 캡처: `output/playwright/stage5-clear-result-5190.png`.

## Stage 6 정상 해금·클리어 (2026-10-06)
- Stage 5의 정상 Next stage 흐름으로 Stage 6 · Eardrum Cliff에 진입해 briefing 목표 10개를 확인했다.
- Sonic Vacuum으로 일반·경화 회색 조각 10/10 회수, CLEAR, Stage 7 unlocked. 결과: score 3,040, extracted 10, time 15:58, best combo 3, ear health 100%, Rank #4, wax earned 369.
- 중간에 `ACHOO!!` sneeze 연출이 실제 발동했고 Shift 입력으로 대응했다. 런은 무피해로 끝나 Flawless 58 wax를 획득했다. Speed는 2:02 목표 초과.
- 캡처: `output/playwright/stage6-clear-result-5190.png`.

## Stage 7 정상 해금·클리어 (2026-10-06)
- Stage 6 Next stage를 통해 Stage 7 · Gravity Storm에 정상 진입했다. briefing의 gravity shift 설명과 실제 HUD `Drift` 상태를 확인했다.
- 좌우로 떠다니는 덩어리를 Sonic Vacuum으로 추적해 11/11 CLEAR 및 Stage 8 unlocked. 결과: score 3,088, extracted 11, time 13:04, best combo 2, ear health 100%, Rank #4, wax earned 399.
- Flawless no-damage 보너스 65 wax 획득. Speed는 2:14 par 초과. Gravity 표시 중 조각 움직임과 회수 동작이 연결됐고, 정식 0→7 순차 해금을 이 프로필에서 완료했다.
- 캡처: `output/playwright/stage7-clear-result-5190.png`.

## Stage 8 정상 해금·클리어 (2026-10-06)
- Stage 7 Next stage로 Stage 8 · Hellish Chasm에 진입했다. 브리핑은 좁은 통로에서 중앙으로 끌어온 뒤 출구 방향으로 이동하라고 안내한다.
- Sonic Vacuum으로 12/12 CLEAR 및 Stage 9 unlocked. 결과: score 3,243, extracted 12, time 8:05, best combo 4, ear health 100%, Rank #4, wax earned 403.
- 건강 무피해로 Flawless 73 wax를 획득했다. Speed 보너스는 2:26 목표 초과.
- 캡처: `output/playwright/stage8-clear-result-5190.png`.

## Stage 9 정상 해금·클리어 (2026-10-06)
- Stage 8 Next stage에서 Stage 9 · Plugged Passage에 진입했다. 큰 플러그를 흡입해 균열·파쇄한 뒤 추가 파편 3개가 생성되어 목표가 12에서 15로 늘어나는 HUD 동작을 확인했다.
- Sonic Vacuum으로 15/15 CLEAR 및 Stage 10 unlocked. 결과: score 4,411, extracted 15, time 11:51, best combo 5, ear health 100%, Rank #2, wax earned 511.
- Flawless 80 wax 보너스 달성. Speed는 2:38 par 초과. 캡처: `output/playwright/stage9-clear-result-5190.png`.
- 연속 단계 진입 중 Stage 9 시작 때 콘솔에 `Too many active WebGL contexts. Oldest context will be lost.` 경고가 1회 발생했다(오류 0). PlayScreen effect cleanup은 `createGame().destroy()`에서 `game.destroy(true)`를 부르고 있으나 경고가 브라우저 context 수명/Phaser 반복 초기화에서 비롯되는지 추가 확인이 필요하다. 이 경고가 난 뒤 Stage 9/현재 run은 정상 동작했다.

## Stage 10 정상 해금·클리어 (2026-10-06)
- Stage 9 Next stage에서 Stage 10 · Whispering Furstorm 진입. briefing은 ambience 아래 whisper layer와 털 회피를 안내했다.
- Sonic Vacuum으로 14/14 CLEAR 및 Stage 11 unlocked. 결과: score 3,148, extracted 14, time 17:24, best combo 3, ear health 94%, Rank #6, wax earned 418.
- eardrum/canal touch로 Flawless 미달, Speed는 2:50 목표를 넘었다. 시각적 위치 이동 외에 whisper가 실제 청각적으로 구별되는지는 브라우저 오디오 청취 검증이 부족하므로 별도 확인 대상으로 남긴다.
- Stage 10 진입 후 같은 `Too many active WebGL contexts. Oldest context will be lost.` warning이 총 2건이 됐다(콘솔 errors 0). Stage 10 런은 계속 플레이되고 정상 완료됐다. 캡처: `output/playwright/stage10-clear-result-5190.png`.

## Stage 11 정상 해금·재시도·클리어 (2026-10-06)
- Stage 10 Next stage에서 Stage 11 · Resonant Drift에 진입했다. 브리핑 목표는 15개였고 Sonic Vacuum으로 대형 플러그를 깨자 파편 2개가 추가되어 목표가 17개로 갱신됐다.
- 첫 시도는 15/17 회수에서 고막 파열로 실패했다(건강 0%, score 3,533, time 8:45, 152 wax). 광고 부활/보상은 누르지 않고 Retry로 재시도했다.
- 두 번째 시도는 안전한 통로 중앙에서 흡입 후 이동하는 방식으로 17/17 CLEAR 및 Stage 12 unlocked를 확인했다. 결과: score 3,836, extracted 17, time 11:56, best combo 5, ear health 55%, Rank #4, wax earned 475.
- 재시도에서도 Vacuum tip이 공명 경계에 들어가면 건강이 빠르게 감소하는 점을 관찰했다. 최종 런은 완료됐지만 Flawless는 고막 접촉으로 미달했고 Speed는 3:02 목표를 초과했다. 캡처: `output/playwright/stage11-clear-result-5190.png`.
- 연속 Stage 진입으로 WebGL context 경고가 누적 4건이 됐다(콘솔 errors 0). 실패 후 Retry와 이어진 두 번째 런 모두 동작했다. 원인과 정리 수명은 아직 코드 차원에서 해결·재검증하지 않았다.

## Stage 12 정상 해금·최종 클리어 (2026-10-06)
- Stage 11 Next stage로 Stage 12 · Tympanic Core에 진입. 기본 목표 16개와 플러그 2개를 확인했고, 두 플러그 파쇄 후 파편으로 목표가 20개가 됐다.
- Sonic Vacuum으로 20/20 CLEAR. 결과: score 6,151, time 8:50, best combo 8, ear health 100%, Rank #1, wax earned 657. `Flawless · no ear damage` 보너스 103 wax 획득. Speed는 3:14 목표 초과.
- 최종 stage에서 `ACHOO!!`와 `Sneeze incoming`이 발생했으나 건강 100%를 유지했다. Core Pulse 경고 텍스트 자체의 출현/2초 타이밍은 별도 화면에서 식별하지 못해 기믹 표시 검증은 아직 부분적이다.
- Stage12 시작 시 `Too many active WebGL contexts. Oldest context will be lost.`가 누적 5건으로 보였다(콘솔 errors 0). 최종 런과 결과 화면은 정상 렌더링됐다. 컨텍스트 경고 원인과 lifecycle 정리 검증이 남아 있다.
- 캡처: `output/playwright/stage12-clear-result-5190.png`.
- 이 브라우저 프로필에서 Stage 1부터 12까지 Next Stage 정상 흐름으로 순차 해금·CLEAR를 마쳤다. Stage 11 첫 시도 실패/정상 Retry도 확인했다. 전체 프로젝트 검증의 나머지 항목(보스·Endless 깊이 보상, Poki 결과 전환 및 실 SDK/Inspector, 터치 장치, 저사양 성능·제출 자산 점검)은 계속 진행한다.

## WebGL 컨텍스트 정리 수정·반복 확인 (2026-10-06)
- Phaser `Game.destroy(true)`는 실제 정리를 다음 프레임으로 미룬다. Stage 재시작 때 새 WebGL 게임이 먼저 만들어지면 기존 컨텍스트가 아직 활성 상태여서 `Too many active WebGL contexts`가 누적되는 것으로 판단했다.
- `src/game/createGame.ts`에서 기존 게임의 destroy를 요청한 직후 WebGL renderer의 `WEBGL_lose_context` 확장을 호출해 이전 컨텍스트를 즉시 해제하도록 수정했다. Canvas renderer일 때는 `gl`이 없어 해당 처리를 건너뛴다.
- 수정 전 Stage 9–12 시작 시 같은 warning이 1→5건까지 누적됐고 errors는 0이었다. 수정 후 페이지를 새로 불러온 뒤 Stage12를 시작하고 Pause → Restart → Start를 두 차례 수행했다. 경고 재발 없음, DOM canvas 1개, WebGL canvas 1개, 게임 HUD 정상 표시를 확인했다.
- `npm run typecheck`, `npm run build`, `git diff --check` 통과. 마지막 브라우저 반복 확인은 새 코드가 반영된 5190 격리 세션에서 했다.

## Endless 정상 실패 보상·깊이 저장 확인 (2026-10-06)
- 홈에서 Endless를 선택해 briefing과 실행 화면을 확인. Sonic Vacuum으로 청크를 반복 흡입한 뒤 Clog 100%로 정상 `MINE COLLAPSED` 결과가 떴다.
- 결과: extracted 34, depth Lv.6, score 12,958, best combo 18, ear health 100%, survival time bonus 96, wax earned 589. 광고 보상 버튼은 누르지 않았다.
- 생존 종료/실패 결과와 깊이·보상 저장은 확인했다. Depth 3의 Golden Vein 전용 배너/청크 생성 및 회수 보상은 이번 런에서 화면 증거를 포착하지 못해 다음 Endless 런에서 계속 확인한다.
- 캡처: `output/playwright/endless-depth6-collapse-result-5190.png`.
- 결과 Retry를 눌러 Endless briefing으로 정상 복귀하고 재시작했다. 두 번째 런은 Clog 100% 종료까지 진행되어 extracted 50, depth Lv.9, score 16,763, time 2:34, best combo 29, ear health 100%, survival bonus 77, wax 716을 확인했다. 최고 깊이 기록은 Lv.6에서 Lv.9로 상승했다. Golden Vein 알림은 두 번째 런에서도 별도 캡처하지 못했다. 캡처: `output/playwright/endless-depth9-collapse-result-5190.png`.
- 추가 관찰 런도 Clog 붕괴까지 진행됐다: extracted 40, depth Lv.7, score 11,049, time 2:25, best combo 9, ear health 100%, survival bonus 72, wax 666. 최고 기록 Lv.9 유지. Depth 3/6 전환을 지나갔으나 Golden Vein 전용 배너는 화면 캡처에서 식별하지 못해 직접 검증 완료로 세지 않는다. 캡처: `output/playwright/endless-depth7-collapse-observation-5190.png`.
# Solarena viral share iteration (2026-10-06)

- Result card now offers an optional share challenge with actual run mode, stage, ear, score, extracted count, and best combo. Poki shareable URL is used when present; normal query URL is the fallback.
- The Hub shows received challenge facts and `Mine this stage`, which enters that same mode/stage using the receiver's own current gear.
- Validation: TypeScript + Vite production build passed (dist/index.html 1,604.67 kB / gzip 453.28 kB); `git diff --check` passed. Isolated browser opened a Stage 1 challenge (`HUMAN`, 525 score, 3 extracted, ×1 combo), displayed its banner, and entered the Stage 1 mission briefing.
- Limits: no natural result was created for this share button, and native share/clipboard/Poki Inspector/device behavior remains unverified. Challenge mode/stage transfers; the receiver keeps their own selected gear and ear progression.


## First-extraction reward split — 2026-10-06

- Tutorial reward remains 30 wax total, now split into +10 wax when the first chunk is extracted and +20 at three extracted chunks. The live coach explains the first reward and how many chunks remain.
- TypeScript/Vite production build passed (1,604.75 kB / gzip 453.30 kB); `git diff --check` passed with expected line-ending notices. Isolated browser confirmed the Stage 1 briefing and tutorial overlay. A successful Canvas extraction was not achieved in this browser run, so the reward trigger still needs end-to-end verification.


## Big plug shaving feedback pass — 2026-10-06

- Confirmed the big plug already lost physical and visual mass as it was scraped, but only shrank to half size and its white ring showed remaining health in a way that could read backward. It now shrinks to 35% size before fracturing; a warm progress arc fills as scraping advances, with stronger wobble at higher wear. Breakup still yields three pullable pieces.
- Final production TypeScript/Vite build passed (1,604.84 kB / gzip 453.34 kB); `git diff --check` passed with line-ending notices. The new scale/ring path was not observed during an in-browser successful scrape because the automated canvas gesture missed the chunk; visual gameplay confirmation remains open.

### Portfolio goal browser closure — 2026-10-06

- Fresh Stage 1 browser run successfully extracted the first chunk. HUD showed Chunks 1/5 and the tutorial showed “First chunk out! +10 wax. Pull 2 more for the final +20!”.
- Scraping the large plug produced three smaller pullable fragments; screenshot: [portfolio-first-extract-plug-scrape-20261006.png](output/playwright/portfolio-first-extract-plug-scrape-20261006.png). Earlier intermediate-frame evidence for progressive shrink remains listed in the big-plug verification entry above.
- This supersedes the two portfolio notes that the successful first extraction and plug scrape were not yet browser-verified. Poki Inspector, physical touch/tablet QA, and playtest data remain external gates.
