// AZ-900 학습 교재용 다이어그램 SVG 레지스트리
// 각 항목은 study-guide.md 안의 ```diagram:<key> 펜스가 참조하는 인라인 SVG 마크업이다.
// 색상은 전역 style.css의 .md-diagram-svg .dg-* 유틸리티 클래스를 통해 테마(라이트/다크)에 자동 대응한다.

const DIAGRAMS = {
  "region-az-nesting": `
    <svg viewBox="0 0 320 200" role="img" aria-label="하나의 리전 안에 물리적으로 분리된 세 개의 가용성 영역">
      <rect x="8" y="8" width="304" height="184" rx="14" class="dg-surface-alt dg-border-soft" stroke-width="2"></rect>
      <text x="24" y="30" class="dg-text-sec" font-size="12" font-weight="600">리전 (Region)</text>

      <rect x="24" y="48" width="82" height="124" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="65" y="70" text-anchor="middle" class="dg-text" font-size="13">영역 1</text>
      <rect x="45" y="88" width="40" height="24" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="65" y="127" text-anchor="middle" class="dg-text-muted" font-size="10.5">데이터센터</text>
      <text x="65" y="142" text-anchor="middle" class="dg-text-muted" font-size="9">독립 전원·냉각</text>

      <rect x="119" y="48" width="82" height="124" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="70" text-anchor="middle" class="dg-text" font-size="13">영역 2</text>
      <rect x="140" y="88" width="40" height="24" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="160" y="127" text-anchor="middle" class="dg-text-muted" font-size="10.5">데이터센터</text>
      <text x="160" y="142" text-anchor="middle" class="dg-text-muted" font-size="9">독립 전원·냉각</text>

      <rect x="214" y="48" width="82" height="124" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="255" y="70" text-anchor="middle" class="dg-text" font-size="13">영역 3</text>
      <rect x="235" y="88" width="40" height="24" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="255" y="127" text-anchor="middle" class="dg-text-muted" font-size="10.5">데이터센터</text>
      <text x="255" y="142" text-anchor="middle" class="dg-text-muted" font-size="9">독립 전원·냉각</text>

      <text x="160" y="184" text-anchor="middle" class="dg-text-muted" font-size="10">세 영역은 서로 물리적으로 완전히 분리되어 있다</text>
    </svg>
  `,

  "mgmt-hierarchy": `
    <svg viewBox="0 0 320 250" role="img" aria-label="관리 그룹, 구독, 리소스 그룹, 리소스로 이어지는 4단계 계층 구조와 상속 방향">
      <line x1="160" y1="52" x2="160" y2="70" class="dg-border" stroke-width="2"></line>
      <polygon points="153,63 167,63 160,73" class="dg-text-muted"></polygon>
      <line x1="160" y1="114" x2="160" y2="132" class="dg-border" stroke-width="2"></line>
      <polygon points="153,125 167,125 160,135" class="dg-text-muted"></polygon>
      <line x1="160" y1="176" x2="160" y2="194" class="dg-border" stroke-width="2"></line>
      <polygon points="153,187 167,187 160,197" class="dg-text-muted"></polygon>

      <rect x="30" y="10" width="260" height="42" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="30" text-anchor="middle" class="dg-text" font-size="13">관리 그룹</text>
      <text x="160" y="45" text-anchor="middle" class="dg-text-muted" font-size="9.5">Management Group</text>

      <rect x="60" y="72" width="200" height="42" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="92" text-anchor="middle" class="dg-text" font-size="13">구독</text>
      <text x="160" y="107" text-anchor="middle" class="dg-text-muted" font-size="9.5">Subscription</text>

      <rect x="85" y="134" width="150" height="42" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="154" text-anchor="middle" class="dg-text" font-size="13">리소스 그룹</text>
      <text x="160" y="169" text-anchor="middle" class="dg-text-muted" font-size="9.5">Resource Group</text>

      <rect x="105" y="196" width="110" height="42" rx="8" class="dg-accent-fill" stroke="none"></rect>
      <text x="160" y="222" text-anchor="middle" class="dg-on-accent" font-size="13" font-weight="600">리소스</text>
    </svg>
  `,

  "shared-responsibility-layers": `
    <svg viewBox="0 0 320 260" role="img" aria-label="IaaS, PaaS, SaaS 세 가지 모델에서 고객과 Microsoft의 책임 범위 비교">
      <text x="56" y="18" text-anchor="middle" class="dg-text" font-size="13" font-weight="700">IaaS</text>
      <text x="160" y="18" text-anchor="middle" class="dg-text" font-size="13" font-weight="700">PaaS</text>
      <text x="264" y="18" text-anchor="middle" class="dg-text" font-size="13" font-weight="700">SaaS</text>

      <rect x="8" y="28" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="112" y="28" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="216" y="28" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="56" y="47" text-anchor="middle" class="dg-text-sec" font-size="10">데이터센터</text>
      <text x="160" y="47" text-anchor="middle" class="dg-text-sec" font-size="10">데이터센터</text>
      <text x="264" y="47" text-anchor="middle" class="dg-text-sec" font-size="10">데이터센터</text>

      <rect x="8" y="58" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="112" y="58" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="216" y="58" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="56" y="77" text-anchor="middle" class="dg-text-sec" font-size="11">네트워크</text>
      <text x="160" y="77" text-anchor="middle" class="dg-text-sec" font-size="11">네트워크</text>
      <text x="264" y="77" text-anchor="middle" class="dg-text-sec" font-size="11">네트워크</text>

      <rect x="8" y="88" width="96" height="30" class="dg-accent-fill" stroke="none"></rect>
      <rect x="112" y="88" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="216" y="88" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="56" y="107" text-anchor="middle" class="dg-on-accent" font-size="11">OS</text>
      <text x="160" y="107" text-anchor="middle" class="dg-text-sec" font-size="11">OS</text>
      <text x="264" y="107" text-anchor="middle" class="dg-text-sec" font-size="11">OS</text>

      <rect x="8" y="118" width="96" height="30" class="dg-accent-fill" stroke="none"></rect>
      <rect x="112" y="118" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="216" y="118" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="56" y="136" text-anchor="middle" class="dg-on-accent" font-size="9">미들웨어·런타임</text>
      <text x="160" y="136" text-anchor="middle" class="dg-text-sec" font-size="9">미들웨어·런타임</text>
      <text x="264" y="136" text-anchor="middle" class="dg-text-sec" font-size="9">미들웨어·런타임</text>

      <rect x="8" y="148" width="96" height="30" class="dg-accent-fill" stroke="none"></rect>
      <rect x="112" y="148" width="96" height="30" class="dg-accent-fill" stroke="none"></rect>
      <rect x="216" y="148" width="96" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="56" y="167" text-anchor="middle" class="dg-on-accent" font-size="11">애플리케이션</text>
      <text x="160" y="167" text-anchor="middle" class="dg-on-accent" font-size="11">애플리케이션</text>
      <text x="264" y="167" text-anchor="middle" class="dg-text-sec" font-size="11">애플리케이션</text>

      <rect x="8" y="178" width="96" height="30" class="dg-accent-fill" stroke="none"></rect>
      <rect x="112" y="178" width="96" height="30" class="dg-accent-fill" stroke="none"></rect>
      <rect x="216" y="178" width="96" height="30" class="dg-accent-fill" stroke="none"></rect>
      <text x="56" y="197" text-anchor="middle" class="dg-on-accent" font-size="11">데이터</text>
      <text x="160" y="197" text-anchor="middle" class="dg-on-accent" font-size="11">데이터</text>
      <text x="264" y="197" text-anchor="middle" class="dg-on-accent" font-size="11">데이터</text>

      <rect x="8" y="222" width="14" height="14" class="dg-accent-fill" stroke="none"></rect>
      <text x="28" y="233" class="dg-text-sec" font-size="10.5">고객 책임</text>
      <rect x="98" y="222" width="14" height="14" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="118" y="233" class="dg-text-sec" font-size="10.5">Microsoft 책임</text>
    </svg>
  `,

  "hub-and-spoke": `
    <svg viewBox="0 0 320 220" role="img" aria-label="중앙 허브 VNet과 여러 스포크 VNet, 온프레미스 연결 토폴로지">
      <line x1="160" y1="110" x2="65" y2="37" class="dg-border-soft" stroke-width="2"></line>
      <line x1="160" y1="110" x2="255" y2="37" class="dg-border-soft" stroke-width="2"></line>
      <line x1="160" y1="110" x2="65" y2="183" class="dg-border-soft" stroke-width="2"></line>
      <line x1="160" y1="110" x2="255" y2="183" class="dg-border-soft" stroke-width="2" stroke-dasharray="5 4"></line>

      <rect x="120" y="85" width="80" height="50" rx="10" class="dg-accent-fill" stroke="none"></rect>
      <text x="160" y="106" text-anchor="middle" class="dg-on-accent" font-size="12" font-weight="600">허브 VNet</text>
      <text x="160" y="121" text-anchor="middle" class="dg-on-accent" font-size="9.5">방화벽 · VPN GW</text>

      <rect x="20" y="15" width="90" height="44" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="65" y="41" text-anchor="middle" class="dg-text" font-size="12">스포크 VNet A</text>

      <rect x="210" y="15" width="90" height="44" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="255" y="41" text-anchor="middle" class="dg-text" font-size="12">스포크 VNet B</text>

      <rect x="20" y="161" width="90" height="44" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="65" y="187" text-anchor="middle" class="dg-text" font-size="12">스포크 VNet C</text>

      <rect x="210" y="161" width="90" height="44" rx="8" class="dg-surface-alt dg-border-soft" stroke-width="2" stroke-dasharray="4 3"></rect>
      <text x="255" y="187" text-anchor="middle" class="dg-text-sec" font-size="12">온프레미스</text>
    </svg>
  `,

  "storage-redundancy-geo": `
    <svg viewBox="0 0 320 220" role="img" aria-label="1차 리전과 2차 리전 사이의 스토리지 복제 구조">
      <rect x="10" y="20" width="150" height="170" rx="12" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="85" y="42" text-anchor="middle" class="dg-text" font-size="12" font-weight="600">1차 리전</text>
      <rect x="28" y="80" width="26" height="26" rx="4" class="dg-accent-fill" stroke="none"></rect>
      <rect x="72" y="80" width="26" height="26" rx="4" class="dg-accent-fill" stroke="none"></rect>
      <rect x="116" y="80" width="26" height="26" rx="4" class="dg-accent-fill" stroke="none"></rect>
      <text x="85" y="128" text-anchor="middle" class="dg-text-sec" font-size="10.5">동기 복제 3개</text>
      <text x="85" y="145" text-anchor="middle" class="dg-text-muted" font-size="9.5">(LRS · ZRS)</text>

      <rect x="180" y="20" width="130" height="170" rx="12" class="dg-surface-alt dg-border-soft" stroke-width="2" stroke-dasharray="4 3"></rect>
      <text x="245" y="42" text-anchor="middle" class="dg-text-sec" font-size="12" font-weight="600">2차 리전</text>
      <rect x="204" y="80" width="26" height="26" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="248" y="80" width="26" height="26" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <text x="245" y="128" text-anchor="middle" class="dg-text-sec" font-size="10.5">비동기 복제 사본</text>
      <text x="245" y="145" text-anchor="middle" class="dg-text-muted" font-size="9.5">(GRS · GZRS)</text>

      <line x1="160" y1="70" x2="180" y2="70" class="dg-border" stroke-width="2"></line>
      <polygon points="176,64 176,76 186,70" class="dg-text-muted"></polygon>
      <text x="170" y="60" text-anchor="middle" class="dg-text-muted" font-size="9">복제 →</text>

      <line x1="180" y1="160" x2="160" y2="160" class="dg-border-soft" stroke-width="2" stroke-dasharray="4 3"></line>
      <polygon points="164,154 164,166 154,160" class="dg-text-muted"></polygon>
      <text x="170" y="175" text-anchor="middle" class="dg-text-muted" font-size="9">← RA- 읽기</text>
    </svg>
  `,

  "defense-in-depth-rings": `
    <svg viewBox="0 0 320 320" role="img" aria-label="물리적 보안부터 데이터까지 겹겹이 쌓인 심층 방어의 7개 계층">
      <rect x="10" y="10" width="300" height="300" rx="16" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="30" y="30" width="260" height="260" rx="14" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="50" y="50" width="220" height="220" rx="12" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="70" y="70" width="180" height="180" rx="10" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="90" y="90" width="140" height="140" rx="8" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="110" y="110" width="100" height="100" rx="6" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="130" y="130" width="60" height="60" rx="6" class="dg-accent-fill" stroke="none"></rect>

      <text x="18" y="26" class="dg-text-muted" font-size="10.5">1. 물리적 보안</text>
      <text x="38" y="46" class="dg-text-muted" font-size="10.5">2. 자격 증명·액세스</text>
      <text x="58" y="66" class="dg-text-muted" font-size="10.5">3. 경계</text>
      <text x="78" y="86" class="dg-text-muted" font-size="10.5">4. 네트워크</text>
      <text x="98" y="106" class="dg-text-muted" font-size="10.5">5. 컴퓨팅</text>
      <text x="118" y="126" class="dg-text-muted" font-size="10.5">6. 애플리케이션</text>
      <text x="160" y="163" text-anchor="middle" class="dg-on-accent" font-size="12" font-weight="700">7. 데이터</text>
    </svg>
  `,

  "vnet-peering-nontransitive": `
    <svg viewBox="0 0 320 190" role="img" aria-label="VNet 피어링은 서로 직접 연결한 두 네트워크 사이에서만 성립하며 전이되지 않음">
      <line x1="50" y1="130" x2="160" y2="35" class="dg-border" stroke-width="2"></line>
      <line x1="160" y1="35" x2="270" y2="130" class="dg-border" stroke-width="2"></line>
      <line x1="50" y1="130" x2="270" y2="130" class="dg-border-soft" stroke-width="2" stroke-dasharray="5 4"></line>

      <line x1="145" y1="120" x2="165" y2="140" class="dg-critical" stroke-width="2.5"></line>
      <line x1="145" y1="140" x2="165" y2="120" class="dg-critical" stroke-width="2.5"></line>
      <text x="155" y="163" text-anchor="middle" class="dg-critical" font-size="10.5">직접 피어링 없음</text>

      <rect x="10" y="105" width="80" height="50" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="50" y="134" text-anchor="middle" class="dg-text" font-size="12">VNet A</text>

      <rect x="120" y="10" width="80" height="50" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="39" text-anchor="middle" class="dg-text" font-size="12">VNet B</text>

      <rect x="230" y="105" width="80" height="50" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="270" y="134" text-anchor="middle" class="dg-text" font-size="12">VNet C</text>
    </svg>
  `,

  "availability-set-grid": `
    <svg viewBox="0 0 320 230" role="img" aria-label="하나의 데이터센터 안에서 장애 도메인과 업데이트 도메인 격자에 분산 배치된 가상 머신">
      <rect x="10" y="10" width="300" height="210" rx="14" class="dg-surface-alt dg-border-soft" stroke-width="2"></rect>
      <text x="26" y="28" class="dg-text-sec" font-size="11" font-weight="600">하나의 데이터센터</text>

      <text x="70" y="50" text-anchor="middle" class="dg-text-muted" font-size="10">장애 도메인 0</text>
      <text x="160" y="50" text-anchor="middle" class="dg-text-muted" font-size="10">장애 도메인 1</text>
      <text x="250" y="50" text-anchor="middle" class="dg-text-muted" font-size="10">장애 도메인 2</text>

      <rect x="30" y="58" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="120" y="58" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="210" y="58" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="30" y="112" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="120" y="112" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="210" y="112" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="30" y="166" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="120" y="166" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="210" y="166" width="80" height="46" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>

      <text x="14" y="85" class="dg-text-muted" font-size="9.5">UD0</text>
      <text x="14" y="139" class="dg-text-muted" font-size="9.5">UD1</text>
      <text x="14" y="193" class="dg-text-muted" font-size="9.5">UD2</text>

      <circle cx="70" cy="81" r="14" class="dg-accent-fill" stroke="none"></circle>
      <text x="70" y="85" text-anchor="middle" class="dg-on-accent" font-size="9.5">VM1</text>
      <circle cx="160" cy="81" r="14" class="dg-accent-fill" stroke="none"></circle>
      <text x="160" y="85" text-anchor="middle" class="dg-on-accent" font-size="9.5">VM2</text>
      <circle cx="250" cy="135" r="14" class="dg-accent-fill" stroke="none"></circle>
      <text x="250" y="139" text-anchor="middle" class="dg-on-accent" font-size="9.5">VM3</text>
      <circle cx="70" cy="189" r="14" class="dg-accent-fill" stroke="none"></circle>
      <text x="70" y="193" text-anchor="middle" class="dg-on-accent" font-size="9.5">VM4</text>
      <circle cx="160" cy="189" r="14" class="dg-accent-fill" stroke="none"></circle>
      <text x="160" y="193" text-anchor="middle" class="dg-on-accent" font-size="9.5">VM5</text>
      <circle cx="250" cy="81" r="14" class="dg-accent-fill" stroke="none"></circle>
      <text x="250" y="85" text-anchor="middle" class="dg-on-accent" font-size="9.5">VM6</text>
    </svg>
  `,
};
