export default async ({page}) => {
  for (const tid of ['call-controls-add-to-call']){
    const l=page.locator('[data-testid="'+tid+'"]');
    if (await l.count()){ await l.click(); await page.waitForTimeout(2500); }
  }
  const inDialog=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | '), hasRevoke:/revoke|turn off|disable/i.test(m.innerText),
      buttons:[...m.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean)}:null;
  });
  const wide=await page.evaluate(()=>({
    bodyRevoke:(document.body.innerText.match(/.{0,50}revoke.{0,50}/gi)||[]).slice(0,4),
    ariaRevoke:[...document.querySelectorAll('[aria-label*="revoke" i]')].map(e=>e.getAttribute('aria-label')),
    testidRevoke:[...document.querySelectorAll('[data-testid*="revoke" i]')].map(e=>e.getAttribute('data-testid'))
  }));
  return {addToCallDialog: inDialog, pageWide: wide};
};
