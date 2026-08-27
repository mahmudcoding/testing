const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(async () => {
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); const u=j.user||j;
    const m=await (await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members?limit=50',{credentials:'include'})).json();
    const a=(m.members||m.items||[]).find(x=>x.user_id==='U4QDALICE000001')||{};
    const main=document.querySelector('main')||document.body;
    const imgs=[...main.querySelectorAll('img')].map(i=>(i.getAttribute('src')||'').slice(0,60));
    return { authMeAvatar: u.avatar_url ?? '(field absent)', memberRowAvatar: a.avatar_url ?? '(field absent)',
             imagesOnPage: imgs, initialsShown: /(^|\s)QA(\s|$)/.test((main.innerText||'').slice(0,200)) };
  });
};
