# -*- coding: utf-8 -*-
"""
Full ASMO Master Synthesis Script (Grades 1 to 12)
"""

import os, json, re, hashlib
from pathlib import Path

DATA_DIR = Path('/Users/imam/Documents/Code/asmo-question-bank/data/final')
WEB_OUTPUT_PATH = Path('/Users/imam/storymee/1-Harness-Apps/E-learning-AIKids/apps/web/src/features/asmo/data/asmo-sample-exams.ts')
BACKEND_OUTPUT_PATH = Path('/Users/imam/storymee/2-MCP-Core/core-lms-api/src/modules/asmo/asmo.seed-data.ts')

AUTHENTIC_RENDERSPECS = {
  'asmo-math-g1-2020-r1-q17': {
    'template': 'INTERACTIVE_CLOCK',
    'camera': { 'x': 0, 'y': 0, 'z': 5.5 },
    'hour': 5,
    'minute': 10,
    'autoRotate': False
  },
  'asmo-math-g1-2020-r1-q04': {
    'template': '3D_BALANCE_SCALE',
    'camera': { 'x': 0, 'y': 0.2, 'z': 7 },
    'leftWeightCount': 2,
    'rightWeightCount': 6,
    'leftItemLabel': 'Dưa hấu',
    'rightItemLabel': 'Cam',
    'autoRotate': False
  },
  'asmo-math-g1-2020-r1-q15': {
    'template': 'GRID_PATH_MAZE',
    'camera': { 'x': 0, 'y': 0, 'z': 6 },
    'gridSize': [5, 5],
    'start': [0, 0],
    'target': [4, 4],
    'autoRotate': False
  },
  'asmo-math-g1-2015-r3-q04': {
    'template': 'INTERACTIVE_CLOCK',
    'camera': { 'x': 0, 'y': 0, 'z': 5.5 },
    'hour': 10,
    'minute': 0,
    'autoRotate': False
  },
  'asmo-math-g1-2016-r4-q04': {
    'template': 'INTERACTIVE_CLOCK',
    'camera': { 'x': 0, 'y': 0, 'z': 5.5 },
    'hour': 3,
    'minute': 0,
    'autoRotate': False
  },
  'asmo-math-g2-2020-r1-q06': {
    'template': '3D_CUBE_CLUSTER',
    'camera': { 'x': 4.5, 'y': 3.5, 'z': 4.5 },
    'cubes': [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1], [0, 1, 0], [1, 1, 0], [0, 1, 1], [0, 2, 0]],
    'autoRotate': False
  },
  'asmo-math-g2-2023-r5-q18': {
    'template': 'NET_CUBE_FOLDING',
    'camera': { 'x': 0, 'y': 0, 'z': 5.5 },
    'faces': [
      { 'id': 1, 'pos': [0, 0.5, 0], 'color': 5195493, 'label': '1' },
      { 'id': 2, 'pos': [1, 0.5, 0], 'color': 440020, 'label': '2' },
      { 'id': 3, 'pos': [-1, 0.5, 0], 'color': 440020, 'label': '3' },
      { 'id': 4, 'pos': [0, 1.5, 0], 'color': 1096065, 'label': '4' },
      { 'id': 5, 'pos': [0, -0.5, 0], 'color': 1096065, 'label': '5' },
      { 'id': 6, 'pos': [0, -1.5, 0], 'color': 16096779, 'label': '6' },
    ],
    'autoRotate': False
  },
  'asmo-math-g3-2020-r1-q03': {
    'template': 'SHADED_AREA_FRACTION',
    'camera': { 'x': 0, 'y': 0, 'z': 5.5 },
    'totalSlices': 10,
    'shadedSlices': 7,
    'autoRotate': False
  },
  'asmo-math-g3-2023-r6-q08': {
    'template': 'NET_CUBE_FOLDING',
    'camera': { 'x': 0, 'y': 0, 'z': 5.5 },
    'faces': [
      { 'id': 1, 'pos': [0, 0.5, 0], 'color': 5195493, 'label': '1' },
      { 'id': 2, 'pos': [1, 0.5, 0], 'color': 440020, 'label': '2' },
      { 'id': 3, 'pos': [-1, 0.5, 0], 'color': 440020, 'label': '3' },
      { 'id': 4, 'pos': [0, 1.5, 0], 'color': 1096065, 'label': '4' },
      { 'id': 5, 'pos': [0, -0.5, 0], 'color': 1096065, 'label': '5' },
      { 'id': 6, 'pos': [0, -1.5, 0], 'color': 16096779, 'label': '6' },
    ],
    'autoRotate': False
  }
}

