const enumPerms = async (page) => page.evaluate(() => {
  const main = document.querySelector('main')||document.body;
  const boxes = [...main.querySelectorAll('input[type=checkbox],[role=checkbox],[role=switch]')]
    .filter(e => e.getBoundingClientRect().width>0 || e.offsetParent!==null);
  const labelFor = (el) => { let n=el;
    for(let i=0;i<5&&n;i++){ n=n.parentElement;
      if(n&&(n.innerText||'').trim().length>0) return (n.innerText||'').trim().split('\n')[0].slice(0,80);} return ''; };
  const labels = boxes.map(labelFor).filter(Boolean);
  return {count:boxes.length, labels, rawKeys: labels.filter(s=>/^[a-z][a-z_]*(\.[a-z][a-z_]*)+$/.test(s.trim()))};
});

export default async ({page}) => {
  const out = {};
  const ws='W4QDF1XTURESO01';

  for (const scope of ['company','workspace']) {
    await page.goto(`https://airion-cargo.store/w/${ws}/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3000);
    out[scope] = {beforeOpen: await enumPerms(page)};
    // open the Create role form
    const btn = page.locator('main button', {hasText:/^Create role$/}).first();
    if (await btn.count()) {
      await btn.scrollIntoViewIfNeeded().catch(()=>{});
      await btn.click().catch(e=>{out[scope].clickErr=String(e).slice(0,80);});
      await page.waitForTimeout(2000);
      out[scope].afterOpen = await enumPerms(page);
      out[scope].dialogText = await page.evaluate(()=>{
        const d=document.querySelector('[role=dialog]'); return d? (d.innerText||'').slice(0,200):null;});
      // close without creating
      await page.keyboard.press('Escape').catch(()=>{});
      await page.waitForTimeout(800);
    } else out[scope].createBtn='not found';
  }
  return out;
}
