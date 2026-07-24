const fs = require('fs');
const file = 'apps/web/src/shared/components/layout/AppShell.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update compact WorkspaceSwitcher label
content = content.replace(
  /<option value="current">Cá nhân<\/option>/g,
  '<option value="current">{user?.role === "parent" ? "TK Ba/Mẹ" : "Cá nhân"}</option>'
);

// Update normal WorkspaceSwitcher label
content = content.replace(
  /<option value="current">Tài khoản cá nhân<\/option>/g,
  '<option value="current">{user?.role === "parent" ? "Tài khoản Ba/Mẹ" : "Tài khoản cá nhân"}</option>'
);

// Add WorkspaceSwitcher to CmsShell topbar
content = content.replace(
  /<span className="role-mobile-topbar-label">{roleLabel}<\/span>\n\s*<\/header>/g,
  `<span className="role-mobile-topbar-label flex-1">{roleLabel}</span>\n        <div className="w-[5rem]">\n          <WorkspaceSwitcher compact />\n        </div>\n      </header>`
);

// Add WorkspaceSwitcher to AdultChrome topbar
content = content.replace(
  /<span className="role-mobile-topbar-label">Phụ huynh<\/span>\n\s*<\/header>/g,
  `<span className="role-mobile-topbar-label flex-1">Phụ huynh</span>\n        <div className="w-[5rem]">\n          <WorkspaceSwitcher compact />\n        </div>\n      </header>`
);

fs.writeFileSync(file, content);