BENCHMARK_ARCHETYPES = {
  'asmo-math-g1-2020-r1-q01': { 'archetype': 'SCATTERED', 'type': 'balls' },
  'asmo-math-g1-2020-r1-q02': { 'archetype': 'SCATTERED', 'type': 'digits' },
  'asmo-math-g1-2020-r1-q04': { 'archetype': 'BALANCE', 'left': { 'emoji': '🍌' }, 'right': { 'emoji': '🍓' }, 'tilt': 'left' },
  'asmo-math-g1-2020-r1-q05': { 'archetype': 'SHADED_RATIO', 'rows': 7, 'cols': 5, 'shadedCells': [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,2]] },
  'asmo-math-g1-2020-r1-q08': { 'archetype': 'SHAPE_EQUATION', 'rows': [{ 'left': 'square', 'right': 'triangle' }] },
  'asmo-math-g1-2020-r1-q09': { 'archetype': 'MATCHSTICK', 'pattern': 'square_flag', 'matchCount': 6 },
  'asmo-math-g1-2020-r1-q11': { 'archetype': 'VERTICAL_ARITHMETIC', 'top': 21, 'op': '-', 'bottom': 17, 'result': '?' },
  'asmo-math-g1-2020-r1-q14': { 'archetype': 'CHECKERBOARD', 'variant': 'puzzle_cut' },
  'asmo-math-g1-2020-r1-q15': { 'archetype': 'MAZE', 'width': 5, 'height': 5 },
  'asmo-math-g1-2020-r1-q17': { 'archetype': 'CLOCK', 'hour': 5, 'minute': 10 },
  'asmo-math-g1-2020-r1-q20': { 'archetype': 'CAKE', 'variant': 'cross' },
  'asmo-math-g1-2020-r1-q23': { 'archetype': 'SIERPINSKI', 'depth': 1 },
  'asmo-math-g1-2020-r1-q25': { 'archetype': 'POLYLINE', 'cols': 6, 'rows': 2, 'points': [[0,0],[2,2],[4,0],[5,2],[6,0]] },
}

def clean_text(text):
    if not text:
        return ""
    s = text
    s = re.sub(r'DIVISION\s+ASIAN\s+[A-Z0-9\s&,-]+(?:ROUND|LEVEL|GRADE|YEAR|PRIMARY|CONTEST)[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'DIVISION\s+ASIAN\s+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'ASIAN\s+ENGLISH\s+OLYMPIAD\s+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'ASIAN\s+SCIENCE\s+OLYMPIAD\s+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'ASIAN\s+MATHS?\s+OLYMPIAD\s+[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'Rules\s+and\s+Regulations[^\n]*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*\d+\s*(?:marks?|Marks?|điểm|Điểm|pts?)\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\[\s*\d+\s*(?:marks?|Marks?|điểm|Điểm|pts?)\s*\]', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+\d+\s*(?:marks?|Marks?)\s*$', '', s, flags=re.IGNORECASE)
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r'\n\s*\n\s*\n+', '\n\n', s)
    return s.strip()

def clean_option_text(text):
    if not text:
        return ""
    s = text
    s = re.sub(r'^\s*\([A-E]\)\s*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'^\s*[A-E][\.\)]\s*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*\d+\s*(?:que|sticks?|triangles?|marks?|s|seconds?)\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*(?:sai|đúng|correct|wrong)\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*Row\s*\d+:[^\)]*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*\d+\s*Marks?\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*forming\s+\d+\s+triangles\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*24\s+is\s+not\s+in\s+the\s+sequence\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*the\s+scores\s+are[^\)]*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*row\s+\d+,\s*col\s+\d+\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\(\s*Net\s*\([A-E]\)\s*\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'DIVISION\s+ASIAN[^\n]*', '', s, flags=re.IGNORECASE)
    return s.strip()

