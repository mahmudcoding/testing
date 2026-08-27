export default async ({page}) => {
  const to=process.env.QA_TO||'QA Bob';
  const msg=process.env.QA_MSG||'QA-PRIVATE-MSG';
  const net=[];
  page.on('response', async r=>{ if(r.url().includes('/messages')&&r.request().method()==='POST'){ let b=''; try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.status()} :: ${b}`);} });
  const t=page.locator('[data-testid="call-controls-chat-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  // open the To: selector
  const picked=await page.evaluate((to)=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    if(!p) return 'no panel';
    const b=[...p.querySelectorAll('button')].find(x=>/^To\b|Everyone/.test((x.textContent||'').trim()));
    if(!b) return 'no To button';
    b.click(); return 'opened';
  }, to);
  await page.waitForTimeout(1800);
  const chose=await page.evaluate((to)=>{
    const ms=[...document.querySelectorAll('[role="menu"],[role="listbox"],[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    if(!m) return 'no menu';
    const opts=[...m.querySelectorAll('button,[role="option"],[role="menuitem"]')];
    for (const o of opts){ if((o.textContent||'').includes(to)){ o.click(); return o.textContent.trim().slice(0,30); } }
    return 'not found; options: '+opts.map(o=>(o.textContent||'').trim().slice(0,20)).join(',');
  }, to);
  await page.waitForTimeout(1500);
  const ta=await page.$('[data-testid="in-call-chat-panel"] textarea');
  if(!ta) return {picked, chose, err:'no composer'};
  const ph=await ta.getAttribute('placeholder');
  await ta.fill(msg);
  await page.waitForTimeout(600);
  const btns=await page.$$('[data-testid="in-call-chat-panel"] button');
  let sent=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Send$/i.test(l)){ sent = await b.isDisabled()? 'DISABLED':'clicked'; if(sent==='clicked') await b.click(); break; } }
  await page.waitForTimeout(4000);
  const after=await page.evaluate(()=>{const p=document.querySelector('[data-testid="in-call-chat-panel"]');return p?p.innerText.replace(/\n+/g,' | ').slice(-260):null;});
  return {picked, chose, placeholder: ph, sent, net, panelAfter: after};
};
