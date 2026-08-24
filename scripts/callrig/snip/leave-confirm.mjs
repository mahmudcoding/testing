export default async ({page}) => {
  for (const lbl of ['Close participants','Close chat','Close Side Rooms panel']) {
    const c = await page.$(`button[aria-label="${lbl}"]`); if (c) { await c.click().catch(()=>{}); await page.waitForTimeout(600); }
  }
  const b = await page.$('[data-testid="call-controls-leave"]');
  if (!b) return {none:true};
  const box = await b.boundingBox();
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(2500);
  const dlgs = await page.$$('[role="dialog"],[role="alertdialog"]');
  const m = dlgs[dlgs.length-1];
  if (m) { for (const x of await m.$$('button')) { const t=(await x.innerText()).trim(); if (/^(Leave|Покинуть)$/i.test(t)) { await x.click(); break; } } }
  await page.waitForTimeout(5000);
  return await page.evaluate(async()=>{const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    return {stillIn: !!(c&&c.meeting), overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]')};});
};
