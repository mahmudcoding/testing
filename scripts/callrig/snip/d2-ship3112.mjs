const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
// ALK-3112: Company dashboard opened without admin rights showed a generic
// "Company unavailable / Something went wrong / Retry" instead of a refusal.
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  const onResp = r => { if(/\/api\//.test(r.url()))
    net.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,58)} -> ${r.status()}`); };
  page.on('response', onResp);
  const out={};
  out.myRoles = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/users/me/roles',{credentials:'include'});
    const j=await r.json().catch(()=>null); return JSON.stringify(j).slice(0,300);})()`);
  for (const route of ['settings/admin/company','settings/admin/members','settings/admin/invites']) {
    net.length=0;
    await page.goto(`https://airion-cargo.store/w/${W}/${route}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(3000);
    out[route] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const i=t.lastIndexOf('›');
      const body=(i>=0?t.slice(i+1):t).trim();
      const ctl=[...main.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=button]')]
        .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
                  dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'}));
      return { text: body.slice(0,300),
               refusal: /Admin access required/i.test(body),
               genericError: /Something went wrong|unavailable|Try again/i.test(body),
               retryButton: ctl.some(c=>/^Retry$/i.test(c.t)),
               controls: ctl.length, enabled: ctl.filter(c=>!c.dis).length }; })()`);
    out[route].apiCalls = [...net].filter(x=>!/realtime|ws-ticket/.test(x)).slice(0,6);
  }
  page.off('response', onResp);
  return out;
};
