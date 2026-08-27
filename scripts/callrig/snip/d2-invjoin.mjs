// Open an invite URL and report what happens, then read the resulting roles.
export default async ({page}) => {
  const url = process.env.QA_INVURL;
  const out={};
  out.before = await page.evaluate(async()=>{
    const w=await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json().catch(()=>({}));
    return (w.workspaces||[]).map(x=>x.id+'/'+x.name);
  }).catch(()=>null);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET'||u.pathname.startsWith('/api/v1/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.reqs=reqs.filter(r=>/invite|workspace/i.test(r)); page.off('response', on);
  out.url = page.url();
  out.screen = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    return {heads:[...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().slice(0,50)),
      ctrls:[...document.querySelectorAll('button,a')].filter(vis).map(b=>((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,10),
      txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,300)};
  });
  out.after = await page.evaluate(async()=>{
    const w=await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json().catch(()=>({}));
    const r=await (await fetch('/api/v1/users/me/roles?company_id=O4QDF1XTURESO01',{credentials:'include'})).json().catch(()=>({}));
    return {workspaces:(w.workspaces||[]).map(x=>x.id+'/'+x.name),
            roles:(r.roles||[]).map(x=>x.scope_type+':'+x.name)};
  });
  return out;
};
