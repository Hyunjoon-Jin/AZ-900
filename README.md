# AZ-900 (Microsoft Azure Fundamentals) 학습 프로그램

Microsoft AZ-900 자격증 취득을 위한 10일(2주) 집중 학습 계획과, 이를 지원하는
플래시카드 · 퀴즈 웹앱입니다.

## 구성

| 항목 | 내용 |
|---|---|
| `study-plan.md` | 10일 집중 커리큘럼, 도메인별 학습 목표, 체크리스트, 참고 자료 |
| `app/` | 브라우저에서 바로 여는 학습용 웹앱 (플래시카드 / 퀴즈 / 진행률 체크) |

## 빠른 시작

1. 학습 계획 확인: [`study-plan.md`](./study-plan.md)
2. 학습 앱 실행: `app/index.html` 파일을 브라우저로 열거나, 아래처럼 로컬 서버로 실행

   ```bash
   cd app
   python3 -m http.server 8080
   # 브라우저에서 http://localhost:8080 접속
   ```

   앱은 별도 설치나 빌드 과정 없이 정적 HTML/JS만으로 동작합니다.

## 앱 기능

- **플래시카드**: 3개 도메인(클라우드 개념 / Azure 아키텍처·서비스 / Azure 관리·거버넌스) 별
  핵심 개념 카드를 클릭해서 앞/뒤로 뒤집어 암기
- **퀴즈**: 객관식 문제 풀이, 채점 결과와 오답 노트 제공
- **진행 상황**: 10일 학습 계획의 각 일차 체크리스트를 브라우저에 저장(localStorage)해서
  진도 관리

## 시험 정보 참고

- 시험 시간: 45~60분 내외 (버전에 따라 다름), 문항 수 약 40~60문항
- 합격 점수: 700/1000 (Microsoft 공식 기준, 문항별 배점 상이)
- 공식 학습 경로: Microsoft Learn "AZ-900: Microsoft Azure Fundamentals"
  (https://learn.microsoft.com/training/courses/az-900t00)
- 공식 시험 안내: https://learn.microsoft.com/credentials/certifications/azure-fundamentals/
