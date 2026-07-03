# AZ-900 10일 집중 학습 계획

시험 도메인(Microsoft 공식 Skills Outline 기준)과 배점 비중:

| 도메인 | 비중 |
|---|---|
| 1. 클라우드 개념 설명 (Describe cloud concepts) | 25~30% |
| 2. Azure 아키텍처 및 서비스 설명 (Describe Azure architecture and services) | 35~40% |
| 3. Azure 관리 및 거버넌스 설명 (Describe Azure management and governance) | 30~35% |

하루 학습 시간은 평일 기준 1.5~2시간을 가정합니다. 시간이 부족하면 "압축 7일 안"
(각 Day를 아래 표대로 병합)도 하단에 안내되어 있습니다.

체크박스는 GitHub/에디터에서 그대로 체크하며 진도를 관리하거나, `app/` 웹앱의
"진행 상황" 탭에서 동일한 항목을 체크할 수 있습니다(둘은 독립적으로 저장됩니다).

---

## Day 1 — 클라우드 개념 기초 (도메인 1)

- [ ] 클라우드 컴퓨팅의 이점: 고가용성(HA), 확장성(Scalability) vs 탄력성(Elasticity),
      민첩성(Agility), 내결함성/재해복구(Fault tolerance & DR), 관리 용이성
- [ ] 비용 모델: 자본 지출(CapEx) vs 운영 지출(OpEx), 종량제(Consumption-based) 가격
- [ ] 클라우드 vs 온프레미스 비교표 직접 만들어보기
- [ ] Microsoft Learn 모듈: "클라우드 컴퓨팅 개념" 완료
- [ ] `app/` 플래시카드 - "클라우드 개념" 세트 1회 학습

## Day 2 — 서비스/배포 모델 (도메인 1)

- [ ] 클라우드 서비스 모델: IaaS / PaaS / SaaS 정의와 책임 분담(관리 주체) 비교
- [ ] 공유 책임 모델(Shared Responsibility Model) 이해
- [ ] 배포 모델: 퍼블릭, 프라이빗, 하이브리드, 멀티 클라우드
- [ ] 각 서비스 모델에 해당하는 Azure 서비스 예시 3개씩 정리 (예: IaaS=VM, PaaS=App
      Service, SaaS=Microsoft 365)
- [ ] `app/` 퀴즈 - "도메인 1: 클라우드 개념" 세트 풀이 (목표 정답률 80%+)

## Day 3 — Azure 핵심 아키텍처 (도메인 2-1)

- [ ] 리전(Region), 리전 페어(Region Pair), 소버린 리전(Sovereign region) 개념
- [ ] 가용성 영역(Availability Zone) vs 가용성 집합(Availability Set) 차이
- [ ] 리소스 계층 구조: 관리 그룹(Management Group) → 구독(Subscription) →
      리소스 그룹(Resource Group) → 리소스(Resource)
- [ ] Azure Resource Manager(ARM)의 역할과 ARM 템플릿 개념
- [ ] `app/` 플래시카드 - "Azure 아키텍처" 세트 1회 학습

## Day 4 — 컴퓨팅 서비스 (도메인 2-2)

- [ ] 가상 머신(VM), VM 확장 집합(Scale Sets)
- [ ] App Service, Azure Container Instances(ACI), Azure Kubernetes Service(AKS)
- [ ] Azure Functions(서버리스), Logic Apps 차이
- [ ] Azure Virtual Desktop 개요
- [ ] 각 컴퓨팅 서비스를 "언제 쓰는가" 기준으로 시나리오 매칭 연습
- [ ] `app/` 퀴즈 - "컴퓨팅 서비스" 세트 풀이

## Day 5 — 네트워킹 서비스 (도메인 2-3)

- [ ] 가상 네트워크(VNet), 서브넷 개념
- [ ] VPN Gateway vs ExpressRoute 비교
- [ ] Azure DNS, Load Balancer vs Application Gateway vs Traffic Manager 차이
- [ ] Azure CDN, Azure Front Door 개요
- [ ] `app/` 플래시카드 - "네트워킹" 세트 1회 학습

## Day 6 — 스토리지 서비스 (도메인 2-4)

- [ ] Blob / Disk / File / Queue / Table 스토리지 차이
- [ ] Blob 액세스 계층: Hot / Cool / Archive
- [ ] 스토리지 중복 옵션: LRS / ZRS / GRS / GZRS / RA-GRS
- [ ] 데이터 이전 도구: Azure Migrate, Azure Data Box, Azure File Sync
- [ ] `app/` 퀴즈 - "스토리지" 세트 풀이

## Day 7 — 복습 + 모의고사 1회 (도메인 1~2 종합)

- [ ] Day 1~6 플래시카드 전체 재학습 (틀렸던 카드 위주)
- [ ] `app/` 퀴즈 - "종합 모의고사 1" (도메인 1~2 혼합, 목표 정답률 80%+)
- [ ] 오답 노트 정리: 왜 틀렸는지 한 줄로 기록
- [ ] 취약 주제 1~2개 선정 후 Microsoft Learn에서 재학습

## Day 8 — ID/액세스/보안 (도메인 3-1)

- [ ] Microsoft Entra ID(구 Azure AD): 인증(Authentication) vs 인가(Authorization)
- [ ] 다단계 인증(MFA), 조건부 액세스(Conditional Access), SSO
- [ ] RBAC(역할 기반 액세스 제어) 개념과 범위(Scope)
- [ ] 제로 트러스트(Zero Trust) 원칙, 심층 방어(Defense in depth)
- [ ] Microsoft Defender for Cloud, Microsoft Sentinel 개요
- [ ] `app/` 플래시카드 - "ID/보안" 세트 1회 학습

## Day 9 — 비용 관리 및 거버넌스 (도메인 3-2)

- [ ] Pricing Calculator vs TCO Calculator 차이와 용도
- [ ] Azure Cost Management, 예산(Budget), 태그(Tags) 활용
- [ ] Azure Policy, Resource Locks, Azure Blueprints 개념
- [ ] Cloud Adoption Framework(CAF) 개요
- [ ] `app/` 퀴즈 - "비용 관리·거버넌스" 세트 풀이

## Day 10 — 모니터링/관리 도구 + 최종 모의고사

- [ ] Azure Monitor, Log Analytics, Azure Advisor, Service Health/Status 차이
- [ ] 관리 도구 비교: Azure Portal, Azure CLI, Azure PowerShell, Cloud Shell
- [ ] `app/` 퀴즈 - "종합 모의고사 2" (전 도메인, 목표 정답률 85%+)
- [ ] 전체 오답 노트 최종 복습
- [ ] 시험 응시 환경/절차 확인 (Pearson VUE, 신분증, 온라인 프록터링 규정 등)

---

## 시간이 부족하다면: 7일 압축 안

| 압축 Day | 병합 대상 |
|---|---|
| 1 | 원래 Day 1 + Day 2 |
| 2 | 원래 Day 3 |
| 3 | 원래 Day 4 + Day 5 |
| 4 | 원래 Day 6 |
| 5 | 원래 Day 7 (모의고사 1) |
| 6 | 원래 Day 8 + Day 9 |
| 7 | 원래 Day 10 (모의고사 2 + 최종 복습) |

## 참고 자료

- Microsoft Learn 공식 학습 경로: https://learn.microsoft.com/training/courses/az-900t00
- 공식 시험 페이지(응시 안내, Skills Outline PDF): https://learn.microsoft.com/credentials/certifications/azure-fundamentals/
- 이 리포지토리의 `app/` 웹앱: 플래시카드·퀴즈로 도메인별 반복 학습
