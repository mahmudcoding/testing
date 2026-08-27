export default async ({page}) => {
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/d/C4OUWJID5OCFYYO',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>{const r=x.getBoundingClientRect();
      return r.width>0&&r.y<130&&/^profile$/i.test((x.getAttribute('aria-label')||'').trim());});
    if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(3000);
  const card = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,130),
      btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22))};
  });
  const clicked = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0];
    if(!d) return null;
    const b=[...d.querySelectorAll('button')].find(x=>/^block$/i.test((x.innerText||'').trim()));
    if(!b) return null; b.click(); return 'Block';});
  await page.waitForTimeout(2500);
  const confirm = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0);
    const d=ds[ds.length-1]; if(!d) return null;
    const t=(d.innerText||'').replace(/\s+/g,' ').slice(0,160);
    const b=[...d.querySelectorAll('button')].find(x=>/^(block|confirm|yes)$/i.test((x.innerText||'').trim()));
    if(b) b.click(); return {text:t, confirmed:!!b};});
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>({
    composer:!!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
    main:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,200)}));
  return {opened, card, clicked, confirm, after};
};
