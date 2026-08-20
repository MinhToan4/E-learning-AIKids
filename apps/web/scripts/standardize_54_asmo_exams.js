import fs from 'node:fs';
import path from 'node:path';

const webFilePath = '/Users/imam/storymee/1-Harness-Apps/E-learning-AIKids/apps/web/src/features/asmo/data/asmo-sample-exams.ts';
const backendFilePath = '/Users/imam/storymee/2-MCP-Core/core-lms-api/src/modules/asmo/asmo.seed-data.ts';

// 1. Text Cleaner
function cleanQuestionText(text) {
  if (!text) return text;
  let cleaned = text;

  // Remove OCR header banners
  cleaned = cleaned.replace(/DIVISION\s+ASIAN\s+[A-Z0-9\s&,-]+(?:ROUND|LEVEL|GRADE|YEAR|PRIMARY|CONTEST)[^\n]*/gi, '');
  cleaned = cleaned.replace(/DIVISION\s+ASIAN\s+[^\n]*/gi, '');
  cleaned = cleaned.replace(/ASIAN\s+ENGLISH\s+OLYMPIAD\s+[^\n]*/gi, '');
  cleaned = cleaned.replace(/ASIAN\s+SCIENCE\s+OLYMPIAD\s+[^\n]*/gi, '');
  cleaned = cleaned.replace(/ASIAN\s+MATHS?\s+OLYMPIAD\s+[^\n]*/gi, '');

  // Remove marks annotations (e.g. '(5 marks)', '[3 Marks]', '5 marks' at end)
  cleaned = cleaned.replace(/\(\s*\d+\s*(?:marks?|Marks?|điểm|Điểm|pts?)\s*\)/gi, '');
  cleaned = cleaned.replace(/\[\s*\d+\s*(?:marks?|Marks?|điểm|Điểm|pts?)\s*\]/gi, '');
  cleaned = cleaned.replace(/\s+\d+\s*(?:marks?|Marks?)\s*$/gi, '');

  // Clean trailing spaces and excessive newlines
  cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  return cleaned;
}

function cleanOptionText(text) {
  if (!text) return text;
  let cleaned = text;

  // Remove leading option labels like '(A) ', 'A. ', etc.
  cleaned = cleaned.replace(/^\s*\([A-E]\)\s*/i, '');
  cleaned = cleaned.replace(/^\s*[A-E]\.\s*/i, '');

  // Remove spoiler parentheses
  cleaned = cleaned.replace(/\(\s*\d+\s*(?:que|sticks?|triangles?|marks?|s|seconds?)\s*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*(?:sai|đúng|correct|wrong)\s*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*Row\s*\d+:[^\)]*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*\d+\s*Marks?\s*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*forming\s+\d+\s+triangles\s*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*24\s+is\s+not\s+in\s+the\s+sequence\s*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*the\s+scores\s+are[^\)]*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*row\s+\d+,\s*col\s+\d+\s*\)/gi, '');
  cleaned = cleaned.replace(/\(\s*Net\s*\([A-E]\)\s*\)/gi, '');

  // Remove DIVISION noise
  cleaned = cleaned.replace(/DIVISION\s+ASIAN[^\n]*/gi, '');

  cleaned = cleaned.trim();
  return cleaned;
}

