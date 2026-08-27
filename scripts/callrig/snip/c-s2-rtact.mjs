export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  // pin a message first (so we can unpin and watch)
  const id=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'})).json();
    const ms=j.messages||j.data||j||[];
    return ms.length? ms[0].id:null;}, ch);
  out.msg=id;
  out.pin=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})});
    return r.status;}, {ch,id});
  await page.waitForTimeout(4000);
  // topic change through the UI
  const det=page.locator('button[aria-label="Channel details"]');
  if(await det.count()){ await det.first().click(); await page.waitForTimeout(1400); }
  const about=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await about.count()){ await about.first().click(); await page.waitForTimeout(1200); }
  const ta=page.locator('textarea').first();
  await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await ta.fill('QA-S2-RTTOPIC live'); await page.waitForTimeout(400);
  const sv=page.locator('button').filter({hasText:'Save'}).first();
  if(!(await sv.evaluate(e=>e.disabled))) await sv.click();
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');
  // unpin
  out.unpin=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({pin:false})});
    return r.status;}, {ch,id});
  out.stored=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {name:j.name, desc:j.description};}, ch);
  return out;
};
