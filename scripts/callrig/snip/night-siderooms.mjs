export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]');
  if (await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(()=>{
    const panel=[...document.querySelectorAll('aside')].filter(a=>/side room/i.test(a.innerText)).pop()
      || [...document.querySelectorAll('aside')].pop();
    return {testid: panel&&panel.getAttribute('data-testid'),
      text: panel?panel.innerText.replace(/\n+/g,' | ').slice(0,600):null,
      buttons: panel?[...panel.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40), t:b.getAttribute('data-testid')})):[],
      allSideTestids: [...document.querySelectorAll('[data-testid*="breakout" i],[data-testid*="side" i],[data-testid*="room" i]')].map(e=>e.getAttribute('data-testid')).slice(0,25)};
  });
};
