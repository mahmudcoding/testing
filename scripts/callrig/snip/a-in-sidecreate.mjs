export default async ({page}) => {
  const NAME=process.env.QA_ROOM||'QA Side A';
  await page.fill('[role="dialog"] input[type="text"]', NAME);
  await page.waitForTimeout(400);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].find(x=>/QA Bob/.test(x.textContent||'')); if(b)b.click();});
  await page.waitForTimeout(600);
  const pre = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].map(b=>(b.textContent||'').trim().slice(0,14)+'='+b.getAttribute('aria-checked')));
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="side-room-create-submit"]'); if(b)b.click();});
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return {url:location.pathname,
      panel: p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,400):null,
      btns: p?[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,26))+(b.getAttribute('data-testid')?' {'+b.getAttribute('data-testid')+'}':'')):[]};
  });
  return {pre, after};
};
