import React from 'react'

type Props = {
  diagramKey: string
  className?: string
}

export function AsmoSvgDiagram({ diagramKey, className }: Props) {
  switch (diagramKey) {
    // ==========================================
    // CÂU 8: Phép toán lồng hình học (To rõ, sắc nét)
    // ==========================================
    case 'q08_shapes_equation':
      return (
        <div className="flex flex-col items-center justify-center p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto w-full">
          <svg viewBox="0 0 380 240" className="w-full max-h-64 select-none font-bold">
            {/* Row 1: Square + Triangle = Triangle in Square */}
            <g transform="translate(20, 15)">
              <rect x="0" y="0" width="55" height="55" rx="6" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
              <text x="80" y="35" fill="#0f172a" fontSize="28" textAnchor="middle" dominantBaseline="middle">+</text>
              <polygon points="135,5 165,50 105,50" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
              <text x="190" y="35" fill="#0f172a" fontSize="28" textAnchor="middle" dominantBaseline="middle">=</text>
              <rect x="220" y="0" width="55" height="55" rx="6" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
              <polygon points="247.5,14 266,45 229,45" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
            </g>

            {/* Row 2: Pentagon + Circle = Circle in Pentagon */}
            <g transform="translate(20, 90)">
              <polygon points="27.5,0 55,20 45,53 10,53 0,20" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
              <text x="80" y="33" fill="#0f172a" fontSize="28" textAnchor="middle" dominantBaseline="middle">+</text>
              <circle cx="135" cy="27" r="26" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
              <text x="190" y="33" fill="#0f172a" fontSize="28" textAnchor="middle" dominantBaseline="middle">=</text>
              <polygon points="247.5,0 275,20 265,53 230,53 220,20" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="247.5,30" r="16" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
            </g>

            {/* Row 3: Triangle + Circle = ? */}
            <g transform="translate(20, 165)">
              <polygon points="27.5,5 55,50 0,50" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
              <text x="80" y="33" fill="#0f172a" fontSize="28" textAnchor="middle" dominantBaseline="middle">+</text>
              <circle cx="135" cy="28" r="25" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
              <text x="190" y="33" fill="#0f172a" fontSize="28" textAnchor="middle" dominantBaseline="middle">=</text>
              <g transform="translate(225, 5)">
                <rect x="0" y="0" width="50" height="50" rx="12" fill="#fff1f2" stroke="#fb7185" strokeWidth="2.5" strokeDasharray="4 3" />
                <text x="25" y="27" fill="#e11d48" fontSize="28" fontWeight="900" textAnchor="middle" dominantBaseline="middle">?</text>
              </g>
            </g>
          </svg>
        </div>
      )

    // Câu 8 Options (A, B, C, D) - Kích thước lớn, viền đậm
    case 'q08_opt_A': // Square inside Triangle
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,64 5,64" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <rect x="22.5" y="33" width="25" height="25" rx="3" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'q08_opt_B': // Pentagon inside Circle
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <circle cx="35" cy="35" r="31" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
          <polygon points="35,16 51,28 45,49 25,49 19,28" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )
    case 'q08_opt_C': // Circle inside Triangle (Correct!)
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,64 5,64" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="35" cy="44" r="16" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'q08_opt_D': // Triangle inside Pentagon
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,28 53,64 17,64 5,28" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="35,25 50,54 20,54" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )

    // ==========================================
    // CÂU 9: Que diêm to rõ, có đầu đỏ cho bé đếm chính xác
    // ==========================================
    case 'q09_opt_A': // Hình A (Square + tail = 6 matches)
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          {/* Top match */}
          <line x1="20" y1="20" x2="65" y2="20" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="20" cy="20" r="4.5" fill="#ef4444" />
          {/* Left match */}
          <line x1="20" y1="20" x2="20" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="20" cy="65" r="4.5" fill="#ef4444" />
          {/* Bottom match */}
          <line x1="20" y1="65" x2="65" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="65" r="4.5" fill="#ef4444" />
          {/* Right match */}
          <line x1="65" y1="20" x2="65" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="20" r="4.5" fill="#ef4444" />
          {/* Horizontal tail */}
          <line x1="65" y1="65" x2="82" y2="65" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="82" cy="65" r="4.5" fill="#ef4444" />
          {/* Vertical tail */}
          <line x1="65" y1="65" x2="65" y2="82" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="82" r="4.5" fill="#ef4444" />
        </svg>
      )

    case 'q09_opt_B': // Hình B (House = 5 matches)
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          {/* Left roof */}
          <line x1="45" y1="15" x2="18" y2="42" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="15" r="4.5" fill="#ef4444" />
          {/* Right roof */}
          <line x1="45" y1="15" x2="72" y2="42" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="72" cy="42" r="4.5" fill="#ef4444" />
          {/* Left wall */}
          <line x1="22" y1="42" x2="22" y2="75" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="22" cy="42" r="4.5" fill="#ef4444" />
          {/* Right wall */}
          <line x1="68" y1="42" x2="68" y2="75" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="68" cy="42" r="4.5" fill="#ef4444" />
          {/* Floor */}
          <line x1="22" y1="75" x2="68" y2="75" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="22" cy="75" r="4.5" fill="#ef4444" />
        </svg>
      )

    case 'q09_opt_C': // Hình C (Scissors / Diamond Cross = 6 matches)
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          {/* Top-left to center */}
          <line x1="45" y1="15" x2="22" y2="40" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="15" r="4.5" fill="#ef4444" />
          {/* Top-right to center */}
          <line x1="45" y1="15" x2="68" y2="40" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="68" cy="40" r="4.5" fill="#ef4444" />
          {/* Mid-left to junction */}
          <line x1="22" y1="40" x2="45" y2="62" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="22" cy="40" r="4.5" fill="#ef4444" />
          {/* Mid-right to junction */}
          <line x1="68" y1="40" x2="45" y2="62" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="62" r="4.5" fill="#ef4444" />
          {/* Bottom-left leg */}
          <line x1="45" y1="62" x2="25" y2="80" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="25" cy="80" r="4.5" fill="#ef4444" />
          {/* Bottom-right leg */}
          <line x1="45" y1="62" x2="65" y2="80" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="65" cy="80" r="4.5" fill="#ef4444" />
        </svg>
      )

    case 'q09_opt_D': // Hình D (Window double square = 7 matches - Correct!)
      return (
        <svg viewBox="0 0 90 90" className="size-20 sm:size-24 shrink-0 select-none">
          {/* Top horizontal */}
          <line x1="12" y1="28" x2="78" y2="28" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="12" cy="28" r="4.5" fill="#ef4444" />
          {/* Bottom horizontal */}
          <line x1="12" y1="64" x2="78" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="78" cy="64" r="4.5" fill="#ef4444" />
          {/* Left vertical */}
          <line x1="12" y1="28" x2="12" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="12" cy="64" r="4.5" fill="#ef4444" />
          {/* Middle vertical */}
          <line x1="45" y1="28" x2="45" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="45" cy="28" r="4.5" fill="#ef4444" />
          {/* Right vertical */}
          <line x1="78" y1="28" x2="78" y2="64" stroke="#d97706" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="78" cy="28" r="4.5" fill="#ef4444" />
        </svg>
      )

    // ==========================================
    // CÂU 1: Đếm bóng đen và trắng (To rõ)
    // ==========================================
    case 'q01_balls':
      return (
        <div className="flex items-center justify-center p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm max-w-lg mx-auto w-full">
          <svg viewBox="0 0 380 180" className="w-full max-h-56 select-none">
            {/* 9 Black Balls */}
            <circle cx="50" cy="45" r="18" fill="#1e293b" />
            <circle cx="75" cy="95" r="18" fill="#1e293b" />
            <circle cx="135" cy="100" r="18" fill="#1e293b" />
            <circle cx="30" cy="145" r="18" fill="#1e293b" />
            <circle cx="120" cy="150" r="18" fill="#1e293b" />
            <circle cx="235" cy="65" r="18" fill="#1e293b" />
            <circle cx="265" cy="120" r="18" fill="#1e293b" />
            <circle cx="350" cy="105" r="18" fill="#1e293b" />
            <circle cx="325" cy="150" r="18" fill="#1e293b" />

            {/* 4 White Balls */}
            <circle cx="165" cy="50" r="18" fill="#ffffff" stroke="#334155" strokeWidth="3.5" />
            <circle cx="185" cy="125" r="18" fill="#ffffff" stroke="#334155" strokeWidth="3.5" />
            <circle cx="300" cy="70" r="18" fill="#ffffff" stroke="#334155" strokeWidth="3.5" />
            <circle cx="260" cy="155" r="18" fill="#ffffff" stroke="#334155" strokeWidth="3.5" />
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 2: Chữ số xoay tìm số còn thiếu (4)
    // ==========================================
    case 'q02_digits':
      return (
        <div className="flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto w-full">
          <svg viewBox="0 0 360 200" className="w-full max-h-60 select-none font-mono font-extrabold">
            <rect x="10" y="10" width="340" height="180" rx="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
            <text x="45" y="70" transform="rotate(-30, 45, 70)" fill="#0f172a" fontSize="36">1</text>
            <text x="130" y="65" fill="#0f172a" fontSize="36">5</text>
            <text x="195" y="70" fill="#0f172a" fontSize="38">9</text>
            <text x="300" y="65" fill="#0f172a" fontSize="36">8</text>

            <text x="55" y="140" transform="rotate(90, 55, 140)" fill="#0f172a" fontSize="36">3</text>
            <text x="120" y="135" transform="rotate(90, 120, 135)" fill="#0f172a" fontSize="34">8</text>
            <text x="170" y="140" fill="#0f172a" fontSize="36">2</text>
            <text x="220" y="140" transform="rotate(25, 220, 140)" fill="#0f172a" fontSize="36">1</text>
            <text x="270" y="135" fill="#0f172a" fontSize="36">2</text>
            <text x="170" y="175" fill="#0f172a" fontSize="30">6</text>
            <text x="275" y="175" transform="rotate(180, 275, 175)" fill="#0f172a" fontSize="32">7</text>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 4: 3 Bập bênh cân đĩa
    // ==========================================
    case 'q04_balance':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto w-full">
          <svg viewBox="0 0 450 180" className="w-full max-h-56 select-none text-3xl">
            {/* Seesaw 1: Banana (down-left) vs Strawberry (up-right) */}
            <g transform="translate(15, 25)">
              <polygon points="70,110 58,135 82,135" fill="#0f172a" />
              <line x1="15" y1="120" x2="125" y2="85" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <text x="20" y="110" fontSize="28">🍌</text>
              <text x="100" y="75" fontSize="26">🍓</text>
            </g>

            {/* Seesaw 2: Apple (up-left) vs Banana (down-right) */}
            <g transform="translate(160, 25)">
              <polygon points="70,110 58,135 82,135" fill="#0f172a" />
              <line x1="15" y1="85" x2="125" y2="120" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <text x="20" y="75" fontSize="26">🍎</text>
              <text x="100" y="110" fontSize="28">🍌</text>
            </g>

            {/* Seesaw 3: Grapes (down-left) vs Banana (up-right) */}
            <g transform="translate(305, 25)">
              <polygon points="70,110 58,135 82,135" fill="#0f172a" />
              <line x1="15" y1="120" x2="125" y2="85" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <text x="18" y="110" fontSize="28">🍇</text>
              <text x="100" y="75" fontSize="28">🍌</text>
            </g>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 5: Lưới ô vuông 5x7 so sánh phần xám (To rõ)
    // ==========================================
    case 'q05_grey_grid':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-sm mx-auto w-full">
          <svg viewBox="0 0 190 260" className="w-full max-h-72 select-none font-bold">
            {/* Base White Grid (5 cols x 7 rows, cell: 36x36) */}
            <rect x="5" y="5" width="180" height="252" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />

            {/* Grey Cells for A */}
            <rect x="5" y="5" width="36" height="36" fill="#94a3b8" />
            <rect x="41" y="5" width="36" height="36" fill="#94a3b8" />
            <rect x="77" y="5" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="41" width="36" height="36" fill="#94a3b8" />
            <rect x="77" y="41" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="77" width="36" height="36" fill="#94a3b8" />
            <rect x="77" y="77" width="36" height="36" fill="#94a3b8" />

            {/* Grey Cells for B (9 cells - Largest!) */}
            <rect x="113" y="5" width="36" height="36" fill="#64748b" />
            <rect x="149" y="5" width="36" height="36" fill="#64748b" />
            <rect x="113" y="41" width="36" height="36" fill="#64748b" />
            <rect x="149" y="41" width="36" height="36" fill="#64748b" />
            <rect x="113" y="77" width="36" height="36" fill="#64748b" />
            <rect x="149" y="77" width="36" height="36" fill="#64748b" />
            <rect x="113" y="113" width="36" height="36" fill="#64748b" />
            <rect x="149" y="113" width="36" height="36" fill="#64748b" />
            <rect x="41" y="77" width="36" height="36" fill="#94a3b8" />

            {/* Grey Cells for C */}
            <rect x="5" y="149" width="36" height="36" fill="#94a3b8" />
            <rect x="41" y="149" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="185" width="36" height="36" fill="#94a3b8" />
            <rect x="41" y="185" width="36" height="36" fill="#94a3b8" />
            <rect x="5" y="221" width="36" height="36" fill="#94a3b8" />

            {/* Grey Cells for D */}
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

            {/* Labels A, B, C, D */}
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
    // CÂU 20: Cắt bánh vuông A, B, C, D
    // ==========================================
    case 'q20_opt_A': // Cross
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#fffbeb" stroke="#d97706" strokeWidth="3" rx="4" />
          <line x1="35" y1="6" x2="35" y2="64" stroke="#92400e" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="6" y1="35" x2="64" y2="35" stroke="#92400e" strokeWidth="2.5" strokeDasharray="4 3" />
        </svg>
      )
    case 'q20_opt_B': // 2 Diagonals
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#fffbeb" stroke="#d97706" strokeWidth="3" rx="4" />
          <line x1="6" y1="6" x2="64" y2="64" stroke="#92400e" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="64" y1="6" x2="6" y2="64" stroke="#92400e" strokeWidth="2.5" strokeDasharray="4 3" />
        </svg>
      )
    case 'q20_opt_C': // Wrong Cut (Central big triangle)
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#fef2f2" stroke="#ef4444" strokeWidth="3" rx="4" />
          <line x1="35" y1="6" x2="6" y2="64" stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="35" y1="6" x2="64" y2="64" stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="35" y1="6" x2="35" y2="64" stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="4 3" />
        </svg>
      )
    case 'q20_opt_D': // 3 Diagonal stripes
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="6" y="6" width="58" height="58" fill="#fffbeb" stroke="#d97706" strokeWidth="3" rx="4" />
          <line x1="6" y1="35" x2="35" y2="6" stroke="#92400e" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="6" y1="64" x2="64" y2="6" stroke="#92400e" strokeWidth="2.5" strokeDasharray="4 3" />
          <line x1="35" y1="64" x2="64" y2="35" stroke="#92400e" strokeWidth="2.5" strokeDasharray="4 3" />
        </svg>
      )

    // ==========================================
    // CÂU 23: Tam giác chia 4 tam giác nhỏ
    // ==========================================
    case 'q23_triangles':
      return (
        <div className="flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-sm mx-auto w-full">
          <svg viewBox="0 0 200 170" className="w-full max-h-56 select-none">
            {/* Big Outer Triangle */}
            <polygon points="100,10 190,160 10,160" fill="#f0fdf4" stroke="#15803d" strokeWidth="3.5" strokeLinejoin="round" />
            {/* Inner Inverted Triangle */}
            <polygon points="100,160 55,85 145,85" fill="#dcfce7" stroke="#15803d" strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </div>
      )

    default:
      return null
  }
}
