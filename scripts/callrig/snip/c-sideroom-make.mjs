export default async ({page}) => {
  const out={};
  out.state = await page.evaluate(async ()=>{let c=null;try{c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){} return {inCall:!!(c&&c.meeting)};});
  if(!out.state.inCall) return out;
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Side Rooms"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(()=>{
    const vis=e=>e.getClientRects().length>0;
    const d=[...document.querySelectorAll('[role="dialog"],aside,section')].filter(e=>vis(e)&&/side room/i.test(e.innerText||'')).pop();
    return d? {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,300), btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(0,10)}:null;});
  out.newRoom = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/new side room/i.test((x.textContent||'').trim())); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(2500);
  out.dlg = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,250), btns:[...d.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(Boolean).slice(0,8), inputs:[...d.querySelectorAll('input')].length}:null;});
  const ti = await page.$('[role="dialog"] input');
  if (ti) { await ti.click(); await page.keyboard.type('SR-1',{delay:20}); }
  out.created = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length).pop(); if(!d) return false;
    const b=[...d.querySelectorAll('button')].find(x=>/create|open room|start/i.test((x.textContent||'').trim())); if(!b||b.disabled) return false; b.click(); return true;});
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(()=>({url:location.pathname, txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(-260)}));
  return out;
};
