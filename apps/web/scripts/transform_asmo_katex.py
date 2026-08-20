# -*- coding: utf-8 -*-
"""
ASMO Master KaTeX Converter & Math Standardizer (Grades 1-12)
Transforms polynomials, equations, powers, fractions, Greek symbols, functions, trigonometry, radicals, etc.
"""

import os
import re
import json
import subprocess
from pathlib import Path

WEB_EXAMS_PATH = Path('/Users/imam/storymee/1-Harness-Apps/E-learning-AIKids/apps/web/src/features/asmo/data/asmo-sample-exams.ts')
BACKEND_EXAMS_PATH = Path('/Users/imam/storymee/2-MCP-Core/core-lms-api/src/modules/asmo/asmo.seed-data.ts')

GREEK_WORDS = ['alpha', 'beta', 'gamma', 'theta', 'lambda', 'sigma', 'delta']

def clean_math_expr(s: str) -> str:
    """Cleans and standardizes an inner mathematical expression to valid KaTeX syntax."""
    if not s:
        return ""
    
    # 0. Protect existing \text{...} blocks from math transformations
    text_blocks = []
    def protect_text(m):
        idx = len(text_blocks)
        text_blocks.append(m.group(0))
        return f"__TEXT_BLOCK_{idx}__"
    s = re.sub(r'\\text\{[^\}]*\}', protect_text, s)
    
    # 1. Normalize typography & unicode shapes
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
    s = re.sub(r'_{2,}', lambda m: r'\underline{\quad}', s)

    # 2. Greek symbols (avoid double backslash with (?<!\\))
    for g in GREEK_WORDS:
        s = re.sub(rf'(?<!\\)\b{g}\b', lambda m, g=g: '\\' + g, s)
    s = re.sub(r'(?<!\\)\bpi\b', lambda m: r'\pi', s)

    # 3. Composite functions: gf(1) -> g(f(1))
    s = re.sub(r'\bgf\((\d+)\)', lambda m: r'g(f(' + m.group(1) + r'))', s)

    # 4. Functions: sin, cos, tan, cot, sec, csc, ln, log
    s = re.sub(r'(?<!\\)\b(sin|cos|tan|cot|sec|csc|ln)\b', lambda m: '\\' + m.group(1), s)
    s = re.sub(r'(?<!\\)\blog_\{?([a-zA-Z0-9]+)\}?\(', lambda m: r'\log_{' + m.group(1) + '}(', s)
    s = re.sub(r'(?<!\\)\blog\b', lambda m: r'\log', s)

    # 5. Radicals (handle nested radicals like sqrt(42 + sqrt(42 + ...)))
    while 'sqrt(' in s:
        s = re.sub(r'sqrt\(([^()]+)\)', lambda m: r'\sqrt{' + clean_math_expr(m.group(1)) + '}', s)

    # 6. Fractions
    s = re.sub(r'\(([^\)]+)\)\s*/\s*\(([^\)]+)\)', lambda m: r'\frac{' + clean_math_expr(m.group(1)) + '}{' + clean_math_expr(m.group(2)) + '}', s)
    s = re.sub(r'\(([^\)]+)\)\s*/\s*([a-zA-Z0-9_\{\}\\]+)', lambda m: r'\frac{' + clean_math_expr(m.group(1)) + '}{' + clean_math_expr(m.group(2)) + '}', s)
    s = re.sub(r'([a-zA-Z0-9_\{\}\\]+)\s*/\s*\(([^\)]+)\)', lambda m: r'\frac{' + clean_math_expr(m.group(1)) + '}{' + clean_math_expr(m.group(2)) + '}', s)
    # Simple fraction: -?A/B (matches \pi/24, 2/\alpha, -2/15, 3/8, a/b)
    s = re.sub(r'(-?)(\\?[a-zA-Z0-9_]+)\s*/\s*(\\?[a-zA-Z0-9_]+)', lambda m: m.group(1) + r'\frac{' + clean_math_expr(m.group(2)) + '}{' + clean_math_expr(m.group(3)) + '}', s)

    # 7. Powers: e.g. 2^(2x) -> 2^{2x}, 2^2020 -> 2^{2020}, (2x+1)^4 -> (2x+1)^4
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
    """Cleans and wraps in $...$."""
    return f"${clean_math_expr(s)}$"

