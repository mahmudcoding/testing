export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  const before=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    return (await r.json()).messages[0].channel_seq;}, ch);
  out.seqBefore=before;
  const rec=page.locator('button[aria-label="Record voice message"]').first();
  out.recordButton=await rec.count();
  if(!out.recordButton) return out;
  await rec.click();
  await page.waitForTimeout(3000);
  out.whileRecording=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    let box=c; for(let i=0;i<5&&box&&box.parentElement;i++) box=box.parentElement;
    return {controls:[...(box||document).querySelectorAll('button,[role="button"]')].filter(v)
      .map(b=>b.getAttribute('aria-label')||(b.innerText||'').trim().slice(0,18)).filter(Boolean).slice(0,10),
      timerish:[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
        .map(e=>(e.textContent||'').trim()).filter(t=>/^\d+:\d\d$/.test(t)).slice(0,3),
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60)))]};});
  await page.waitForTimeout(4000);
  // find whatever stops/sends the recording
  const stop=page.locator('button[aria-label*="Stop"], button[aria-label*="stop"], button[aria-label="Send"]').first();
  out.stopFound=await stop.count();
  if(out.stopFound){ out.stopLabel=await stop.getAttribute('aria-label'); await stop.click(); await page.waitForTimeout(3000); }
  out.afterStop=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    let box=c; for(let i=0;i<5&&box&&box.parentElement;i++) box=box.parentElement;
    return {controls:[...(box||document).querySelectorAll('button,[role="button"]')].filter(v)
      .map(b=>b.getAttribute('aria-label')||(b.innerText||'').trim().slice(0,18)).filter(Boolean).slice(0,10)};});
  const send=page.locator('button[aria-label="Send"]').first();
  if(await send.count() && !(await send.isDisabled())){ await send.click(); await page.waitForTimeout(10000); }
  out.after=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
    const arr=(await r.json()).messages||[];
    const m=arr[0];
    const e=document.querySelector(`main [data-message-id="${m.id}"]`);
    return {newestSeq:m.channel_seq, body:(m.body||'').slice(0,20), files:(m.files||[]).length,
      audioTags:e?e.querySelectorAll('audio').length:null,
      canvases:e?e.querySelectorAll('canvas,svg').length:null,
      btns:e?[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,5):null};}, ch);
  out.sent = out.after.newestSeq>before;
  return out;
};
