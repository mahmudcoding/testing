const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/roles?scope=company`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const ui = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const nav=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>(a.innerText||'').trim());
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    const body=(i>=0?t.slice(i+1):t).trim();
    const ctl=[...main.querySelectorAll('button,input,select,[role=switch],[role=combobox]')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
    return { rolesInNav:nav.includes('Roles'),
      denied:/do not have permission|Admin access required|not allowed/i.test(body),
      controls:ctl.length, enabled:ctl.filter(e=>!(e.disabled===true||e.getAttribute('aria-disabled')==='true')).length,
      body:body.slice(0,190) }; })()`);
  const api = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,b:t.slice(0,150),j};};
    const get  = await call('GET',  `/api/v1/companies/${CO}/roles`);
    const post = await call('POST', `/api/v1/companies/${CO}/roles`, {name:'D2 verify probe', permissions:[]});
    let del=null;
    if (post.j && post.j.id) del = await call('DELETE', `/api/v1/companies/roles/${post.j.id}`);
    return { get:{s:get.s}, post:{s:post.s,b:post.b}, cleanup:del&&del.s };
  });
  return { ui, api };
};
