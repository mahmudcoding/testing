export default async ({page}) => {
  const n=Number(process.env.QA_LEN||200);
  const title='S'.repeat(n);
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && r.url().includes('calendar')){ let b=''; try{b=(await r.text()).slice(0,260);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const btns=await page.$$('main button');
  for (const b of btns){ const t=(await b.innerText()).trim(); if(/^Schedule meeting/.test(t)){ await b.click(); break; } }
  await page.waitForTimeout(3000);
  const ms=await page.$$('[role="dialog"]'); const m=ms[ms.length-1];
  const inp=await m.$('input[placeholder="Add title"]');
  if(!inp) return {err:'no title input'};
  await inp.fill(title);
  await page.waitForTimeout(600);
  const typed=await inp.inputValue();
  const sbtns=await m.$$('button');
  let submitted=null;
  for (const b of sbtns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Schedule meeting$/.test(l)){ submitted = await b.isDisabled()? 'DISABLED':'clicked'; if(submitted==='clicked') await b.click(); break; } }
  await page.waitForTimeout(6000);
  const after=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')];
    const m=ms[ms.length-1];
    return {dialogOpen: !!m && /Schedule meeting/.test(m.innerText||''),
      errorText: m? (m.innerText.match(/.{0,80}(too long|error|invalid|maximum|limit).{0,80}/i)||[])[0] : null,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean)};
  });
  return {requested:n, typedLen: typed.length, submitted, net, after};
};
