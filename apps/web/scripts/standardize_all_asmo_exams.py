# -*- coding: utf-8 -*-
"""
ASMO Master Taxonomy Standardizer & KaTeX Converter (Grades 1 - 12)
Standardizes topicCode & topicName across all grades, and applies thorough KaTeX math formatting.
"""

import os
import re
import json
from pathlib import Path

WEB_EXAMS_PATH = Path('/Users/imam/storymee/1-Harness-Apps/E-learning-AIKids/apps/web/src/features/asmo/data/asmo-sample-exams.ts')
BACKEND_EXAMS_PATH = Path('/Users/imam/storymee/2-MCP-Core/core-lms-api/src/modules/asmo/asmo.seed-data.ts')

GREEK_WORDS = ['alpha', 'beta', 'gamma', 'theta', 'lambda', 'sigma', 'delta', 'phi', 'psi', 'omega']

TOPIC_TAXONOMY = {
    'primary': {
        1: 'Đếm & Nhận Biết Hình Học',
        2: 'Số Học & Dãy Số Quy Luật',
        3: 'Đo Lường & Thời Gian',
        4: 'Phân Số & Tỉ Số Trực Quan',
        5: 'Tư Duy Logic & Trò Chơi',
        6: 'Chu Vi & Diện Tích',
    },
    'secondary': {
        1: 'Số Học & Tính Chia Hết',
        2: 'Đại Số & Đa Thức',
        3: 'Phương Trình & Hệ Phương Trình',
        4: 'Hình Học Phẳng & Góc',
        5: 'Tổ Hợp & Dãy Số',
        6: 'Bất Đẳng Thức',
    },
    'high': {
        1: 'Phương Trình Bậc Hai & Viète',
        2: 'Phương Trình Mũ & Logarit',
        3: 'Lượng Giác & Biến Đổi',
        4: 'Hình Học Không Gian & Vectơ',
        5: 'Giải Tích, Giới Hạn & Đạo Hàm',
        6: 'Tổ Hợp, Xác Suất & Nhị Thức',
    },
}

PRIMARY_LEGACY_MAP = {
    'MATH_G1_COUNT': 1,
    'MATH_G1_COUNT_TRIANGLES': 1,
    'MATH_G1_SHAPES_ADD': 1,
    'MATH_G1_PUZZLE': 1,
    'MATH_G1_MATCHES': 1,
    'MATH_GEO_3D_COUNT': 1,
    
    'MATH_G1_ADDITION': 2,
    'MATH_G1_VERTICAL_SUB': 2,
    'MATH_G1_CANDIES': 2,
    'MATH_G1_SUM_SERIES': 2,
    'MATH_G1_EVEN_ODD': 2,
    'MATH_G1_BOX_EQUATION': 2,
    'MATH_G1_DIGITS': 2,
    'MATH_G1_PINEAPPLES': 2,
    'MATH_G1_INEQUALITY': 2,
    
    'MATH_G1_CLOCK': 3,
    'MATH_G1_RACE_TIME': 3,
    'MATH_G1_BALANCE': 3,
    'MATH_G1_LINE_GRID': 3,
    'MATH_TIME_CLOCK': 3,
    'MATH_LOGIC_WEIGHT': 3,
    
    'MATH_G1_CAKE': 4,
    'MATH_G1_RATE': 4,
    'MATH_G1_COINS': 4,
    'MATH_GEO_FRACTION': 4,
    
    'MATH_G1_MAZE': 5,
    'MATH_G1_QUEUE': 5,
    'MATH_G1_BALLS_LOGIC': 5,
    'MATH_COMB_GRID_PATH': 5,
    'MATH_LOGIC_MATCHES': 5,
    'MATH_COMB_PERMUTATION': 5,
    
    'MATH_G1_AREA': 6,
}

