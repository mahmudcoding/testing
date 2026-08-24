export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // click the live-call join button on the hub (last button in the live card row)
  const btns = await page.evaluate(()=>[...document.querySelectorAll('main button')].map((b,i)=>({i,t:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)})));
  const hub = await page.$$('main button');
  // find button whose text is short and inside the Live now card
  let idx = btns.findIndex(b=>/Присоедин|Войти|Join/i.test(b.t));
  if (idx<0) return {err:'no join on hub', btns};
  await hub[idx].click();
  await page.waitForTimeout(5000);
  const pre = await page.evaluate(()=>({url:location.href, text: document.body.innerText.replace(/\n+/g,' | ').slice(0,400),
    btns:[...document.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,25)}#${b.getAttribute('data-testid')||'-'}`).slice(-12)}));
  // now click prejoin join
  const all = await page.$$('button');
  const labels = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  let j = labels.findIndex(t=>/^(Присоединиться|Войти|Join)$/i.test(t));
  if (j>=0) { await all[j].click(); await page.waitForTimeout(9000); }
  const after = await page.evaluate(()=>({overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'), text: document.body.innerText.replace(/\n+/g,' | ').slice(0,250)}));
  return {pre, joinedLabel: j>=0?labels[j]:null, after};
};
