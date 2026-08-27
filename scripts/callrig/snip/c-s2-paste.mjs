const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const doPaste=async(text)=>{
    await comp.click();
    return page.evaluate((t)=>{
      const el=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
      el.focus();
      const dt=new DataTransfer(); dt.setData('text/plain', t);
      const ev=new ClipboardEvent('paste',{clipboardData:dt, bubbles:true, cancelable:true});
      const delivered=el.dispatchEvent(ev);
      return {dispatched:true, defaultPrevented:ev.defaultPrevented, delivered};
    }, text);
  };
  // 1. sanity: does synthetic paste reach the editor at all?
  out.clear1=await empty(page, comp);
  out.ev1=await doPaste('QA-S2-PASTE-SANITY');
  await page.waitForTimeout(1200);
  out.after1=await comp.evaluate(e=>e.innerText.slice(0,60));

  if (out.after1.includes('QA-S2-PASTE-SANITY')) {
    // 2. multi-line paste
    out.clear2=await empty(page, comp);
    await doPaste('QA-S2-PASTE-ML line1\nline2\nline3');
    await page.waitForTimeout(1200);
    out.multiline=await comp.evaluate(e=>e.innerText.replace(/\n/g,'\\n').slice(0,70));
    // 3. long paste
    out.clear3=await empty(page, comp);
    const big='QA-S2-PASTE-BIG '+'x'.repeat(20000);
    await doPaste(big);
    await page.waitForTimeout(2500);
    out.longPaste=await page.evaluate(()=>{
      const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
      const notices=[...document.querySelectorAll('[role="status"],[role="alert"]')]
        .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
        .map(e=>e.textContent.trim().slice(0,70));
      const send=document.querySelector('button[aria-label="Send"]');
      return {len:c.innerText.length, head:c.innerText.slice(0,24), notices,
        sendDisabled: send? send.disabled:'none',
        attachRows:[...document.querySelectorAll('*')].filter(e=>e.children.length===0
          && /\.txt|Attach|file/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,30)).slice(0,4)};
    });
    await empty(page, comp);
  }
  return out;
};
