// AZ-900 학습 데이터: 플래시카드, 퀴즈 문제, 10일 학습 계획 체크리스트
// 모두 정적 데이터이며 별도 빌드 없이 브라우저에서 바로 로드됩니다.

const TOPICS = [
  { key: "cloud-concepts", label: "클라우드 개념", domain: 1 },
  { key: "architecture", label: "Azure 아키텍처", domain: 2 },
  { key: "compute", label: "컴퓨팅 서비스", domain: 2 },
  { key: "networking", label: "네트워킹", domain: 2 },
  { key: "storage", label: "스토리지", domain: 2 },
  { key: "identity-security", label: "ID/보안", domain: 3 },
  { key: "cost-governance", label: "비용 관리·거버넌스", domain: 3 },
  { key: "monitoring-tools", label: "모니터링·관리도구", domain: 3 },
];

const FLASHCARDS = [
  // --- 클라우드 개념 ---
  { topic: "cloud-concepts", front: "고가용성(High Availability)이란?", back: "장애가 발생해도 사전에 합의된 수준으로 서비스가 계속 작동하도록 하는 것. Azure는 SLA로 가용성 수준을 보장." },
  { topic: "cloud-concepts", front: "확장성(Scalability)과 탄력성(Elasticity)의 차이는?", back: "확장성: 늘어난 수요를 처리하기 위해 리소스를 추가/제거할 수 있는 능력(수동/자동). 탄력성: 수요 변화에 따라 자동으로 리소스가 늘고 줄어드는 능력." },
  { topic: "cloud-concepts", front: "민첩성(Agility)이 클라우드에서 의미하는 것은?", back: "필요한 리소스를 빠르게 만들고 구성해 아이디어를 신속히 제품/서비스로 구현할 수 있는 능력." },
  { topic: "cloud-concepts", front: "CapEx와 OpEx의 차이는?", back: "CapEx(자본 지출): 초기에 대규모 자산을 구매하는 지출. OpEx(운영 지출): 사용한 만큼 지불하는 지출. 클라우드는 CapEx를 OpEx로 전환." },
  { topic: "cloud-concepts", front: "IaaS, PaaS, SaaS의 예시를 각각 하나씩 들면?", back: "IaaS: Azure Virtual Machines. PaaS: Azure App Service. SaaS: Microsoft 365." },
  { topic: "cloud-concepts", front: "공유 책임 모델(Shared Responsibility Model)이란?", back: "클라우드 서비스 유형에 따라 보안 책임이 고객과 클라우드 제공자 사이에 분담되는 모델. IaaS로 갈수록 고객 책임이 커지고, SaaS로 갈수록 제공자 책임이 커짐." },
  { topic: "cloud-concepts", front: "퍼블릭 클라우드, 프라이빗 클라우드, 하이브리드 클라우드를 구분하면?", back: "퍼블릭: 제3자가 소유/운영하는 공용 인프라. 프라이빗: 단일 조직 전용 인프라. 하이브리드: 둘을 연결해 함께 사용." },
  { topic: "cloud-concepts", front: "종량제(Consumption-based) 모델의 장점은?", back: "사용한 리소스만큼만 비용을 지불하며, 예측 및 필요에 따라 리소스를 유연하게 늘리거나 줄일 수 있음." },

  // --- Azure 아키텍처 ---
  { topic: "architecture", front: "Azure 리전(Region)이란?", back: "지연 시간을 고려해 정의된 경계 내에 배포된 데이터 센터의 집합. 하나 이상의 데이터 센터로 구성." },
  { topic: "architecture", front: "리전 페어(Region Pair)란?", back: "같은 지리적 영역 내 최소 300마일 이상 떨어진 두 리전을 짝지어, 한쪽 리전 장애 시 다른 리전으로 복구를 지원하는 구성." },
  { topic: "architecture", front: "가용성 영역(Availability Zone)이란?", back: "리전 내에서 독립된 전원, 냉각, 네트워크를 갖춘 물리적으로 분리된 데이터센터 그룹(최소 3개). 리전 내 데이터센터 장애로부터 보호." },
  { topic: "architecture", front: "가용성 집합(Availability Set)이란?", back: "동일 데이터센터 내에서 VM을 장애 도메인과 업데이트 도메인에 분산 배치해 하드웨어 장애/유지관리로부터 보호하는 논리적 그룹." },
  { topic: "architecture", front: "Azure 리소스 계층 구조 순서는?", back: "관리 그룹(Management Group) → 구독(Subscription) → 리소스 그룹(Resource Group) → 리소스(Resource)." },
  { topic: "architecture", front: "리소스 그룹(Resource Group)이란?", back: "Azure 솔루션 관련 리소스들을 담는 논리적 컨테이너. 리소스 그룹을 삭제하면 그 안의 모든 리소스가 함께 삭제됨." },
  { topic: "architecture", front: "Azure Resource Manager(ARM)의 역할은?", back: "Azure 리소스를 배포, 관리, 구성하기 위한 배포/관리 계층. 포털, CLI, PowerShell, REST API 요청이 모두 ARM을 거쳐 처리됨." },
  { topic: "architecture", front: "소버린 리전(Sovereign Region)이란?", back: "특별한 규정/컴플라이언스 요구(예: 정부기관용) 때문에 일반 Azure 퍼블릭 클라우드와 분리 운영되는 리전. 예: Azure Government, Azure China." },

  // --- 컴퓨팅 서비스 ---
  { topic: "compute", front: "Azure Virtual Machines는 어떤 서비스 모델?", back: "IaaS(Infrastructure as a Service). OS와 미들웨어까지 고객이 직접 관리." },
  { topic: "compute", front: "VM 확장 집합(Virtual Machine Scale Sets)이란?", back: "동일하게 구성된 VM 집합을 만들고 관리해, 수요에 따라 자동으로 확장/축소(Autoscale)할 수 있게 하는 서비스." },
  { topic: "compute", front: "Azure App Service는 어떤 서비스 모델?", back: "PaaS. 웹앱, REST API, 모바일 백엔드를 호스팅하며 인프라 관리 없이 코드 배포에 집중 가능." },
  { topic: "compute", front: "Azure Container Instances(ACI)의 특징은?", back: "VM 프로비저닝이나 오케스트레이션 없이 컨테이너를 가장 빠르고 간단하게 실행할 수 있는 서버리스 컨테이너 서비스." },
  { topic: "compute", front: "Azure Kubernetes Service(AKS)란?", back: "관리형 Kubernetes 클러스터 서비스로, 컨테이너화된 애플리케이션의 배포/확장/운영을 자동화." },
  { topic: "compute", front: "Azure Functions의 특징은?", back: "서버리스 컴퓨트 서비스. 이벤트에 반응해 코드를 실행하며, 사용한 실행 시간만큼만 과금(Consumption plan)." },
  { topic: "compute", front: "Azure Functions와 Logic Apps의 차이는?", back: "Functions: 코드 기반으로 이벤트에 반응해 로직 실행. Logic Apps: 코드 없이(Low-code) 워크플로우를 시각적으로 설계해 여러 서비스를 연결." },
  { topic: "compute", front: "Azure Virtual Desktop이란?", back: "클라우드에서 Windows 데스크톱과 앱을 가상화해 어디서든 접속할 수 있게 하는 데스크톱/앱 가상화 서비스(DaaS)." },

  // --- 네트워킹 ---
  { topic: "networking", front: "가상 네트워크(Virtual Network, VNet)란?", back: "Azure 리소스들이 서로 및 인터넷, 온프레미스 네트워크와 안전하게 통신하도록 하는 Azure 네트워킹의 기본 구성 요소." },
  { topic: "networking", front: "VPN Gateway란?", back: "인터넷을 통해 온프레미스 네트워크와 Azure VNet 간, 또는 VNet 간에 암호화된 트래픽을 전송하는 게이트웨이." },
  { topic: "networking", front: "ExpressRoute란?", back: "공용 인터넷을 거치지 않고 전용 사설 연결로 온프레미스와 Azure를 연결하는 서비스. 더 높은 보안성, 안정성, 낮은 지연 시간 제공." },
  { topic: "networking", front: "VPN Gateway와 ExpressRoute의 핵심 차이는?", back: "VPN Gateway는 인터넷 기반 암호화 터널, ExpressRoute는 통신사를 통한 전용 사설 연결(인터넷 미경유)." },
  { topic: "networking", front: "Load Balancer와 Application Gateway의 차이는?", back: "Load Balancer: OSI 4계층(전송 계층)에서 TCP/UDP 트래픽 분산. Application Gateway: 7계층(애플리케이션 계층)에서 URL 기반 라우팅 등 HTTP(S) 트래픽 처리(WAF 포함 가능)." },
  { topic: "networking", front: "Azure Traffic Manager란?", back: "DNS 기반으로 여러 리전에 분산된 서비스 엔드포인트에 트래픽을 분산시키는 글로벌 트래픽 라우팅 서비스." },
  { topic: "networking", front: "Azure CDN(Content Delivery Network)이란?", back: "전 세계에 분산된 서버 네트워크를 통해 정적 콘텐츠를 사용자와 가까운 곳에서 제공해 지연 시간을 줄이는 서비스." },
  { topic: "networking", front: "Azure DNS의 역할은?", back: "Azure 인프라를 이용해 도메인 이름을 호스팅하고 관리하는 서비스." },

  // --- 스토리지 ---
  { topic: "storage", front: "Azure Blob Storage란?", back: "텍스트, 이미지, 동영상 등 대용량 비정형(unstructured) 데이터를 저장하기 위한 객체 스토리지." },
  { topic: "storage", front: "Blob 스토리지의 3가지 액세스 계층(Access tier)은?", back: "Hot(자주 접근), Cool(가끔 접근, 최소 30일 보관), Archive(거의 접근 안 함, 오프라인, 최소 180일 보관)." },
  { topic: "storage", front: "LRS, ZRS, GRS의 차이는?", back: "LRS: 동일 데이터센터 내 3개 복제본. ZRS: 리전 내 여러 가용성 영역에 복제. GRS: 주 리전 + 페어 리전(다른 지역)에 복제." },
  { topic: "storage", front: "Azure Disk Storage는 어떤 용도?", back: "Azure VM에 연결하는 블록 수준 스토리지 볼륨(가상 하드 디스크)." },
  { topic: "storage", front: "Azure Files의 특징은?", back: "SMB/NFS 프로토콜을 지원하는 완전관리형 클라우드 파일 공유. 온프레미스와 클라우드에서 동시에 마운트 가능." },
  { topic: "storage", front: "Azure Migrate의 역할은?", back: "온프레미스 서버/VM/데이터베이스를 Azure로 평가하고 마이그레이션하는 것을 지원하는 허브 서비스." },
  { topic: "storage", front: "Azure Data Box란?", back: "대용량 오프라인 데이터를 물리적 장치를 이용해 Azure로 전송하는 서비스. 네트워크 대역폭이 부족할 때 사용." },

  // --- ID/보안 ---
  { topic: "identity-security", front: "인증(Authentication)과 인가(Authorization)의 차이는?", back: "인증: 사용자가 누구인지 확인하는 과정. 인가: 인증된 사용자가 무엇에 접근할 수 있는지 권한을 결정하는 과정." },
  { topic: "identity-security", front: "Microsoft Entra ID(구 Azure AD)란?", back: "클라우드 기반 ID 및 액세스 관리 서비스로, 사용자가 Microsoft 365, Azure Portal, 기타 SaaS 앱에 로그인/접근할 수 있게 함." },
  { topic: "identity-security", front: "다단계 인증(MFA)이란?", back: "비밀번호 외에 추가로 하나 이상의 인증 방법(문자, 앱 알림, 생체인식 등)을 요구해 보안을 강화하는 방식." },
  { topic: "identity-security", front: "조건부 액세스(Conditional Access)란?", back: "위치, 기기 상태, 위험도 등 신호(signal)를 바탕으로 액세스 제어 결정을 자동화하는 정책 기반 기능." },
  { topic: "identity-security", front: "RBAC(역할 기반 액세스 제어)란?", back: "사용자/그룹에게 리소스에 대한 특정 역할(예: Reader, Contributor, Owner)을 할당해 세분화된 액세스 관리를 제공하는 인가 시스템." },
  { topic: "identity-security", front: "제로 트러스트(Zero Trust) 원칙 3가지는?", back: "명시적으로 검증(Verify explicitly), 최소 권한 액세스(Least privileged access) 사용, 침해 가정(Assume breach)." },
  { topic: "identity-security", front: "심층 방어(Defense in depth)란?", back: "물리 보안, ID/액세스, 경계, 네트워크, 컴퓨팅, 애플리케이션, 데이터 등 여러 계층에서 방어를 겹겹이 적용하는 보안 전략." },
  { topic: "identity-security", front: "Microsoft Defender for Cloud의 역할은?", back: "하이브리드/멀티클라우드 워크로드에 대한 보안 상태를 강화하고 위협을 탐지/대응하는 통합 보안 관리 도구(CSPM/CWPP)." },
  { topic: "identity-security", front: "Microsoft Sentinel이란?", back: "클라우드 기반 SIEM(보안 정보 이벤트 관리) + SOAR(보안 오케스트레이션 자동 대응) 솔루션. 조직 전체의 보안 이벤트를 수집/분석." },

  // --- 비용 관리·거버넌스 ---
  { topic: "cost-governance", front: "Pricing Calculator와 TCO Calculator의 차이는?", back: "Pricing Calculator: Azure 서비스 예상 비용을 사전에 견적. TCO Calculator: 온프레미스 인프라 대비 Azure로 이전 시 총소유비용 절감액을 비교." },
  { topic: "cost-governance", front: "Azure Cost Management란?", back: "Azure 지출을 모니터링, 할당, 최적화하는 도구 모음. 예산 설정, 비용 분석, 알림 기능 제공." },
  { topic: "cost-governance", front: "태그(Tags)를 사용하는 이유는?", back: "리소스에 메타데이터(이름-값 쌍)를 부여해 비용 추적, 리소스 구성/관리를 논리적으로 그룹화하기 위함." },
  { topic: "cost-governance", front: "Azure Policy란?", back: "조직의 표준/규정 준수를 위해 리소스에 대한 규칙(정책)을 만들고 평가해 비준수 리소스를 감사하거나 방지하는 서비스." },
  { topic: "cost-governance", front: "리소스 잠금(Resource Lock)이란?", back: "구독, 리소스 그룹, 리소스에 대해 실수로 삭제하거나 수정하는 것을 막는 잠금 기능(CanNotDelete, ReadOnly)." },
  { topic: "cost-governance", front: "Azure Blueprints란?", back: "리소스 그룹, 정책, 역할 할당, ARM 템플릿 등을 하나의 패키지로 정의해 반복 가능하게 환경을 구성/배포하는 서비스." },
  { topic: "cost-governance", front: "Cloud Adoption Framework(CAF)란?", back: "조직이 클라우드 도입 전략을 수립하고 실행하기 위한 Microsoft의 모범 사례, 문서, 도구 모음." },

  // --- 모니터링·관리도구 ---
  { topic: "monitoring-tools", front: "Azure Monitor란?", back: "Azure 및 온프레미스 환경의 애플리케이션/인프라에서 텔레메트리 데이터를 수집, 분석, 대응하는 종합 모니터링 서비스." },
  { topic: "monitoring-tools", front: "Azure Advisor의 역할은?", back: "비용, 보안, 안정성, 성능, 운영 우수성 관점에서 리소스 구성을 분석해 개인화된 모범 사례 권장사항을 제공." },
  { topic: "monitoring-tools", front: "Azure Service Health란?", back: "현재 진행 중인 Azure 서비스 문제, 계획된 유지 관리, 자신의 구독에 영향을 주는 상태를 알려주는 개인화된 대시보드." },
  { topic: "monitoring-tools", front: "Azure Portal, CLI, PowerShell, Cloud Shell의 차이는?", back: "Portal: 웹 기반 GUI 관리. CLI/PowerShell: 명령줄 스크립트 기반 관리(자동화 용이). Cloud Shell: 브라우저에서 바로 쓰는 관리형 셸(CLI/PowerShell 모두 지원)." },
  { topic: "monitoring-tools", front: "Log Analytics란?", back: "Azure Monitor의 일부로, 로그 데이터를 쿼리(KQL)해 분석할 수 있는 도구." },
];

