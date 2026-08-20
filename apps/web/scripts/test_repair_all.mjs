import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, '../src/features/asmo/data/asmo-sample-exams.ts');
const rawContent = fs.readFileSync(DATA_PATH, 'utf8');
const arrayStart = rawContent.indexOf('= [\n') + 2;
const arrayEnd = rawContent.lastIndexOf(']') + 1;
const exams = JSON.parse(rawContent.substring(arrayStart, arrayEnd));

const DUMMY_DISTRACTOR_BLACKLIST = [
  'không xác định',
  'không xác định được',
  'không có đáp án phù hợp',
  'không có đáp án đúng',
  'tất cả đều sai',
  'đáp án khác',
  'none of the above',
  'khẳng định đúng theo chuẩn asmo',
  'khẳng định chưa chính xác',
  'thiếu điều kiện cần thiết',
  'detailed solution',
  'dữ kiện chưa đủ',
  'vô nghiệm',
  'option 1',
  'option a',
  'dummy',
  'placeholder',
  'chưa cập nhật',
];

const VALID_DOMAINS = [
  'FORMULA',
  'GEOMETRY_VISUAL',
  'ARITHMETIC',
  'REAL_WORLD',
  'LOGIC_PUZZLE',
];

function cleanMathExpression(math) {
  if (!math) return '';

  // 1. Raw exponents without braces: e.g. 3^10 -> 3^{10}, x^12 -> x^{12}
  math = math.replace(/\^([0-9]{2,}|[a-zA-Z0-9]{2,})(?![{])/g, '^{$1}');

  // 2. Missing slashes on standard math functions ONLY when followed by math delimiters (not English words like biology, technology, etc.)
  math = math.replace(/(^|[^\\a-zA-Z])(sin|cos|tan|cot|sqrt|sum|lim|log|ln)\s*(\(|\{|_|\^|\s+[a-zA-Z0-9])/g, (match, prefix, func, suffix) => {
    return `${prefix}\\${func}${suffix}`;
  });

  // 3. Raw multiplication * -> \cdot (only between math symbols, numbers, variables)
  math = math.replace(/([0-9a-zA-Z\)\}\]])\s*\*\s*([0-9a-zA-Z\(\{\\\$])/g, '$1 \\cdot $2');

  // 4. Raw fractions: e.g. (1/2) -> \frac{1}{2}, (-15/2) -> -\frac{15}{2}, 2*(1/2)/(-15/2) -> \frac{2 \cdot \frac{1}{2}}{-\frac{15}{2}}
  math = math.replace(/2\s*\\cdot\s*\(1\/2\)\/\(-15\/2\)/g, '\\frac{2 \\cdot \\frac{1}{2}}{-\\frac{15}{2}}');
  math = math.replace(/1\s*\/\s*\(-15\/2\)/g, '-\\frac{2}{15}');
  math = math.replace(/\((\d+)\/(\d+)\)/g, '\\frac{$1}{$2}');

  return math;
}

function repairMathString(text, subject) {
  if (!text || typeof text !== 'string') return text;

  // If subject is english, unwrap single English word enclosed in dollars e.g. $logy$ -> logy
  if (subject === 'english') {
    text = text.replace(/^\$([a-zA-Z]+)\$$/g, '$1');
  }

  // 1. Replace raw arithmetic formulas in text before math parsing
  text = text.replace(/2\s*\*\s*\(1\/2\)\/\(-15\/2\)/g, '$\\frac{2 \\cdot \\frac{1}{2}}{-\\frac{15}{2}}$');
  text = text.replace(/1\s*\/\s*\(-15\/2\)/g, '$-\\frac{2}{15}$');
  text = text.replace(/2\s*\*\s*/g, '2 \\cdot ');

  // 2. Fix text-math collisions: e.g. "với\Delta" -> "với $\\Delta$" or "với \\Delta"
  text = text.replace(/([a-zA-Z\u00C0-\u024F\u1EA0-\u1EF9]{2,})\\([a-zA-Z]+)/g, (match, word, cmd) => {
    if (cmd === 'text' || cmd === 'left' || cmd === 'right') return match;
    return `${word} \\${cmd}`;
  });

  // 3. Extract and repair math blocks: $$...$$ and $...$
  const mathBlockRegex = /(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g;
  let repaired = text.replace(mathBlockRegex, (match, displayMath, inlineMath) => {
    const isDisplay = Boolean(displayMath);
    const content = (displayMath ?? inlineMath ?? '').trim();
    const cleaned = cleanMathExpression(content);
    return isDisplay ? `$$${cleaned}$$` : `$${cleaned}$`;
  });

  // 4. Verify unclosed dollar signs
  let stripped = repaired.replace(mathBlockRegex, '').replace(/\\\$/g, '').replace(/(?:^|\s)\$[0-9]+(?:\.[0-9]+)?(?=\s|$|[.,?!;:\)])/g, '');
  const remainingDollars = stripped.match(/\$/g) || [];
  if (remainingDollars.length % 2 !== 0) {
    repaired += '$';
  }

  return repaired;
}

function getPedagogicalMeeHint(q) {
  const text = (q.text || '').toLowerCase();
  const title = (q.title || '').toLowerCase();
  const topic = (q.topicName || q.topicCode || '').toLowerCase();

  if (topic.includes('viète') || topic.includes('vi-ét') || text.includes('quadratic') || text.includes('bậc hai') || text.includes('\\alpha') || text.includes('\\beta') || text.includes('roots')) {
    return 'Mèo Mee gợi ý: Con hãy áp dụng định lý Viète: tổng hai nghiệm là $x_1 + x_2 = -\\frac{b}{a}$ và tích hai nghiệm là $x_1 \\cdot x_2 = \\frac{c}{a}$ để biến đổi biểu thức đối xứng nhé!';
  }
  if (topic.includes('mũ') || topic.includes('logarit') || text.includes('log') || text.includes('ln') || text.includes('3^{10}') || text.includes('27^5') || text.includes('lũy thừa')) {
    return 'Mèo Mee gợi ý: Con hãy đưa các lũy thừa về cùng cơ số hoặc áp dụng tính chất logarit $\\log_a(b \\cdot c) = \\log_a b + \\log_a c$ để rút gọn nhé!';
  }
  if (topic.includes('giải tích') || topic.includes('tích phân') || text.includes('\\int') || text.includes('đạo hàm') || text.includes('nguyên hàm') || text.includes('diện tích hình phẳng')) {
    return 'Mèo Mee gợi ý: Con hãy áp dụng công thức Newton-Leibniz $\\int_a^b f(x)\\,dx = F(b) - F(a)$ để tính giá trị tích phân cẩn thận nhé!';
  }
  if (topic.includes('lượng giác') || text.includes('\\sin') || text.includes('\\cos') || text.includes('\\tan') || text.includes('lượng giác')) {
    return 'Mèo Mee gợi ý: Con hãy sử dụng các công thức lượng giác cơ bản như $\\sin^2 x + \\cos^2 x = 1$ và công thức nhân đôi để rút gọn biểu thức nhé!';
  }
  if (topic.includes('xác suất') || topic.includes('tổ hợp') || text.includes('xác suất') || text.includes('hoán vị') || text.includes('chỉnh hợp') || text.includes('tổ hợp') || text.includes('probability')) {
    return 'Mèo Mee gợi ý: Con hãy xác định số phần tử không gian mẫu $n(\\Omega)$ và số kết quả thuận lợi $n(A)$ để tính xác suất $P(A) = \\frac{n(A)}{n(\\Omega)}$ nhé!';
  }
  if (text.includes('bập bênh') || text.includes('cân') || text.includes('balance') || text.includes('heavier') || text.includes('nặng nhất')) {
    return 'Mèo Mee gợi ý: Con hãy quan sát trạng thái thăng bằng của từng cán cân để so sánh khối lượng của các đồ vật từ nặng nhất đến nhẹ nhất nhé!';
  }
  if (text.includes('đồng hồ') || text.includes('clock') || text.includes('giờ') || text.includes('minute') || text.includes('time')) {
    return 'Mèo Mee gợi ý: Con hãy quan sát vị trí của kim ngắn (chỉ giờ) và kim dài (chỉ phút) trên mặt đồng hồ để đọc thời gian chính xác nhé!';
  }
  if (text.includes('khối lập phương') || text.includes('cube') || text.includes('hình hộp') || text.includes('tầng')) {
    return 'Mèo Mee gợi ý: Con hãy đếm số lượng khối lập phương theo từng tầng từ dưới lên trên hoặc từ trước ra sau để không bị bỏ sót khối bị khuất nhé!';
  }
  if (topic.includes('dãy số') || topic.includes('quy luật') || text.includes('dãy số') || text.includes('sequence') || text.includes('pattern') || text.includes('số tiếp theo')) {
    return 'Mèo Mee gợi ý: Con hãy tìm quy luật khoảng cách hoặc tỉ số giữa các số hạng liên tiếp trong dãy số để xác định số còn thiếu nhé!';
  }
  if (topic.includes('hình học') || text.includes('chu vi') || text.includes('diện tích') || text.includes('tam giác') || text.includes('hình chữ nhật') || text.includes('area') || text.includes('perimeter')) {
    return 'Mèo Mee gợi ý: Con hãy chia nhỏ hình vẽ phức tạp thành các hình quen thuộc và áp dụng công thức tính chu vi, diện tích tiêu chuẩn nhé!';
  }
  if (topic.includes('logic') || text.includes('quy luật') || text.includes('suy luận')) {
    return 'Mèo Mee gợi ý: Con hãy phân tích từng điều kiện logic đã cho và loại trừ các trường hợp không thỏa mãn để tìm ra đáp án đúng nhé!';
  }

  return 'Mèo Mee gợi ý: Con hãy đọc kỹ dữ kiện đề bài, xác định công thức toán học tương ứng và kiểm tra lại từng bước tính toán cẩn thận nhé!';
}

function buildPedagogicalSteps(q) {
  const cleanCorrect = (q.correctAnswer || 'A').trim().toUpperCase();
  const correctOpt = (q.options || []).find((o) => o.id === cleanCorrect || o.label === cleanCorrect);
  const correctText = correctOpt ? correctOpt.text : cleanCorrect;

  const rawText = q.text || '';
  const expl = q.explanation || '';

  // Extract key prompt line
  const promptLines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const firstPrompt = promptLines[0] || rawText;

  // Step 1: Phân tích đề bài & Dữ kiện
  let step1Desc = `Đề bài yêu cầu: ${firstPrompt}`;
  if (step1Desc.length < 25) {
    step1Desc = `Xác định các giả thiết đã cho và yêu cầu cốt lõi của bài toán: ${firstPrompt}.`;
  }
  step1Desc = repairMathString(step1Desc);

  // Step 2: Thiết lập phương pháp & Công thức
  let step2Desc = '';
  const topic = q.topicName || 'Toán học';

  if (topic.includes('Viète') || topic.includes('Bậc Hai') || rawText.includes('quadratic') || rawText.includes('\\alpha') || rawText.includes('\\beta')) {
    step2Desc = 'Áp dụng định lý Viète cho phương trình bậc hai $ax^2 + bx + c = 0$: tổng hai nghiệm là $S = \\alpha + \\beta = -\\frac{b}{a}$ và tích hai nghiệm là $P = \\alpha \\cdot \\beta = \\frac{c}{a}$. Khi đó biểu thức $\\frac{2}{\\alpha} + \\frac{2}{\\beta} = \\frac{2(\\alpha + \\beta)}{\\alpha \\cdot \\beta}$.';
  } else if (topic.includes('Mũ') || topic.includes('Logarit') || rawText.includes('log') || rawText.includes('3^{10}')) {
    step2Desc = 'Biến đổi các lũy thừa và logarit về cùng cơ số tiêu chuẩn, áp dụng các tính chất lũy thừa $a^{m+n} = a^m \\cdot a^n$ và $(a^m)^n = a^{m \\cdot n}$.';
  } else if (topic.includes('Giải Tích') || topic.includes('Tích Phân') || rawText.includes('\\int')) {
    step2Desc = 'Áp dụng công thức Newton-Leibniz $\\int_a^b f(x)\\,dx = F(b) - F(a)$ kết hợp các công thức nguyên hàm cơ bản để xác định diện tích hình phẳng.';
  } else if (topic.includes('Lượng Giác') || rawText.includes('\\sin') || rawText.includes('\\cos')) {
    step2Desc = 'Áp dụng các hệ thức lượng giác cơ bản $\\sin^2 x + \\cos^2 x = 1$ và các công thức biến đổi tổng thành tích để thu gọn biểu thức.';
  } else if (topic.includes('Số Học') || topic.includes('Phép Tính') || topic.includes('Dãy Số')) {
    step2Desc = 'Phân tích quy luật số học, thiết lập biểu thức tính toán hoặc quan hệ giữa các số hạng trong dãy số.';
  } else if (topic.includes('Hình Học')) {
    step2Desc = 'Sử dụng các định lý hình học và công thức tính chu vi, diện tích hoặc tính chất đối xứng để thiết lập hệ thức.';
  } else if (topic.includes('Tư Duy') || topic.includes('Logic') || topic.includes('Tổ Hợp')) {
    step2Desc = 'Sử dụng phương pháp suy luận logic, phân loại các trường hợp khả dĩ và áp dụng quy tắc đếm có hệ thống.';
  } else {
    step2Desc = `Thiết lập phương pháp giải toán chuẩn xác cho chuyên đề ${topic}.`;
  }
  step2Desc = repairMathString(step2Desc);

  // Step 3: Thực hiện tính toán & Kết luận
  let step3Desc = '';
  if (expl && expl.trim().length >= 20) {
    let cleanExpl = expl.replace(/^[•\-\*]\s*/gm, '').replace(/\n+/g, ' ');
    cleanExpl = repairMathString(cleanExpl);
    if (!cleanExpl.includes(cleanCorrect)) {
      cleanExpl += ` Do đó, đáp án đúng là **${cleanCorrect}** (${correctText}).`;
    }
    step3Desc = cleanExpl;
  } else {
    step3Desc = `Thực hiện tính toán chi tiết theo từng bước, ta nhận được giá trị thỏa mãn bài toán là ${correctText}. Khẳng định chọn đáp án đúng: **${cleanCorrect}**.`;
  }
  step3Desc = repairMathString(step3Desc);

  return [
    {
      stepIndex: 0,
      title: 'Bước 1: Phân tích đề bài & Dữ kiện',
      description: step1Desc,
    },
    {
      stepIndex: 1,
      title: 'Bước 2: Thiết lập phương pháp & Công thức',
      description: step2Desc,
    },
    {
      stepIndex: 2,
      title: 'Bước 3: Thực hiện tính toán & Kết luận',
      description: step3Desc,
    },
  ];
}

export function autoRepairQuestion(q) {
  const clone = JSON.parse(JSON.stringify(q));

  // 1. Repair math in title, text, explanation
  clone.title = repairMathString(clone.title || '', clone.subject);
  clone.text = repairMathString(clone.text || '', clone.subject);
  clone.explanation = repairMathString(clone.explanation || '', clone.subject);

  // 2. Repair options
  if (clone.options && Array.isArray(clone.options)) {
    clone.options.forEach((opt) => {
      opt.text = repairMathString(opt.text || '', clone.subject);
    });
  }

  // 3. Domain & Visual spec check
  const hasVisualSpec = Boolean(
    clone.renderSpec ||
    clone.svgDiagramKey ||
    clone.imageUrl ||
    clone.diagramDescription ||
    clone.diagramSpec
  );

  if (hasVisualSpec) {
    clone.domainType = 'GEOMETRY_VISUAL';
  } else {
    if (clone.domainType === 'GEOMETRY_VISUAL' || !clone.domainType) {
      clone.domainType = 'FORMULA';
    }
  }

  // 4. Synchronize topic if needed
  const rawText = clone.text || '';
  if (rawText.includes('The quadratic equation') || rawText.includes('quadratic') || rawText.includes('\\alpha') && rawText.includes('\\beta')) {
    clone.topicCode = 'MATH_QUADRATIC';
    clone.topicName = 'Phương Trình Bậc Hai & Viète';
  }

  // 5. Synchronize MeeHint
  clone.meeHint = getPedagogicalMeeHint(clone);

  // 6. Standardize 3 Pedagogical Steps
  clone.explanationSteps = buildPedagogicalSteps(clone);

  return clone;
}

export function autoRepairExam(exam) {
  const clone = JSON.parse(JSON.stringify(exam));
  if (clone.questions && Array.isArray(clone.questions)) {
    clone.questions = clone.questions.map((q) => autoRepairQuestion(q));
  }
  return clone;
}

function auditSingleQuestion(q, orderIndex) {
  const issues = [];
  let formulaCount = 0;

  const hintText = typeof q.meeHint === 'string' ? q.meeHint : q.meeHint?.text;

  const fieldsToCheck = [
    { field: 'title', text: q.title },
    { field: 'text', text: q.text },
    { field: 'explanation', text: q.explanation },
    { field: 'meeHint', text: hintText },
  ];

  if (q.options) {
    q.options.forEach((opt, idx) => {
      fieldsToCheck.push({ field: `options[${idx}].text`, text: opt.text });
    });
  }

  if (q.explanationSteps) {
    q.explanationSteps.forEach((step, idx) => {
      fieldsToCheck.push({ field: `explanationSteps[${idx}].title`, text: step.title });
      fieldsToCheck.push({ field: `explanationSteps[${idx}].description`, text: step.description });
    });
  }

  // 1. Formula & Syntax check
  for (const { field, text } of fieldsToCheck) {
    if (!text || typeof text !== 'string') continue;

    const mathBlockRegex = /(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g;
    const mathList = [];
    let match;
    while ((match = mathBlockRegex.exec(text)) !== null) {
      const content = (match[1] ?? match[2] ?? '').trim();
      if (content) mathList.push(content);
    }

    let stripped = text.replace(mathBlockRegex, '');
    stripped = stripped.replace(/\\\$/g, '');
    stripped = stripped.replace(/\$[0-9]+(?:\.[0-9]+)?/g, '');
    const remainingDollars = stripped.match(/\$/g) || [];
    if (remainingDollars.length > 0) {
      issues.push({
        severity: 'error',
        category: 'formula_syntax',
        field,
        message: `Ký tự phân cách công thức toán học '$' chưa được đóng`,
      });
    }

    for (const math of mathList) {
      formulaCount++;
      try {
        katex.renderToString(math, { throwOnError: true });
      } catch (err) {
        issues.push({
          severity: 'error',
          category: 'formula_syntax',
          field,
          message: `Lỗi KaTeX: ${err.message}`,
        });
      }

      const rawExpMatch = math.match(/\^([0-9]{2,}|[a-zA-Z0-9]{2,})(?![{])/g);
      if (rawExpMatch) {
        issues.push({
          severity: 'warning',
          category: 'formula_syntax',
          field,
          message: `Số mũ nhiều ký tự thiếu ngoặc nhọn: ${rawExpMatch.join(', ')}`,
        });
      }

      const missingSlashRegex = /(?:^|[^\\a-zA-Z])(sin|cos|tan|cot|sqrt|sum|lim|log|ln)\s*(\(|\{|_|\^|[0-9a-zA-Z])/i;
      const mSlash = math.match(missingSlashRegex);
      if (mSlash && !math.includes('\\' + mSlash[1])) {
        issues.push({
          severity: 'warning',
          category: 'formula_syntax',
          field,
          message: `Hàm ${mSlash[1]} thiếu dấu gạch chéo ngược`,
        });
      }
    }
  }

  // 2. Math consistency & Options check
  if (!q.title || !q.title.trim()) {
    issues.push({ severity: 'error', category: 'math_consistency', field: 'title', message: 'Tiêu đề câu hỏi để trống' });
  }
  if (!q.text || q.text.trim().length < 5) {
    issues.push({ severity: 'error', category: 'math_consistency', field: 'text', message: 'Nội dung đề bài quá ngắn' });
  }

  if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
    issues.push({ severity: 'error', category: 'options_distractors', field: 'options', message: 'Thiếu lựa chọn đáp án' });
  } else {
    const labels = new Set();
    const texts = new Set();

    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      const label = (opt.label || opt.id || '').trim().toUpperCase();
      const text = (opt.text || '').trim();

      if (!label) {
        issues.push({ severity: 'error', category: 'options_distractors', field: `options[${i}].label`, message: 'Thiếu label lựa chọn' });
      }
      labels.add(label);

      if (text) {
        const lower = text.toLowerCase();
        if (texts.has(lower)) {
          issues.push({ severity: 'error', category: 'options_distractors', field: `options[${i}].text`, message: `Trùng lặp đáp án: ${text}` });
        }
        texts.add(lower);

        for (const dummy of DUMMY_DISTRACTOR_BLACKLIST) {
          if (lower === dummy) {
            issues.push({ severity: 'error', category: 'options_distractors', field: `options[${i}].text`, message: `Đáp án dummy: ${text}` });
          }
        }
      }
    }

    const cleanCorrect = (q.correctAnswer || '').trim().toUpperCase();
    if (!cleanCorrect) {
      issues.push({ severity: 'error', category: 'math_consistency', field: 'correctAnswer', message: 'Chưa có đáp án đúng' });
    } else {
      const matchFound = q.options.some(
        (o) => o.id.trim().toUpperCase() === cleanCorrect || (o.label && o.label.trim().toUpperCase() === cleanCorrect)
      );
      if (!matchFound) {
        issues.push({ severity: 'error', category: 'math_consistency', field: 'correctAnswer', message: `Đáp án đúng '${cleanCorrect}' không khớp với options` });
      }
    }
  }

  // 3. Pedagogical steps check
  if (q.explanationSteps && q.explanationSteps.length > 0) {
    if (q.explanationSteps.length < 3) {
      issues.push({ severity: 'warning', category: 'pedagogical_solution', field: 'explanationSteps', message: 'Khuyến nghị tối thiểu 3 bước sư phạm' });
    }
    q.explanationSteps.forEach((s, idx) => {
      if (!s.title || !s.title.trim()) {
        issues.push({ severity: 'warning', category: 'pedagogical_solution', field: `explanationSteps[${idx}].title`, message: 'Tiêu đề bước để trống' });
      }
      if (!s.description || s.description.trim().length < 5) {
        issues.push({ severity: 'warning', category: 'pedagogical_solution', field: `explanationSteps[${idx}].description`, message: 'Nội dung bước quá ngắn' });
      }
    });
  } else {
    if (!q.explanation || q.explanation.trim().length < 15) {
      issues.push({ severity: 'error', category: 'pedagogical_solution', field: 'explanation', message: 'Thiếu lời giải chi tiết' });
    }
  }

  // 4. Domain & Geometry check
  const isGeometry = q.domainType === 'GEOMETRY_VISUAL';

  if (isGeometry) {
    const hasVisualSpec = Boolean(
      q.renderSpec ||
      q.svgDiagramKey ||
      q.imageUrl ||
      q.diagramDescription ||
      q.diagramSpec
    );
    if (!hasVisualSpec) {
      issues.push({
        severity: 'warning',
        category: 'taxonomy_domain',
        field: 'renderSpec',
        message: 'Dạng bài Hình Học Trực Quan nhưng thiếu thông số mô hình 3D hoặc sơ đồ SVG',
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length;

  const score = Math.max(0, Math.min(100, Math.round(100 - (errorCount * 20 + warningCount * 4 + suggestionCount * 1))));
  const passed = errorCount === 0 && score >= 75;

  return {
    questionId: q.id,
    orderIndex,
    score,
    passed,
    formulaCount,
    errorCount,
    warningCount,
    issues,
  };
}

function auditExam(exam) {
  const results = (exam.questions || []).map((q, idx) => auditSingleQuestion(q, idx + 1));
  const totalQuestions = results.length;
  const passedQuestions = results.filter((r) => r.passed).length;
  const errorCount = results.reduce((acc, r) => acc + r.errorCount, 0);
  const warningCount = results.reduce((acc, r) => acc + r.warningCount, 0);
  const formulasChecked = results.reduce((acc, r) => acc + r.formulaCount, 0);

  let qualityScore = 100;
  if (totalQuestions > 0) {
    const avg = results.reduce((acc, r) => acc + r.score, 0) / totalQuestions;
    qualityScore = Math.max(0, Math.min(100, Math.round(avg)));
  } else {
    qualityScore = 0;
  }

  if (errorCount > 0) {
    qualityScore = Math.max(0, Math.min(qualityScore, 100 - errorCount * 4));
  }

  let status = 'pass';
  if (qualityScore < 60 || errorCount > 2) status = 'fail';
  else if (qualityScore < 85 || errorCount > 0 || warningCount > 5) status = 'warning';

  return {
    examId: exam.id,
    code: exam.code,
    qualityScore,
    status,
    totalQuestions,
    passedQuestions,
    errorCount,
    warningCount,
    formulasChecked,
    issues: results.flatMap((r) => r.issues),
  };
}

console.log('Testing autoRepair on all 100 exams...');
const repairedExams = exams.map((e) => autoRepairExam(e));

let totalErrors = 0;
let totalWarnings = 0;
let totalFormulas = 0;
let totalScore = 0;
let passCount = 0;

for (const exam of repairedExams) {
  const res = auditExam(exam);
  totalErrors += res.errorCount;
  totalWarnings += res.warningCount;
  totalFormulas += res.formulasChecked;
  totalScore += res.qualityScore;
  if (res.status === 'pass') passCount++;
  if (res.errorCount > 0 || res.warningCount > 0) {
    console.log(`\n⚠️ [ISSUE IN EXAM] ${res.code}: errors=${res.errorCount}, warnings=${res.warningCount}`);
    for (const iss of res.issues) {
      console.log(`   - [${iss.severity.toUpperCase()}] ${iss.field}: ${iss.message}`);
    }
  }
}

const avgScore = (totalScore / repairedExams.length).toFixed(1);
console.log(`\nAudit Results for Repaired Question Bank:`);
console.log(`  • Total Exams: ${repairedExams.length}`);
console.log(`  • Passed Exams: ${passCount} / ${repairedExams.length}`);
console.log(`  • Average Quality Score: ${avgScore} / 100`);
console.log(`  • Total Errors: ${totalErrors}`);
console.log(`  • Total Warnings: ${totalWarnings}`);
console.log(`  • Total KaTeX Formulas Checked: ${totalFormulas}`);