def normalize_katex(text):
    if not text:
        return ""
    s = text
    s = re.sub(r'\b(\d+)/(\d+)\s*<\s*(?:\[\s*\]|□)/(\d+)\s*<\s*(\d+)/(\d+)\b', r'$\\frac{\1}{\2} < \\frac{\\square}{\3} < \\frac{\4}{\5}$', s)
    s = re.sub(r'\b(\d+)/(\d+)\s*<\s*1/n\s*<\s*(\d+)/(\d+)\b', r'$\\frac{\1}{\2} < \\frac{1}{n} < \\frac{\3}{\4}$', s)
    s = re.sub(r'\b(\d+)/(\d+)\s*×\s*(\d+)/(\d+)\s*\+\s*(\d+)/(\d+)\s*÷\s*(\d+)/(\d+)\b', r'$\\frac{\1}{\2} \\times \\frac{\3}{\4} + \\frac{\5}{\6} \\div \\frac{\7}{\8}$', s)

    lines = s.split('\n')
    new_lines = []
    for line in lines:
        if not '$' in line and not '------' in line and not 'table' in line and not '<div' in line and not 'http' in line:
            if any(c in line for c in ['○', '△', '□', '☆', '★', '▲', '♦', '♠', '♥']) and any(c in line for c in ['=', '+', '-', '–', '−']):
                math_form = line.replace('○', '\\bigcirc ') \
                                .replace('△', '\\triangle ') \
                                .replace('□', '\\square ') \
                                .replace('★', '\\bigstar ') \
                                .replace('▲', '\\blacktriangle ') \
                                .replace('☆', '\\star ') \
                                .replace('–', '-') \
                                .replace('−', '-') \
                                .strip()
                new_lines.append(f'${math_form}$')
                continue
        new_lines.append(line)
    return '\n'.join(new_lines)

def make_distractors(ans_str, q_num=1):
    ans = ans_str.strip() if ans_str else ""
    if not ans or ans.upper() == 'DETAILED SOLUTION':
        return [
            { 'id': 'A', 'label': 'A', 'text': 'Khẳng định đúng theo chuẩn ASMO' },
            { 'id': 'B', 'label': 'B', 'text': 'Khẳng định chưa chính xác' },
            { 'id': 'C', 'label': 'C', 'text': 'Thiếu điều kiện cần thiết' },
            { 'id': 'D', 'label': 'D', 'text': 'Không xác định được' }
        ], 'A'

    if re.fullmatch(r'-?\d+', ans):
        val = int(ans)
        d1 = str(val - 1 if val > 1 else val + 3)
        d2 = str(val + 1)
        d3 = str(val + 2)
        return [
            { 'id': 'A', 'label': 'A', 'text': ans },
            { 'id': 'B', 'label': 'B', 'text': d1 },
            { 'id': 'C', 'label': 'C', 'text': d2 },
            { 'id': 'D', 'label': 'D', 'text': d3 }
        ], 'A'

    if re.fullmatch(r'-?\d+\.\d+', ans):
        val = float(ans)
        d1 = f'{val - 0.5:.1f}'.rstrip('0').rstrip('.')
        d2 = f'{val + 0.5:.1f}'.rstrip('0').rstrip('.')
        d3 = f'{val + 1.0:.1f}'.rstrip('0').rstrip('.')
        return [
            { 'id': 'A', 'label': 'A', 'text': ans },
            { 'id': 'B', 'label': 'B', 'text': d1 },
            { 'id': 'C', 'label': 'C', 'text': d2 },
            { 'id': 'D', 'label': 'D', 'text': d3 }
        ], 'A'

    m_frac = re.fullmatch(r'(-?\d+)/(\d+)', ans)
    if m_frac:
        p, q = int(m_frac.group(1)), int(m_frac.group(2))
        d1 = f'{p-1}/{q}' if p > 1 else f'{p+3}/{q}'
        d2 = f'{p+1}/{q}'
        d3 = f'{p+2}/{q}'
        return [
            { 'id': 'A', 'label': 'A', 'text': ans },
            { 'id': 'B', 'label': 'B', 'text': d1 },
            { 'id': 'C', 'label': 'C', 'text': d2 },
            { 'id': 'D', 'label': 'D', 'text': d3 }
        ], 'A'

    return [
        { 'id': 'A', 'label': 'A', 'text': ans },
        { 'id': 'B', 'label': 'B', 'text': f'{ans} + 1' if not any(c in ans for c in [' ', 'a', 'x']) else 'Không có đáp án phù hợp' },
        { 'id': 'C', 'label': 'C', 'text': '0' if ans != '0' else '1' },
        { 'id': 'D', 'label': 'D', 'text': 'Không xác định' }
    ], 'A'

def get_mee_hint(subject, grade, topic_name, q_num):
    if subject == 'math':
        if grade <= 5:
            return f"Mèo Mee gợi ý: Con hãy đọc kỹ đề bài Câu {q_num} về chủ đề '{topic_name}', vẽ nháp hoặc thử từng trường hợp cụ thể nhé!"
        elif grade <= 9:
            return f"Mèo Mee gợi ý: Vận dụng tư duy logic chủ đề '{topic_name}', lập phương trình hoặc đặt ẩn phụ để tìm kết quả chính xác nhé!"
        else:
            return f"Mèo Mee phân tích: Đề thi Olympic Lớp {grade} yêu cầu biến đổi chuẩn xác trong chủ đề '{topic_name}'. Hãy xét kỹ điều kiện biên và bất đẳng thức!"
    elif subject == 'science':
        if grade <= 5:
            return f"Mèo Mee gợi ý: Quan sát hiện tượng tự nhiên và các đặc điểm sinh học/vật lý liên quan đến '{topic_name}' nhé!"
        else:
            return f"Mèo Mee gợi ý: Vận dụng các định luật khoa học, chu trình phản ứng và nguyên lý thực nghiệm trong chủ đề '{topic_name}'!"
    else:
        return f"Mèo Mee gợi ý: Chú ý ngữ cảnh câu, thì động từ và cấu trúc ngữ pháp học thuật ASMO trong chủ đề '{topic_name}'!"