const QUIZ = [
  // --- 클라우드 개념 ---
  { topic: "cloud-concepts", q: "수요 변화에 따라 리소스가 자동으로 늘어나고 줄어드는 클라우드 특성은?", options: ["탄력성(Elasticity)", "민첩성(Agility)", "고가용성(High availability)", "내결함성(Fault tolerance)"], answer: 0, explain: "탄력성은 부하에 맞춰 리소스를 자동으로 조정하는 능력입니다. 확장성은 수동/자동 모두 포함하는 더 넓은 개념입니다." },
  { topic: "cloud-concepts", q: "초기 대규모 자산 투자 대신 사용한 만큼 지불하는 방식으로 전환하는 것은?", options: ["OpEx로 전환", "CapEx로 전환", "TCO 증가", "SLA 강화"], answer: 0, explain: "클라우드는 자본 지출(CapEx)을 운영 지출(OpEx)로 전환시켜 초기 투자 부담을 줄입니다." },
  { topic: "cloud-concepts", q: "다음 중 SaaS(Software as a Service)의 예시는?", options: ["Microsoft 365", "Azure Virtual Machines", "Azure App Service", "Azure Kubernetes Service"], answer: 0, explain: "Microsoft 365는 완성된 소프트웨어를 그대로 사용하는 SaaS입니다." },
  { topic: "cloud-concepts", q: "공유 책임 모델에서 고객의 책임이 가장 큰 서비스 모델은?", options: ["IaaS", "PaaS", "SaaS", "모두 동일"], answer: 0, explain: "IaaS는 OS, 미들웨어, 데이터, 앱까지 고객이 관리해야 할 범위가 가장 넓습니다." },
  { topic: "cloud-concepts", q: "단일 조직 전용으로 구축된 클라우드 인프라를 무엇이라 하는가?", options: ["프라이빗 클라우드", "퍼블릭 클라우드", "하이브리드 클라우드", "멀티 클라우드"], answer: 0, explain: "프라이빗 클라우드는 특정 조직만을 위한 전용 인프라입니다." },

  // --- Azure 아키텍처 ---
  { topic: "architecture", q: "리전 내에서 독립된 전원과 네트워크를 갖춘 물리적으로 분리된 데이터센터 그룹은?", options: ["가용성 영역(Availability Zone)", "가용성 집합(Availability Set)", "리전 페어(Region Pair)", "관리 그룹(Management Group)"], answer: 0, explain: "가용성 영역은 리전 내에서 물리적으로 분리된 데이터센터 그룹으로 최소 3개로 구성됩니다." },
  { topic: "architecture", q: "Azure 리소스 계층 구조에서 가장 상위 레벨은?", options: ["관리 그룹(Management Group)", "구독(Subscription)", "리소스 그룹(Resource Group)", "리소스(Resource)"], answer: 0, explain: "관리 그룹 → 구독 → 리소스 그룹 → 리소스 순서입니다." },
  { topic: "architecture", q: "리소스 그룹을 삭제하면 어떤 일이 발생하는가?", options: ["그룹 내 모든 리소스가 함께 삭제된다", "구독이 삭제된다", "리소스만 남고 그룹만 삭제된다", "아무 일도 일어나지 않는다"], answer: 0, explain: "리소스 그룹 삭제 시 그 안의 모든 리소스가 함께 삭제되므로 주의가 필요합니다." },
  { topic: "architecture", q: "같은 지리 영역 내 최소 300마일 떨어진 두 리전을 짝지은 것은?", options: ["리전 페어(Region Pair)", "가용성 영역", "가용성 집합", "관리 그룹"], answer: 0, explain: "리전 페어는 재해 복구를 위해 서로 떨어진 두 리전을 짝짓는 개념입니다." },
  { topic: "architecture", q: "Azure Portal, CLI, PowerShell 요청이 공통적으로 거치는 배포/관리 계층은?", options: ["Azure Resource Manager(ARM)", "Azure Monitor", "Azure Policy", "Azure Advisor"], answer: 0, explain: "ARM은 모든 Azure 리소스 관리 요청을 처리하는 공통 계층입니다." },

  // --- 컴퓨팅 서비스 ---
  { topic: "compute", q: "VM 프로비저닝 없이 컨테이너를 가장 빠르게 실행할 수 있는 서비스는?", options: ["Azure Container Instances", "Azure Kubernetes Service", "Azure Virtual Machines", "Azure Virtual Desktop"], answer: 0, explain: "ACI는 오케스트레이션 없이 컨테이너를 즉시 실행하는 서버리스 컨테이너 서비스입니다." },
  { topic: "compute", q: "코드 없이(Low-code) 워크플로우를 시각적으로 설계해 여러 서비스를 연결하는 서비스는?", options: ["Logic Apps", "Azure Functions", "Azure Kubernetes Service", "App Service"], answer: 0, explain: "Logic Apps는 로우코드 방식으로 워크플로우를 자동화합니다." },
  { topic: "compute", q: "관리형 Kubernetes 클러스터를 제공하는 서비스는?", options: ["Azure Kubernetes Service(AKS)", "Azure Container Instances(ACI)", "Azure App Service", "Azure Functions"], answer: 0, explain: "AKS는 Kubernetes 클러스터의 배포와 운영을 관리형으로 제공합니다." },
  { topic: "compute", q: "사용한 실행 시간만큼만 과금되는 이벤트 기반 서버리스 컴퓨트 서비스는?", options: ["Azure Functions", "Azure Virtual Machines", "VM Scale Sets", "Azure Virtual Desktop"], answer: 0, explain: "Azure Functions의 Consumption plan은 실행된 만큼만 과금됩니다." },
  { topic: "compute", q: "동일하게 구성된 VM 집합을 만들어 자동 확장/축소를 지원하는 서비스는?", options: ["VM Scale Sets", "Azure Container Instances", "Azure Functions", "App Service"], answer: 0, explain: "VM Scale Sets는 동일 구성 VM 그룹의 오토스케일을 지원합니다." },

  // --- 네트워킹 ---
  { topic: "networking", q: "공용 인터넷을 거치지 않고 온프레미스와 Azure를 전용 사설 연결로 연결하는 서비스는?", options: ["ExpressRoute", "VPN Gateway", "Azure DNS", "Traffic Manager"], answer: 0, explain: "ExpressRoute는 통신사를 통한 전용 회선으로 인터넷을 거치지 않습니다." },
  { topic: "networking", q: "URL 경로 기반 라우팅 등 HTTP(S) 계층(7계층) 트래픽을 처리하는 서비스는?", options: ["Application Gateway", "Load Balancer", "VPN Gateway", "ExpressRoute"], answer: 0, explain: "Application Gateway는 애플리케이션 계층(L7)에서 동작하며 WAF도 포함할 수 있습니다." },
  { topic: "networking", q: "DNS 기반으로 여러 리전의 엔드포인트에 트래픽을 분산시키는 서비스는?", options: ["Traffic Manager", "Load Balancer", "Application Gateway", "Azure Firewall"], answer: 0, explain: "Traffic Manager는 DNS 레벨에서 전역 트래픽 라우팅을 수행합니다." },
  { topic: "networking", q: "Azure 리소스가 인터넷 및 온프레미스와 안전하게 통신하는 기본 네트워킹 구성 요소는?", options: ["가상 네트워크(VNet)", "Azure CDN", "Azure DNS", "Network Security Group"], answer: 0, explain: "VNet은 Azure 네트워킹의 기본 구성 요소입니다." },
  { topic: "networking", q: "정적 콘텐츠를 사용자와 지리적으로 가까운 서버에서 제공해 지연 시간을 줄이는 서비스는?", options: ["Azure CDN", "ExpressRoute", "VPN Gateway", "Load Balancer"], answer: 0, explain: "CDN은 전 세계에 분산된 캐시 서버를 통해 콘텐츠 전달 속도를 높입니다." },

  // --- 스토리지 ---
  { topic: "storage", q: "거의 접근하지 않는 데이터를 가장 저렴하게 저장하는 Blob 액세스 계층은?", options: ["Archive", "Hot", "Cool", "Premium"], answer: 0, explain: "Archive 계층은 오프라인 저장이며 최소 180일 보관, 가장 저렴하지만 접근 시 재수화(rehydrate)가 필요합니다." },
  { topic: "storage", q: "주 리전과 페어 리전(다른 지리적 위치) 모두에 데이터를 복제하는 중복 옵션은?", options: ["GRS", "LRS", "ZRS", "없음"], answer: 0, explain: "GRS(Geo-redundant storage)는 주 리전과 페어 리전에 각각 복제본을 저장합니다." },
  { topic: "storage", q: "SMB/NFS 프로토콜로 클라우드와 온프레미스에서 동시에 마운트 가능한 완전관리형 파일 공유는?", options: ["Azure Files", "Azure Blob Storage", "Azure Disk Storage", "Azure Data Box"], answer: 0, explain: "Azure Files는 표준 파일 공유 프로토콜을 지원하는 관리형 서비스입니다." },
  { topic: "storage", q: "대용량 오프라인 데이터를 물리적 장치로 Azure에 전송하는 서비스는?", options: ["Azure Data Box", "Azure Migrate", "Azure Files", "Azure Import/Export만 가능"], answer: 0, explain: "Azure Data Box는 네트워크 대역폭이 부족할 때 물리적 장치로 대용량 데이터를 옮깁니다." },
  { topic: "storage", q: "Azure VM에 연결하는 블록 수준 스토리지는?", options: ["Azure Disk Storage", "Azure Blob Storage", "Azure Files", "Azure Table Storage"], answer: 0, explain: "Disk Storage는 VM의 가상 하드 디스크로 사용됩니다." },

  // --- ID/보안 ---
  { topic: "identity-security", q: "인증된 사용자가 무엇에 접근할 수 있는지 결정하는 과정은?", options: ["인가(Authorization)", "인증(Authentication)", "감사(Auditing)", "암호화(Encryption)"], answer: 0, explain: "인증은 신원 확인, 인가는 권한 결정입니다." },
  { topic: "identity-security", q: "위치, 기기 상태 등의 신호를 바탕으로 액세스 정책을 자동 적용하는 기능은?", options: ["조건부 액세스(Conditional Access)", "MFA", "RBAC", "Azure Policy"], answer: 0, explain: "조건부 액세스는 신호 기반으로 액세스 여부를 동적으로 결정합니다." },
  { topic: "identity-security", q: "사용자/그룹에 리소스에 대한 역할을 할당해 세분화된 권한을 관리하는 시스템은?", options: ["RBAC", "MFA", "Conditional Access", "Zero Trust"], answer: 0, explain: "RBAC(역할 기반 액세스 제어)는 Reader, Contributor, Owner 등의 역할을 할당합니다." },
  { topic: "identity-security", q: "제로 트러스트 원칙에 해당하지 않는 것은?", options: ["암묵적 신뢰(Implicit trust) 부여", "명시적 검증(Verify explicitly)", "최소 권한 액세스", "침해 가정(Assume breach)"], answer: 0, explain: "제로 트러스트는 암묵적 신뢰를 배제하고 항상 명시적으로 검증하는 것이 핵심입니다." },
  { topic: "identity-security", q: "클라우드 기반 SIEM + SOAR 솔루션은?", options: ["Microsoft Sentinel", "Microsoft Defender for Cloud", "Microsoft Entra ID", "Azure Policy"], answer: 0, explain: "Sentinel은 보안 이벤트 수집/분석(SIEM)과 자동 대응(SOAR)을 함께 제공합니다." },

  // --- 비용 관리·거버넌스 ---
  { topic: "cost-governance", q: "온프레미스 대비 Azure 이전 시 비용 절감을 비교하는 도구는?", options: ["TCO Calculator", "Pricing Calculator", "Azure Cost Management", "Azure Advisor"], answer: 0, explain: "TCO Calculator는 총소유비용 비교를 위한 도구입니다." },
  { topic: "cost-governance", q: "구독/리소스 그룹/리소스가 실수로 삭제되거나 수정되는 것을 막는 기능은?", options: ["리소스 잠금(Resource Lock)", "Azure Policy", "RBAC", "태그(Tags)"], answer: 0, explain: "리소스 잠금은 CanNotDelete, ReadOnly 두 가지 유형이 있습니다." },
  { topic: "cost-governance", q: "리소스 그룹, 정책, 역할 할당 등을 패키지로 묶어 반복 가능하게 환경을 구성하는 서비스는?", options: ["Azure Blueprints", "Azure Policy", "ARM 템플릿만 가능", "Resource Lock"], answer: 0, explain: "Blueprints는 여러 구성 요소를 하나의 패키지로 정의해 재사용합니다." },
  { topic: "cost-governance", q: "조직의 규정 준수를 위해 리소스에 규칙을 적용하고 비준수를 감사/방지하는 서비스는?", options: ["Azure Policy", "Azure Blueprints", "RBAC", "Cost Management"], answer: 0, explain: "Azure Policy는 조직 표준 준수를 위한 규칙 평가 서비스입니다." },
  { topic: "cost-governance", q: "리소스에 이름-값 쌍의 메타데이터를 붙여 비용 추적/그룹화하는 기능은?", options: ["태그(Tags)", "Resource Lock", "Management Group", "Blueprints"], answer: 0, explain: "태그는 리소스를 논리적으로 분류하고 비용 보고서에서 필터링하는 데 사용됩니다." },

  // --- 모니터링·관리도구 ---
  { topic: "monitoring-tools", q: "비용, 보안, 안정성, 성능 관점에서 개인화된 모범 사례를 권장하는 서비스는?", options: ["Azure Advisor", "Azure Monitor", "Azure Policy", "Service Health"], answer: 0, explain: "Advisor는 구성 분석 후 맞춤형 권장사항을 제시합니다." },
  { topic: "monitoring-tools", q: "진행 중인 서비스 문제나 계획된 유지 관리로 인한 영향을 알려주는 개인화된 대시보드는?", options: ["Azure Service Health", "Azure Monitor", "Azure Advisor", "Log Analytics"], answer: 0, explain: "Service Health는 구독에 영향을 주는 이벤트를 개인화해서 보여줍니다." },
  { topic: "monitoring-tools", q: "로그 데이터를 KQL로 쿼리해 분석하는 Azure Monitor의 구성 요소는?", options: ["Log Analytics", "Azure Advisor", "Azure Policy", "Resource Lock"], answer: 0, explain: "Log Analytics는 Azure Monitor 내에서 로그 쿼리 및 분석을 담당합니다." },
  { topic: "monitoring-tools", q: "브라우저에서 바로 사용할 수 있는 관리형 셸로 CLI/PowerShell을 모두 지원하는 것은?", options: ["Azure Cloud Shell", "Azure Portal", "Azure Advisor", "ARM 템플릿"], answer: 0, explain: "Cloud Shell은 설치 없이 브라우저에서 바로 명령줄 관리를 할 수 있게 합니다." },
  { topic: "monitoring-tools", q: "Azure 및 온프레미스 텔레메트리 데이터를 수집·분석·대응하는 종합 모니터링 서비스는?", options: ["Azure Monitor", "Azure Advisor", "Azure Policy", "Azure Blueprints"], answer: 0, explain: "Azure Monitor는 메트릭, 로그 등 다양한 텔레메트리를 통합 수집/분석합니다." },
];

