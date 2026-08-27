const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const ROUTES=['settings/account','settings/profile','settings/privacy','settings/notifications',
  'settings/appearance','settings/sessions','settings/security','settings/company','settings/workspace',
  'settings/roles?scope=company','settings/roles?scope=workspace','settings/admin/company',
  'settings/admin/members','settings/admin/invites','settings/admin/workspaces','settings/about','settings/calls'];
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const console_=[];
  const onMsg = m => { const t=m.text(); if(/warn|error/i.test(m.type())||/Warning|key|aria/i.test(t))
    console_.push({ type:m.type(), text:t.replace(/\s+/g,' ').slice(0,150) }); };
  page.on('console', onMsg);
  const out={ perRoute:{}, reactWarningsSeenAtAll:0 };
  for (const r of ROUTES) {
    console_.length=0;
    await page.goto(`https://airion-cargo.store/w/${W}/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2400);
    const aria = await page.evaluate(`(() => { const vis=(${VIS});
      const nodes=[...document.querySelectorAll('[aria-describedby],[aria-labelledby]')];
      let checked=0, dangling=[];
      for (const n of nodes) {
        for (const attr of ['aria-describedby','aria-labelledby']) {
          const v=n.getAttribute(attr); if(!v) continue;
          for (const id of v.split(/\\s+/).filter(Boolean)) {
            checked++;
            if(!document.getElementById(id)) dangling.push({attr, id:id.slice(0,40),
              on:n.tagName.toLowerCase()+(n.getAttribute('placeholder')?'['+n.getAttribute('placeholder')+']':''),
              vis:vis(n)});
          }
        }
      }
      return { refs:checked, dangling: dangling.slice(0,6), danglingCount:dangling.length }; })()`);
    const dupKey = console_.filter(c=>/same key/i.test(c.text));
    out.perRoute[r] = { ...aria, duplicateKeyWarnings: dupKey.length,
                        sampleWarnings: console_.slice(0,2).map(c=>c.type+': '+c.text.slice(0,90)) };
    out.reactWarningsSeenAtAll += console_.filter(c=>/Warning:/i.test(c.text)).length;
  }
  page.off('console', onMsg);
  return out;
};
