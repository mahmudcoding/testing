export default async ({page}) => {
  const b=page.locator('[data-testid="main-audio-mute"]');
  if(!await b.count()) return {err:'no mute button'};
  const before=await page.evaluate(()=>({label:(document.querySelector('[data-testid="main-audio-mute"]')||{}).textContent, vols:[...document.querySelectorAll('audio')].map(a=>({v:a.volume,m:a.muted}))}));
  await b.click(); await page.waitForTimeout(2500);
  const after=await page.evaluate(()=>({label:(document.querySelector('[data-testid="main-audio-mute"]')||{}).textContent, vols:[...document.querySelectorAll('audio')].map(a=>({v:a.volume,m:a.muted}))}));
  await b.click(); await page.waitForTimeout(2500);
  const back=await page.evaluate(()=>({label:(document.querySelector('[data-testid="main-audio-mute"]')||{}).textContent, vols:[...document.querySelectorAll('audio')].map(a=>({v:a.volume,m:a.muted}))}));
  return {before, after, back};
};
