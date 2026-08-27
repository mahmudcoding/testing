export default async ({page}) => {
  const tid='meeting-settings-video-quality-slider';
  await page.focus('[data-testid="'+tid+'"]');
  for (let i=0;i<12;i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(120); }
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const t=(p?p.innerText:'').replace(/\s+/g,' '); const i=t.indexOf('MAXIMUM VIDEO QUALITY');
    return t.slice(i,i+60); });
}
