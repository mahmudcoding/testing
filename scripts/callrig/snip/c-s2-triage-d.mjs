export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  // ── ALK-3001: creating a channel with a name that already exists
  const add=page.locator('button[aria-label="Add channel"]').first();
  out.addBtn=await add.count();
  if(out.addBtn){
    await add.click(); await page.waitForTimeout(2500);
    const inp=page.locator('[role="dialog"] input:visible').first();
    out.dialogOpened=await inp.count();
    if(out.dialogOpened){
      await inp.fill('qa-general');           // an existing channel name
      await page.waitForTimeout(1200);
      const create=page.locator('[role="dialog"] button').filter({hasText:/^(Create|Create channel)$/}).first();
      out.createEnabled=await create.count()? !(await create.isDisabled()) : null;
      if(out.createEnabled){ await create.click(); await page.waitForTimeout(4000); }
      out.afterCreate=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
        const inp=d?d.querySelector('input'):null;
        const cs=inp?getComputedStyle(inp):null;
        return {dialogStillOpen:!!d,
          fieldBorder:cs?cs.borderColor:null, fieldAria:inp?inp.getAttribute('aria-invalid'):null,
          toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
            .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,90)))],
          dialogText:d?(d.innerText||'').replace(/\s+/g,' ').slice(0,140):null};});
      await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    }
  }
  // ── ALK-2995: the last member leaves a private channel
  out.mkPrivate=await page.evaluate(async(ws)=>{
    const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name:'qa-c2-lastleave', workspace_id:ws, type:'private',
        description:'throwaway: last member leave'})});
    const t=await r.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
    return {status:r.status, id:j.id||j.channel_id, body:t.slice(0,110)};}, ws);
  if(out.mkPrivate.id){
    await page.waitForTimeout(3000);
    out.leave=await page.evaluate(async(ch)=>{
      const r=await fetch(`/api/v1/channels/${ch}/leave`,{method:'POST',credentials:'include'});
      return {status:r.status, body:(await r.text()).slice(0,170)};}, out.mkPrivate.id);
    // and the UI path
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${out.mkPrivate.id}`);
    await page.waitForTimeout(8000);
    out.uiAfterLeaveAttempt=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=document.querySelector('main');
      return {head:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,80),
        toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,80)))]};});
  }
  return out;
};