const PLAN_DAYS = [
  { day: 1, title: "클라우드 개념 기초", items: [
    "클라우드 이점: HA/확장성/탄력성/민첩성/DR",
    "비용 모델: CapEx vs OpEx, 종량제",
    "클라우드 vs 온프레미스 비교표 작성",
    "Microsoft Learn '클라우드 컴퓨팅 개념' 완료",
    "플래시카드 '클라우드 개념' 1회 학습",
  ]},
  { day: 2, title: "서비스/배포 모델", items: [
    "IaaS/PaaS/SaaS 정의 및 책임 분담 비교",
    "공유 책임 모델 이해",
    "배포 모델: 퍼블릭/프라이빗/하이브리드/멀티클라우드",
    "서비스 모델별 Azure 서비스 예시 정리",
    "퀴즈 '클라우드 개념' 세트 풀이 (목표 80%+)",
  ]},
  { day: 3, title: "Azure 핵심 아키텍처", items: [
    "리전/리전 페어/소버린 리전 개념",
    "가용성 영역 vs 가용성 집합 차이",
    "관리 그룹→구독→리소스 그룹→리소스 계층 구조",
    "ARM의 역할과 템플릿 개념",
    "플래시카드 'Azure 아키텍처' 1회 학습",
  ]},
  { day: 4, title: "컴퓨팅 서비스", items: [
    "VM, VM Scale Sets",
    "App Service, ACI, AKS",
    "Azure Functions vs Logic Apps",
    "Azure Virtual Desktop 개요",
    "퀴즈 '컴퓨팅 서비스' 세트 풀이",
  ]},
  { day: 5, title: "네트워킹 서비스", items: [
    "VNet, 서브넷 개념",
    "VPN Gateway vs ExpressRoute",
    "Azure DNS, Load Balancer vs App Gateway vs Traffic Manager",
    "Azure CDN, Front Door 개요",
    "플래시카드 '네트워킹' 1회 학습",
  ]},
  { day: 6, title: "스토리지 서비스", items: [
    "Blob/Disk/File/Queue/Table 차이",
    "Blob 액세스 계층: Hot/Cool/Archive",
    "중복 옵션: LRS/ZRS/GRS/GZRS",
    "데이터 이전 도구: Migrate/Data Box/File Sync",
    "퀴즈 '스토리지' 세트 풀이",
  ]},
  { day: 7, title: "복습 + 모의고사 1", items: [
    "Day 1~6 플래시카드 재학습(오답 위주)",
    "종합 모의고사 1 (도메인 1~2, 목표 80%+)",
    "오답 노트 정리",
    "취약 주제 재학습",
  ]},
  { day: 8, title: "ID/액세스/보안", items: [
    "Entra ID: 인증 vs 인가",
    "MFA, 조건부 액세스, SSO",
    "RBAC 개념과 범위",
    "제로 트러스트, 심층 방어",
    "Defender for Cloud, Sentinel 개요",
    "플래시카드 'ID/보안' 1회 학습",
  ]},
  { day: 9, title: "비용 관리 및 거버넌스", items: [
    "Pricing Calculator vs TCO Calculator",
    "Cost Management, 예산, 태그",
    "Azure Policy, Resource Locks, Blueprints",
    "Cloud Adoption Framework 개요",
    "퀴즈 '비용 관리·거버넌스' 세트 풀이",
  ]},
  { day: 10, title: "모니터링/관리도구 + 최종 모의고사", items: [
    "Azure Monitor, Log Analytics, Advisor, Service Health",
    "Portal vs CLI vs PowerShell vs Cloud Shell",
    "종합 모의고사 2 (전 도메인, 목표 85%+)",
    "전체 오답 노트 최종 복습",
    "시험 응시 환경/절차 확인",
  ]},
];
