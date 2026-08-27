export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const tag='QACMD';
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
  await page.waitForTimeout(2000);
  const box=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await box.click(); await page.keyboard.press('End'); await page.keyboard.type(' OK');
  await page.waitForTimeout(700);
  const reqs=[]; const h=r=>{ const p=new URL(r.url()).pathname;
    if(/\/messaging\//.test(p)&&r.method()!=='GET') reqs.push(r.method()+' '+p.slice(-22)); };
  page.on('request',h);
  await page.keyboard.press('Meta+Enter');
  await page.waitForTimeout(5000); page.off('request',h);
  return {reqs, lens:await page.evaluate(async ({ch,tag})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    return a.filter(m=>(m.body||'').includes(tag)).map(m=>(m.body||'').length);}, {ch,tag})};
};
