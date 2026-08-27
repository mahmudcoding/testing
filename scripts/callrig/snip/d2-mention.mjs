// Post a real mention through the composer (Lexical), so it is a mention entity
// rather than literal text.
export default async ({page}) => {
  const ch=process.env.QA_CH, who=process.env.QA_WHO||'qa_d_alice';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/c/'+ch,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  out.composer = await comp.count();
  if(!out.composer) return out;
  await comp.first().click();
  await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.keyboard.type('QA-D2 mention probe ');
  await page.keyboard.type('@'+who.slice(0,8));
  await page.waitForTimeout(2500);
  out.suggestionsOpen = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const p=[...document.querySelectorAll('[role=listbox],[role=menu],[data-radix-popper-content-wrapper]')].filter(vis);
    return p.map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,120));
  });
  // accept the first suggestion if the picker is open
  if (out.suggestionsOpen.length) { await page.keyboard.press('Enter'); await page.waitForTimeout(800); }
  out.beforeSend = await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {text:(c.innerText||'').trim().slice(0,80), mentionNodes:c.querySelectorAll('[data-lexical-mention],[data-mention]').length};
  });
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(r.request().method()==='POST'&&u.pathname.includes('messag')) reqs.push(u.pathname+' -> '+r.status());}catch{}};
  page.on('response', on);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);
  page.off('response', on);
  out.sendReqs=reqs;
  return out;
};
