const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.keyboard.press('Escape').catch(()=>{});
  // leave the side room first
  const lr = page.locator('button', { hasText: /^Leave room$/ }).first();
  if(await lr.count()){ await lr.click(); out.leftRoom=true; await page.waitForTimeout(5000); }
  out.toolbar = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24)).filter(Boolean).filter(t=>/end|leave/i.test(t));},VS);
  const ef = page.locator('button', { hasText: /End for everyone/i }).first();
  out.endFound = await ef.count()>0;
  if(out.endFound){ await ef.click(); await page.waitForTimeout(2200);
    out.confirmDialog = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis).pop();
      return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,180),
        btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,20),tid:b.getAttribute('data-testid')||''}))}:null;},VS);
    const cf = page.locator('[data-testid="call-end-confirm-submit"]').first();
    if(await cf.count()){ await cf.click(); out.confirmed='testid'; }
    else { const b=page.locator('[role="dialog"] button, [role="alertdialog"] button',{hasText:/^End/i}).first();
           if(await b.count()){ await b.click(); out.confirmed='text'; } }
    await page.waitForTimeout(7000);
  }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/call-ended-alice.png'});
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,18) };},VS);
  return out;
};
