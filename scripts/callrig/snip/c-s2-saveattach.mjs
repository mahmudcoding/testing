export default async ({page}) => {
  const ws='W4QCF1XTURESO01', src='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${src}`);
  await page.waitForTimeout(7000);
  const el=page.locator('main [data-message-id]').filter({hasText:'QA-S2-FWDIMG'}).last();
  out.found=await el.count();
  if(!out.found) return out;
  out.srcId=await el.getAttribute('data-message-id');
  out.srcImgs=await el.evaluate(e=>e.querySelectorAll('img').length);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  const sv=el.locator('button[aria-label="Save"]');
  out.saveBtn=await sv.count();
  if(!out.saveBtn) return out;
  await sv.first().click(); await page.waitForTimeout(2500);
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  const s=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate(()=>{
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>/QA-S2-FWDIMG/.test(x.innerText||''));
      if(!e) return {present:false};
      return {present:true, imgs:e.querySelectorAll('img').length,
        fileBtns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))
          .filter(l=>l&&/Preview|Download|Open q/.test(l)).length,
        text:(e.innerText||'').replace(/\s+/g,' ').slice(0,80)};}));
  }
  out.savedSettled=s.at(-1);
  out.savedEverImg=s.some(x=>x.imgs>0);
  out.api=await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QCSAVED000003/messages?limit=10',{credentials:'include'})).json();
    const ms=j.messages||j.data||j||[];
    const m=ms.find(x=>/FWDIMG/.test((x.forwarded_from&&x.forwarded_from.body)||x.body||''));
    return m? {body:(m.body||'').slice(0,30), files:m.files??null,
      fwdFiles:(m.forwarded_from&&m.forwarded_from.files)||null}:'absent';});
  return out;
};
