export default async ({page}) => {
  const netlog=[];
  page.on('request', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET') netlog.push(`${r.method()} ${u.replace('https://airion-cargo.store','')} :: ${(r.postData()||'').slice(0,180)}`);});
  const t = await page.$('button[aria-label="Call chat"]');
  if (t && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(2500); }
  // open the "To" recipient selector
  const to = await page.$('[data-testid="in-call-chat-panel"] button:has-text("Everyone")') || (await page.$$('[data-testid="in-call-chat-panel"] button')).find(async b=>/To/.test(await b.innerText()));
  const btns = await page.$$('[data-testid="in-call-chat-panel"] button');
  let opened=false;
  for (const b of btns) { const txt=(await b.innerText()).trim(); if (/Everyone/i.test(txt)) { await b.click(); opened=true; break; } }
  await page.waitForTimeout(2000);
  const menu = await page.evaluate(()=>{const m=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')].pop();
    return m? {text:m.innerText.replace(/\n+/g,' | ').slice(0,300), items:[...m.querySelectorAll('button,[role="option"],[role="menuitem"]')].map(b=>(b.textContent||'').trim().slice(0,30)).filter(Boolean)}:'no menu';});
  return {opened, menu, net: netlog};
};
