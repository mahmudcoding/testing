const MIC = `async () => {
  const pcs = window.__pcs || []; const o=[];
  for (const pc of pcs) for (const s of pc.getSenders()) {
    if (!s.track || s.track.kind!=='audio') continue;
    o.push(s.track.enabled);
  } return o;
}`;
export default async ({page}) => {
  const out={};
  await page.mouse.move(700,500); await page.waitForTimeout(600);
  await page.evaluate(()=>{ const el=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    if (el.focus) el.focus(); });
  out.before = await page.evaluate('('+MIC+')()');
  await page.keyboard.down('Space');
  const held=[];
  for (let i=0;i<5;i++){ await page.waitForTimeout(500); held.push(await page.evaluate('('+MIC+')()')); }
  out.held = held;
  await page.keyboard.up('Space');
  const after=[];
  for (let i=0;i<4;i++){ await page.waitForTimeout(500); after.push(await page.evaluate('('+MIC+')()')); }
  out.after = after;
  return out;
};
