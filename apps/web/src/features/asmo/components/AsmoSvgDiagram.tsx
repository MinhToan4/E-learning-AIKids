import React from 'react'

type Props = {
  diagramKey: string
  className?: string
}

export function AsmoSvgDiagram({ diagramKey, className }: Props) {
  switch (diagramKey) {
    // ==========================================
    // CÂU 8: Phép toán lồng hình học
    // ==========================================
    case 'q08_shapes_equation':
      return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs max-w-md mx-auto w-full">
          <svg viewBox="0 0 360 220" className="w-full max-h-56 select-none font-bold">
            {/* Row 1: Square + Triangle = Triangle in Square */}
            <g transform="translate(20, 15)">
              <rect x="0" y="0" width="50" height="50" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
              <text x="75" y="32" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">+</text>
              <polygon points="125,5 150,45 100,45" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
              <text x="175" y="32" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">=</text>
              <rect x="200" y="0" width="50" height="50" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
              <polygon points="225,12 242,40 208,40" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
            </g>

            {/* Row 2: Pentagon + Circle = Circle in Pentagon */}
            <g transform="translate(20, 85)">
              <polygon points="25,0 50,18 41,48 9,48 0,18" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
              <text x="75" y="30" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">+</text>
              <circle cx="125" cy="24" r="23" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
              <text x="175" y="30" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">=</text>
              <polygon points="225,0 250,18 241,48 209,48 200,18" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="225" cy="27" r="14" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
            </g>

            {/* Row 3: Triangle + Circle = ? */}
            <g transform="translate(20, 155)">
              <polygon points="25,5 50,45 0,45" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
              <text x="75" y="30" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">+</text>
              <circle cx="125" cy="25" r="22" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
              <text x="175" y="30" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">=</text>
              <g transform="translate(205, 5)">
                <rect x="0" y="0" width="45" height="45" rx="10" fill="#fff1f2" stroke="#fb7185" strokeWidth="2" strokeDasharray="4 3" />
                <text x="22.5" y="24" fill="#e11d48" fontSize="26" fontWeight="900" textAnchor="middle" dominantBaseline="middle">?</text>
              </g>
            </g>
          </svg>
        </div>
      )

    // Câu 8 Options (A, B, C, D)
    case 'q08_opt_A': // Square inside Triangle
      return (
        <svg viewBox="0 0 50 50" className="size-11 sm:size-12 shrink-0 select-none">
          <polygon points="25,4 47,44 3,44" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="16" y="22" width="18" height="18" rx="2" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
        </svg>
      )
    case 'q08_opt_B': // Pentagon inside Circle
      return (
        <svg viewBox="0 0 50 50" className="size-11 sm:size-12 shrink-0 select-none">
          <circle cx="25" cy="25" r="22" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
          <polygon points="25,12 37,21 32,36 18,36 13,21" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )
    case 'q08_opt_C': // Circle inside Triangle (Correct!)
      return (
        <svg viewBox="0 0 50 50" className="size-11 sm:size-12 shrink-0 select-none">
          <polygon points="25,4 47,44 3,44" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="25" cy="30" r="12" fill="#d1fae5" stroke="#059669" strokeWidth="2" />
        </svg>
      )
    case 'q08_opt_D': // Triangle inside Pentagon
      return (
        <svg viewBox="0 0 50 50" className="size-11 sm:size-12 shrink-0 select-none">
          <polygon points="25,4 47,20 39,46 11,46 3,20" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="25,18 36,38 14,38" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )

    // ==========================================
    // CÂU 1: Đếm bóng đen và trắng
    // ==========================================
    case 'q01_balls':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto w-full">
          <svg viewBox="0 0 340 160" className="w-full max-h-48 select-none">
            {/* 9 Black Balls */}
            <circle cx="45" cy="40" r="16" fill="#1e293b" />
            <circle cx="65" cy="85" r="16" fill="#1e293b" />
            <circle cx="120" cy="90" r="16" fill="#1e293b" />
            <circle cx="25" cy="130" r="16" fill="#1e293b" />
            <circle cx="105" cy="135" r="16" fill="#1e293b" />
            <circle cx="210" cy="60" r="16" fill="#1e293b" />
            <circle cx="235" cy="110" r="16" fill="#1e293b" />
            <circle cx="315" cy="95" r="16" fill="#1e293b" />
            <circle cx="290" cy="135" r="16" fill="#1e293b" />

            {/* 4 White Balls */}
            <circle cx="145" cy="45" r="16" fill="#ffffff" stroke="#475569" strokeWidth="3" />
            <circle cx="165" cy="115" r="16" fill="#ffffff" stroke="#475569" strokeWidth="3" />
            <circle cx="270" cy="65" r="16" fill="#ffffff" stroke="#475569" strokeWidth="3" />
            <circle cx="230" cy="140" r="16" fill="#ffffff" stroke="#475569" strokeWidth="3" />
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 2: Chữ số xoay tìm số còn thiếu (4)
    // ==========================================
    case 'q02_digits':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-xs max-w-md mx-auto w-full">
          <svg viewBox="0 0 340 180" className="w-full max-h-52 select-none font-mono font-extrabold">
            <rect x="10" y="10" width="320" height="160" rx="8" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
            <text x="40" y="65" transform="rotate(-30, 40, 65)" fill="#0f172a" fontSize="32">1</text>
            <text x="120" y="60" fill="#0f172a" fontSize="32">5</text>
            <text x="180" y="65" fill="#0f172a" fontSize="34">9</text>
            <text x="280" y="60" fill="#0f172a" fontSize="32">8</text>

            <text x="50" y="125" transform="rotate(90, 50, 125)" fill="#0f172a" fontSize="32">3</text>
            <text x="110" y="120" transform="rotate(90, 110, 120)" fill="#0f172a" fontSize="30">8</text>
            <text x="155" y="125" fill="#0f172a" fontSize="32">2</text>
            <text x="200" y="125" transform="rotate(25, 200, 125)" fill="#0f172a" fontSize="32">1</text>
            <text x="245" y="120" fill="#0f172a" fontSize="32">2</text>
            <text x="155" y="155" fill="#0f172a" fontSize="26">6</text>
            <text x="250" y="155" transform="rotate(180, 250, 155)" fill="#0f172a" fontSize="28">7</text>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 4: 3 Bập bênh cân đĩa
    // ==========================================
    case 'q04_balance':
      return (
        <div className="flex items-center justify-center p-3 rounded-3xl bg-white border border-slate-200 shadow-xs max-w-lg mx-auto w-full">
          <svg viewBox="0 0 420 160" className="w-full max-h-48 select-none text-2xl">
            {/* Seesaw 1: Banana (down-left) vs Strawberry (up-right) */}
            <g transform="translate(10, 20)">
              <polygon points="65,95 55,115 75,115" fill="#0f172a" />
              <line x1="15" y1="105" x2="115" y2="75" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <text x="20" y="95" fontSize="24">🍌</text>
              <text x="95" y="65" fontSize="22">🍓</text>
            </g>

            {/* Seesaw 2: Apple (up-left) vs Banana (down-right) */}
            <g transform="translate(145, 20)">
              <polygon points="65,95 55,115 75,115" fill="#0f172a" />
              <line x1="15" y1="75" x2="115" y2="105" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <text x="20" y="65" fontSize="22">🍎</text>
              <text x="95" y="95" fontSize="24">🍌</text>
            </g>

            {/* Seesaw 3: Grapes (down-left) vs Banana (up-right) */}
            <g transform="translate(280, 20)">
              <polygon points="65,95 55,115 75,115" fill="#0f172a" />
              <line x1="15" y1="105" x2="115" y2="75" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <text x="18" y="95" fontSize="24">🍇</text>
              <text x="95" y="65" fontSize="24">🍌</text>
            </g>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 5: Lưới ô vuông 5x7 so sánh phần xám
    // ==========================================
    case 'q05_grey_grid':
      return (
        <div className="flex items-center justify-center p-3 rounded-3xl bg-white border border-slate-200 shadow-xs max-w-xs mx-auto w-full">
          <svg viewBox="0 0 160 220" className="w-full max-h-56 select-none font-bold">
            {/* Base White Grid */}
            <rect x="5" y="5" width="150" height="210" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />

            {/* Grey Cells for A */}
            <rect x="5" y="5" width="30" height="30" fill="#94a3b8" />
            <rect x="35" y="5" width="30" height="30" fill="#94a3b8" />
            <rect x="65" y="5" width="30" height="30" fill="#94a3b8" />
            <rect x="5" y="35" width="30" height="30" fill="#94a3b8" />
            <rect x="65" y="35" width="30" height="30" fill="#94a3b8" />
            <rect x="5" y="65" width="30" height="30" fill="#94a3b8" />
            <rect x="65" y="65" width="30" height="30" fill="#94a3b8" />

            {/* Grey Cells for B (9 cells - Largest!) */}
            <rect x="95" y="5" width="30" height="30" fill="#64748b" />
            <rect x="125" y="5" width="30" height="30" fill="#64748b" />
            <rect x="95" y="35" width="30" height="30" fill="#64748b" />
            <rect x="125" y="35" width="30" height="30" fill="#64748b" />
            <rect x="95" y="65" width="30" height="30" fill="#64748b" />
            <rect x="125" y="65" width="30" height="30" fill="#64748b" />
            <rect x="95" y="95" width="30" height="30" fill="#64748b" />
            <rect x="125" y="95" width="30" height="30" fill="#64748b" />
            <rect x="35" y="65" width="30" height="30" fill="#94a3b8" />

            {/* Grey Cells for C */}
            <rect x="5" y="125" width="30" height="30" fill="#94a3b8" />
            <rect x="35" y="125" width="30" height="30" fill="#94a3b8" />
            <rect x="5" y="155" width="30" height="30" fill="#94a3b8" />
            <rect x="35" y="155" width="30" height="30" fill="#94a3b8" />
            <rect x="5" y="185" width="30" height="30" fill="#94a3b8" />

            {/* Grey Cells for D */}
            <rect x="95" y="125" width="30" height="30" fill="#94a3b8" />
            <rect x="125" y="125" width="30" height="30" fill="#94a3b8" />
            <rect x="95" y="155" width="30" height="30" fill="#94a3b8" />
            <rect x="125" y="155" width="30" height="30" fill="#94a3b8" />
            <rect x="95" y="185" width="30" height="30" fill="#94a3b8" />
            <rect x="125" y="185" width="30" height="30" fill="#94a3b8" />

            {/* Grid overlay lines */}
            <line x1="35" y1="5" x2="35" y2="215" stroke="#334155" strokeWidth="1.5" />
            <line x1="65" y1="5" x2="65" y2="215" stroke="#334155" strokeWidth="1.5" />
            <line x1="95" y1="5" x2="95" y2="215" stroke="#334155" strokeWidth="1.5" />
            <line x1="125" y1="5" x2="125" y2="215" stroke="#334155" strokeWidth="1.5" />

            <line x1="5" y1="35" x2="155" y2="35" stroke="#334155" strokeWidth="1.5" />
            <line x1="5" y1="65" x2="155" y2="65" stroke="#334155" strokeWidth="1.5" />
            <line x1="5" y1="95" x2="155" y2="95" stroke="#334155" strokeWidth="1.5" />
            <line x1="5" y1="125" x2="155" y2="125" stroke="#334155" strokeWidth="1.5" />
            <line x1="5" y1="155" x2="155" y2="155" stroke="#334155" strokeWidth="1.5" />
            <line x1="5" y1="185" x2="155" y2="185" stroke="#334155" strokeWidth="1.5" />

            {/* Labels A, B, C, D */}
            <rect x="35" y="35" width="30" height="30" fill="#f8fafc" />
            <text x="50" y="55" fill="#0f172a" fontSize="16" textAnchor="middle" dominantBaseline="middle">A</text>

            <rect x="95" y="35" width="30" height="30" fill="#f8fafc" />
            <text x="110" y="55" fill="#0f172a" fontSize="16" textAnchor="middle" dominantBaseline="middle">B</text>

            <rect x="35" y="155" width="30" height="30" fill="#f8fafc" />
            <text x="50" y="175" fill="#0f172a" fontSize="16" textAnchor="middle" dominantBaseline="middle">C</text>

            <rect x="95" y="155" width="30" height="30" fill="#f8fafc" />
            <text x="110" y="175" fill="#0f172a" fontSize="16" textAnchor="middle" dominantBaseline="middle">D</text>
          </svg>
        </div>
      )

    // ==========================================
    // CÂU 9: Que diêm các phương án A, B, C, D
    // ==========================================
    case 'q09_opt_A': // Square + tail (6 matches)
      return (
        <svg viewBox="0 0 60 60" className="size-12 shrink-0 select-none">
          <line x1="15" y1="15" x2="45" y2="15" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="15" y1="15" x2="15" y2="45" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="15" y1="45" x2="45" y2="45" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="15" x2="45" y2="45" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="45" x2="55" y2="45" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="45" x2="45" y2="55" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'q09_opt_B': // House (5 matches)
      return (
        <svg viewBox="0 0 60 60" className="size-12 shrink-0 select-none">
          <line x1="30" y1="10" x2="12" y2="28" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="10" x2="48" y2="28" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="15" y1="28" x2="15" y2="50" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="28" x2="45" y2="50" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="15" y1="50" x2="45" y2="50" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'q09_opt_C': // Scissors / Diamond Cross (6 matches)
      return (
        <svg viewBox="0 0 60 60" className="size-12 shrink-0 select-none">
          <line x1="30" y1="10" x2="15" y2="28" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="10" x2="45" y2="28" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="15" y1="28" x2="30" y2="44" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="45" y1="28" x2="30" y2="44" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="44" x2="15" y2="55" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="44" x2="45" y2="55" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'q09_opt_D': // Window double square (7 matches - Correct!)
      return (
        <svg viewBox="0 0 60 60" className="size-12 shrink-0 select-none">
          <line x1="8" y1="18" x2="52" y2="18" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="8" y1="44" x2="52" y2="44" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="8" y1="18" x2="8" y2="44" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="30" y1="18" x2="30" y2="44" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="52" y1="18" x2="52" y2="44" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )

    // ==========================================
    // CÂU 20: Cắt bánh vuông A, B, C, D
    // ==========================================
    case 'q20_opt_A': // Cross
      return (
        <svg viewBox="0 0 50 50" className="size-12 shrink-0 select-none">
          <rect x="4" y="4" width="42" height="42" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" rx="2" />
          <line x1="25" y1="4" x2="25" y2="46" stroke="#92400e" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="4" y1="25" x2="46" y2="25" stroke="#92400e" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      )
    case 'q20_opt_B': // 2 Diagonals
      return (
        <svg viewBox="0 0 50 50" className="size-12 shrink-0 select-none">
          <rect x="4" y="4" width="42" height="42" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" rx="2" />
          <line x1="4" y1="4" x2="46" y2="46" stroke="#92400e" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="46" y1="4" x2="4" y2="46" stroke="#92400e" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      )
    case 'q20_opt_C': // Wrong Cut (Central big triangle)
      return (
        <svg viewBox="0 0 50 50" className="size-12 shrink-0 select-none">
          <rect x="4" y="4" width="42" height="42" fill="#fef2f2" stroke="#ef4444" strokeWidth="2.5" rx="2" />
          <line x1="25" y1="4" x2="4" y2="46" stroke="#b91c1c" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="25" y1="4" x2="46" y2="46" stroke="#b91c1c" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="25" y1="4" x2="25" y2="46" stroke="#b91c1c" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      )
    case 'q20_opt_D': // 3 Diagonal stripes
      return (
        <svg viewBox="0 0 50 50" className="size-12 shrink-0 select-none">
          <rect x="4" y="4" width="42" height="42" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" rx="2" />
          <line x1="4" y1="25" x2="25" y2="4" stroke="#92400e" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="4" y1="46" x2="46" y2="4" stroke="#92400e" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="25" y1="46" x2="46" y2="25" stroke="#92400e" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      )

    // ==========================================
    // CÂU 23: Tam giác chia 4 tam giác nhỏ
    // ==========================================
    case 'q23_triangles':
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-xs max-w-xs mx-auto w-full">
          <svg viewBox="0 0 160 140" className="w-full max-h-48 select-none">
            {/* Big Outer Triangle */}
            <polygon points="80,10 150,130 10,130" fill="#f0fdf4" stroke="#15803d" strokeWidth="3" strokeLinejoin="round" />
            {/* Inner Inverted Triangle */}
            <polygon points="80,130 45,70 115,70" fill="#dcfce7" stroke="#15803d" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>
      )

    default:
      return null
  }
}
