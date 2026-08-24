export default async ({page}) => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.click('[data-testid="call-controls-settings-toggle"]');
  await page.waitForTimeout(2000);
  const api = await page.evaluate(async () => (await (await fetch('/api/v1/meeting/V4OTLVMJL42ZGIG/settings',{credentials:'include'})).text()));
  const ui = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="meeting-settings-panel"]')
      || [...document.querySelectorAll('[role="dialog"]')].pop();
    return {
      text: panel ? panel.innerText.replace(/\n+/g,' | ').slice(0,1800) : 'no panel',
      controls: panel ? [...panel.querySelectorAll('button,input,select,[role=switch],[role=radio],[role=tab]')].map(c=>`${c.tagName}:${(c.getAttribute('aria-label')||c.getAttribute('name')||c.textContent||'').trim().slice(0,38)}#${c.getAttribute('data-testid')||'-'}${c.getAttribute('aria-checked')!=null?' ac='+c.getAttribute('aria-checked'):''}${c.type?' t='+c.type:''}` ) : []
    };
  });
  return {api, ui};
};
