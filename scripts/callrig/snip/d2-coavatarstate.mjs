const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return { images:[...main.querySelectorAll('img')].filter(vis).map(i=>(i.getAttribute('src')||'').slice(0,55)),
      buttons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,8),
      mentionsRemove:/remove|delete/i.test((main.innerText||'')) }; })()`);
  const api = await page.evaluate(async () => {
    const r=await fetch('/api/v1/users/me/companies',{credentials:'include'}); const j=await r.json();
    const a=j.companies||j.items||(Array.isArray(j)?j:[]);
    return a.map(c=>({ name:c.name, avatar:c.avatar_url ?? '(none)' }));
  });
  return { ui, api };
};
