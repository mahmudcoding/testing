export default async ({page}) => {
  const msg = process.env.QA_MSG || 'QA-THREAD-REPLY';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('thread')||u.includes('/messages')){let b='';try{b=(await r.text()).slice(0,350);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const dlgs = await page.$$('[role="dialog"]');
  const d = dlgs[dlgs.length-1];
  const ta = await d.$('textarea');
  if (!ta) return {err:'no thread composer', txt: await d.evaluate(e=>e.innerText.slice(0,200))};
  await ta.fill(msg);
  await page.waitForTimeout(600);
  const btns = await d.$$('button');
  let clicked=null;
  for (const b of btns) { const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/send reply/i.test(l)) { if (await b.isDisabled()) clicked='DISABLED'; else { await b.click(); clicked=l; } break; } }
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{
    const dl=[...document.querySelectorAll('[role="dialog"]')].pop();
    const chat=document.querySelector('[data-testid="in-call-chat-panel"]');
    return {threadText: dl?dl.innerText.replace(/\n+/g,' | ').slice(0,400):null,
            chatText: chat?chat.innerText.replace(/\n+/g,' | ').slice(0,400):null};
  });
  return {typed:msg, clicked, net, after};
};
