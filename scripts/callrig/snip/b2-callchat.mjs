export default async ({page}) => {
  const MSG = process.env.QA_MSG || 'hello from the call';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  // open chat panel if closed
  await page.evaluate((v)=>{ const vis=eval(v);
    const open=document.querySelector('[data-testid*="in-call-chat"],[data-testid*="chat-panel"]');
    if(open && vis(open)) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='call-controls-chat-toggle');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3000);
  // find composer, clear it, type, send
  const composer = await page.$('div[contenteditable="true"]');
  const res = {found: !!composer};
  if (composer) {
    await composer.click();
    await page.keyboard.down('Meta'); await page.keyboard.press('a'); await page.keyboard.up('Meta');
    await page.keyboard.press('Backspace');
    await composer.type(MSG, {delay: 20});
    await page.waitForTimeout(400);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3500);
  }
  res.panel = await page.evaluate((v)=>{ const vis=eval(v);
    const p=[...document.querySelectorAll('[data-testid]')].filter(e=>vis(e) && /chat/i.test(e.getAttribute('data-testid')||'')).pop();
    return p?{tid:p.getAttribute('data-testid'), txt:(p.innerText||'').replace(/\n+/g,' | ').slice(0,400)}:null; }, V);
  return res;
};
