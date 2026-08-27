export default async ({page}) => {
  const inDialog=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?{hasRevokeWord:/revoke|turn off|disable/i.test(m.innerText),
      buttons:[...m.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean),
      linkSection:(m.innerText.match(/Invite link[\s\S]{0,240}/)||[''])[0].replace(/\n+/g,' | ')}:null;
  });
  const wide=await page.evaluate(()=>({
    ariaRevoke:[...document.querySelectorAll('[aria-label*="revoke" i]')].map(e=>e.getAttribute('aria-label')),
    testidRevoke:[...document.querySelectorAll('[data-testid*="revoke" i]')].map(e=>e.getAttribute('data-testid')),
    bodyRevoke:(document.body.innerText.match(/.{0,40}revoke.{0,40}/gi)||[]).slice(0,3)
  }));
  return {addToCallDialog: inDialog, pageWide: wide};
};
