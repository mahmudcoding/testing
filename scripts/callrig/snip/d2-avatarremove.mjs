const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const out = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    // everything interactive near the avatar image
    const img=[...main.querySelectorAll('img')].filter(vis)[0];
    let box = img ? img.parentElement : null;
    for (let i=0;i<5&&box;i++){ if (box.querySelectorAll('button').length >= 1) break; box = box.parentElement; }
    const near = box ? [...box.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
      .map(e=>({ t:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,30), dis:e.disabled===true })) : [];
    const allBtns=[...main.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(Boolean);
    const t=(main.innerText||'');
    return { avatarSrc: img?(img.getAttribute('src')||'').slice(0,60):'(no image)',
             controlsNearAvatar: near, removeLike: allBtns.filter(x=>/remove|delete|clear/i.test(x)),
             mentionsRemove: /remove (avatar|photo|image)|delete (avatar|photo|image)/i.test(t) }; })()`);
  // does the API offer a delete?
  out.api = await page.evaluate(async () => {
    const r=[];
    for (const [m,u] of [['DELETE','/api/v1/auth/me/avatar'],['DELETE','/api/v1/users/me/avatar']]) {
      const x=await fetch(u,{method:m,credentials:'include'});
      r.push(m+' '+u+' -> '+x.status);
    }
    return r; });
  return out;
};
