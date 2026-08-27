const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const out={};
  out.view = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const main=document.querySelector('main')||document.body;
    return {url:location.href, composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      mainText: main.innerText.replace(/\n+/g,' | ').slice(0,220),
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3)};
  });
  if (out.view.composer) {
    const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.keyboard.type('QA-S2-MUTED-TRY');
    await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
    out.afterSend = await page.evaluate(async (ch)=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
      const j=await r.json();
      return {top:(j.messages||[]).map(m=>m.body).slice(0,3),
        toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,3),
        domHas:/QA-S2-MUTED-TRY/.test(document.body.innerText)};
    }, CH);
  }
  return out;
};
