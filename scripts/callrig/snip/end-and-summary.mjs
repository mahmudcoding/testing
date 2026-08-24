export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&/meeting|record|transcript|summary|ai/i.test(u)){let b='';try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')}`);}});
  await page.click('[data-testid="call-controls-end-for-everyone"]');
  await page.waitForTimeout(1200);
  const cf = page.locator('[data-testid="call-end-confirm-submit"]');
  if (await cf.count()) await cf.click();
  await page.waitForTimeout(9000);
  const ui = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop();
    return {text: d? d.innerText.replace(/\n+/g,' | ').slice(0,1200):null,
            buttons: d? [...d.querySelectorAll('button,a')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)}#${b.getAttribute('data-testid')||'-'}${b.tagName==='A'?'|href='+(b.getAttribute('href')||'').slice(0,60):''}`):[],
            testids: d? [...new Set([...d.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,30):[]};
  });
  return {ui, net: [...new Set(net)]};
};
