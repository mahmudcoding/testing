const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await page.locator('input[type=file]').first().setInputFiles(
    [`${DIR}/qa-s2-v1.png`,`${DIR}/qa-s2-v2.png`,`${DIR}/qa-s2-v3.png`]);
  await page.waitForTimeout(3000);
  out.pending = await page.evaluate(()=>{
    const t=document.querySelector('form, footer, [class*="composer"]');
    return {names:[...document.querySelectorAll('main *')].filter(e=>e.children.length===0
      && /qa-s2-v\d\.png/.test(e.textContent||'')).map(e=>e.textContent.trim()).slice(0,6)};
  });
  await comp.click();
  await comp.type('QA-S2-GALLERY', {delay:35});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  out.msg = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const el=els.reverse().find(e=>/QA-S2-GALLERY/.test(e.innerText||''));
    if(!el) return 'not rendered';
    const imgs=[...el.querySelectorAll('img')].map(i=>({nw:i.naturalWidth,nh:i.naturalHeight,
      alt:i.alt, w:Math.round(i.getBoundingClientRect().width)}));
    return {id:el.getAttribute('data-message-id'), imgs,
      text:(el.innerText||'').replace(/\s+/g,' ').slice(0,90),
      buttons:[...el.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>0)
        .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,20)).slice(0,12)};
  });
  return out;
};
