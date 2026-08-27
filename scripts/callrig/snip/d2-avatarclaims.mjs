const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const all=[...main.querySelectorAll('button,a[href],input,[role=button]')].filter(vis)
      .map(e=>({ t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
                 aria:(e.getAttribute('aria-label')||'').slice(0,28), type:e.type||'' }));
    return { controls: all,
             anyRemoveControl: all.some(c=>/remove|delete|убрать|clear/i.test(c.t+' '+c.aria)) }; })()`);
  const api = await page.evaluate(`(async()=>{
    const CO='O4QDF1XTURESO01';
    const d=await fetch('/api/v1/companies/'+CO+'/avatar',{method:'DELETE',credentials:'include'});
    const dt=(await d.text()).slice(0,120);
    const u=await fetch('/api/v1/users/me/avatar',{method:'OPTIONS',credentials:'include'}).catch(()=>null);
    return { companyAvatarDelete:{status:d.status, body:dt} };})()`);
  return { ui, api };
};
