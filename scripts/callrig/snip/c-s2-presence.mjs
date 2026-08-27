export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  out.me=await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return {id:j.id, email:j.email, name:j.name||j.display_name||null};});
  out.presenceApi=await page.evaluate(async(ws)=>{
    const j=await (await fetch(`/api/v1/workspaces/${ws}/presence`,{credentials:'include'})).json();
    const arr=j.presences||j.data||j||[];
    return Array.isArray(arr)? arr.map(p=>({user_id:p.user_id, online:p.online, status:p.status})):j;}, ws);
  // 1. sidebar own status
  out.sidebar=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const nodes=[...document.querySelectorAll('nav *, aside *, header *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/online|offline|away|busy/i.test(t)&&t.length<24);
    return [...new Set(nodes)];});
  // 2. members modal
  const mb=page.locator('button[aria-label*="members"], button').filter({hasText:/members/i}).first();
  out.membersBtn=await mb.count();
  if(out.membersBtn){ await mb.click(); await page.waitForTimeout(2500);
    out.modal=await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>40);
      if(!d) return 'no dialog';
      const rows=[...d.querySelectorAll('*')].filter(e=>/Status:/.test(e.textContent||'')&&e.children.length===0)
        .map(e=>(e.textContent||'').trim());
      return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,240), statuses:[...new Set(rows)].slice(0,10)};});
    await page.keyboard.press('Escape');
  }
  return out;
};
