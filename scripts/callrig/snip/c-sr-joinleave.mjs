export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Side Rooms"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(()=>{
    const vis=e=>e.getClientRects().length>0;
    const d=[...document.querySelectorAll('[role="dialog"],aside,section')].filter(e=>vis(e)&&/side room/i.test(e.innerText||'')).pop();
    return d? {txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,250), btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(0,10)}:null;});
  out.joined = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Join( room)?$/i.test((x.textContent||'').trim())); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(9000);
  out.inRoom = await page.evaluate(()=>({txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(-220)}));
  // leave the room
  out.leaveClicked = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Leave room$/i.test((x.textContent||'').trim())); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(1800);
  out.leaveDlg = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    return d? {t:(d.innerText||'').replace(/\n+/g,' | ').slice(0,260), b:[...d.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).filter(Boolean)}:null;});
  await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length).pop();
    if(d){const b=[...d.querySelectorAll('button')].find(x=>/^leave/i.test((x.textContent||'').trim())); if(b)b.click();}});
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(async ()=>{let c=null;try{c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){}
    return {inCall:!!(c&&c.meeting), txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(-200)};});
  return out;
};
