export default async ({page}) => {
  const sel='[data-testid="meeting-settings-video-quality-slider"]';
  const snap = async (tag) => await page.evaluate((s)=>{
    const el=document.querySelector(s); const a=document.activeElement;
    return {value: el?el.value:null, active: a? (a.tagName+'|'+(a.getAttribute('data-testid')||a.getAttribute('aria-label')||a.className.slice(0,40))) : null};
  }, sel);
  const out=[];
  const sl = await page.$(sel);
  if (!sl) return {err:'no slider'};
  await sl.focus();
  out.push(['after focus', await snap()]);
  for (let i=0;i<4;i++){
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    out.push([`press#${i+1} +200ms`, await snap()]);
    await page.waitForTimeout(1800);
    out.push([`press#${i+1} +2000ms`, await snap()]);
  }
  return out;
};
