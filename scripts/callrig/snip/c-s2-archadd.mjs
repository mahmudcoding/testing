export default async ({page}) => {
  const arch='C4OX4NTD8DNF88E';
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${arch}`);
  await page.waitForTimeout(9000);
  const out={};
  // try adding through the API the UI uses, then look at what the UI says
  out.api=await page.evaluate(async({ch,uid})=>{
    const r=await fetch('/api/v1/channels/members/add',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({channel_id:ch, user_id:uid})});
    return {status:r.status, body:(await r.text()).slice(0,170)};},{ch:arch, uid:'U4QCALICE000001'});
  // now the UI path: open members, pick someone, press Add selected, read the message
  const mb=page.locator('main button').filter({hasText:/members/i}).first();
  if(await mb.count()){
    await mb.click(); await page.waitForTimeout(2500);
    const person=page.locator('[role="dialog"] button, aside button').filter({hasText:/QA Bob/}).first();
    out.personFound=await person.count();
    if(out.personFound){
      await person.click(); await page.waitForTimeout(1200);
      const add=page.locator('button').filter({hasText:/^Add selected$/}).first();
      out.addEnabled = await add.count()? !(await add.isDisabled()) : null;
      if(out.addEnabled){ await add.click(); await page.waitForTimeout(4000); }
      out.afterAdd=await page.evaluate(()=>{
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        return {toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,90)))],
          inlineErrors:[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
            .map(e=>(e.textContent||'').trim())
            .filter(t=>/error|failed|could not|archiv|try again/i.test(t)))].slice(0,4)};});
    }
    await page.keyboard.press('Escape');
  }
  return out;
};
