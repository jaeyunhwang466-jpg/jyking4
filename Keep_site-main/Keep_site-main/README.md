# KEEP SITE

KEEP 서비스 프론트엔드 프로토타입 프로젝트입니다.  
고객 → 직원 → 관리자로 이어지는 피팅 요청 흐름을  
웹 기반으로 검증하기 위한 Mock 기반 프로토타입입니다.

---

## 프로젝트 소개

KEEP는 오프라인 의류 매장에서  
고객이 모바일로 피팅을 요청하면  
직원과 관리자가 이를 실시간으로 확인/관리할 수 있도록 설계된 서비스입니다.

본 프로젝트는 실제 백엔드 연동 전  
서비스 흐름 검증 및 UI/UX 프로토타이핑을 목적으로 제작되었습니다.

---

## 주요 기능

### 고객용 웹앱
- 상품 조회
- 색상 / 사이즈 선택
- 찜(하트) 기능
- 장바구니 기능
- 피팅 요청 생성

### 직원용 웹앱
- 피팅 요청 목록 확인
- 요청 상태 변경
- 피팅 준비 시작 / 처리 관리

### 관리자용 웹앱
- 전체 요청 로그 조회
- 요청 상태 모니터링
- 통계 / 대시보드 확인

---

## 배포 링크

### 고객용 페이지
🔗 https://keep-site.vercel.app/customer.html

### 직원용 페이지
🔗 https://keep-site.vercel.app/staff.html

### 관리자용 페이지
🔗 https://keep-site.vercel.app/admin.html

---

## 기술 스택

- **Frontend:** React / TypeScript / Vite
- **State Management:** Zustand
- **Persistence:** localStorage
- **Deployment:** Vercel

---

## 현재 구조

본 프로젝트는 현재 **Mock 기반 프로토타입**으로 구성되어 있습니다.

- 실제 DB / API 없이  
  Zustand + localStorage 기반 상태 관리 사용
- 추후 백엔드/API 연동 예정

---

