export default function LogoSvg({ size = 160 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* outer rings */}
      <circle cx="100" cy="100" r="97" fill="#111" />
      <circle cx="100" cy="100" r="91" fill="none" stroke="#C9A227" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="83" fill="none" stroke="#C9A227" strokeWidth="0.8" strokeDasharray="3 2.2" />

      {/* top arc text */}
      <defs>
        <path id="topArc" d="M 20,100 A 80,80 0 0,1 180,100" />
        <path id="botArc" d="M 20,110 A 80,80 0 0,0 180,110" />
      </defs>
      <text fontFamily="Arial Black, sans-serif" fontSize="11" fill="#C9A227" letterSpacing="3">
        <textPath href="#topArc" startOffset="4%">CLUB 4X4 SEM JUIZO</textPath>
      </text>

      {/* Jeep body */}
      <rect x="44" y="88"  width="112" height="36" rx="4" fill="#C9A227" />
      <rect x="56" y="68"  width="80"  height="26" rx="3" fill="#C9A227" />
      {/* windows */}
      <rect x="61" y="71"  width="32"  height="19" rx="2" fill="#111" opacity="0.72" />
      <rect x="98" y="71"  width="30"  height="19" rx="2" fill="#111" opacity="0.72" />
      {/* front bumper */}
      <rect x="34" y="96"  width="13"  height="22" rx="2" fill="#999" />
      {/* wheels */}
      <circle cx="68"  cy="124" r="15" fill="#111" stroke="#C9A227" strokeWidth="3.5" />
      <circle cx="68"  cy="124" r="5"  fill="#555" />
      <circle cx="132" cy="124" r="15" fill="#111" stroke="#C9A227" strokeWidth="3.5" />
      <circle cx="132" cy="124" r="5"  fill="#555" />

      {/* bottom arc text */}
      <text fontFamily="Arial Black, sans-serif" fontSize="13" fill="#ffffff" letterSpacing="2">
        <textPath href="#botArc" startOffset="9%">CLUB OFF ROAD</textPath>
      </text>
      <text
        x="100" y="187"
        textAnchor="middle"
        fill="#C9A227"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        letterSpacing="2.5"
      >
        NÃO TEM REGRA
      </text>
    </svg>
  )
}
