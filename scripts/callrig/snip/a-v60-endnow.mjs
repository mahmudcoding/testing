const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.locator('button', { hasText: /End for everyone/i }).first().click();
  await page.waitForTimeout(2500);
  const pos = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
    if(!d) return null;
    out_txt=(d.innerText||'').replace(/\s+/g,' ').slice(0,160);
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>b.getAttribute('data-testid')==='call-end-confirm-submit')
      || [...d.querySelectorAll('button')].filter(vis).find(b=>/^End (call|for everyone)$/i.test((b.innerText||'').trim()));
    const r=b?b.getBoundingClientRect():null;
    return {txt:out_txt, btns:[...d.querySelectorAll('button')].filter(vis).map(x=>({t:(x.innerText||'').trim().slice(0,20),tid:x.getAttribute('data-testid')||''})),
            x:r?Math.round(r.x+r.width/2):null, y:r?Math.round(r.y+r.height/2):null};},VS);
  out.confirm=pos;
  if(pos&&pos.x){ await page.mouse.click(pos.x,pos.y); }
  await page.waitForTimeout(9000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ended-view.png'});
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,340),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,20),
      dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,200)) };},VS);
  return out;
};
