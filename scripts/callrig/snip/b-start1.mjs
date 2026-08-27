export default async ({page}) => {
  const out={};
  const btns = await page.$$('button');
  let clicked=false;
  for (const b of btns) {
    const t = (await b.innerText().catch(()=>'')).trim();
    if (t === 'Start now' && await b.isVisible().catch(()=>false)) { await b.click(); clicked=true; break; }
  }
  out.clickedStartNow = clicked;
  await page.waitForTimeout(2500);
  out.url1 = page.url();
  // capture any dialog
  out.dialog = await page.evaluate(() => {
    const d = document.querySelector('[role=dialog]');
    if (!d) return null;
    return {
      text: d.innerText.slice(0,500),
      buttons: [...d.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).slice(0,20),
      inputs: [...d.querySelectorAll('input,textarea')].map(i=>({t:i.type,ph:i.placeholder,v:String(i.value).slice(0,40),lab:i.getAttribute('aria-label')})).slice(0,10)
    };
  });
  return out;
};
