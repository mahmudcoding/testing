export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('thread')||u.includes('/messages')){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const t = page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  const btns = await page.$$('aside button');
  let clicked=null;
  for (const b of btns) { const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^Thread$/i.test(l)||/thread/i.test(l)) { await b.click(); clicked=l; break; } }
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => {
    const panel = [...document.querySelectorAll('aside')].pop() || document.body;
    return {
      testid: panel.getAttribute('data-testid'),
      text: panel.innerText.replace(/\n+/g,' | ').slice(0,600),
      buttons: [...panel.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,36), t:b.getAttribute('data-testid')})),
      composer: (()=>{const ta=panel.querySelector('textarea'); return ta?{ph:ta.getAttribute('placeholder'),dis:ta.disabled}:null;})(),
      allTestids: [...document.querySelectorAll('[data-testid*="thread" i]')].map(e=>e.getAttribute('data-testid'))
    };
  });
  return {clicked, net, panel: st};
};
