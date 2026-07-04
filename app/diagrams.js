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

  "scale-up-vs-scale-out": `
    <svg viewBox="0 0 320 200" role="img" aria-label="수직 확장은 한 대의 사양을 올리는 것, 수평 확장은 같은 서버를 여러 대로 늘리는 것">
      <line x1="160" y1="15" x2="160" y2="185" class="dg-border-soft" stroke-width="1.5" stroke-dasharray="4 3"></line>
      <text x="80" y="28" text-anchor="middle" class="dg-text-sec" font-size="12" font-weight="600">수직 확장 (Scale Up)</text>
      <text x="240" y="28" text-anchor="middle" class="dg-text-sec" font-size="12" font-weight="600">수평 확장 (Scale Out)</text>

      <rect x="30" y="110" width="34" height="34" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <text x="47" y="131" text-anchor="middle" class="dg-text-muted" font-size="9">이전</text>
      <line x1="68" y1="127" x2="88" y2="127" class="dg-border" stroke-width="2"></line>
      <polygon points="82,121 82,133 92,127" class="dg-text-muted"></polygon>
      <rect x="94" y="85" width="56" height="85" rx="8" class="dg-accent-fill" stroke="none"></rect>
      <text x="122" y="132" text-anchor="middle" class="dg-on-accent" font-size="10">더 좋은</text>
      <text x="122" y="146" text-anchor="middle" class="dg-on-accent" font-size="10">사양</text>
      <text x="80" y="182" text-anchor="middle" class="dg-text-muted" font-size="9.5">한 대의 사양을 올림</text>

      <rect x="175" y="110" width="34" height="34" rx="6" class="dg-accent-fill" stroke="none"></rect>
      <rect x="222" y="110" width="34" height="34" rx="6" class="dg-accent-fill" stroke="none"></rect>
      <rect x="269" y="110" width="34" height="34" rx="6" class="dg-accent-fill" stroke="none"></rect>
      <text x="240" y="182" text-anchor="middle" class="dg-text-muted" font-size="9.5">동일한 서버를 추가</text>
    </svg>
  `,

  "compute-abstraction-spectrum": `
    <svg viewBox="0 0 320 210" role="img" aria-label="가상 머신에서 컨테이너, App Service, Functions로 갈수록 내가 직접 관리할 범위가 줄어드는 스펙트럼">
      <text x="160" y="16" text-anchor="middle" class="dg-text-muted" font-size="10">← 내가 관리하는 범위 많음 · 적음 →</text>

      <rect x="10" y="30" width="66" height="30" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="10" y="60" width="66" height="110" class="dg-accent-fill" stroke="none"></rect>
      <text x="43" y="130" text-anchor="middle" class="dg-on-accent" font-size="10">VM</text>

      <rect x="88" y="30" width="66" height="65" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="88" y="95" width="66" height="75" class="dg-accent-fill" stroke="none"></rect>
      <text x="121" y="137" text-anchor="middle" class="dg-on-accent" font-size="10">컨테이너</text>

      <rect x="166" y="30" width="66" height="100" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="166" y="130" width="66" height="40" class="dg-accent-fill" stroke="none"></rect>
      <text x="199" y="154" text-anchor="middle" class="dg-on-accent" font-size="9.5">App Service</text>

      <rect x="244" y="30" width="66" height="125" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <rect x="244" y="155" width="66" height="15" class="dg-accent-fill" stroke="none"></rect>
      <text x="277" y="97" text-anchor="middle" class="dg-text-sec" font-size="9.5">Functions</text>

      <rect x="10" y="188" width="14" height="14" class="dg-accent-fill" stroke="none"></rect>
      <text x="30" y="199" class="dg-text-sec" font-size="10">내 책임</text>
      <rect x="100" y="188" width="14" height="14" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="120" y="199" class="dg-text-sec" font-size="10">Azure 책임</text>
    </svg>
  `,

  "vpn-vs-expressroute-paths": `
    <svg viewBox="0 0 320 200" role="img" aria-label="VPN Gateway는 암호화된 공용 인터넷 경로, ExpressRoute는 전용 회선 경로로 온프레미스와 Azure를 연결">
      <rect x="10" y="55" width="70" height="90" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="45" y="105" text-anchor="middle" class="dg-text" font-size="12">온프레미스</text>

      <rect x="240" y="55" width="70" height="90" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="275" y="105" text-anchor="middle" class="dg-text" font-size="12">Azure</text>

      <line x1="80" y1="80" x2="240" y2="80" class="dg-border-soft" stroke-width="2" stroke-dasharray="5 4"></line>
      <text x="160" y="65" text-anchor="middle" class="dg-text-sec" font-size="10.5">VPN Gateway</text>
      <text x="160" y="95" text-anchor="middle" class="dg-text-muted" font-size="9">공용 인터넷 · 암호화</text>

      <line x1="80" y1="122" x2="240" y2="122" class="dg-accent" stroke-width="4"></line>
      <text x="160" y="138" text-anchor="middle" class="dg-text-sec" font-size="10.5">ExpressRoute</text>
      <text x="160" y="152" text-anchor="middle" class="dg-text-muted" font-size="9">전용 회선 · 기본 비암호화</text>
    </svg>
  `,

  "traffic-routing-paths": `
    <svg viewBox="0 0 320 260" role="img" aria-label="Load Balancer, Application Gateway, Front Door는 실제로 트래픽을 대신 전달하지만 Traffic Manager는 DNS로 주소만 안내">
      <circle cx="28" cy="130" r="16" class="dg-surface dg-border" stroke-width="2"></circle>
      <text x="28" y="134" text-anchor="middle" class="dg-text-muted" font-size="8">사용자</text>

      <rect x="250" y="55" width="55" height="150" rx="8" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="277" y="50" text-anchor="middle" class="dg-text-muted" font-size="9.5">백엔드</text>

      <line x1="44" y1="130" x2="70" y2="37" class="dg-border-soft" stroke-width="1.5"></line>
      <rect x="70" y="15" width="140" height="44" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="140" y="33" text-anchor="middle" class="dg-text" font-size="10.5">Load Balancer</text>
      <text x="140" y="47" text-anchor="middle" class="dg-text-muted" font-size="9">4계층 · 프록시 O</text>
      <line x1="210" y1="37" x2="250" y2="60" class="dg-border" stroke-width="2"></line>

      <line x1="44" y1="130" x2="70" y2="97" class="dg-border-soft" stroke-width="1.5"></line>
      <rect x="70" y="75" width="140" height="44" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="140" y="93" text-anchor="middle" class="dg-text" font-size="10.5">Application Gateway</text>
      <text x="140" y="107" text-anchor="middle" class="dg-text-muted" font-size="9">7계층 · 프록시 O</text>
      <line x1="210" y1="97" x2="250" y2="105" class="dg-border" stroke-width="2"></line>

      <line x1="44" y1="130" x2="70" y2="157" class="dg-border-soft" stroke-width="1.5"></line>
      <rect x="70" y="135" width="140" height="44" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="140" y="153" text-anchor="middle" class="dg-text" font-size="10.5">Traffic Manager</text>
      <text x="140" y="167" text-anchor="middle" class="dg-critical" font-size="9">DNS만 안내 · 프록시 X</text>
      <line x1="210" y1="157" x2="250" y2="150" class="dg-border-soft" stroke-width="1.5" stroke-dasharray="4 3"></line>

      <line x1="44" y1="130" x2="70" y2="217" class="dg-border-soft" stroke-width="1.5"></line>
      <rect x="70" y="195" width="140" height="44" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="140" y="213" text-anchor="middle" class="dg-text" font-size="10.5">Azure Front Door</text>
      <text x="140" y="227" text-anchor="middle" class="dg-text-muted" font-size="9">7계층 · 글로벌 · 프록시 O</text>
      <line x1="210" y1="217" x2="250" y2="195" class="dg-border" stroke-width="2"></line>
    </svg>
  `,

  "network-security-layers": `
    <svg viewBox="0 0 320 150" role="img" aria-label="인터넷에서 VM까지 Azure Firewall, Application Gateway·WAF, NSG를 차례로 거치는 트래픽 경로">
      <text x="160" y="18" text-anchor="middle" class="dg-text-muted" font-size="10">트래픽 흐름 →</text>

      <rect x="3" y="55" width="56" height="50" rx="8" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="31" y="84" text-anchor="middle" class="dg-text-sec" font-size="10">인터넷</text>

      <line x1="59" y1="80" x2="76" y2="80" class="dg-border" stroke-width="2"></line>
      <polygon points="70,74 70,86 80,80" class="dg-text-muted"></polygon>
      <rect x="79" y="55" width="70" height="50" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="114" y="78" text-anchor="middle" class="dg-text" font-size="9.5">Azure</text>
      <text x="114" y="91" text-anchor="middle" class="dg-text" font-size="9.5">Firewall</text>

      <line x1="149" y1="80" x2="166" y2="80" class="dg-border" stroke-width="2"></line>
      <polygon points="160,74 160,86 170,80" class="dg-text-muted"></polygon>
      <rect x="169" y="55" width="70" height="50" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="204" y="75" text-anchor="middle" class="dg-text" font-size="9">App Gateway</text>
      <text x="204" y="88" text-anchor="middle" class="dg-text" font-size="9">(WAF)</text>

      <line x1="239" y1="80" x2="256" y2="80" class="dg-border" stroke-width="2"></line>
      <polygon points="250,74 250,86 260,80" class="dg-text-muted"></polygon>
      <rect x="259" y="55" width="30" height="50" rx="6" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <text x="274" y="84" text-anchor="middle" class="dg-text-sec" font-size="9.5">NSG</text>

      <line x1="289" y1="80" x2="304" y2="80" class="dg-border" stroke-width="2"></line>
      <polygon points="298,74 298,86 308,80" class="dg-text-muted"></polygon>
      <circle cx="311" cy="80" r="8" class="dg-accent-fill" stroke="none"></circle>
      <text x="311" y="112" text-anchor="middle" class="dg-text-muted" font-size="9">VM</text>
    </svg>
  `,

  "dns-resolution-flow": `
    <svg viewBox="0 0 320 140" role="img" aria-label="브라우저가 도메인 이름을 입력하면 DNS가 IP 주소로 변환해 서버에 접속시켜주는 3단계 흐름">
      <rect x="5" y="40" width="90" height="60" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="50" y="66" text-anchor="middle" class="dg-text" font-size="11">브라우저</text>
      <text x="50" y="82" text-anchor="middle" class="dg-text-muted" font-size="9">www.example.com</text>

      <line x1="95" y1="70" x2="118" y2="70" class="dg-border" stroke-width="2"></line>
      <polygon points="112,64 112,76 122,70" class="dg-text-muted"></polygon>

      <rect x="115" y="40" width="90" height="60" rx="10" class="dg-accent-fill" stroke="none"></rect>
      <text x="160" y="66" text-anchor="middle" class="dg-on-accent" font-size="11">DNS</text>
      <text x="160" y="82" text-anchor="middle" class="dg-on-accent" font-size="9">이름 → IP 변환</text>

      <line x1="205" y1="70" x2="228" y2="70" class="dg-border" stroke-width="2"></line>
      <polygon points="222,64 222,76 232,70" class="dg-text-muted"></polygon>

      <rect x="225" y="40" width="90" height="60" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="270" y="66" text-anchor="middle" class="dg-text" font-size="11">서버</text>
      <text x="270" y="82" text-anchor="middle" class="dg-text-muted" font-size="9">실제 IP 주소</text>
    </svg>
  `,

  "service-endpoint-vs-private-endpoint": `
    <svg viewBox="0 0 320 260" role="img" aria-label="Service Endpoint는 스토리지가 공인 IP를 유지한 채 VNet에서 접근을 허용하고, Private Endpoint는 스토리지가 VNet 안의 사설 IP를 직접 부여받는다">
      <text x="10" y="20" class="dg-text-sec" font-size="11" font-weight="600">Service Endpoint</text>
      <rect x="15" y="30" width="140" height="80" rx="8" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="25" y="44" class="dg-text-muted" font-size="9">VNet</text>
      <rect x="30" y="60" width="55" height="30" rx="6" class="dg-surface dg-border" stroke-width="1.5"></rect>
      <text x="57" y="79" text-anchor="middle" class="dg-text" font-size="10">VM</text>
      <line x1="85" y1="75" x2="205" y2="75" class="dg-border" stroke-width="2"></line>
      <polygon points="198,69 198,81 208,75" class="dg-text-muted"></polygon>
      <rect x="210" y="60" width="95" height="30" rx="6" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="257" y="73" text-anchor="middle" class="dg-text-sec" font-size="9">Storage</text>
      <text x="257" y="85" text-anchor="middle" class="dg-text-muted" font-size="8">공인 IP 유지</text>

      <text x="10" y="150" class="dg-text-sec" font-size="11" font-weight="600">Private Endpoint</text>
      <rect x="15" y="160" width="290" height="80" rx="8" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="25" y="174" class="dg-text-muted" font-size="9">VNet</text>
      <rect x="30" y="190" width="55" height="30" rx="6" class="dg-surface dg-border" stroke-width="1.5"></rect>
      <text x="57" y="209" text-anchor="middle" class="dg-text" font-size="10">VM</text>
      <line x1="85" y1="205" x2="205" y2="205" class="dg-border" stroke-width="2"></line>
      <polygon points="198,199 198,211 208,205" class="dg-text-muted"></polygon>
      <rect x="210" y="190" width="90" height="30" rx="6" class="dg-accent-fill" stroke="none"></rect>
      <text x="255" y="203" text-anchor="middle" class="dg-on-accent" font-size="9">Storage</text>
      <text x="255" y="214" text-anchor="middle" class="dg-on-accent" font-size="8">사설 IP 부여</text>
    </svg>
  `,

  "blob-storage-nesting": `
    <svg viewBox="0 0 320 200" role="img" aria-label="스토리지 계정 안에 여러 컨테이너가 있고, 각 컨테이너 안에 개별 Blob 파일들이 담겨 있는 중첩 구조">
      <rect x="8" y="8" width="304" height="184" rx="14" class="dg-surface-alt dg-border-soft" stroke-width="2"></rect>
      <text x="24" y="30" class="dg-text-sec" font-size="12" font-weight="600">스토리지 계정</text>

      <rect x="24" y="45" width="130" height="130" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="89" y="65" text-anchor="middle" class="dg-text" font-size="11">컨테이너 A</text>
      <rect x="40" y="78" width="98" height="20" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="89" y="92" text-anchor="middle" class="dg-text-muted" font-size="9">Blob</text>
      <rect x="40" y="105" width="98" height="20" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="89" y="119" text-anchor="middle" class="dg-text-muted" font-size="9">Blob</text>
      <rect x="40" y="132" width="98" height="20" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="89" y="146" text-anchor="middle" class="dg-text-muted" font-size="9">Blob</text>

      <rect x="166" y="45" width="130" height="130" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="231" y="65" text-anchor="middle" class="dg-text" font-size="11">컨테이너 B</text>
      <rect x="182" y="90" width="98" height="20" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="231" y="104" text-anchor="middle" class="dg-text-muted" font-size="9">Blob</text>
      <rect x="182" y="117" width="98" height="20" rx="4" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="231" y="131" text-anchor="middle" class="dg-text-muted" font-size="9">Blob</text>
    </svg>
  `,

  "authn-authz-sequence": `
    <svg viewBox="0 0 320 160" role="img" aria-label="인증이 먼저 이루어진 뒤에 인가가 이어지는 2단계 순서">
      <rect x="10" y="45" width="140" height="80" rx="10" class="dg-accent-fill" stroke="none"></rect>
      <text x="80" y="78" text-anchor="middle" class="dg-on-accent" font-size="12" font-weight="600">1. 인증 (AuthN)</text>
      <text x="80" y="96" text-anchor="middle" class="dg-on-accent" font-size="9.5">당신은 누구인가요?</text>

      <line x1="150" y1="85" x2="172" y2="85" class="dg-border" stroke-width="2"></line>
      <polygon points="166,79 166,91 176,85" class="dg-text-muted"></polygon>

      <rect x="170" y="45" width="140" height="80" rx="10" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="240" y="78" text-anchor="middle" class="dg-text" font-size="12" font-weight="600">2. 인가 (AuthZ)</text>
      <text x="240" y="96" text-anchor="middle" class="dg-text-sec" font-size="9.5">무엇을 할 수 있나요?</text>
    </svg>
  `,

  "rbac-role-matrix": `
    <svg viewBox="0 0 320 190" role="img" aria-label="Owner, Contributor, Reader, User Access Administrator 역할별로 리소스 관리와 권한 위임 가능 여부 비교">
      <text x="215" y="18" text-anchor="middle" class="dg-text-muted" font-size="10">리소스 관리</text>
      <text x="290" y="18" text-anchor="middle" class="dg-text-muted" font-size="10">권한 위임</text>

      <line x1="5" y1="28" x2="315" y2="28" class="dg-border-soft" stroke-width="1.5"></line>

      <text x="10" y="48" class="dg-text-sec" font-size="10.5">Owner</text>
      <text x="215" y="48" text-anchor="middle" class="dg-good" font-size="13" font-weight="700">O</text>
      <text x="290" y="48" text-anchor="middle" class="dg-good" font-size="13" font-weight="700">O</text>

      <text x="10" y="78" class="dg-text-sec" font-size="10.5">Contributor</text>
      <text x="215" y="78" text-anchor="middle" class="dg-good" font-size="13" font-weight="700">O</text>
      <text x="290" y="78" text-anchor="middle" class="dg-critical" font-size="13" font-weight="700">X</text>

      <text x="10" y="108" class="dg-text-sec" font-size="10.5">Reader</text>
      <text x="215" y="108" text-anchor="middle" class="dg-critical" font-size="13" font-weight="700">X</text>
      <text x="290" y="108" text-anchor="middle" class="dg-critical" font-size="13" font-weight="700">X</text>

      <text x="10" y="138" class="dg-text-sec" font-size="9.5">User Access</text>
      <text x="10" y="151" class="dg-text-sec" font-size="9.5">Administrator</text>
      <text x="215" y="142" text-anchor="middle" class="dg-critical" font-size="13" font-weight="700">X</text>
      <text x="290" y="142" text-anchor="middle" class="dg-good" font-size="13" font-weight="700">O</text>
    </svg>
  `,

  "castle-moat-vs-zero-trust": `
    <svg viewBox="0 0 320 210" role="img" aria-label="성곽과 해자 모델은 정문만 지나면 내부를 자유롭게 이동하지만, 제로 트러스트는 모든 방마다 다시 검증한다">
      <text x="80" y="18" text-anchor="middle" class="dg-text-sec" font-size="11" font-weight="600">성곽과 해자</text>
      <rect x="15" y="28" width="130" height="165" rx="10" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="65" y="28" width="30" height="14" class="dg-surface-alt dg-border-soft" stroke-width="1.5"></rect>
      <text x="80" y="39" text-anchor="middle" class="dg-text-muted" font-size="7">정문</text>
      <rect x="30" y="60" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="90" y="60" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="30" y="105" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="90" y="105" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <line x1="70" y1="75" x2="90" y2="75" class="dg-border-soft" stroke-width="1.5"></line>
      <line x1="50" y1="90" x2="50" y2="105" class="dg-border-soft" stroke-width="1.5"></line>
      <line x1="70" y1="120" x2="90" y2="120" class="dg-border-soft" stroke-width="1.5"></line>
      <text x="80" y="188" text-anchor="middle" class="dg-text-muted" font-size="8.5">한 번 들어오면 자유 이동</text>

      <text x="240" y="18" text-anchor="middle" class="dg-text-sec" font-size="11" font-weight="600">제로 트러스트</text>
      <rect x="175" y="28" width="130" height="165" rx="10" class="dg-border-soft" stroke-width="2" fill="none"></rect>
      <rect x="225" y="28" width="30" height="14" class="dg-accent-fill" stroke="none"></rect>
      <text x="240" y="39" text-anchor="middle" class="dg-on-accent" font-size="7">검증</text>
      <rect x="190" y="60" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="250" y="60" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="190" y="105" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="250" y="105" width="40" height="30" rx="4" class="dg-surface dg-border-soft" stroke-width="1.5"></rect>
      <rect x="204" y="90" width="12" height="8" class="dg-accent-fill" stroke="none"></rect>
      <rect x="264" y="90" width="12" height="8" class="dg-accent-fill" stroke="none"></rect>
      <rect x="204" y="135" width="12" height="8" class="dg-accent-fill" stroke="none"></rect>
      <text x="240" y="188" text-anchor="middle" class="dg-text-muted" font-size="8.5">문마다 다시 확인</text>
    </svg>
  `,

  "caf-phases-flow": `
    <svg viewBox="0 0 320 300" role="img" aria-label="전략, 계획, 준비, 도입, 거버넌스, 관리로 이어지는 CAF의 6단계 클라우드 도입 여정">
      <line x1="160" y1="45" x2="160" y2="63" class="dg-border" stroke-width="2"></line>
      <polygon points="153,56 167,56 160,66" class="dg-text-muted"></polygon>
      <line x1="160" y1="107" x2="160" y2="125" class="dg-border" stroke-width="2"></line>
      <polygon points="153,118 167,118 160,128" class="dg-text-muted"></polygon>
      <line x1="160" y1="169" x2="160" y2="187" class="dg-border" stroke-width="2"></line>
      <polygon points="153,180 167,180 160,190" class="dg-text-muted"></polygon>
      <line x1="160" y1="231" x2="160" y2="249" class="dg-border" stroke-width="2"></line>
      <polygon points="153,242 167,242 160,252" class="dg-text-muted"></polygon>

      <rect x="60" y="5" width="200" height="40" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="30" text-anchor="middle" class="dg-text" font-size="12">1. 전략 (Strategy)</text>

      <rect x="60" y="67" width="200" height="40" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="92" text-anchor="middle" class="dg-text" font-size="12">2. 계획 (Plan)</text>

      <rect x="60" y="129" width="200" height="40" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="154" text-anchor="middle" class="dg-text" font-size="12">3. 준비 (Ready)</text>

      <rect x="60" y="191" width="200" height="40" rx="8" class="dg-surface dg-border" stroke-width="2"></rect>
      <text x="160" y="216" text-anchor="middle" class="dg-text" font-size="12">4. 도입 (Adopt)</text>

      <rect x="60" y="253" width="95" height="40" rx="8" class="dg-accent-fill" stroke="none"></rect>
      <text x="107" y="272" text-anchor="middle" class="dg-on-accent" font-size="10.5">5. 거버넌스</text>
      <text x="107" y="286" text-anchor="middle" class="dg-on-accent" font-size="9">(Govern)</text>

      <rect x="165" y="253" width="95" height="40" rx="8" class="dg-accent-fill" stroke="none"></rect>
      <text x="212" y="272" text-anchor="middle" class="dg-on-accent" font-size="10.5">6. 관리</text>
      <text x="212" y="286" text-anchor="middle" class="dg-on-accent" font-size="9">(Manage)</text>
    </svg>
  `,
};
