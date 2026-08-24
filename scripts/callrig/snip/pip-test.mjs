export default async ({page}) => {
  const state = async () => await page.evaluate(()=>({
    expanded: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    pipIds: [...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/pip|mini|float|compact/i.test(t)),
    minimizeBtn: !!document.querySelector('[data-testid="call-surface-minimize"]')
  }));
  const out=[];
  out.push(['before', await state()]);
  for (let i=1;i<=3;i++){
    const b = await page.$('[data-testid="call-surface-minimize"]');
    if (!b) { out.push([`click${i}`, 'no minimize button']); break; }
    const box = await b.boundingBox();
    if (!box) { out.push([`click${i}`, 'button has no box']); break; }
    await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
    await page.waitForTimeout(3000);
    out.push([`after click ${i}`, await state()]);
    if (!(await state()).expanded) break;
  }
  return out;
};
