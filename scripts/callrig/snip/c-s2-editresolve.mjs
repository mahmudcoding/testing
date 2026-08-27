export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const setup=async(tag)=>{
    await page.evaluate(async ({ch,tag})=>{ await fetch('/api/v1/messaging/messages',{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:tag+' base'})}); }, {ch,tag});
    await page.waitForTimeout(2500);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(8500);
    const msg=page.locator('[data-message-id]').filter({hasText:tag}).last();
    await msg.hover(); await page.waitForTimeout(1300);
    await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
    await page.waitForTimeout(1400);
    await page.locator('[role="menuitem"]').filter({hasText:/^Edit/}).first().click();
    await page.waitForTimeout(1800);
    return page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  };
  const check=async(ch,tag)=>await page.evaluate(async ({ch,tag})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    return a.filter(m=>(m.body||'').includes(tag)).map(m=>(m.body||'').length);
  }, {ch,tag});
  const watch=()=>{ const reqs=[]; const h=r=>{ const p=new URL(r.url()).pathname;
    if(/\/messaging\//.test(p)&&r.method()!=='GET') reqs.push(r.method()+' '+p.slice(-28)); };
    page.on('request',h); return {reqs, off:()=>page.off('request',h)}; };

  // A. append a char (no Meta+A) then Enter
  let tag='QARESA'; let box=await setup(tag);
  await box.click(); await page.keyboard.press('End');
  await page.keyboard.type(' XA');
  await page.waitForTimeout(700);
  let w=watch();
  await page.keyboard.press('Enter'); await page.waitForTimeout(5000); w.off();
  out.appendThenEnter={reqs:w.reqs, lens:await check(ch,tag)};

  // B. same, but click the Save changes button
  tag='QARESB'; box=await setup(tag);
  await box.click(); await page.keyboard.press('End');
  await page.keyboard.type(' XB');
  await page.waitForTimeout(700);
  out.saveBtnCount=await page.locator('button[aria-label="Save changes"]').count();
  out.visibleBtns=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('button')].filter(v)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim())
      .filter(t=>/save|cancel|done|отмен/i.test(t)).slice(0,6);});
  w=watch();
  if(out.saveBtnCount){ await page.locator('button[aria-label="Save changes"]').first().click(); }
  await page.waitForTimeout(5000); w.off();
  out.saveButton={reqs:w.reqs, lens:await check(ch,tag)};

  // C. what does the screen promise near the edit box?
  out.hint=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/enter|escape|save|cancel/i.test(t)&&t.length<60).slice(0,6);});
  return out;
};
