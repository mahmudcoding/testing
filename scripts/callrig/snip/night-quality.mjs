export default async ({page}) => {
  const val=process.env.QA_VAL||'0';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/settings')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} :: ${b}`);}});
  const s=page.locator('[data-testid="call-controls-settings-toggle"]');
  if (await s.getAttribute('aria-pressed')!=='true'){ await s.click(); await page.waitForTimeout(2500); }
  const sl=page.locator('[data-testid="meeting-settings-video-quality-slider"]');
  const before=await sl.inputValue();
  // move with keyboard so React sees the change
  await sl.focus();
  const steps = Number(before) - Number(val);
  for (let i=0;i<Math.abs(steps);i++){ await page.keyboard.press(steps>0?'ArrowLeft':'ArrowRight'); await page.waitForTimeout(300); }
  await page.waitForTimeout(3000);
  const after=await sl.inputValue();
  const label = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    const m=p?p.innerText.match(/MAXIMUM VIDEO QUALITY[\s\S]{0,60}/):null; return m?m[0].replace(/\n+/g,' | '):null;
  });
  return {before, after, label, net};
};
