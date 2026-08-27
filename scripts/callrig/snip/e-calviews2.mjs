export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const state = () => page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const views=['Day','Week','Month'].map(v=>{
      const b=[...m.querySelectorAll('button')].filter(vis).find(x=>x.innerText.trim()===v);
      return b? {v, pressed:b.getAttribute('aria-pressed'), sel:b.getAttribute('aria-selected'), cls:(b.className||'').slice(0,40)}:{v,missing:true};
    });
    const hdr=m.innerText.split('\n').filter(Boolean)[1]||'';
    // count anything that looks like a rendered event
    const testids={};
    m.querySelectorAll('[data-testid]').forEach(e=>{const k=e.getAttribute('data-testid'); if(/event|chip|meeting/i.test(k)) testids[k]=(testids[k]||0)+1;});
    const titleHits=(m.innerText.match(/QA-E Sync/g)||[]).length;
    return {hdr, views, testids, titleHits, url:location.pathname};
  });
  const out={};
  out.initial = await state();
  await page.locator('main button').filter({hasText:/^Day$/}).first().click();
  await page.waitForTimeout(3000);
  out.afterDay = await state();
  await page.locator('main button').filter({hasText:/^Month$/}).first().click();
  await page.waitForTimeout(3000);
  out.afterMonth = await state();
  return out;
};
