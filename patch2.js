const fs = require('fs');
const file = 'apps/web/src/features/home/pages/HomePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: Filter shouldn't hide enrolled courses
content = content.replace(
  'const enrolled = filtered.filter((c) => c.enrolled)',
  'const enrolled = open.filter((c) => c.enrolled)'
);

// Fix 2: Unconditionally show progress bar
content = content.replace(
  '{course.enrolled && questCount > 0 && (\n        <div className="course-card-progress-bar">\n          <div className="course-card-progress-fill" style={{ width: `${progressPct}%` }} />\n        </div>\n      )}',
  '<div className="course-card-progress-bar">\n        <div className="course-card-progress-fill" style={{ width: `${progressPct}%` }} />\n      </div>'
);

fs.writeFileSync(file, content);
