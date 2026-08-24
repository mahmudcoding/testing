export default async ({page}) => {
  const state = async () => await page.evaluate(()=>({
    expanded: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    pip: [...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/^pip|draggable-pip/.test(t))
  }));
  const out=[];
  // open a side panel first (the suspected repro condition)
  const p = await page.$('[data-testid="call-controls-people-toggle"]');
  if (p) { await p.click(); await page.waitForTimeout(2500); }
  out.push(['panel open', await state()]);
  for (let i=1;i<=3;i++){
    const b = await page.$('[data-testid="call-surface-minimize"]');
    if (!b) { out.push([`click${i}`,'no button']); break; }
    const box = await b.boundingBox();
    if (!box) { out.push([`click${i}`,'no box']); break; }
    await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
    await page.waitForTimeout(3000);
    const st = await state();
    out.push([`after click ${i}`, st]);
    if (!st.expanded) break;
  }
  return out;
};
