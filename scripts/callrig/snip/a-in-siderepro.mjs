export default async ({page}) => {
  // open Side Rooms panel
  await page.click('button[data-testid="call-controls-breakout-rooms"]');
  await page.waitForTimeout(2500);
  await page.click('[data-testid="side-rooms-new"]');
  await page.waitForTimeout(2000);
  await page.fill('[role="dialog"] input[type="text"]', process.env.QA_ROOM||'QA Side C');
  await page.waitForTimeout(400);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].find(x=>/QA Carol/.test(x.textContent||'')); if(b)b.click();});
  await page.waitForTimeout(600);
  const pre = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].map(b=>(b.textContent||'').trim().slice(0,14)+'='+b.getAttribute('aria-checked')));
  await page.click('[data-testid="side-room-create-submit"]');
  await page.waitForTimeout(6000);
  const after = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,400):null;});
  return {pre, after};
};
