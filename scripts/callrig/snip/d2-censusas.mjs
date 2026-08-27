const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const W='W4QDF1XTURESO01';
  const EMAIL=process.env.D2_EMAIL;
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1500);
  await p.fill('input[name="email"]', EMAIL);
  await p.fill('input[name="password"]', 'QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6500);
  await p.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await p.waitForTimeout(2400);
  const routes = await p.evaluate(`(() => { const vis=(${VIS});
    return [...new Set([...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>a.getAttribute('href')))]; })()`);
  const census={};
  for (const href of routes) {
    await p.goto('https://airion-cargo.store'+href, { waitUntil:'networkidle' });
    await p.waitForTimeout(1800);
    census[href.split('/settings/')[1]] = await p.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      return [...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio],a[href]')]
        .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
        .map(e=>{ const lab=((e.innerText||'').replace(/\\s+/g,' ').trim()||e.getAttribute('aria-label')||('<'+e.tagName.toLowerCase()+'>'));
          return lab.slice(0,34)+(e.disabled===true||e.getAttribute('aria-disabled')==='true'?' [off]':''); }); })()`);
  }
  await ctx.close();
  return { who:EMAIL, routes:routes.length, census };
};
