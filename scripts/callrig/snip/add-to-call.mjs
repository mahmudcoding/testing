export default async ({page}) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/')&&(u.includes('meeting')||u.includes('invite')||u.includes('call'))){ let b=''; try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.click('[data-testid="call-controls-add-to-call"]');
  await page.waitForTimeout(1800);
  const dump = await page.evaluate(() => {
    const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
    if (!dlg) return {err:'no dialog', panels: [...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/add|invite/i.test(t))};
    return {
      title: (dlg.querySelector('h2')||{}).textContent,
      text: dlg.innerText.replace(/\n+/g,' | ').slice(0,700),
      inputs: [...dlg.querySelectorAll('input,textarea')].map(i=>`${i.type}|${i.placeholder||''}|${i.getAttribute('aria-label')||''}`),
      buttons: [...dlg.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)}#${b.getAttribute('data-testid')||'-'}${b.disabled?' DISABLED':''}`),
      testids: [...new Set([...dlg.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))]
    };
  });
  return {dump, net};
};
