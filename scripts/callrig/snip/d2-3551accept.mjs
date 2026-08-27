const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const TOKEN=process.env.D2_TOKEN;
  const net=[];
  page.on('response', async r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/invite/i.test(u)||r.request().method()==='GET') return;
    let b=''; try{b=(await r.text()).slice(0,120);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,54)} -> ${r.status()} ${b}`); });
  const who = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();return a.email;})()`).catch(()=>null);
  await page.goto('https://airion-cargo.store/invite?token='+encodeURIComponent(TOKEN), { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const b=document.body; const t=(b.innerText||'').replace(/\\s+/g,' ').trim();
    const ctl=[...b.querySelectorAll('button,a[href]')].filter(vis)
      .map(e=>({t:(e.innerText||'').trim().slice(0,26)})).filter(x=>x.t);
    return { text:t.slice(0,220), controls:ctl }; })()`);
  // click an accept/join control if present
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button,a[href]')].filter(vis)
      .filter(x=>/join|accept|принять|войти в workspace/i.test((x.innerText||'')));
    if(!b.length) return 'no accept control'; b[0].click(); return 'clicked: '+(b[0].innerText||'').trim().slice(0,24); })()`);
  await page.waitForTimeout(4000);
  const after = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const a=Array.isArray(j)?j:((j&&(j.workspaces||j.items))||[]);
    return { workspaces:a.map(w=>w.name), url:location.pathname };})()`);
  return { signedInAs:who, ui, clicked, after, inviteRequests:net };
};
