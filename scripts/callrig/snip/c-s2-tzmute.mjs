export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTimezoneOverride', {timezoneId:'America/New_York'});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  out.browserTZ = await page.evaluate(()=>({
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    now: new Date().toString().slice(0,33),
    lang: navigator.language, docLang: document.documentElement.lang}));
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  await comp.type('QA-S2-TZ1', {delay:35}); await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  out.feedStamp = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-TZ1/.test(e.innerText||''));
    if(!el) return 'not found';
    const leaf=[...el.querySelectorAll('*')].filter(e=>e.children.length===0)
      .map(e=>(e.textContent||'').trim()).find(t=>/\d{1,2}:\d{2}/.test(t));
    return leaf||'no stamp';
  });
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  await page.locator(sel).first().click(); await page.waitForTimeout(900);
  const pt=await page.evaluate(()=>{const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      if((n.textContent||'').trim()==='For 1 hour'){const r=n.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};}} return null;});
  if(pt){ await page.mouse.click(pt.x,pt.y); await page.waitForTimeout(1600); }
  await page.locator(sel).first().click(); await page.waitForTimeout(1100);
  out.mutePopover = await page.evaluate(()=>{const w=document.querySelector('[data-radix-popper-content-wrapper]');
    return w?(w.innerText||'').replace(/\s+/g,' ').slice(0,60):'none';});
  const un=page.locator('[data-radix-popper-content-wrapper] button').filter({hasText:'Unmute'}).first();
  if(await un.count()){ await un.click(); await page.waitForTimeout(1500); } else await page.keyboard.press('Escape');
  out.restored = await page.evaluate((s)=>(document.querySelector(s)||{}).ariaLabel, sel);
  await cdp.send('Emulation.setTimezoneOverride', {timezoneId:''});
  return out;
};
