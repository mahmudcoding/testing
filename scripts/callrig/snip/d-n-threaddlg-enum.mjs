export default async ({page}) => {
  const out={};
  // fresh: close any dialog, reopen thread on message index QA_IDX
  const c = page.locator('[role=dialog] button[aria-label="Close"]').last();
  if (await c.count()>0 && await c.isVisible().catch(()=>false)){ const b=await c.boundingBox(); if(b){await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(1200);} }
  const idx = +(process.env.QA_IDX||0);
  // record which parent we clicked
  out.parent = await page.evaluate((i)=>{
    const rows=[...document.querySelectorAll('[data-testid="ic-user-message"]')];
    return rows[i]?(rows[i].innerText||'').replace(/\s+/g,' ').slice(0,120):null;}, idx);
  await page.locator('[data-testid="in-call-chat-panel"] button', {hasText:/^Thread$/}).nth(idx).click();
  await page.waitForTimeout(2500);
  out.dlg = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const d=[...document.querySelectorAll('[role=dialog]')].find(x=>/Message thread/.test(x.innerText||''));
    if(!d) return null;
    const r=d.getBoundingClientRect();
    // FULL innerText, not sliced
    const full=(d.innerText||'').replace(/\s+/g,' ');
    // every visible leaf node in the dialog, complete
    const leaves=[...d.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim());
    const ta=d.querySelector('textarea');
    const send=[...d.querySelectorAll('button')].find(b=>/Send reply/.test(b.innerText||''));
    return {size:Math.round(r.width)+'x'+Math.round(r.height), fullLen:full.length, full,
      leafCount:leaves.length, leaves,
      ta: ta?{ph:ta.placeholder,dis:ta.disabled,title:ta.title||null,desc:ta.getAttribute('aria-describedby'),
              descText: ta.getAttribute('aria-describedby')? (document.getElementById(ta.getAttribute('aria-describedby'))?.innerText||null):null}:null,
      send: send?{dis:send.disabled,title:send.title||null,al:send.getAttribute('aria-label'),desc:send.getAttribute('aria-describedby')}:null,
      titles:[...d.querySelectorAll('[title]')].map(e=>e.getAttribute('title'))};
  });
  return out;
};
