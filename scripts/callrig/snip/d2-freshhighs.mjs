const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1500);
  await p.fill('input[name="email"]', 'qa.d.bob@aloqa.test');
  await p.fill('input[name="password"]', 'QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6500);
  const who = await p.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  const look = async path => { await p.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, {waitUntil:'networkidle'});
    await p.waitForTimeout(2500);
    return p.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
      const body=(i>=0?t.slice(i+1):t).trim();
      const ctl=[...main.querySelectorAll('button,input,select,[role=combobox]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings');
      return { denied:/do not have permission|Admin access required/i.test(body),
        total:ctl.length, enabled:ctl.filter(e=>!(e.disabled===true||e.getAttribute('aria-disabled')==='true')).length,
        labels:ctl.map(e=>(((e.innerText||'').trim()||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'?').slice(0,24))+(e.disabled||e.getAttribute('aria-disabled')==='true'?'[off]':'')).slice(0,12),
        head:body.slice(0,110) }; })()`); };
  const invites = await look('admin/invites');
  const roles   = await look('roles?scope=company');
  const api = await p.evaluate(async () => {
    const CO='O4QDF1XTURESO01', W='W4QDF1XTURESO01';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j};};
    const inv=await call('POST','/api/v1/workspaces/invites',{workspace_id:W, role_ids:[], max_uses:1});
    if (inv.j&&inv.j.id) await call('POST',`/api/v1/workspaces/invites/${inv.j.id}/revoke`);
    const rget=await call('GET',`/api/v1/companies/${CO}/roles`);
    const rpost=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2B freshprobe',permissions:[]});
    return { invitePost:inv.s, roleGet:rget.s, rolePost:rpost.s, createdId:rpost.j&&rpost.j.id };
  });
  await ctx.close();
  return { who, invites, roles, api };
};
