export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')){let b='';try{b=(await r.text()).slice(0,260);}catch(e){} if(r.request().method()!=='GET'||r.status()>=400) net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const card = await page.evaluate(() => {
    const m=document.querySelector('main');
    return {liveText: m.innerText.replace(/\n+/g,' | ').slice(0,300),
            lockIcons: [...m.querySelectorAll('svg,img')].map(e=>e.getAttribute('aria-label')||e.getAttribute('data-testid')||'').filter(Boolean).slice(0,15)};
  });
  const btn = page.locator('main button', {hasText: /^Join$/}).first();
  if (!(await btn.count())) return {err:'no join', card};
  await btn.click();
  await page.waitForTimeout(4000);
  const prompt = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return {url: location.href,
      dialog: dlg? dlg.innerText.replace(/\n+/g,' | ').slice(0,500):null,
      inputs: dlg? [...dlg.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}|${i.getAttribute('aria-label')||''}`):[],
      testids: dlg? [...new Set([...dlg.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,25):[],
      body: document.body.innerText.replace(/\n+/g,' | ').slice(0,400)};
  });
  return {card, prompt, net};
};
