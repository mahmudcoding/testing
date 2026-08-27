const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/sessions', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const api = await page.evaluate(async () => {
    for (const u of ['/api/v1/security/sessions','/api/v1/auth/sessions','/api/v1/users/me/sessions']) {
      const r=await fetch(u,{credentials:'include'});
      if (r.status===200) { const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}
        const arr=Array.isArray(j)?j:(j&&(j.sessions||j.items))||[];
        return { endpoint:u, count:arr.length,
                 rows:arr.map(x=>({ current:x.is_current??x.current, ip:x.ip_address||x.ip, ua:(x.user_agent||'').slice(0,34) })) }; }
    }
    return '(no sessions endpoint answered 200)';
  });
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    const items=[...main.querySelectorAll('button,a')].filter(vis)
      .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
      .map(e=>({ t:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,40), dis:e.disabled===true }));
    const txt=(main.innerText||''); const i=txt.lastIndexOf('\\u203a');
    return { controls: items, content:(i>=0?txt.slice(i+1):txt).replace(/\\n+/g,' | ').trim().slice(0,300) }; })()`);
  return { sessionsApi: api, ui };
};