// 2. KaTeX Normalization for Math Expressions
function normalizeKatex(text) {
  if (!text) return text;
  let s = text;

  // Normalize comparisons with fractions: e.g. 3/5 < [ ]/7 < 4/5 or 3/5 < □/7 < 4/5
  s = s.replace(/\b(\d+)\/(\d+)\s*<\s*(?:\[\s*\]|□)\/(\d+)\s*<\s*(\d+)\/(\d+)\b/g, '$\\frac{$1}{$2} < \\frac{\\square}{$3} < \\frac{$4}{$5}$');
  s = s.replace(/\b(\d+)\/(\d+)\s*<\s*1\/n\s*<\s*(\d+)\/(\d+)\b/g, '$\\frac{$1}{$2} < \\frac{1}{n} < \\frac{$3}{$4}$');

  // Normalize standalone fraction arithmetic like 1/2 × 1/3 + 5/13 ÷ 8/21
  s = s.replace(/\b(\d+)\/(\d+)\s*×\s*(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)\s*÷\s*(\d+)\/(\d+)\b/g, '$\\frac{$1}{$2} \\times \\frac{$3}{$4} + \\frac{$5}{$6} \\div \\frac{$7}{$8}$');

  // Normalize geometric shape equations line by line
  const lines = s.split('\n');
  const newLines = lines.map(line => {
    // Only if line is not already KaTeX wrapped and not an arithmetic table
    if (!line.includes('$') && !line.includes('------') && !line.includes('table') && !line.includes('<div') && !line.includes('http')) {
      if (/[○△□☆★▲♦♠♥☻♪]/.test(line) && (line.includes('=') || line.includes('+') || line.includes('-') || line.includes('–'))) {
        const mathForm = line.replace(/○/g, '\\bigcirc ')
                             .replace(/△/g, '\\triangle ')
                             .replace(/□/g, '\\square ')
                             .replace(/★/g, '\\bigstar ')
                             .replace(/▲/g, '\\blacktriangle ')
                             .replace(/☆/g, '\\star ')
                             .replace(/–/g, '-')
                             .replace(/−/g, '-')
                             .trim();
        return `$${mathForm}$`;
      }
    }
    return line;
  });

  return newLines.join('\n');
}

// 3. Authentic RenderSpec Configuration Map
// Strict whitelist of genuine 3D visual specifications
const AUTHENTIC_RENDERSPECS = {
  // Benchmark Exam 2020 G1 Math
  'asmo-math-g1-2020-r1-q17': {
    template: 'INTERACTIVE_CLOCK',
    camera: { x: 0, y: 0, z: 5.5 },
    hour: 5,
    minute: 10,
    autoRotate: false
  },
  'asmo-math-g1-2020-r1-q04': {
    template: '3D_BALANCE_SCALE',
    camera: { x: 0, y: 0.2, z: 7 },
    leftWeightCount: 2,
    rightWeightCount: 6,
    leftItemLabel: 'Dưa hấu',
    rightItemLabel: 'Cam',
    autoRotate: false
  },
  'asmo-math-g1-2020-r1-q15': {
    template: 'GRID_PATH_MAZE',
    camera: { x: 0, y: 0, z: 6 },
    gridSize: [5, 5],
    start: [0, 0],
    target: [4, 4],
    autoRotate: false
  },

  // 2015 G1 Math Q4 (Clock 10:00)
  'asmo-math-g1-2015-r3-q04': {
    template: 'INTERACTIVE_CLOCK',
    camera: { x: 0, y: 0, z: 5.5 },
    hour: 10,
    minute: 0,
    autoRotate: false
  },

  // 2016 G1 Math Q4 (Clock 3:00)
  'asmo-math-g1-2016-r4-q04': {
    template: 'INTERACTIVE_CLOCK',
    camera: { x: 0, y: 0, z: 5.5 },
    hour: 3,
    minute: 0,
    autoRotate: false
  },

  // 2020 G2 Math Q6 (3D Cubes)
  'asmo-math-g2-2020-r1-q06': {
    template: '3D_CUBE_CLUSTER',
    camera: { x: 4.5, y: 3.5, z: 4.5 },
    cubes: [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1], [0, 1, 0], [1, 1, 0], [0, 1, 1], [0, 2, 0]],
    autoRotate: false
  },

  // 2023 G2 Math Q18 (Net Cube)
  'asmo-math-g2-2023-r5-q18': {
    template: 'NET_CUBE_FOLDING',
    camera: { x: 0, y: 0, z: 5.5 },
    faces: [
      { id: 1, pos: [0, 0.5, 0], color: 5195493, label: '1' },
      { id: 2, pos: [1, 0.5, 0], color: 440020, label: '2' },
      { id: 3, pos: [-1, 0.5, 0], color: 440020, label: '3' },
      { id: 4, pos: [0, 1.5, 0], color: 1096065, label: '4' },
      { id: 5, pos: [0, -0.5, 0], color: 1096065, label: '5' },
      { id: 6, pos: [0, -1.5, 0], color: 16096779, label: '6' },
    ],
    autoRotate: false
  },

  // 2020 G3 Math Q3 (Cake Slices)
  'asmo-math-g3-2020-r1-q03': {
    template: 'SHADED_AREA_FRACTION',
    camera: { x: 0, y: 0, z: 5.5 },
    totalSlices: 10,
    shadedSlices: 7,
    autoRotate: false
  },

  // 2023 G3 Math Q8 (Net Cube)
  'asmo-math-g3-2023-r6-q08': {
    template: 'NET_CUBE_FOLDING',
    camera: { x: 0, y: 0, z: 5.5 },
    faces: [
      { id: 1, pos: [0, 0.5, 0], color: 5195493, label: '1' },
      { id: 2, pos: [1, 0.5, 0], color: 440020, label: '2' },
      { id: 3, pos: [-1, 0.5, 0], color: 440020, label: '3' },
      { id: 4, pos: [0, 1.5, 0], color: 1096065, label: '4' },
      { id: 5, pos: [0, -0.5, 0], color: 1096065, label: '5' },
      { id: 6, pos: [0, -1.5, 0], color: 16096779, label: '6' },
    ],
    autoRotate: false
  }
};