# 1. Load existing base exams
with open(WEB_OUTPUT_PATH, 'r', encoding='utf-8') as f:
    text = f.read()

clean_text_content = re.sub(r'^import[^\n]*\n+', '', text)
clean_text_content = re.sub(r'^export const ASMO_SAMPLE_EXAMS: AsmoExam\[\] = ', '', clean_text_content).strip().rstrip(';')
base_exams = json.loads(clean_text_content)

final_exams = []
seen_exam_ids = set()

# Process existing base exams
for e in base_exams:
    eid = e['id']
    if eid in ['asmo-sci-l1-2023-r5', 'asmo-sci-l1-2023-r7']:
        e['grade'] = 4
        e['title'] = e['title'].replace('Lớp 1', 'Lớp 4')
        for q in e['questions']:
            q['grade'] = 4
            q['topicName'] = 'Khoa học Tự Nhiên Lớp 4'
    elif eid in ['asmo-sci-l1-2021-r1', 'asmo-sci-l1-2022-r3']:
        e['grade'] = 3
        e['title'] = e['title'].replace('Lớp 1', 'Lớp 3')
        for q in e['questions']:
            q['grade'] = 3
            q['topicName'] = 'Khoa học Tự Nhiên Lớp 3'
    elif eid in ['asmo-eng-l1-2022-r22', 'asmo-eng-l1-2022-r23', 'asmo-eng-l1-2023-r26', 'asmo-eng-l1-2023-r27']:
        e['grade'] = 2
        e['title'] = e['title'].replace('Lớp 1', 'Lớp 2')
        for q in e['questions']:
            q['grade'] = 2
            q['topicName'] = 'Tiếng Anh Học Thuật Lớp 2'
    elif eid in ['asmo-eng-l2-2020-r5']:
        e['grade'] = 4
        e['title'] = e['title'].replace('Lớp 3', 'Lớp 4')
        for q in e['questions']:
            q['grade'] = 4
            q['topicName'] = 'Tiếng Anh Học Thuật Lớp 4'
    
    seen_exam_ids.add(e['id'])
    final_exams.append(e)

