export default async ({page}) => {
  const sl=page.locator('[data-testid="main-audio-slider"]');
  if(!await sl.count()) return {err:'no slider'};
  const before=await sl.inputValue();
  await sl.focus();
  const steps=[];
  for (let i=0;i<5;i++){
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    const v=await sl.inputValue();
    const focused=await page.evaluate(()=>{const e=document.activeElement;return e?(e.getAttribute('data-testid')||e.tagName):null;});
    const vol=await page.evaluate(()=>{const a=document.querySelector('audio');return a?a.volume:null;});
    steps.push({press:i+1, value:v, focus:focused, audioVolume:vol});
  }
  return {before, steps};
};