// 4. SVG Diagram Key Mapping
function assignSvgDiagramKeys(q, examId) {
  // If already has an explicit svgDiagramKey, keep it
  if (q.svgDiagramKey) return q.svgDiagramKey;

  const text = ((q.title || '') + ' ' + (q.text || '')).toLowerCase();

  // Clocks
  if (q.id === 'asmo-math-g1-2020-r1-q17' || (text.includes('clock') && text.includes('5:10'))) {
    return 'q17_clock';
  }
  if (q.id === 'asmo-math-g1-2015-r3-q04') return 'g1_2015_q4_clock';
  if (q.id === 'asmo-math-g1-2016-r4-q04') return 'g1_2016_q4_clock';
  if (q.id === 'asmo-math-g2-2014-r2-q13' || text.includes('clock shows 2:45')) return 'clock_2_45';
  if (q.id === 'asmo-math-g2-2015-r3-q17' || text.includes('10 o’clock at night')) return 'clock_10_00';
  if (q.id === 'asmo-math-g2-2023-r5-q19' || q.id === 'asmo-math-g3-2023-r6-q09') return 'clock_7_15';

  return undefined;
}

function processExams(rawExams) {
  return rawExams.map(exam => {
    const updatedExam = { ...exam };
    updatedExam.questions = exam.questions.map((q, idx) => {
      const updatedQ = { ...q };

      // 1. Clean Title and Text
      updatedQ.title = cleanQuestionText(q.title);
      updatedQ.text = cleanQuestionText(q.text);

      // 2. KaTeX normalizations
      if (exam.subject === 'math') {
        updatedQ.text = normalizeKatex(updatedQ.text);
      }

      // 3. Clean Options
      updatedQ.options = q.options.map(opt => {
        const updatedOpt = { ...opt };
        updatedOpt.text = cleanOptionText(opt.text);
        return updatedOpt;
      });

      // 4. Set RenderSpec (ONLY authentic 3D specs, delete all fake ones)
      if (AUTHENTIC_RENDERSPECS[q.id]) {
        updatedQ.renderSpec = AUTHENTIC_RENDERSPECS[q.id];
      } else {
        delete updatedQ.renderSpec;
      }

      // 5. Assign SVG Diagram Key
      const svgKey = assignSvgDiagramKeys(updatedQ, exam.id);
      if (svgKey) {
        updatedQ.svgDiagramKey = svgKey;
      }

      return updatedQ;
    });

    return updatedExam;
  });
}

