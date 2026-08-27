export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  // --- BUG-18 checkable parts
  out.v18_get=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,90)};}, ch);
  out.v18_channelObj=await page.evaluate(async({ws,ch})=>{
    const j=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
    const arr=j.channels||j.data||j||[];
    const c=arr.find(x=>x.id===ch);
    return c? Object.keys(c):'absent';}, {ws,ch});
  // --- BUG-22 field limits
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const det=page.locator('button[aria-label="Channel details"]');
  if(await det.count()){ await det.first().click(); await page.waitForTimeout(1400); }
  const about=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await about.count()){ await about.first().click(); await page.waitForTimeout(1200); }
  const ta=page.locator('textarea').first();
  const inp=page.locator('input:visible').first();
  out.v22_attrs={taMaxlength:await ta.evaluate(e=>e.getAttribute('maxlength')),
    inputMaxlength:await inp.evaluate(e=>e.getAttribute('maxlength')),
    ariaDesc:await ta.evaluate(e=>e.getAttribute('aria-describedby'))};
  await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await ta.fill('T'.repeat(257)); await page.waitForTimeout(500);
  out.v22_taLen=await ta.evaluate(e=>e.value.length);
  const resps=[];
  const onResp=async(r)=>{ if(r.url().includes('/api/v1/channels/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
    resps.push({status:r.status(), body:b}); } };
  page.on('response', onResp);
  await page.locator('button').filter({hasText:'Save'}).first().click();
  await page.waitForTimeout(3200);
  page.off('response', onResp);
  out.v22_resp=resps;
  out.v22_notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,60)));
  // restore empty topic
  await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(400);
  const sv=page.locator('button').filter({hasText:'Save'}).first();
  if(!(await sv.evaluate(e=>e.disabled))){ await sv.click(); await page.waitForTimeout(2500); }
  out.v22_restored=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {name:j.name, descLen:(j.description||'').length};}, ch);
  return out;
};