# 2. Add Math Exams (Grades 6 to 12)
math_configs = [
    (6, 'grade6_math_verified.json', [
        ('ASMO_MATH_G6_2020_SCHOOL', 'asmo-math-g6-2020-r1', 'ASMO-MATH-G06-2020-R1', 2020, 'School Level'),
        ('ASMO_MATH_G6_2005_P1', 'asmo-math-g6-2005-r2', 'ASMO-MATH-G06-2005-R2', 2005, 'Contest Paper 1'),
        ('ASMO_MATH_G6_2006_P2', 'asmo-math-g6-2006-r3', 'ASMO-MATH-G06-2006-R3', 2006, 'Contest Paper 2'),
        ('ASMO_MATH_G6_2007_P3', 'asmo-math-g6-2007-r4', 'ASMO-MATH-G06-2007-R4', 2007, 'Contest Paper 3'),
        ('ASMO_MATH_G6_2013_MASMO', 'asmo-math-g6-2013-r5', 'ASMO-MATH-G06-2013-R5', 2013, 'MASMO Contest Paper'),
        ('ASMO_MATH_G6_2023_STATE', 'asmo-math-g6-2023-r6', 'ASMO-MATH-G06-2023-R6', 2023, 'State Round'),
    ]),
    (7, 'grade7_math_verified.json', [
        ('ASMO_MATH_G7_2020_SCHOOL', 'asmo-math-g7-2020-r1', 'ASMO-MATH-G07-2020-R1', 2020, 'School Level'),
        ('ASMO_MATH_G7_2011_P1', 'asmo-math-g7-2011-r2', 'ASMO-MATH-G07-2011-R2', 2011, 'Contest Paper 1'),
        ('ASMO_MATH_G7_2012_P2', 'asmo-math-g7-2012-r3', 'ASMO-MATH-G07-2012-R3', 2012, 'Contest Paper 2'),
        ('ASMO_MATH_G7_2013_P3', 'asmo-math-g7-2013-r4', 'ASMO-MATH-G07-2013-R4', 2013, 'Contest Paper 3'),
        ('ASMO_MATH_G7_2013_MASMO', 'asmo-math-g7-2013-r5', 'ASMO-MATH-G07-2013-R5', 2013, 'MASMO Contest Paper'),
        ('ASMO_MATH_G7_2023_STATE', 'asmo-math-g7-2023-r6', 'ASMO-MATH-G07-2023-R6', 2023, 'State Round'),
    ]),
    (8, 'grade8_math_verified.json', [
        ('ASMO_MATH_G8_2023_STATE', 'asmo-math-g8-2023-r1', 'ASMO-MATH-G08-2023-R1', 2023, 'State Round'),
        ('ASMO_MATH_G8_2013_MASMO', 'asmo-math-g8-2013-r2', 'ASMO-MATH-G08-2013-R2', 2013, 'MASMO Contest Paper'),
        ('ASMO_MATH_G8_2011_P1', 'asmo-math-g8-2011-r3', 'ASMO-MATH-G08-2011-R3', 2011, 'Contest Paper 1'),
        ('ASMO_MATH_G8_2014_P2', 'asmo-math-g8-2014-r4', 'ASMO-MATH-G08-2014-R4', 2014, 'Contest Paper 2'),
        ('ASMO_MATH_G8_2012_P3', 'asmo-math-g8-2012-r5', 'ASMO-MATH-G08-2012-R5', 2012, 'Contest Paper 3'),
    ]),
    (9, 'grade9_math_verified.json', [
        ('ASMO_MATH_G9_2023_STATE', 'asmo-math-g9-2023-r1', 'ASMO-MATH-G09-2023-R1', 2023, 'State Round'),
        ('ASMO_MATH_G9_2013_MASMO', 'asmo-math-g9-2013-r2', 'ASMO-MATH-G09-2013-R2', 2013, 'MASMO Contest Paper'),
        ('ASMO_MATH_G9_2011_P1', 'asmo-math-g9-2011-r3', 'ASMO-MATH-G09-2011-R3', 2011, 'Contest Paper 1'),
        ('ASMO_MATH_G9_2012_P2', 'asmo-math-g9-2012-r4', 'ASMO-MATH-G09-2012-R4', 2012, 'Contest Paper 2'),
        ('ASMO_MATH_G9_2013_P3', 'asmo-math-g9-2013-r5', 'ASMO-MATH-G09-2013-R5', 2013, 'Contest Paper 3'),
    ]),
    (10, 'grade10_math_verified.json', [
        ('ASMO_MATH_G10_2020_SCHOOL', 'asmo-math-g10-2020-r1', 'ASMO-MATH-G10-2020-R1', 2020, 'School Level'),
        ('ASMO_MATH_G10_2023_STATE', 'asmo-math-g10-2023-r2', 'ASMO-MATH-G10-2023-R2', 2023, 'State Round'),
        ('ASMO_MATH_G10_2018_P1', 'asmo-math-g10-2018-r3', 'ASMO-MATH-G10-2018-R3', 2018, 'Contest Paper 1'),
        ('ASMO_MATH_G10_2014_P3', 'asmo-math-g10-2014-r4', 'ASMO-MATH-G10-2014-R4', 2014, 'Contest Paper 3'),
    ]),
    (11, 'grade11_math_verified.json', [
        ('ASMO_MATH_G11_2023_STATE', 'asmo-math-g11-2023-r1', 'ASMO-MATH-G11-2023-R1', 2023, 'State Round'),
        ('ASMO_MATH_G11_2014_P1', 'asmo-math-g11-2014-r2', 'ASMO-MATH-G11-2014-R2', 2014, 'Contest Paper 1'),
        ('ASMO_MATH_G11_2015_P2', 'asmo-math-g11-2015-r3', 'ASMO-MATH-G11-2015-R3', 2015, 'Contest Paper 2'),
        ('ASMO_MATH_G11_2016_P3', 'asmo-math-g11-2016-r4', 'ASMO-MATH-G11-2016-R4', 2016, 'Contest Paper 3'),
    ]),
    (12, 'grade12_math_verified.json', [
        ('ASMO_MATH_G12_2023_STATE', 'asmo-math-g12-2023-r1', 'ASMO-MATH-G12-2023-R1', 2023, 'State Round'),
    ]),
]

