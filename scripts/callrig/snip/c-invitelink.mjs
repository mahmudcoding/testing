export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Add to call"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2500);
  out.dlg = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,350), btns:[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,12),
      inputs:[...d.querySelectorAll('input')].map(i=>({v:String(i.value).slice(0,90), ro:i.readOnly}))}:null;});
  // read the link from input or from the API
  out.link = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    const i=[...d.querySelectorAll('input')].find(x=>/join|http/i.test(String(x.value))); return i?String(i.value):null;});
  if (!out.link) {
    out.linkFromText = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
      const m=(d.innerText||'').match(/https?:\/\/\S+/); return m?m[0]:null;});
  }
  return out;
};
