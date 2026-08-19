import React from 'react'

type Props = {
  diagramKey: string
  className?: string
}

export function AsmoSvgDiagram({ diagramKey, className }: Props) {
  switch (diagramKey) {
    // ==========================================
    // CÂU 1: Đếm bóng đen (9 bóng đen, 4 bóng trắng) - Chuẩn PDF Trang 1
    // ==========================================
    case 'q01_balls':
      return (
        <div className="flex items-center justify-center p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto w-full">
          <svg viewBox="0 0 400 200" className="w-full max-h-60 select-none">
            {/* 9 Black Balls */}
            <circle cx="95" cy="55" r="17" fill="#0f172a" />
            <circle cx="108" cy="108" r="17" fill="#0f172a" />
            <circle cx="165" cy="118" r="17" fill="#0f172a" />
            <circle cx="68" cy="170" r="17" fill="#0f172a" />
            <circle cx="148" cy="165" r="17" fill="#0f172a" />
            <circle cx="265" cy="85" r="17" fill="#0f172a" />
            <circle cx="300" cy="138" r="17" fill="#0f172a" />
            <circle cx="390" cy="120" r="17" fill="#0f172a" />
            <circle cx="365" cy="170" r="17" fill="#0f172a" />

            {/* 4 White Balls */}
            <circle cx="198" cy="62" r="17" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
            <circle cx="102" cy="155" r="17" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
            <circle cx="218" cy="135" r="17" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
            <circle cx="340" cy="90" r="17" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
            <circle cx="282" cy="180" r="17" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 2: Chữ số xoay tìm chữ số thiếu (4) - Chuẩn PDF Trang 1
    // ==========================================
    case 'q02_digits':
      return (
        <div className="flex items-center justify-center p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto w-full">
          <svg viewBox="0 0 460 220" className="w-full max-h-64 select-none">
            {/* Box Border */}
            <rect x="15" y="15" width="430" height="190" rx="10" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />

            {/* Top Row: 1, 5, 9, 8 */}
            <text x="65" y="70" transform="rotate(-30, 65, 70)" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="36" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">1</text>
            <text x="160" y="65" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="38" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">5</text>
            <text x="250" y="65" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="38" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">9</text>
            <text x="365" y="65" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="38" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">8</text>

            {/* Bottom Row / Floating: 3(rotated), 8(rotated), 2, 6, 1(italic), 2, 7(rotated) */}
            <text x="75" y="145" transform="rotate(90, 75, 145)" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="36" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">3</text>
            <text x="140" y="145" transform="rotate(90, 140, 145)" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="36" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">8</text>
            <text x="205" y="130" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="36" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">2</text>
            <text x="205" y="172" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="28" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">6</text>
            <text x="260" y="138" transform="rotate(20, 260, 138)" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="36" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">1</text>
            <text x="325" y="125" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="36" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">2</text>
            <text x="325" y="172" transform="rotate(180, 325, 172)" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="32" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">7</text>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 4: 3 Bập bênh cân đĩa - Chuẩn PDF Trang 2
    // ==========================================
    case 'q04_balance':
      return (
        <div className="flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto w-full">
          <svg viewBox="0 0 540 180" className="w-full max-h-56 select-none font-bold">
            {/* Balance 1: Banana (heavy) vs Strawberry (light) */}
            <g transform="translate(20, 30)">
              <polygon points="75,100 63,125 87,125" fill="#1e293b" />
              <line x1="15" y1="110" x2="135" y2="80" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
              <text x="20" y="98" fontSize="28">🍌</text>
              <text x="110" y="70" fontSize="24">🍓</text>
            </g>

            {/* Balance 2: Apple (heavy) vs Banana (light) */}
            <g transform="translate(195, 30)">
              <polygon points="75,100 63,125 87,125" fill="#1e293b" />
              <line x1="15" y1="80" x2="135" y2="110" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
              <text x="20" y="70" fontSize="26">🍎</text>
              <text x="110" y="100" fontSize="28">🍌</text>
            </g>

            {/* Balance 3: Grapes (heavy) vs Banana (light) */}
            <g transform="translate(370, 30)">
              <polygon points="75,100 63,125 87,125" fill="#1e293b" />
              <line x1="15" y1="110" x2="135" y2="80" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
              <text x="18" y="100" fontSize="28">🍇</text>
              <text x="110" y="70" fontSize="28">🍌</text>
            </g>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 5: Lưới ô vuông 5x7 so sánh phần xám - Chuẩn PDF Trang 2
    // ==========================================
    case 'q05_grey_grid':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-sm mx-auto w-full">
          <svg viewBox="0 0 190 260" className="w-full max-h-72 select-none font-bold">
            <rect x="5" y="5" width="180" height="252" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />

            {/* Area A: 7 grey cells */}
            <rect x="5" y="5" width="36" height="36" fill="#94a3b8" />
            <rect x="41" y="5" width="36" height="36" fill="#94a3b8" />
            <rect x="77" y="5" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="41" width="36" height="36" fill="#94a3b8" />
            <rect x="77" y="41" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="77" width="36" height="36" fill="#94a3b8" />
            <rect x="77" y="77" width="36" height="36" fill="#94a3b8" />

            {/* Area B: 9 grey cells */}
            <rect x="113" y="5" width="36" height="36" fill="#64748b" />
            <rect x="149" y="5" width="36" height="36" fill="#64748b" />
            <rect x="113" y="41" width="36" height="36" fill="#64748b" />
            <rect x="149" y="41" width="36" height="36" fill="#64748b" />
            <rect x="113" y="77" width="36" height="36" fill="#64748b" />
            <rect x="149" y="77" width="36" height="36" fill="#64748b" />
            <rect x="113" y="113" width="36" height="36" fill="#64748b" />
            <rect x="149" y="113" width="36" height="36" fill="#64748b" />
            <rect x="41" y="77" width="36" height="36" fill="#94a3b8" />

            {/* Area C: 5 grey cells */}
            <rect x="5" y="149" width="36" height="36" fill="#94a3b8" />
            <rect x="41" y="149" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="185" width="36" height="36" fill="#94a3b8" />
            <rect x="41" y="185" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="221" width="36" height="36" fill="#94a3b8" />

            {/* Area D: 6 grey cells */}
            <rect x="113" y="149" width="36" height="36" fill="#94a3b8" />
            <rect x="149" y="149" width="36" height="36" fill="#94a3b8" />
            <rect x="113" y="185" width="36" height="36" fill="#94a3b8" />
            <rect x="149" y="185" width="36" height="36" fill="#94a3b8" />
            <rect x="113" y="221" width="36" height="36" fill="#94a3b8" />
            <rect x="149" y="221" width="36" height="36" fill="#94a3b8" />

            {/* Grid lines */}
            <line x1="41" y1="5" x2="41" y2="257" stroke="#1e293b" strokeWidth="2" />
            <line x1="77" y1="5" x2="77" y2="257" stroke="#1e293b" strokeWidth="2" />
            <line x1="113" y1="5" x2="113" y2="257" stroke="#1e293b" strokeWidth="2" />
            <line x1="149" y1="5" x2="149" y2="257" stroke="#1e293b" strokeWidth="2" />

            <line x1="5" y1="41" x2="185" y2="41" stroke="#1e293b" strokeWidth="2" />
            <line x1="5" y1="77" x2="185" y2="77" stroke="#1e293b" strokeWidth="2" />
            <line x1="5" y1="113" x2="185" y2="113" stroke="#1e293b" strokeWidth="2" />
            <line x1="5" y1="149" x2="185" y2="149" stroke="#1e293b" strokeWidth="2" />
            <line x1="5" y1="185" x2="185" y2="185" stroke="#1e293b" strokeWidth="2" />
            <line x1="5" y1="221" x2="185" y2="221" stroke="#1e293b" strokeWidth="2" />

            {/* Labels */}
            <rect x="41" y="41" width="36" height="36" fill="#ffffff" />
            <text x="59" y="64" fill="#0f172a" fontSize="18" textAnchor="middle" dominantBaseline="middle">A</text>

            <rect x="113" y="41" width="36" height="36" fill="#ffffff" />
            <text x="131" y="64" fill="#0f172a" fontSize="18" textAnchor="middle" dominantBaseline="middle">B</text>

            <rect x="41" y="185" width="36" height="36" fill="#ffffff" />
            <text x="59" y="208" fill="#0f172a" fontSize="18" textAnchor="middle" dominantBaseline="middle">C</text>

            <rect x="113" y="185" width="36" height="36" fill="#ffffff" />
            <text x="131" y="208" fill="#0f172a" fontSize="18" textAnchor="middle" dominantBaseline="middle">D</text>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 8: Phép toán lồng hình học - Chuẩn PDF Trang 3
    // ==========================================
    case 'q08_shapes_equation':
      return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full">
          <svg viewBox="0 0 300 200" className="w-full max-h-56 select-none font-bold">
            {/* ROW 1 */}
            <g transform="translate(15, 10)">
              <rect x="0" y="0" width="50" height="50" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
            </g>
            <text x="85" y="37" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">+</text>
            <g transform="translate(105, 10)">
              <polygon points="25,4 48,46 2,46" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
            <text x="175" y="37" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">=</text>
            <g transform="translate(195, 10)">
              <rect x="0" y="0" width="50" height="50" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
              <polygon points="25,12 40,40 10,40" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
            </g>

            {/* ROW 2 */}
            <g transform="translate(15, 75)">
              <polygon points="25,2 49,19 40,48 10,48 1,19" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
            <text x="85" y="102" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">+</text>
            <g transform="translate(105, 75)">
              <circle cx="25" cy="25" r="23" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
            </g>
            <text x="175" y="102" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">=</text>
            <g transform="translate(195, 75)">
              <polygon points="25,2 49,19 40,48 10,48 1,19" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="25" cy="28" r="14" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
            </g>

            {/* ROW 3 */}
            <g transform="translate(15, 140)">
              <polygon points="25,4 48,46 2,46" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
            <text x="85" y="167" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">+</text>
            <g transform="translate(105, 140)">
              <circle cx="25" cy="25" r="23" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
            </g>
            <text x="175" y="167" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">=</text>
            <g transform="translate(195, 140)">
              <rect x="0" y="0" width="50" height="50" rx="10" fill="#fff1f2" stroke="#fb7185" strokeWidth="2" strokeDasharray="4 3" />
              <text x="25" y="27" fill="#e11d48" fontSize="26" fontWeight="900" textAnchor="middle" dominantBaseline="middle">?</text>
            </g>
          </svg>
        </div>
      )

    // Câu 8 Options
    case 'q08_opt_A':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,64 5,64" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <rect x="22.5" y="33" width="25" height="25" rx="3" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'q08_opt_B':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <circle cx="35" cy="35" r="31" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
          <polygon points="35,16 51,28 45,49 25,49 19,28" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )
    case 'q08_opt_C':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,64 5,64" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="35" cy="44" r="16" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'q08_opt_D':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,28 53,64 17,64 5,28" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="35,25 50,54 20,54" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )

    // ==========================================
    // CÂU 9: Que diêm - Chuẩn PDF Trang 4
    // ==========================================
    case 'q09_opt_A':
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          <line x1="20" y1="20" x2="65" y2="20" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="20" cy="20" r="4.5" fill="#ef4444" />
          <line x1="20" y1="20" x2="20" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="20" cy="65" r="4.5" fill="#ef4444" />
          <line x1="20" y1="65" x2="65" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="65" r="4.5" fill="#ef4444" />
          <line x1="65" y1="20" x2="65" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="20" r="4.5" fill="#ef4444" />
          <line x1="65" y1="65" x2="82" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="82" cy="65" r="4.5" fill="#ef4444" />
          <line x1="65" y1="65" x2="65" y2="82" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="82" r="4.5" fill="#ef4444" />
        </svg>
      )
    case 'q09_opt_B':
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          <line x1="45" y1="15" x2="18" y2="42" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="15" r="4.5" fill="#ef4444" />
          <line x1="45" y1="15" x2="72" y2="42" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="72" cy="42" r="4.5" fill="#ef4444" />
          <line x1="22" y1="42" x2="22" y2="75" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="22" cy="42" r="4.5" fill="#ef4444" />
          <line x1="68" y1="42" x2="68" y2="75" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="68" cy="42" r="4.5" fill="#ef4444" />
          <line x1="22" y1="75" x2="68" y2="75" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="22" cy="75" r="4.5" fill="#ef4444" />
        </svg>
      )
    case 'q09_opt_C':
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          <line x1="45" y1="15" x2="22" y2="40" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="15" r="4.5" fill="#ef4444" />
          <line x1="45" y1="15" x2="68" y2="40" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="68" cy="40" r="4.5" fill="#ef4444" />
          <line x1="22" y1="40" x2="45" y2="62" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="22" cy="40" r="4.5" fill="#ef4444" />
          <line x1="68" y1="40" x2="45" y2="62" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="62" r="4.5" fill="#ef4444" />
          <line x1="45" y1="62" x2="25" y2="80" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="25" cy="80" r="4.5" fill="#ef4444" />
          <line x1="45" y1="62" x2="65" y2="80" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="80" r="4.5" fill="#ef4444" />
        </svg>
      )
    case 'q09_opt_D':
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          <line x1="12" y1="28" x2="78" y2="28" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="12" cy="28" r="4.5" fill="#ef4444" />
          <line x1="12" y1="64" x2="78" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="78" cy="64" r="4.5" fill="#ef4444" />
          <line x1="12" y1="28" x2="12" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="12" cy="64" r="4.5" fill="#ef4444" />
          <line x1="45" y1="28" x2="45" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="28" r="4.5" fill="#ef4444" />
          <line x1="78" y1="28" x2="78" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="78" cy="28" r="4.5" fill="#ef4444" />
        </svg>
      )

    // ==========================================
    // CÂU 14: Bàn cờ khuyết 5x5 - Chuẩn PDF Trang 5
    // ==========================================
    case 'q14_puzzle':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full">
          <svg viewBox="0 0 320 150" className="w-full max-h-56 select-none font-bold">
            {/* Full 5x5 Chessboard on Left */}
            <g transform="translate(15, 15)">
              <rect x="0" y="0" width="120" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
              {[
                [1, 0, 1, 0, 1],
                [0, 1, 0, 1, 0],
                [1, 0, 1, 0, 1],
                [0, 1, 0, 1, 0],
                [1, 0, 1, 0, 1],
              ].map((row, r) =>
                row.map((cell, c) => (
                  <rect
                    key={`full-${r}-${c}`}
                    x={c * 24}
                    y={r * 24}
                    width={24}
                    height={24}
                    fill={cell === 1 ? '#0f172a' : '#ffffff'}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                )),
              )}
            </g>

            {/* Transition Arrow in Center */}
            <g transform="translate(145, 65)">
              <polygon points="0,5 18,5 18,0 30,10 18,20 18,15 0,15" fill="#0f172a" />
            </g>

            {/* Cut 5x5 Chessboard on Right */}
            <g transform="translate(185, 15)">
              <rect x="0" y="0" width="120" height="120" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
              {[
                [1, 0, 1, 0, 1],
                [0, 1, 0, 1, -1],
                [1, 0, 1, -1, -1],
                [0, 1, -1, -1, -1],
                [1, 0, 1, -1, -1],
              ].map((row, r) =>
                row.map((cell, c) => {
                  if (cell === -1) return null
                  return (
                    <rect
                      key={`cut-${r}-${c}`}
                      x={c * 24}
                      y={r * 24}
                      width={24}
                      height={24}
                      fill={cell === 1 ? '#0f172a' : '#ffffff'}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                  )
                }),
              )}
            </g>
          </svg>
        </div>
      )

    case 'q14_opt_A':
      return (
        <svg viewBox="0 0 80 110" className="w-16 h-22 shrink-0 select-none">
          <g transform="translate(5, 5)">
            <rect x="40" y="0" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="40" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="40" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="60" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="60" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="60" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="80" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="80" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          </g>
        </svg>
      )
    case 'q14_opt_B':
      return (
        <svg viewBox="0 0 80 110" className="w-16 h-22 shrink-0 select-none">
          <g transform="translate(5, 5)">
            <rect x="40" y="0" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="20" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="40" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="40" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="40" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="60" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="60" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          </g>
        </svg>
      )
    case 'q14_opt_C':
      return (
        <svg viewBox="0 0 80 110" className="w-16 h-22 shrink-0 select-none">
          <g transform="translate(5, 5)">
            <rect x="0" y="0" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="0" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="40" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="40" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="60" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          </g>
        </svg>
      )
    case 'q14_opt_D':
      return (
        <svg viewBox="0 0 80 110" className="w-16 h-22 shrink-0 select-none">
          <g transform="translate(5, 5)">
            <rect x="0" y="0" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="0" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="20" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="40" y="20" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="40" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="20" y="40" width="20" height="20" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="0" y="60" width="20" height="20" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
          </g>
        </svg>
      )

    // ==========================================
    // CÂU 15: Mê cung Pure Vector SVG - Chuẩn PDF Trang 6
    // ==========================================
    case 'q15_maze':
      return (
        <div className="flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full">
          <svg viewBox="0 0 340 320" className="w-full max-h-72 select-none font-bold">
            {/* Entrance Arrow (Left) */}
            <g transform="translate(10, 60)">
              <line x1="0" y1="10" x2="35" y2="10" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="35,4 45,10 35,16" fill="#0f172a" />
            </g>

            {/* Exit A (Top) */}
            <g transform="translate(200, 5)">
              <text x="0" y="16" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">A</text>
              <line x1="0" y1="40" x2="0" y2="24" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="-5,24 0,18 5,24" fill="#0f172a" />
            </g>

            {/* Exit B (Right) */}
            <g transform="translate(295, 125)">
              <text x="25" y="7" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">B</text>
              <line x1="0" y1="0" x2="16" y2="0" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="16,-5 22,0 16,5" fill="#0f172a" />
            </g>

            {/* Exit C (Bottom-Right) */}
            <g transform="translate(230, 275)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="-5,16 0,22 5,16" fill="#0f172a" />
              <text x="0" y="40" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">C</text>
            </g>

            {/* Exit D (Bottom-Left) */}
            <g transform="translate(90, 275)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="-5,16 0,22 5,16" fill="#0f172a" />
              <text x="0" y="40" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">D</text>
            </g>

            {/* Maze Walls (3px solid #1e293b) */}
            <g stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Outer boundary with openings */}
              <line x1="60" y1="50" x2="185" y2="50" />
              <line x1="215" y1="50" x2="280" y2="50" />
              <line x1="280" y1="50" x2="280" y2="110" />
              <line x1="280" y1="140" x2="280" y2="270" />
              <line x1="280" y1="270" x2="245" y2="270" />
              <line x1="215" y1="270" x2="105" y2="270" />
              <line x1="75" y1="270" x2="60" y2="270" />
              <line x1="60" y1="270" x2="60" y2="90" />
              <line x1="60" y1="50" x2="60" y2="50" />

              {/* Internal Walls */}
              <line x1="90" y1="80" x2="150" y2="80" />
              <line x1="90" y1="80" x2="90" y2="130" />
              <line x1="90" y1="130" x2="130" y2="130" />

              <line x1="120" y1="100" x2="120" y2="170" />
              <line x1="150" y1="100" x2="150" y2="150" />
              <line x1="150" y1="150" x2="200" y2="150" />

              <line x1="180" y1="80" x2="250" y2="80" />
              <line x1="180" y1="80" x2="180" y2="120" />
              <line x1="220" y1="100" x2="220" y2="170" />
              <line x1="250" y1="100" x2="250" y2="210" />

              <line x1="90" y1="170" x2="170" y2="170" />
              <line x1="90" y1="200" x2="140" y2="200" />
              <line x1="90" y1="230" x2="180" y2="230" />
              <line x1="140" y1="200" x2="140" y2="270" />
              <line x1="180" y1="170" x2="180" y2="230" />

              <line x1="210" y1="200" x2="270" y2="200" />
              <line x1="210" y1="230" x2="250" y2="230" />
              <line x1="210" y1="200" x2="210" y2="270" />
            </g>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 17: Mặt đồng hồ chỉ đúng 5:10 - Chuẩn PDF Trang 7
    // ==========================================
    case 'q17_clock':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xs mx-auto w-full">
          <svg viewBox="0 0 200 200" className="w-full max-h-56 select-none font-bold">
            <circle cx="100" cy="100" r="90" fill="#f8fafc" stroke="#1e293b" strokeWidth="6" />
            <circle cx="100" cy="100" r="82" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

            {[
              { n: '12', x: 100, y: 36 },
              { n: '1', x: 140, y: 47 },
              { n: '2', x: 165, y: 72 },
              { n: '3', x: 174, y: 106 },
              { n: '4', x: 165, y: 140 },
              { n: '5', x: 140, y: 165 },
              { n: '6', x: 100, y: 174 },
              { n: '7', x: 60, y: 165 },
              { n: '8', x: 35, y: 140 },
              { n: '9', x: 26, y: 106 },
              { n: '10', x: 35, y: 72 },
              { n: '11', x: 60, y: 47 },
            ].map(({ n, x, y }) => (
              <text key={n} x={x} y={y} fill="#1e293b" fontSize="16" textAnchor="middle" dominantBaseline="middle">
                {n}
              </text>
            ))}

            {/* Hour hand pointing at 5:10 */}
            <line
              x1="100"
              y1="100"
              x2={100 + 48 * Math.sin((155 * Math.PI) / 180)}
              y2={100 - 48 * Math.cos((155 * Math.PI) / 180)}
              stroke="#0f172a"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Minute hand pointing at 2 */}
            <line
              x1="100"
              y1="100"
              x2={100 + 68 * Math.sin((60 * Math.PI) / 180)}
              y2={100 - 68 * Math.cos((60 * Math.PI) / 180)}
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            <circle cx="100" cy="100" r="5" fill="#0f172a" />
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 20: Cắt bánh vuông A, B, C, D - Chuẩn PDF Trang 8
    // ==========================================
    case 'q20_opt_A':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="35" y1="6" x2="35" y2="64" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="6" y1="35" x2="64" y2="35" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )
    case 'q20_opt_B':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="6" y1="6" x2="64" y2="64" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="64" y1="6" x2="6" y2="64" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )
    case 'q20_opt_C':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="35" y1="6" x2="6" y2="64" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="35" y1="6" x2="64" y2="64" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="35" y1="6" x2="35" y2="64" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )
    case 'q20_opt_D':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="6" y1="35" x2="35" y2="6" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="6" y1="64" x2="64" y2="6" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="35" y1="64" x2="64" y2="35" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )

    // ==========================================
    // CÂU 23: Tam giác chia 4 tam giác nhỏ - Chuẩn PDF Trang 9
    // ==========================================
    case 'q23_triangles':
      return (
        <div className="flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-sm mx-auto w-full">
          <svg viewBox="0 0 200 170" className="w-full max-h-56 select-none">
            <polygon points="100,10 190,160 10,160" fill="#ffffff" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="100,160 55,85 145,85" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 25: 4 đường gấp khúc trên lưới 6x2 - Chuẩn PDF Trang 10
    // ==========================================
    case 'q25_opt_A':
      return (
        <svg viewBox="0 0 160 50" className="w-36 sm:w-44 h-12 shrink-0 select-none">
          {/* 6x2 Grid */}
          <rect x="2" y="2" width="156" height="46" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
          {[28, 54, 80, 106, 132].map(x => (
            <line key={x} x1={x} y1="2" x2={x} y2="48" stroke="#1e293b" strokeWidth="1" />
          ))}
          <line x1="2" y1="25" x2="158" y2="25" stroke="#1e293b" strokeWidth="1" />
          {/* Path A: (0,0) -> (2,2) -> (4,0) -> (5,2) -> (6,0) */}
          <polyline points="2,2 54,48 106,2 132,48 158,2" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'q25_opt_B':
      return (
        <svg viewBox="0 0 160 50" className="w-36 sm:w-44 h-12 shrink-0 select-none">
          <rect x="2" y="2" width="156" height="46" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
          {[28, 54, 80, 106, 132].map(x => (
            <line key={x} x1={x} y1="2" x2={x} y2="48" stroke="#1e293b" strokeWidth="1" />
          ))}
          <line x1="2" y1="25" x2="158" y2="25" stroke="#1e293b" strokeWidth="1" />
          {/* Path B: (0,0) -> (3,2) -> (5,0) -> (6,1) */}
          <polyline points="2,2 80,48 132,2 158,25" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'q25_opt_C':
      return (
        <svg viewBox="0 0 160 50" className="w-36 sm:w-44 h-12 shrink-0 select-none">
          <rect x="2" y="2" width="156" height="46" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
          {[28, 54, 80, 106, 132].map(x => (
            <line key={x} x1={x} y1="2" x2={x} y2="48" stroke="#1e293b" strokeWidth="1" />
          ))}
          <line x1="2" y1="25" x2="158" y2="25" stroke="#1e293b" strokeWidth="1" />
          {/* Path C: (0,0) -> (1,2) -> (2,0) -> (3,2) -> (5,0) -> (6,2) */}
          <polyline points="2,2 28,48 54,2 80,48 132,2 158,48" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'q25_opt_D':
      return (
        <svg viewBox="0 0 160 50" className="w-36 sm:w-44 h-12 shrink-0 select-none">
          <rect x="2" y="2" width="156" height="46" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
          {[28, 54, 80, 106, 132].map(x => (
            <line key={x} x1={x} y1="2" x2={x} y2="48" stroke="#1e293b" strokeWidth="1" />
          ))}
          <line x1="2" y1="25" x2="158" y2="25" stroke="#1e293b" strokeWidth="1" />
          {/* Path D: (0,0) -> (1,2) -> (2,0) -> (3,2) -> (4,0) -> (5,2) -> (6,0) */}
          <polyline points="2,2 28,48 54,2 80,48 106,2 132,48 158,2" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )

    default:
      return null
  }
}
