export default async ({page}) => {
  const want=process.env.QA_EMOJI_NAME||'Thumbs up';
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('react')){let b='';try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const ms=await page.$$('[role="dialog"],[role="menu"]');
  const m=ms[ms.length-1];
  const btns=await m.$$('button');
  let clicked=null;
  for (const b of btns){ const l=(await b.getAttribute('aria-label'))||''; if(l.toLowerCase().startsWith(want.toLowerCase())){ await b.click(); clicked=l; break; } }
  if(!clicked){
    // fall back: use the search field if present
    return {err:'emoji not found: '+want, sample: (await m.$$('button')).length};
  }
  await page.waitForTimeout(3500);
  const rows=await page.evaluate(()=>[...document.querySelectorAll('[data-testid="ic-user-message"]')].map(r=>r.innerText.replace(/\n+/g,' | ').slice(0,160)));
  return {clicked, net, rows};
};
