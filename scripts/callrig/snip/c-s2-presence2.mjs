export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  out.presenceHasMe=await page.evaluate(async(ws)=>{
    const me=(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).id;
    const j=await (await fetch(`/api/v1/workspaces/${ws}/presence`,{credentials:'include'})).json();
    const arr=j.presences||j.data||j||[];
    const mine=Array.isArray(arr)? arr.find(p=>p.user_id===me):null;
    return {me, count:Array.isArray(arr)?arr.length:null, mine:mine||'ABSENT from presence list'};}, ws);
  // hunt for any own-presence indicator in the shell: profile row, avatar dot, tooltip
  out.shell=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>2&&r.height>2;};
    const texts=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>({t:(e.textContent||'').trim(), x:Math.round(e.getBoundingClientRect().x)}))
      .filter(e=>/^(Online|Offline|Away|Busy|Active)$/i.test(e.t));
    const titles=[...document.querySelectorAll('[title],[aria-label]')].filter(vis)
      .map(e=>(e.getAttribute('title')||e.getAttribute('aria-label')||''))
      .filter(t=>/online|offline|away|busy/i.test(t)).slice(0,8);
    return {statusTexts:texts.slice(0,10), statusLabels:[...new Set(titles)]};});
  // open own profile from the rail
  const pb=page.locator('button[aria-label="Profile"]').first();
  out.profileBtn=await pb.count();
  if(out.profileBtn){ await pb.click(); await page.waitForTimeout(2500);
    out.profileMenu=await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const w=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(vis)[0];
      return w? (w.innerText||'').replace(/\s+/g,' ').slice(0,180):'none';});
    await page.keyboard.press('Escape');
  }
  return out;
};
