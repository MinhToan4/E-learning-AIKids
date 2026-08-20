import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, '../src/features/asmo/data/asmo-sample-exams.ts');
const rawContent = fs.readFileSync(DATA_PATH, 'utf8');
const arrayStart = rawContent.indexOf('= [\n') + 2;
const arrayEnd = rawContent.lastIndexOf(']') + 1;
const exams = JSON.parse(rawContent.substring(arrayStart, arrayEnd));

const warningCounts = {};
const samplesByWarning = {};

for (const exam of exams) {
  for (const [idx, q] of exam.questions.entries()) {
    // 1. explanationSteps
    if (q.explanationSteps && q.explanationSteps.length > 0) {
      if (q.explanationSteps.length < 3) {
        const key = `explanationSteps < 3 (${q.explanationSteps.length})`;
        warningCounts[key] = (warningCounts[key] || 0) + 1;
        if (!samplesByWarning[key]) samplesByWarning[key] = { exam: exam.code, q: q.id, title: q.title, steps: q.explanationSteps };
      }
      q.explanationSteps.forEach((s, sIdx) => {
        if (!s.title || !s.title.trim()) {
          const key = `step[${sIdx}] title empty`;
          warningCounts[key] = (warningCounts[key] || 0) + 1;
        }
        if (!s.description || s.description.trim().length < 5) {
          const key = `step[${sIdx}] description too short`;
          warningCounts[key] = (warningCounts[key] || 0) + 1;
        }
      });
    } else {
      if (!q.explanation || q.explanation.trim().length < 15) {
        const key = 'explanation missing/short';
        warningCounts[key] = (warningCounts[key] || 0) + 1;
      }
    }

    // 2. meeHint
    const hintText = typeof q.meeHint === 'string' ? q.meeHint : q.meeHint?.text;
    if (!hintText || hintText.trim().length === 0) {
      const key = 'meeHint missing';
      warningCounts[key] = (warningCounts[key] || 0) + 1;
    } else if (hintText.trim().length < 15) {
      const key = 'meeHint short (<15 chars)';
      warningCounts[key] = (warningCounts[key] || 0) + 1;
      if (!samplesByWarning[key]) samplesByWarning[key] = { exam: exam.code, q: q.id, hintText };
    } else {
      const directAnsRegex = /(?:chọn ngay|đáp án là|chọn đáp án)\s+[A-E](\.|\s|$)/i;
      if (directAnsRegex.test(hintText)) {
        const key = 'meeHint direct answer';
        warningCounts[key] = (warningCounts[key] || 0) + 1;
        if (!samplesByWarning[key]) samplesByWarning[key] = { exam: exam.code, q: q.id, hintText };
      }
    }

    // 3. Geometry visual check
    const isGeometry =
      q.domainType === 'GEOMETRY_VISUAL' ||
      (q.topicName && (q.topicName.includes('Hình học') || q.topicName.includes('Hình Khối'))) ||
      (q.topicCode && q.topicCode.includes('GEOMETRY'));

    if (isGeometry) {
      const hasVisualSpec = Boolean(
        q.renderSpec ||
        q.svgDiagramKey ||
        q.imageUrl ||
        q.diagramDescription ||
        q.diagramSpec
      );
      if (!hasVisualSpec) {
        const key = 'geometry without visual/renderSpec';
        warningCounts[key] = (warningCounts[key] || 0) + 1;
        if (!samplesByWarning[key]) samplesByWarning[key] = { exam: exam.code, q: q.id, topicCode: q.topicCode, topicName: q.topicName, domainType: q.domainType };
      }
    }

    // 4. Options count check
    if (q.options && q.options.length !== 4 && q.options.length !== 5) {
      const key = `options count !== 4 or 5 (${q.options.length})`;
      warningCounts[key] = (warningCounts[key] || 0) + 1;
    }

    // 5. Points
    if (typeof q.points !== 'number' || q.points <= 0) {
      const key = 'points invalid';
      warningCounts[key] = (warningCounts[key] || 0) + 1;
    }

    // 6. TopicCode / TopicName
    if (!q.topicCode || !q.topicCode.trim()) {
      const key = 'topicCode empty';
      warningCounts[key] = (warningCounts[key] || 0) + 1;
    }
    if (!q.topicName || !q.topicName.trim()) {
      const key = 'topicName empty';
      warningCounts[key] = (warningCounts[key] || 0) + 1;
    }

    // 7. Math checks
    const fieldsToCheck = [q.title, q.text, q.explanation, hintText];
    if (q.options) q.options.forEach(o => fieldsToCheck.push(o.text));
    if (q.explanationSteps) q.explanationSteps.forEach(s => { fieldsToCheck.push(s.title); fieldsToCheck.push(s.description); });
    
    for (const text of fieldsToCheck) {
      if (!text || typeof text !== 'string') continue;
      const mathBlockRegex = /(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g;
      let match;
      while ((match = mathBlockRegex.exec(text)) !== null) {
        const math = (match[1] ?? match[2] ?? '').trim();
        const rawExpMatch = math.match(/\^([0-9]{2,}|[a-zA-Z0-9]{2,})(?![{])/g);
        if (rawExpMatch) {
          const key = `raw exponent: ${rawExpMatch.join(', ')}`;
          warningCounts[key] = (warningCounts[key] || 0) + 1;
        }
        const missingSlashRegex = /(?:^|[^\\a-zA-Z])(sin|cos|tan|cot|sqrt|sum|lim|log|ln)\s*(\(|\{|_|\^|[0-9a-zA-Z])/i;
        const mSlash = math.match(missingSlashRegex);
        if (mSlash && !math.includes('\\' + mSlash[1])) {
          const key = `missing slash on func: ${mSlash[1]}`;
          warningCounts[key] = (warningCounts[key] || 0) + 1;
        }
      }
    }
  }
}

console.log('WARNING COUNTS SUMMARY:');
console.log(JSON.stringify(warningCounts, null, 2));
console.log('\nTOTAL WARNINGS TALLY:', Object.values(warningCounts).reduce((a, b) => a + b, 0));
console.log('\nSAMPLES:');
console.log(JSON.stringify(samplesByWarning, null, 2));