def clean_math_expr(s: str) -> str:
    """Cleans and standardizes an inner mathematical expression to valid KaTeX syntax."""
    if not s:
        return ""
    
    # 0. Protect existing \text{...} blocks
    text_blocks = []
    def protect_text(m):
        idx = len(text_blocks)
        text_blocks.append(m.group(0))
        return f"__TEXT_BLOCK_{idx}__"
    s = re.sub(r'\\text\{[^\}]*\}', protect_text, s)
    
    # 1. Normalize typography & unicode symbols
    s = s.replace('–', '-').replace('−', '-')
    s = s.replace('’', "'")
    s = s.replace('°C', r'^\circ\text{C}')
    s = s.replace('°', r'^\circ')
    s = s.replace('π', r'\pi')
    s = s.replace('...', r'\dots')
    s = s.replace('…', r'\dots')
    s = s.replace('×', r'\times')
    s = s.replace('÷', r'\div')
    s = s.replace('☻', r'\bigstar ')
    s = s.replace('■', r'\blacksquare ')
    s = s.replace('⬤', r'\bullet ')
    s = s.replace('♪', r'\clubsuit ')
    s = s.replace('♥', r'\heartsuit ')
    s = s.replace('♠', r'\spadesuit ')
    s = s.replace('♦', r'\diamondsuit ')
    s = s.replace('○', r'\bigcirc ')
    s = s.replace('△', r'\triangle ')
    s = s.replace('□', r'\square ')
    s = s.replace('★', r'\bigstar ')
    s = s.replace('▲', r'\blacktriangle ')
    s = s.replace('☆', r'\star ')
    s = re.sub(r'_{2,}', lambda m: r'\underline{\quad}', s)

    # 2. Greek symbols
    for g in GREEK_WORDS:
        s = re.sub(rf'(?<!\\)\b{g}\b', lambda m, g=g: '\\' + g, s)
    s = re.sub(r'(?<!\\)\bpi\b', lambda m: r'\pi', s)

    # 3. Composite functions
    s = re.sub(r'\bgf\((\d+)\)', lambda m: r'g(f(' + m.group(1) + r'))', s)

    # 4. Functions: sin, cos, tan, cot, sec, csc, ln, log
    s = re.sub(r'(?<!\\)\b(sin|cos|tan|cot|sec|csc|ln)\b', lambda m: '\\' + m.group(1), s)
    s = re.sub(r'(?<!\\)\blog_\{?([a-zA-Z0-9]+)\}?\(', lambda m: r'\log_{' + m.group(1) + '}(', s)
    s = re.sub(r'(?<!\\)\blog\b', lambda m: r'\log', s)

    # 5. Radicals
    while 'sqrt(' in s:
        s = re.sub(r'sqrt\(([^()]+)\)', lambda m: r'\sqrt{' + clean_math_expr(m.group(1)) + '}', s)

    # 6. Fractions
    s = re.sub(r'\(([^\)]+)\)\s*/\s*\(([^\)]+)\)', lambda m: r'\frac{' + clean_math_expr(m.group(1)) + '}{' + clean_math_expr(m.group(2)) + '}', s)
    s = re.sub(r'\(([^\)]+)\)\s*/\s*([a-zA-Z0-9_\{\}\\]+)', lambda m: r'\frac{' + clean_math_expr(m.group(1)) + '}{' + clean_math_expr(m.group(2)) + '}', s)
    s = re.sub(r'([a-zA-Z0-9_\{\}\\]+)\s*/\s*\(([^\)]+)\)', lambda m: r'\frac{' + clean_math_expr(m.group(1)) + '}{' + clean_math_expr(m.group(2)) + '}', s)
    # Simple fractions
    s = re.sub(r'(-?)(\\?[a-zA-Z0-9_]+)\s*/\s*(\\?[a-zA-Z0-9_]+)', lambda m: m.group(1) + r'\frac{' + clean_math_expr(m.group(2)) + '}{' + clean_math_expr(m.group(3)) + '}', s)

    # 7. Powers: e.g. e^(2x) -> e^{2x}, 2^(2x) -> 2^{2x}, 2^2020 -> 2^{2020}
    s = re.sub(r'\^\(([^\)]+)\)', lambda m: '^{' + clean_math_expr(m.group(1)) + '}', s)
    s = re.sub(r'\^(\d{2,})', lambda m: '^{' + m.group(1) + '}', s)
    s = re.sub(r'([a-zA-Z])\^([0-9])([a-zA-Z])\^([0-9])', lambda m: m.group(1) + '^{' + m.group(2) + '}' + m.group(3) + '^{' + m.group(4) + '}', s)

    # 8. Multiplications
    s = re.sub(r'(\d+)\s*\*\s*\\(sin|cos|tan|cot|sec|csc|sqrt|pi|alpha|beta|gamma|theta)', lambda m: m.group(1) + '\\' + m.group(2), s)
    s = re.sub(r'([a-zA-Z0-9\)\}])\s*\*\s*\\(sin|cos|tan|cot|sec|csc|sqrt|pi|alpha|beta|gamma|theta)', lambda m: m.group(1) + r' \cdot \\' + m.group(2), s)
    s = re.sub(r'(\d+)\s*\*\s*(\d+)', lambda m: m.group(1) + r' \times ' + m.group(2), s)
    s = re.sub(r'([a-zA-Z0-9\)])\s*\*\s*([a-zA-Z\(])', lambda m: m.group(1) + r' \cdot ' + m.group(2), s)
    s = re.sub(r'\s*\*\s*', lambda m: r' \cdot ', s)

    # 9. Comparison & set operators
    s = re.sub(r'<=', lambda m: r'\le', s)
    s = re.sub(r'>=', lambda m: r'\ge', s)
    s = re.sub(r'!=', lambda m: r'\neq', s)
    s = re.sub(r'\bin\b', lambda m: r'\in', s)
    s = re.sub(r'\b-inf\b', lambda m: r'-\infty', s)
    s = re.sub(r'\binft?y?\b', lambda m: r'\infty', s)
    s = re.sub(r'\bU\b', lambda m: r'\cup', s)

    # 10. Geometric symbols
    s = s.replace('∠', r'\angle ')
    s = s.replace('Δ', r'\Delta ')

    # 11. Calculus expressions
    s = re.sub(r'\bdy/dx\b', lambda m: r'\frac{dy}{dx}', s)
    s = re.sub(r'\bsum_\{?([a-zA-Z0-9=]+)\}?\^\{?([a-zA-Z0-9\\]+)\}?', lambda m: r'\sum_{' + m.group(1) + '}^{' + m.group(2) + '}', s)

    # Restore \text{...} blocks
    for idx, blk in enumerate(text_blocks):
        s = s.replace(f"__TEXT_BLOCK_{idx}__", blk)

    # Clean up redundant spaces
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def wrap_math(s: str) -> str:
    return f"${clean_math_expr(s)}$"

