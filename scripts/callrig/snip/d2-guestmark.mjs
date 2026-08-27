const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const ROWOF = name => `(() => { const vis = ${VIS};
  const b=[...document.querySelectorAll('button,div,tr,li')].filter(vis).filter(e=>(e.innerText||'').includes(${JSON.stringify(name)}));
  const row=b.sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length).find(e=>(e.innerText||'').trim().length>8);
  return row ? (row.innerText||'').replace(/\\n/g,' | ').slice(0,180) : '(not found)'; })()`;
export default async ({ page }) => {
  const out = {};
  const W = 'W4QDF1XTURESO01';
  // 1. admin members page
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2800);
  out.adminMembersGuestRow = await page.evaluate(ROWOF('QA Guest'));
  out.adminPageMentionsGuest = await page.evaluate(`(() => {
    const t=(document.querySelector('main')||document.body).innerText;
    return { wordGuestCount: (t.match(/guest/gi)||[]).length,
             sample: (t.match(/.{0,40}[Gg]uest.{0,40}/g)||[]).slice(0,4) }; })()`);
  // 2. directory
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2800);
  out.directoryGuestRow = await page.evaluate(ROWOF('QA Guest'));
  // 3. API truth
  out.api = await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r = await fetch(`/api/v1/workspaces/${W}/members?limit=50`, { credentials:'include' });
    const j = await r.json(); const arr = j.members||j.items||j||[];
    return arr.map(m => ({ name: m.name, is_guest: m.is_guest })).slice(0,10);
  });
  return out;
};
