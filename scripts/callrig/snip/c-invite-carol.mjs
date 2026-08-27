export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{ if(/invite/.test(r.url())){ let b=''; try{b=(await r.text()).slice(0,150);}catch(e){} net.push({m:r.request().method(), s:r.status(), b}); }});
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Add to call"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2500);
  out.rows = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop(); if(!d) return null;
    return [...d.querySelectorAll('li,label')].map(e=>(e.textContent||'').replace(/\s+/g,' ').trim()).filter(t=>/QA /.test(t)).slice(0,8);
  });
  out.tick = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    const el=[...d.querySelectorAll('*')].find(e=>e.children.length===0 && /^QA Carol$/.test((e.textContent||'').trim()));
    if(!el) return 'no carol'; let n=el;
    for(let i=0;i<6&&n;i++){const cb=n.querySelector?n.querySelector('input[type=checkbox]'):null; if(cb){cb.click(); return 'ok';} n=n.parentElement;}
    return 'no cb';});
  await page.waitForTimeout(900);
  out.click = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/^Invite/i.test((x.textContent||'').trim()));
    if(!b||b.disabled) return {ok:false,l:b?b.textContent.trim():null}; b.click(); return {ok:true,l:b.textContent.trim()};});
  await page.waitForTimeout(3000);
  out.toast = await page.evaluate(()=>{
    const vis=e=>{let a=e,op=1;while(a){const cs=getComputedStyle(a);op=Math.min(op,parseFloat(cs.opacity));if(cs.display==='none')return false;a=a.parentElement;}return op>0.05&&e.getClientRects().length>0;};
    return [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis).map(e=>(e.innerText||'').replace(/\n+/g,' / ').trim().slice(0,90)).filter(Boolean);});
  out.net=net;
  return out;
};