def is_pure_math_option(text: str) -> bool:
    if not text:
        return False
    s = text.strip()
    if s.startswith('$') and s.endswith('$'):
        return False
    
    non_math_starters = [
        'Khẳng định', 'Thiếu điều kiện', 'Không xác định', 'Không có đáp án',
        'None of', 'All ', 'Always ', 'Despite', 'The ', 'This ', 'Which',
        'is ', 'are ', 'was ', 'were ', 'has ', 'have ', 'to ', 'for ', 'with ',
        'Rectangle', 'Triangle', 'Circle', 'Square', 'Pentagon', 'Cylinder',
        'prism', 'Hình ', 'Tam giác', 'Hình vuông', 'Hình chữ nhật',
        'chasing', 'computer', 'rapidly', 'resistance', 'disinterested',
        'misinterpret', 'misunderstand', 'pink and tight', 'pink tight',
        'pitiful', 'since', 'sink', 'sleeping', 'tight but pink', 'tight pink',
        'understand', 'understanding', 'understands', 'are keeping', 'hesitantly',
        'happily', 'Decomposing', 'Respiration', 'Iron', 'Steel', 'Oxygen',
        'Hydrogen', 'Water', 'Sodium', 'Aluminium', 'Polymerisation', 'Vulcanisation',
        'Heating', 'Hydrogenation', 'strong', 'solid', 'float', 'feeble',
        'meaningful', 'fruitful', 'lawful', 'doubtful', 'Mảnh '
    ]
    if any(s.startswith(p) or f' {p}' in s for p in non_math_starters):
        return False
    
    # 0, \ln(3) or \ln(3)
    if r'\ln' in s or r'\log' in s or r'\frac' in s or r'\sqrt' in s:
        return True
    
    # Explicit fraction: -2/15, 1/15, 3/8, 24/7, 45/512, 2/alpha, pi/24, 0/15
    if re.fullmatch(r'-?[a-zA-Z0-9_\{\}\\]+/[a-zA-Z0-9_\{\}\\]+(\s*\+\s*\d+)?', s):
        return True
    
    # Mathematical keywords / symbols
    if any(w in s for w in ['sqrt', 'pi', 'alpha', 'beta', 'theta', 'gamma', 'sin', 'cos', 'tan', 'cot', 'log', 'ln', '^', '°']):
        return True
    
    # Variable assignments / equations: A = 5, C = 7, D = 5, x = 2, y = 3, p = 5, q = -7, y = 9x - 16
    if re.search(r'\b[a-zA-Z]\s*=\s*-?\d+', s):
        return True
    
    # Coordinate tuples: (2, -3), (1, 8), (4, 3), (3, 4)
    if re.fullmatch(r'(\(-?\d+,\s*-?\d+(\s*,\s*-?\d+)?\)(,\s*)?)+', s):
        return True
    
    # Interval / inequality: x in (-inf, 1) U (1, 3), -2 < x < 5, 5 <= m <= 10
    if any(op in s for op in ['<', '>', '<=', '>=', ' in ']):
        return True
    
    # Arithmetic: 13 + 17, 9 + 11, +, -, -
    if re.fullmatch(r'[\d\s\+\-\*\/]+', s) and any(c in s for c in ['+', '-', '*', '/']) and not re.fullmatch(r'-?\d+', s):
        return True
    if re.fullmatch(r'[\+\-,\s]+', s):
        return True
    
    # Algebraic polynomial: x - 2, 2a + b, 2R/3, 3R/4, 4R/5, R/2
    if re.fullmatch(r'[a-zA-Z0-9\s\+\-\*\/\^R_]+', s) and any(c in s for c in ['+', '-', '*', '/', '^']):
        return True
        
    return False

