const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  try{ await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); }catch(e){}
  out.build = await page.evaluate(async()=>{
    const t=await (await fetch('/',{credentials:'include'})).text();
    const m=t.match(/data-dpl-id="([^"]*)"/); return m? m[1]:'absent';
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('@qa_c_bob', {delay:50}); await page.waitForTimeout(1200);
  const o=page.locator('[role="option"]').filter({hasText:'qa_c_bob'});
  if(await o.count()) await o.first().click();
  await page.waitForTimeout(700);
  await comp.type('QA-S2-V15', {delay:30}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-V15'}).last();
  out.onScreen = await el.evaluate(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60));
  await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL')).catch(()=>{});
  await el.hover(); await page.waitForTimeout(500);
  await el.locator('button[aria-label="Copy text"]').first().click();
  await page.waitForTimeout(1500);
  out.clipboard = await page.evaluate(async()=>{ try{ return (await navigator.clipboard.readText()).slice(0,60);}catch(e){return 'ERR';} });
  out.stored = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=4`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>/V15/.test(x.body||''));
    return m? m.body.slice(0,50):'absent';}, ch);
  return out;
};