// Read raw files
const webRaw = fs.readFileSync(webFilePath, 'utf8');
const backendRaw = fs.readFileSync(backendFilePath, 'utf8');

const webExams = JSON.parse(
  webRaw.replace(/^import[^\n]*\n+/m, '').replace(/^export const ASMO_SAMPLE_EXAMS: AsmoExam\[\] = /m, '').trim().replace(/;$/, '')
);

const backendExams = JSON.parse(
  backendRaw.replace(/^import[^\n]*\n+/m, '').replace(/^export const ASMO_SEED_EXAMS: AsmoExam\[\] = /m, '').trim().replace(/;$/, '')
);

console.log(`Standardizing ${webExams.length} web exams and ${backendExams.length} backend exams...`);

const processedWebExams = processExams(webExams);
const processedBackendExams = processExams(backendExams);

// Align diagramSpec in Backend for all 12 archetypes in benchmark exam 2020 G1 Math
const benchmarkBackend = processedBackendExams.find(e => e.id === 'asmo-math-g1-2020-r1');
if (benchmarkBackend) {
  const archetypeMap = {
    'asmo-math-g1-2020-r1-q01': { archetype: 'SCATTERED', type: 'balls' },
    'asmo-math-g1-2020-r1-q02': { archetype: 'SCATTERED', type: 'digits' },
    'asmo-math-g1-2020-r1-q04': { archetype: 'BALANCE', left: { emoji: '🍌' }, right: { emoji: '🍓' }, tilt: 'left' },
    'asmo-math-g1-2020-r1-q05': { archetype: 'SHADED_RATIO', rows: 7, cols: 5, shadedCells: [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,2]] },
    'asmo-math-g1-2020-r1-q08': { archetype: 'SHAPE_EQUATION', rows: [{ left: 'square', right: 'triangle' }] },
    'asmo-math-g1-2020-r1-q09': { archetype: 'MATCHSTICK', pattern: 'square_flag', matchCount: 6 },
    'asmo-math-g1-2020-r1-q11': { archetype: 'VERTICAL_ARITHMETIC', top: 21, op: '-', bottom: 17, result: '?' },
    'asmo-math-g1-2020-r1-q14': { archetype: 'CHECKERBOARD', variant: 'puzzle_cut' },
    'asmo-math-g1-2020-r1-q15': { archetype: 'MAZE', width: 5, height: 5 },
    'asmo-math-g1-2020-r1-q17': { archetype: 'CLOCK', hour: 5, minute: 10 },
    'asmo-math-g1-2020-r1-q20': { archetype: 'CAKE', variant: 'cross' },
    'asmo-math-g1-2020-r1-q23': { archetype: 'SIERPINSKI', depth: 1 },
    'asmo-math-g1-2020-r1-q25': { archetype: 'POLYLINE', cols: 6, rows: 2, points: [[0,0],[2,2],[4,0],[5,2],[6,0]] },
  };

  benchmarkBackend.questions.forEach(q => {
    if (archetypeMap[q.id]) {
      q.diagramSpec = archetypeMap[q.id];
    }
  });
}

// Write to files
const webOutput = `import type { AsmoExam } from '../types'\n\nexport const ASMO_SAMPLE_EXAMS: AsmoExam[] = ${JSON.stringify(processedWebExams, null, 2)}\n`;
fs.writeFileSync(webFilePath, webOutput, 'utf8');
console.log(`Successfully updated ${webFilePath}!`);

const backendOutput = `import type { AsmoExam } from './asmo.domain'\n\nexport const ASMO_SEED_EXAMS: AsmoExam[] = ${JSON.stringify(processedBackendExams, null, 2)}\n`;
fs.writeFileSync(backendFilePath, backendOutput, 'utf8');
console.log(`Successfully updated ${backendFilePath}!`);