def transform_option(opt_text: str) -> str:
    if not opt_text:
        return ""
    s = opt_text.strip()
    if s.startswith('$') and s.endswith('$'):
        inner = s[1:-1]
        return f"${clean_math_expr(inner)}$"
    
    if is_pure_math_option(s):
        return wrap_math(s)
    
    return s

def transform_narrative_text(text: str) -> str:
    """Extracts and standardizes math formulas embedded in narrative text."""
    if not text:
        return ""
    
    protected_blocks = []
    
    def add_math_block(raw_math: str) -> str:
        clean = clean_math_expr(raw_math)
        block = f"${clean}$"
        idx = len(protected_blocks)
        protected_blocks.append(block)
        return f"__MATH_BLOCK_{idx}__"

    # Protect existing $...$ and $$...$$ blocks
    def protect_existing(match):
        raw = match.group(0)
        idx = len(protected_blocks)
        if raw.startswith('$$') and raw.endswith('$$'):
            clean = clean_math_expr(raw[2:-2])
            protected_blocks.append(f"$${clean}$$")
        elif raw.startswith('$') and raw.endswith('$'):
            clean = clean_math_expr(raw[1:-1])
            protected_blocks.append(f"${clean}$")
        else:
            protected_blocks.append(raw)
        return f"__MATH_BLOCK_{idx}__"

    s = re.sub(r'(\$\$[\s\S]*?\$\$|\$[^\$\n]*?\$|<[^>]+>)', protect_existing, text)

    # 1. Specific High-Level Mathematical Equations & Formulas
    equations = [
        r'e\^\(2x\)\s*-\s*4e\^x\s*\+\s*3\s*=\s*0',
        r'e\^\{2x\}\s*-\s*4e\^x\s*\+\s*3\s*=\s*0',
        r'2\^\(2x\)\s*-\s*5\(2\^x\)\s*\+\s*4\s*=\s*0',
        r'\(e\^x\s*-\s*\d+\)\(e\^x\s*-\s*\d+\)\s*=\s*0',
        r'e\^x\s*=\s*\d+',
        r'x\s*=\s*\\ln\(\d+\)',
        r'x\^4\s*-\s*4x\^3\s*\+\s*6x\^2\s*-\s*4x\s*\+\s*1\s*=\s*0',
        r'\(x\s*-\s*1\)\^4\s*=\s*0',
        r'2x\^2\s*-\s*x\s*-\s*15\s*=\s*0',
        r'3x\^2\s*-\s*5x\s*\+\s*2\s*=\s*0',
        r'y\s*=\s*2x\^2\s*-\s*8x\s*\+\s*5',
        r'x\^2\s*\+\s*kx\s*\+\s*9\s*=\s*0',
        r'4x\s*-\s*3y\s*\+\s*2\s*=\s*0',
        r'x\^2\s*-\s*4\s*=\s*0',
        r'\(x\s*-\s*2\)\(x\s*\+\s*2\)\s*/\s*\(x\s*\+\s*2\)\s*=\s*x\s*-\s*2',
        r'y\s*-\s*2\s*=\s*9\(x\s*-\s*2\)\s*->\s*y\s*=\s*9x\s*-\s*16',
        r'y\'\s*=\s*3x\^2\s*-\s*3',
        r'f\(x\)\s*=\s*3x\s*\+\s*1',
        r'g\(x\)\s*=\s*x\s*-\s*1',
        r'f\(x\)\s*=\s*3\*sin\(2x\s*-\s*pi/4\)',
        r'tan\(x\)\s*\+\s*cot\(x\)\s*=\s*8\*cos\(2x\)',
        r'3\^x\s*\*\s*2\^y\s*=\s*1152',
        r'\(9\s*-\s*log_2\(x\)\)\s*\*\s*log_\{?2x\}?\(8\)\s*=\s*2',
        r'log_2\(x\)\s*\+\s*log_2\(x\s*-\s*2\)\s*=\s*3',
        r'y\s*=\s*3x\^3\s*-\s*q/x',
        r'xy\s*=\s*3x\^3\s*-\s*q',
        r'p\(x\)\s*=\s*2x\^3\s*\+\s*px\^2\s*\+\s*qx\s*\+\s*6',
        r'x\^3\s*\+\s*px\^2\s*-\s*x\s*\+\s*6',
        r'f\(theta\)\s*=\s*csc\(2\*theta\)\s*-\s*cot\(2\*theta\)',
        r'u_1\s*=\s*2,\s*u_\{?n\+1\}?\s*=\s*3\*u_n\s*\+\s*1',
        r'\(x\+y\)\(x\+y\+z\)\s*=\s*22',
        r'\(y\+z\)\(x\+y\+z\)\s*=\s*44',
        r'\(x\+z\)\(x\+y\+z\)\s*=\s*66',
        r'x\*sqrt\(y\)\s*\+\s*y\*sqrt\(x\)\s*\+\s*sqrt\(xy\)\s*=\s*24',
        r'a_1\s*=\s*5,\s*d\s*=\s*3',
        r'AC\s*=\s*sqrt\(5\)\s*\+\s*sqrt\(3\)',
        r'7\s*\+\s*sqrt\(15\)',
        r'b\^2\s*-\s*4ac\s*=\s*25\s*-\s*24\s*=\s*1',
        r'L\(n\)\s*=\s*\(n\^2\s*\+\s*n\s*\+\s*2\)/2',
        r'L\(5\)',
        r'-\(x-1\)\^2\*\([^\)]+\)',
        r'\(x\s*-\s*1\)\^2\*\([^\)]+\)',
    ]
    for eq_pat in equations:
        s = re.sub(rf'(?<![a-zA-Z0-9_\$]){eq_pat}(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 2. Function calls: gf(1), g(f(1)), f(45°), f(theta), f(x) > g(x)
    s = re.sub(r'\b(gf\(\d+\)|g\(f\(\d+\)\)|f\(45[°\^\w]*\)|f\(theta\)|f\(x\)\s*>\s*g\(x\))(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 3. Fractions
    s = re.sub(r'(?<![a-zA-Z0-9_\$])\((?:x\^2\s*-\s*4)\)\s*/\s*\(x\s*\+\s*2\)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\frac{x^2 - 4}{x + 2}"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])\((?:sqrt\(1\s*\+\s*x\)\s*-\s*1)\)\s*/\s*x(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\frac{\sqrt{1 + x} - 1}{x}"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(?:pi/\d+(?:\s*\+\s*\d+)?)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(?:2/alpha|2/beta|-2/15|1/15|-1/15|0/15|3/8|7/10|a/b|22/7|24/7|45/512|3/20|7/24|1/10|1/8)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 4. Radicals & Surds
    s = re.sub(r'(?<![a-zA-Z0-9_\$])sqrt\(42\s*\+\s*sqrt\(42\s*\+\s*sqrt\(42\s*\+\s*\.\.\.\)\)\)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\sqrt{42 + \sqrt{42 + \sqrt{42 + \dots}}}"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])sqrt\(12\)\s*-\s*sqrt\(75\)\s*\+\s*sqrt\(108\)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\sqrt{12} - \sqrt{75} + \sqrt{108}"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(?:3\*sqrt\(3\)|3\s*\+\s*2\*sqrt\(6\)|sqrt\(10\)\s*\+\s*sqrt\(6\)|a\*sqrt\(b\)|a\s*\+\s*b\*sqrt\(c\)|sqrt\(16\s*\+\s*9\))(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 5. Logarithms & Calculus & Sequences
    s = re.sub(r'(?<![a-zA-Z0-9_\$])ln\(x\)\s*\+\s*e\^y\s*\+\s*ln\(z\)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\ln(x) + e^y + \ln(z)"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(?:ln\(12\)\s*\+\s*e\^0)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\ln(12) + e^0"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])sum_\{n=1\}\^\{infty\}\s*1/\(n\(n\+2\)\)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\sum_{n=1}^{\infty} \frac{1}{n(n+2)}"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])\(2x\^2\s*-\s*1/x\)\^9(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\left(2x^2 - \frac{1}{x}\right)^9"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])\(2x\s*\+\s*1\)\^4(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"(2x + 1)^4"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])\(3x\^2\s*\+\s*2x\s*\+\s*1\)\s*dx(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"(3x^2 + 2x + 1) \, dx"), s)
    s = re.sub(r'\b(dy/dx|u_5|x\^6|2\^2020|x\^2|y\^3|2\^n|a\^b)\b', lambda m: add_math_block(m.group(0)), s)

    # 6. Greek letters
    for g in GREEK_WORDS:
        s = re.sub(rf'(?<![\\a-zA-Z0-9_\$])\b{g}\b(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 7. Unenclosed LaTeX commands like \ln(3), \frac{a}{b}, \sqrt{x}, \alpha, \beta, \pi
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(?:-?[a-zA-Z0-9_\{\}\^()]+\s*,\s*)?\\[a-zA-Z]+(?:\{[^}]*\}|\([^)]*\))*(?:\s*[+\-*/^_\\()]\s*\\?[a-zA-Z0-9_\{\}\^()]+)*(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 8. Trigonometric / log expressions: 8*cos(2x), log_2(x), ln(x)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(log_\{?\d+\}?\(.+?\)|ln\(.+?\)|(?:\d+\*)?cos\(.+?\)|(?:\d+\*)?sin\(.+?\)|(?:\d+\*)?tan\(.+?\))(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 9. Geometric angles & triangles: ∠BCD, ∠ACB, ΔDEF, ΔABC
    s = re.sub(r'∠([A-Z]{3})', lambda m: add_math_block(f"\\angle {m.group(1)}"), s)
    s = re.sub(r'Δ([A-Z]{3})', lambda m: add_math_block(f"\\Delta {m.group(1)}"), s)

    # Step Final: Restore protected blocks
    for idx, block in enumerate(protected_blocks):
        s = s.replace(f"__MATH_BLOCK_{idx}__", block)

    return s

def get_tier(grade: int) -> str:
    if grade <= 5:
        return 'primary'
    elif grade <= 9:
        return 'secondary'
    else:
        return 'high'

def get_math_topic(grade: int, q_idx: int, existing_topic_code: str):
    tier = get_tier(grade)
    
    topic_idx = None
    # Check if existing code ends with _T1 .. _T6
    m = re.search(r'_T([1-6])$', existing_topic_code or '')
    if m:
        topic_idx = int(m.group(1))
    elif grade <= 5 and existing_topic_code in PRIMARY_LEGACY_MAP:
        topic_idx = PRIMARY_LEGACY_MAP[existing_topic_code]
    else:
        topic_idx = (q_idx % 6) + 1
        
    topic_code = f"MATH_G{grade}_T{topic_idx}"
    topic_name = TOPIC_TAXONOMY[tier][topic_idx]
    return topic_code, topic_name

def standardize_and_transform_all():
    print(f"Reading master exams from {WEB_EXAMS_PATH}...")
    with open(WEB_EXAMS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    clean_json = re.sub(r'^import[^\n]*\n+', '', content)
    clean_json = re.sub(r'^export const ASMO_SAMPLE_EXAMS: AsmoExam\[\] = ', '', clean_json).strip().rstrip(';')
    exams = json.loads(clean_json)
    
    print(f"Loaded {len(exams)} exams. Processing standardization and KaTeX conversion...")
    
    transformed_exams = []
    math_q_count = 0
    total_q_count = 0
    
    for exam in exams:
        exam_copy = dict(exam)
        subj = exam_copy.get('subject')
        grade = exam_copy.get('grade', 1)
        
        new_questions = []
        for q_idx, q in enumerate(exam_copy.get('questions', [])):
            total_q_count += 1
            q_res = dict(q)
            
            if subj == 'math':
                math_q_count += 1
                new_t_code, new_t_name = get_math_topic(grade, q_idx, q_res.get('topicCode', ''))
                old_t_name = q_res.get('topicName', '')
                q_res['topicCode'] = new_t_code
                q_res['topicName'] = new_t_name
                
                # Update meeHint if it has topic references
                if q_res.get('meeHint'):
                    if isinstance(q_res['meeHint'], str):
                        hint_str = q_res['meeHint']
                        hint_str = re.sub(r"chủ đề '[^']+'", f"chủ đề '{new_t_name}'", hint_str)
                        hint_str = re.sub(rf"Tư duy Toán Olympic Lớp {grade}", new_t_name, hint_str)
                        q_res['meeHint'] = transform_narrative_text(hint_str)
                    elif isinstance(q_res['meeHint'], dict) and q_res['meeHint'].get('text'):
                        hint_str = q_res['meeHint']['text']
                        hint_str = re.sub(r"chủ đề '[^']+'", f"chủ đề '{new_t_name}'", hint_str)
                        hint_str = re.sub(rf"Tư duy Toán Olympic Lớp {grade}", new_t_name, hint_str)
                        q_res['meeHint']['text'] = transform_narrative_text(hint_str)
            
            # Apply KaTeX transformation
            if q_res.get('title'):
                q_res['title'] = transform_narrative_text(q_res['title'])
            if q_res.get('text'):
                q_res['text'] = transform_narrative_text(q_res['text'])
            if q_res.get('explanation'):
                q_res['explanation'] = transform_narrative_text(q_res['explanation'])
            if q_res.get('meeHint') and subj != 'math':
                if isinstance(q_res['meeHint'], str):
                    q_res['meeHint'] = transform_narrative_text(q_res['meeHint'])
                elif isinstance(q_res['meeHint'], dict) and q_res['meeHint'].get('text'):
                    q_res['meeHint']['text'] = transform_narrative_text(q_res['meeHint']['text'])
                
            if q_res.get('options'):
                new_opts = []
                for opt in q_res['options']:
                    o = dict(opt)
                    if o.get('text'):
                        o['text'] = transform_option(o['text'])
                    new_opts.append(o)
                q_res['options'] = new_opts
                
            if q_res.get('explanationSteps'):
                new_steps = []
                for st in q_res['explanationSteps']:
                    s_dict = dict(st)
                    if s_dict.get('title'):
                        s_dict['title'] = transform_narrative_text(s_dict['title'])
                    if s_dict.get('description'):
                        s_dict['description'] = transform_narrative_text(s_dict['description'])
                    if s_dict.get('content'):
                        s_dict['content'] = transform_narrative_text(s_dict['content'])
                    new_steps.append(s_dict)
                q_res['explanationSteps'] = new_steps
                
            new_questions.append(q_res)
        
        exam_copy['questions'] = new_questions
        transformed_exams.append(exam_copy)
        
    print(f"Finished processing! Total questions: {total_q_count}, Math questions standardized: {math_q_count}")
    
    # Save to Frontend
    print(f"Writing to Frontend: {WEB_EXAMS_PATH}")
    web_ts = "import type { AsmoExam } from '../types'\n\nexport const ASMO_SAMPLE_EXAMS: AsmoExam[] = " + json.dumps(transformed_exams, ensure_ascii=False, indent=2) + "\n"
    with open(WEB_EXAMS_PATH, 'w', encoding='utf-8') as f:
        f.write(web_ts)
        
    # Save to Backend
    print(f"Writing to Backend: {BACKEND_EXAMS_PATH}")
    backend_ts = "import type { AsmoExam } from './asmo.domain'\n\nexport const ASMO_SEED_EXAMS: AsmoExam[] = " + json.dumps(transformed_exams, ensure_ascii=False, indent=2) + "\n"
    with open(BACKEND_EXAMS_PATH, 'w', encoding='utf-8') as f:
        f.write(backend_ts)
        
    print("Standardization and sync completed successfully!")

if __name__ == '__main__':
    standardize_and_transform_all()
