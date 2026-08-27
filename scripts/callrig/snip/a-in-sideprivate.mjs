export default async ({page}) => {
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="side-rooms-new"]'); if(b)b.click();});
  await page.waitForTimeout(2000);
  await page.fill('[role="dialog"] input[type="text"]', process.env.QA_ROOM||'QA Side B');
  await page.waitForTimeout(300);
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="side-room-create-private"]'); if(b)b.click();});
  await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].find(x=>/QA Carol/.test(x.textContent||'')); if(b)b.click();});
  await page.waitForTimeout(500);
  const pre = await page.evaluate(()=>({
    invitees:[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].map(b=>(b.textContent||'').trim().slice(0,14)+'='+b.getAttribute('aria-checked')),
    priv: (document.querySelector('[data-testid="side-room-create-private"]')||{}).getAttribute? document.querySelector('[data-testid="side-room-create-private"]').getAttribute('aria-checked'):null,
    dlg: ((document.querySelector('[role="dialog"]')||{}).innerText||'').replace(/\n+/g,' | ').slice(0,200)}));
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="side-room-create-submit"]'); if(b)b.click();});
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,400):null;
  });
  return {pre, after};
};