for g, fname, exam_mappings in math_configs:
    fpath = DATA_DIR / fname
    with open(fpath, 'r', encoding='utf-8') as fp:
        raw_data = json.load(fp)
        raw_exams = raw_data.get('exams', [])
        
        for raw_id, new_id, new_code, year, round_name in exam_mappings:
            matching = next((e for e in raw_exams if e.get('exam_id') == raw_id or e.get('id') == raw_id), None)
            if not matching:
                continue
            
            questions = []
            for q_idx, q in enumerate(matching.get('questions', [])):
                q_num = q_idx + 1
                q_id = f'{new_id}-q{q_num:02d}'
                raw_text = q.get('question_text', '')
                clean_q_text = normalize_katex(clean_text(raw_text))
                raw_opts = q.get('options')
                correct_ans = q.get('correct_answer', 'A')
                
                if raw_opts and isinstance(raw_opts, dict):
                    options = [
                        {
                            'id': k,
                            'label': k,
                            'text': clean_option_text(v)
                        }
                        for k, v in raw_opts.items()
                    ]
                else:
                    options, correct_ans = make_distractors(correct_ans, q_num)
                
                topic_code = f'MATH_G{g}_T{((q_num-1)%6)+1}'
                topic_name = f'Tư duy Toán Olympic Lớp {g}'
                
                q_title = f'Câu {q_num}: {clean_q_text.splitlines()[0][:60]}' if clean_q_text else f'Câu {q_num}'
                
                explanation = q.get('explanation') or f'Lời giải chuẩn xác theo đáp án ASMO: Kết quả là {correct_ans}.'
                explanation = normalize_katex(clean_text(explanation))
                
                steps = [
                    { 'stepIndex': 0, 'title': 'Bước 1: Phân tích đề bài', 'description': 'Xác định giả thiết và đại lượng cần tìm trong bài toán.' },
                    { 'stepIndex': 1, 'title': 'Bước 2: Thực hiện phép tính', 'description': explanation }
                ]
                
                mee_hint = get_mee_hint('math', g, topic_name, q_num)
                
                questions.append({
                    'id': q_id,
                    'subject': 'math',
                    'grade': g,
                    'topicCode': topic_code,
                    'topicName': topic_name,
                    'title': q_title,
                    'text': clean_q_text,
                    'options': options,
                    'correctAnswer': correct_ans,
                    'explanation': explanation,
                    'meeHint': mee_hint,
                    'points': q.get('points', 4),
                    'imageUrl': None,
                    'explanationSteps': steps
                })
            
            exam_obj = {
                'id': new_id,
                'code': new_code,
                'title': f'Đề Thi Olympic Toán ASMO Lớp {g} ({round_name} - {year})',
                'subject': 'math',
                'grade': g,
                'year': year,
                'round': round_name,
                'durationMinutes': 60 if g <= 5 else 75,
                'passScore': 60,
                'totalPoints': sum(q['points'] for q in questions),
                'description': f'Đề thi chính thức Olympic Toán Quốc Tế ASMO Lớp {g} năm {year} ({round_name}).',
                'questions': questions
            }
            
            if exam_obj['id'] not in seen_exam_ids:
                seen_exam_ids.add(exam_obj['id'])
                final_exams.append(exam_obj)

# 3. Add Science Exams (Grades 6, 7, 8, 9, 10, 11, 12)
sci_configs = [
    (6, 2, 'asmo_science_level2_verified.json', 1, 'asmo-sci-l2-2023-r4', 'ASMO-SCI-L2-2023-R4', 2023, 'Finals (International Round)'),
    (7, 3, 'asmo_science_level3_verified.json', 6, 'asmo-sci-l3-2022-r7', 'ASMO-SCI-L3-2022-R7', 2022, 'National Round'),
    (8, 3, 'asmo_science_level3_verified.json', 7, 'asmo-sci-l3-2022-r8', 'ASMO-SCI-L3-2022-R8', 2022, 'National Round'),
    (9, 3, 'asmo_science_level3_verified.json', 0, 'asmo-sci-l3-2022-r11', 'ASMO-SCI-L3-2022-R11', 2022, 'National Round'),
    (10, 4, 'asmo_science_level4_verified.json', 0, 'asmo-sci-l4-2023-r1', 'ASMO-SCI-L4-2023-R1', 2023, 'National Round'),
    (11, 5, 'asmo_science_level5_verified.json', 0, 'asmo-sci-l5-2023-r1', 'ASMO-SCI-L5-2023-R1', 2023, 'National Round'),
    (12, 6, 'asmo_science_level6_verified.json', 0, 'asmo-sci-l6-2023-r1', 'ASMO-SCI-L6-2023-R1', 2023, 'National Round'),
]

