# YouTube 채널 분석 대시보드 (YouTube Channel Analysis Dashboard)

이 프로젝트는 YouTube 채널의 데이터를 시각화하고, Google Gemini AI를 활용하여 심층적인 분석 인사이트를 제공하는 웹 애플리케이션입니다. 사용자는 채널 ID, 핸들(@handle), 또는 URL을 입력하여 채널의 주요 지표, 동영상 성과, 예상 수익, 시청자 반응 등을 한눈에 파악할 수 있습니다.

실행주소1 : https://youtube-board.vercel.app/

실행주소2 : https://dev-canvas-pi.vercel.app/


---

## ✨ 주요 기능 (Key Features)

*   **📈 종합 채널 대시보드**: 구독자 수, 총 조회수, 비디오 수를 직관적인 카드 형태로 제공합니다.
*   **📊 동영상 성과 분석**: 기간별(전체, 7일, 30일, 90일) 및 정렬(최신순, 인기순)에 따른 동영상 목록과 조회수 차트를 시각화합니다.
*   **🤖 Gemini AI 기반 분석**:
    *   **종합 리포트**: 채널의 강점, 개선점, 미래 전망을 포함한 종합 분석 리포트를 스트리밍 방식으로 제공합니다.
    *   **예상 수익 분석**: 채널 데이터 기반의 예상 월간/연간 광고 수익(KRW)을 추정하고 근거를 제시합니다.
    *   **댓글 반응 분석**: 특정 동영상의 댓글을 분석하여 긍/부정 감성, 핵심 토픽, 크리에이터를 위한 제안 사항을 도출합니다.
*   **🆚 채널 비교 모드**: 두 개의 채널을 나란히 놓고 주요 지표와 동영상 데이터를 비교 분석할 수 있습니다.
*   **🎬 비디오 상세 정보**: 동영상 클릭 시 상세 정보(설명, 태그 등)와 AI 댓글 분석 결과를 모달 창에서 확인할 수 있습니다.
*   **🔑 안전한 API 키 관리**: `localStorage`를 사용하여 브라우저에 안전하게 API 키를 저장하고, UI를 통해 손쉽게 키를 추가/삭제할 수 있습니다.
*   **📱 반응형 디자인**: 데스크톱, 태블릿, 모바일 등 다양한 기기에서 최적화된 화면을 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

*   **Frontend**: React, TypeScript
*   **Styling**: Tailwind CSS
*   **Charting**: Recharts
*   **APIs**:
    *   YouTube Data API v3
    *   Google Gemini API (`@google/genai`)
*   **Environment**: Vite (ESM via `importmap`)

---

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하기 위한 절차입니다.

### 1. API 키 발급받기

이 애플리케이션을 사용하려면 **YouTube Data API Key**와 **Gemini API Key**가 필요합니다.

*   **YouTube Data API Key**:
    1.  [Google Cloud Console](https://console.cloud.google.com/)에 접속하여 새 프로젝트를 생성합니다.
    2.  'API 및 서비스' > '라이브러리'로 이동하여 **YouTube Data API v3**를 검색하고 '사용 설정'합니다.
    3.  'API 및 서비스' > '사용자 인증 정보'로 이동하여 '사용자 인증 정보 만들기' > 'API 키'를 선택하여 키를 발급받습니다.

*   **Gemini API Key**:
    1.  [Google AI Studio](https://aistudio.google.com/)에 방문합니다.
    2.  Google 계정으로 로그인 후, 왼쪽 메뉴에서 **'Get API key'**를 클릭하여 새로운 API 키를 생성합니다.

### 2. 프로젝트 실행

이 프로젝트는 별도의 빌드 과정 없이 정적 웹 서버를 통해 실행할 수 있습니다.

1.  이 저장소를 로컬에 다운로드하거나 클론합니다.
2.  Visual Studio Code의 `Live Server`와 같은 확장 프로그램을 사용하여 `index.html` 파일을 엽니다.

### 3. API 키 설정

1.  브라우저에서 애플리케이션을 엽니다.
2.  화면 상단에 있는 **YouTube Data API Key**와 **Gemini API Key** 입력 필드에 발급받은 키를 각각 붙여넣습니다.
3.  '저장' 버튼을 클릭합니다. 키는 브라우저의 `localStorage`에 저장되며, 브라우저를 닫았다가 다시 열어도 유지됩니다.

---

## 📖 사용 방법 (How to Use)

1.  **API 키 설정**: 위의 '시작하기' 가이드에 따라 API 키를 설정합니다.
2.  **채널 정보 입력**: 분석하고 싶은 YouTube 채널의 **ID**, **핸들(@handle)**, 또는 **전체 URL**을 입력창에 넣습니다.
3.  **분석 시작**: '분석' 버튼을 클릭하여 데이터를 불러옵니다.
4.  **대시보드 탐색**:
    *   기본적인 채널 지표와 동영상 차트, 목록을 확인합니다.
    *   **Gemini AI 토글**을 켜고 '인사이트 생성' 버튼을 눌러 AI 분석 리포트를 받아보세요.
    *   동영상 목록에서 특정 동영상을 클릭하여 상세 정보와 댓글 반응 분석을 확인하세요.
5.  **채널 비교**: '채널 비교' 토글을 켜고 두 번째 채널 정보를 입력하면 두 채널의 데이터를 나란히 비교할 수 있습니다. (비교 모드에서는 Gemini AI 기능이 비활성화됩니다.)

---

## 📂 프로젝트 구조 (Project Structure)

```
.
├── components/       # 재사용 가능한 React 컴포넌트
│   ├── Charts.tsx
│   ├── DashboardSkeleton.tsx
│   ├── StatCard.tsx
│   ├── VideoDetailModal.tsx
│   └── VideoList.tsx
├── services/         # 외부 API 통신 로직
│   ├── geminiService.ts
│   └── youtubeService.ts
├── App.tsx           # 메인 애플리케이션 컴포넌트
├── index.tsx         # React 애플리케이션 진입점
├── types.ts          # TypeScript 타입 정의
├── index.html        # 메인 HTML 파일
├── metadata.json
├── PLAN.md           # 프로젝트 개발 계획
└── README.md         # 프로젝트 설명서
```

---

## 📄 라이선스 (License)

이 프로젝트는 MIT 라이선스에 따라 배포됩니다.