def is_pure_math_option(text: str) -> bool:
    """Detects whether an option string is pure mathematical notation."""
    if not text:
        return False
    s = text.strip()
    if s.startswith('$') and s.endswith('$'):
        return False
    
    # Non-math text phrases to skip
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
    """Carefully extracts and standardizes math formulas embedded in narrative text."""
    if not text:
        return ""
    
    protected_blocks = []
    
    def add_math_block(raw_math: str) -> str:
        clean = clean_math_expr(raw_math)
        block = f"${clean}$"
        idx = len(protected_blocks)
        protected_blocks.append(block)
        return f"__MATH_BLOCK_{idx}__"

    # Step 0: Protect and clean existing $...$ and $$...$$ blocks
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

    s = re.sub(r'(\$\$[\s\S]*?\$\$|\$[^\$\n]*?\$)', protect_existing, text)

    # 1. Specific High-Level Mathematical Equations & Formulas
    equations = [
        r'2x\^2\s*-\s*x\s*-\s*15\s*=\s*0',
        r'3x\^2\s*-\s*5x\s*\+\s*2\s*=\s*0',
        r'y\s*=\s*2x\^2\s*-\s*8x\s*\+\s*5',
        r'x\^2\s*\+\s*kx\s*\+\s*9\s*=\s*0',
        r'4x\s*-\s*3y\s*\+\s*2\s*=\s*0',
        r'2\^\(2x\)\s*-\s*5\(2\^x\)\s*\+\s*4\s*=\s*0',
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

    # 3. Fractions: (x^2 - 4)/(x + 2), (sqrt(1 + x) - 1) / x, 2/alpha, 2/beta, pi/24, pi/24 + 1, -2/15, 1/15, -1/15, 0/15, 3/8, 7/10, a/b, 22/7, 24/7, 45/512
    s = re.sub(r'(?<![a-zA-Z0-9_\$])\((?:x\^2\s*-\s*4)\)\s*/\s*\(x\s*\+\s*2\)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\frac{x^2 - 4}{x + 2}"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])\((?:sqrt\(1\s*\+\s*x\)\s*-\s*1)\)\s*/\s*x(?![a-zA-Z0-9_\$])', lambda m: add_math_block(r"\frac{\sqrt{1 + x} - 1}{x}"), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(?:pi/\d+(?:\s*\+\s*\d+)?)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(?:2/alpha|2/beta|-2/15|1/15|-1/15|0/15|3/8|7/10|a/b|22/7|24/7|45/512|3/20|7/24|1/10|1/8)(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 4. Radicals & Surds: sqrt(42 + sqrt(42 + sqrt(42 + ...))), sqrt(12) - sqrt(75) + sqrt(108), 3*sqrt(3), 3 + 2*sqrt(6), sqrt(10) + sqrt(6), a*sqrt(b), a + b*sqrt(c)
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
    s = re.sub(r'\b(dy/dx|u_5|x\^6|2\^2020|x\^2|y\^3|2\^n)\b', lambda m: add_math_block(m.group(0)), s)

    # 6. Greek letters in math context
    for g in GREEK_WORDS:
        s = re.sub(rf'(?<!\\)\b{g}\b', lambda m: add_math_block(m.group(0)), s)

    # 7. Trigonometric / log expressions: 8*cos(2x), log_2(x), ln(x)
    s = re.sub(r'(?<![a-zA-Z0-9_\$])(log_\{?\d+\}?\(.+?\)|ln\(.+?\)|(?:\d+\*)?cos\(.+?\)|(?:\d+\*)?sin\(.+?\)|(?:\d+\*)?tan\(.+?\))(?![a-zA-Z0-9_\$])', lambda m: add_math_block(m.group(0)), s)

    # 8. Geometric angles & triangles: ∠BCD, ∠ACB, ΔDEF, ΔABC
    s = re.sub(r'∠([A-Z]{3})', lambda m: add_math_block(f"\\angle {m.group(1)}"), s)
    s = re.sub(r'Δ([A-Z]{3})', lambda m: add_math_block(f"\\Delta {m.group(1)}"), s)

    # Step Final: Restore protected blocks
    for idx, block in enumerate(protected_blocks):
        s = s.replace(f"__MATH_BLOCK_{idx}__", block)

    return s

def transform_question(q: dict) -> dict:
    """Transforms all fields of an ASMO Question object."""
    q_res = dict(q)
    
    if q_res.get('title'):
        q_res['title'] = transform_narrative_text(q_res['title'])
    if q_res.get('text'):
        q_res['text'] = transform_narrative_text(q_res['text'])
    if q_res.get('explanation'):
        q_res['explanation'] = transform_narrative_text(q_res['explanation'])
    if q_res.get('meeHint'):
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
        
    return q_res

def run_conversion():
    print(f"Reading base exams from: {WEB_EXAMS_PATH}")
    with open(WEB_EXAMS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    clean_json = re.sub(r'^import[^\n]*\n+', '', content)
    clean_json = re.sub(r'^export const ASMO_SAMPLE_EXAMS: AsmoExam\[\] = ', '', clean_json).strip().rstrip(';')
    exams = json.loads(clean_json)
    
    print(f"Transforming {len(exams)} exams...")
    
    transformed_exams = []
    total_questions = 0
    math_questions = 0
    
    for exam in exams:
        exam_copy = dict(exam)
        transformed_questions = []
        for q in exam['questions']:
            total_questions += 1
            t_q = transform_question(q)
            if '$' in str(t_q):
                math_questions += 1
            transformed_questions.append(t_q)
        exam_copy['questions'] = transformed_questions
        transformed_exams.append(exam_copy)
        
    print(f"Transformation complete! Total questions: {total_questions}, questions with KaTeX math: {math_questions}")
    
    # Save to Web
    print(f"Writing to Frontend: {WEB_EXAMS_PATH}")
    web_ts = "import type { AsmoExam } from '../types'\n\nexport const ASMO_SAMPLE_EXAMS: AsmoExam[] = " + json.dumps(transformed_exams, ensure_ascii=False, indent=2) + "\n"
    with open(WEB_EXAMS_PATH, 'w', encoding='utf-8') as f:
        f.write(web_ts)
        
    # Save to Backend
    print(f"Writing to Backend: {BACKEND_EXAMS_PATH}")
    backend_ts = "import type { AsmoExam } from './asmo.domain'\n\nexport const ASMO_SEED_EXAMS: AsmoExam[] = " + json.dumps(transformed_exams, ensure_ascii=False, indent=2) + "\n"
    with open(BACKEND_EXAMS_PATH, 'w', encoding='utf-8') as f:
        f.write(backend_ts)
        
    print("Files successfully updated!")

if __name__ == '__main__':
    run_conversion()