for g, lvl, fname, raw_idx, new_id, new_code, year, round_name in sci_configs:
    fpath = DATA_DIR / fname
    with open(fpath, 'r', encoding='utf-8') as fp:
        raw_data = json.load(fp)
        raw_exams = raw_data.get('exams', [])
        if raw_idx >= len(raw_exams):
            continue
        matching = raw_exams[raw_idx]
        
        questions = []
        for q_idx, q in enumerate(matching.get('questions', [])):
            q_num = q_idx + 1
            q_id = f'{new_id}-q{q_num:02d}'
            clean_q_text = clean_text(q.get('question_text', ''))
            raw_opts = q.get('options')
            correct_ans = q.get('correct_answer', 'A')
            
            if raw_opts and isinstance(raw_opts, dict):
                options = [
                    { 'id': k, 'label': k, 'text': clean_option_text(v) }
                    for k, v in raw_opts.items()
                ]
            else:
                options, correct_ans = make_distractors(correct_ans, q_num)
                
            topic_code = q.get('topic_code') or f'SCI_L{lvl}_T{((q_num-1)%4)+1}'
            topic_name = f'Khoa học Tự Nhiên Lớp {g}'
            q_title = f'Câu {q_num}: {clean_q_text.splitlines()[0][:60]}' if clean_q_text else f'Câu {q_num}'
            
            explanation = q.get('explanation') or f'Lời giải khoa học chuẩn ASMO: Đáp án chính xác là {correct_ans}.'
            explanation = clean_text(explanation)
            
            mee_hint = get_mee_hint('science', g, topic_name, q_num)
            
            questions.append({
                'id': q_id,
                'subject': 'science',
                'grade': g,
                'topicCode': topic_code,
                'topicName': topic_name,
                'title': q_title,
                'text': clean_q_text,
                'options': options,
                'correctAnswer': correct_ans,
                'explanation': explanation,
                'meeHint': mee_hint,
                'points': q.get('points', 4),
                'imageUrl': None,
                'explanationSteps': [
                    { 'stepIndex': 0, 'title': 'Bước 1: Nhận diện hiện tượng', 'description': 'Phân tích nguyên lý vật lý/hoá học/sinh học trong đề bài.' },
                    { 'stepIndex': 1, 'title': 'Bước 2: Kết luận khoa học', 'description': explanation }
                ]
            })
            
        exam_obj = {
            'id': new_id,
            'code': new_code,
            'title': f'Đề Thi Olympic Khoa Học ASMO Lớp {g} ({round_name} - {year})',
            'subject': 'science',
            'grade': g,
            'year': year,
            'round': round_name,
            'durationMinutes': 60,
            'passScore': 60,
            'totalPoints': sum(q['points'] for q in questions),
            'description': f'Đề thi Olympic Khoa Học Tự Nhiên Quốc Tế ASMO Lớp {g} năm {year} ({round_name}).',
            'questions': questions
        }
        
        if exam_obj['id'] not in seen_exam_ids:
            seen_exam_ids.add(exam_obj['id'])
            final_exams.append(exam_obj)

# 4. Add English Exams (Grades 6, 7, 8, 9, 10, 11, 12)
eng_configs = [
    (6, 3, 'asmo_english_level3_verified.json', 10, 'asmo-eng-l3-2022-r11', 'ASMO-ENG-L3-2022-R11', 2022, 'National Round'),
    (7, 4, 'asmo_english_level4_verified.json', 1, 'asmo-eng-l4-2022-r2', 'ASMO-ENG-L4-2022-R2', 2022, 'National Round'),
    (8, 4, 'asmo_english_level4_verified.json', 0, 'asmo-eng-l4-2023-r1', 'ASMO-ENG-L4-2023-R1', 2023, 'National Round'),
    (9, 4, 'asmo_english_level4_verified.json', 7, 'asmo-eng-l4-2022-r8', 'ASMO-ENG-L4-2022-R8', 2022, 'National Round'),
    (10, 5, 'asmo_english_level5_verified.json', 1, 'asmo-eng-l5-2022-r2', 'ASMO-ENG-L5-2022-R2', 2022, 'Round 1 (State/School Round)'),
    (10, 5, 'asmo_english_level5_verified.json', 0, 'asmo-eng-l5-2023-r1', 'ASMO-ENG-L5-2023-R1', 2023, 'National Round'),
    (11, 6, 'asmo_english_level6_verified.json', 0, 'asmo-eng-l6-2023-r1', 'ASMO-ENG-L6-2023-R1', 2023, 'National Round'),
    (12, 6, 'asmo_english_level6_verified.json', 1, 'asmo-eng-l6-2023-r2', 'ASMO-ENG-L6-2023-R2', 2023, 'National Round'),
]

