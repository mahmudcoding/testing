export default async ({page}) => {
  const out={};
  const search=page.locator('input[placeholder="Search emoji"]').first();
  out.searchPresent=await search.count();
  if(!out.searchPresent) return out;
  await search.fill('rocket');
  await page.waitForTimeout(2500);
  out.afterSearch=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
    if(!d) return 'gone';
    return {buttons:d.querySelectorAll('button').length,
      text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)};});
  // click the first emoji result
  const first=page.locator('[role="dialog"] button, [data-radix-popper-content-wrapper] button').filter({hasText:'🚀'}).first();
  out.rocketFound=await first.count();
  if(out.rocketFound){ await first.click({timeout:6000}).catch(()=>{out.clickFail=true}); }
  await page.waitForTimeout(2500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  out.composerAfterInsert=await comp.evaluate(e=>e.innerText.trim().slice(0,20));
  // type a tag and send
  await comp.click();
  await page.keyboard.type(' QA-EMOJI-x1');
  await page.waitForTimeout(800);
  out.composerBeforeSend=await comp.evaluate(e=>e.innerText.trim().slice(0,30));
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{out.sendFail=true});
  await page.waitForTimeout(5000);
  out.stored=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=3',{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    const hit=m.find(x=>(x.body||'').includes('QA-EMOJI'));
    return hit?{body:hit.body, id:hit.id.slice(-5)}:{none:m.map(x=>(x.body||'').slice(0,20))};});
  out.rendered=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.reverse().find(e=>(e.innerText||'').includes('QA-EMOJI'));
    return hit?(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-30):'not rendered';});
  return out;
};