for g, lvl, fname, raw_idx, new_id, new_code, year, round_name in eng_configs:
    fpath = DATA_DIR / fname
    with open(fpath, 'r', encoding='utf-8') as fp:
        raw_data = json.load(fp)
        raw_exams = raw_data.get('exams', [])
        if raw_idx >= len(raw_exams):
            continue
        matching = raw_exams[raw_idx]
        
        questions = []
        for q_idx, q in enumerate(matching.get('questions', [])):
            q_num = q_idx + 1
            q_id = f'{new_id}-q{q_num:02d}'
            clean_q_text = clean_text(q.get('question_text', ''))
            raw_opts = q.get('options')
            correct_ans = q.get('correct_answer', 'A')
            
            if raw_opts and isinstance(raw_opts, dict):
                options = [
                    { 'id': k, 'label': k, 'text': clean_option_text(v) }
                    for k, v in raw_opts.items()
                ]
            else:
                options, correct_ans = make_distractors(correct_ans, q_num)
                
            topic_code = q.get('topic_code') or f'ENG_L{lvl}_T{((q_num-1)%4)+1}'
            topic_name = f'Tiếng Anh Học Thuật Lớp {g}'
            q_title = f'Câu {q_num}: {clean_q_text.splitlines()[0][:60]}' if clean_q_text else f'Câu {q_num}'
            
            explanation = q.get('explanation') or f'Giải thích học thuật ASMO: Đáp án chính xác là {correct_ans}.'
            explanation = clean_text(explanation)
            
            mee_hint = get_mee_hint('english', g, topic_name, q_num)
            
            questions.append({
                'id': q_id,
                'subject': 'english',
                'grade': g,
                'topicCode': topic_code,
                'topicName': topic_name,
                'title': q_title,
                'text': clean_q_text,
                'options': options,
                'correctAnswer': correct_ans,
                'explanation': explanation,
                'meeHint': mee_hint,
                'points': q.get('points', 2),
                'imageUrl': None,
                'explanationSteps': [
                    { 'stepIndex': 0, 'title': 'Bước 1: Đọc hiểu ngữ cảnh', 'description': 'Xác định từ vựng, ngữ pháp hoặc cấu trúc cần điền.' },
                    { 'stepIndex': 1, 'title': 'Bước 2: Đối chiếu quy tắc Anh ngữ', 'description': explanation }
                ]
            })
            
        exam_obj = {
            'id': new_id,
            'code': new_code,
            'title': f'Đề Thi Olympic Tiếng Anh ASMO Lớp {g} ({round_name} - {year})',
            'subject': 'english',
            'grade': g,
            'year': year,
            'round': round_name,
            'durationMinutes': 60,
            'passScore': 60,
            'totalPoints': sum(q['points'] for q in questions),
            'description': f'Đề thi Olympic Tiếng Anh Học Thuật Quốc Tế ASMO Lớp {g} năm {year} ({round_name}).',
            'questions': questions
        }
        
        if exam_obj['id'] not in seen_exam_ids:
            seen_exam_ids.add(exam_obj['id'])
            final_exams.append(exam_obj)

print(f'\nTotal Synthesized ASMO Exams: {len(final_exams)}')

# 5. Output to Frontend: apps/web/src/features/asmo/data/asmo-sample-exams.ts
web_code = f"import type {{ AsmoExam }} from '../types'\n\nexport const ASMO_SAMPLE_EXAMS: AsmoExam[] = {json.dumps(final_exams, ensure_ascii=False, indent=2)}\n"
with open(WEB_OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write(web_code)
print(f'Saved Frontend sample exams to: {WEB_OUTPUT_PATH}')

# 6. Output to Backend: core-lms-api/src/modules/asmo/asmo.seed-data.ts
backend_exams = json.loads(json.dumps(final_exams))
benchmark_backend = next((e for e in backend_exams if e['id'] == 'asmo-math-g1-2020-r1'), None)
if benchmark_backend:
    for q in benchmark_backend['questions']:
        if q['id'] in BENCHMARK_ARCHETYPES:
            q['diagramSpec'] = BENCHMARK_ARCHETYPES[q['id']]
        if q['id'] in AUTHENTIC_RENDERSPECS:
            q['renderSpec'] = AUTHENTIC_RENDERSPECS[q['id']]
        if isinstance(q['meeHint'], str):
            q['meeHint'] = {
                'text': q['meeHint'],
                'emotion': 'explaining'
            }

backend_code = f"import type {{ AsmoExam }} from './asmo.domain'\n\nexport const ASMO_SEED_EXAMS: AsmoExam[] = {json.dumps(backend_exams, ensure_ascii=False, indent=2)}\n"
with open(BACKEND_OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write(backend_code)
print(f'Saved Backend seed exams to: {BACKEND_OUTPUT_PATH}')
