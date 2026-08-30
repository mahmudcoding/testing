export default async ({page}) => {
  const out={};
  out.panel = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    return {tail:(p.innerText||'').replace(/\s+/g,' ').slice(-200),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim(),dis:b.disabled||b.getAttribute('aria-disabled')}))};
  });
  const th = page.locator('[data-testid="in-call-chat-panel"] button', {hasText:/^Thread$/});
  out.threadCount = await th.count();
  if(!out.threadCount) return out;
  await th.nth(0).click(); await page.waitForTimeout(2500);
  out.dlg = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].find(x=>/Message thread/.test(x.innerText||''));
    if(!d) return null;
    const ta=d.querySelector('textarea');
    return {full:(d.innerText||'').replace(/\s+/g,' ').slice(0,400),
      ta: ta?{ph:ta.placeholder,dis:ta.disabled}:null,
      btns:[...d.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim(),dis:b.disabled||b.getAttribute('aria-disabled')}))};
  });
  // try to send a reply
  if (out.dlg && out.dlg.ta && !out.dlg.ta.dis){
    const ta=page.locator('textarea[placeholder="Reply to message"]').first();
    await ta.click(); await ta.fill(''); await ta.type(process.env.QA_TEXT||'DN-THREAD-WHILE-DISABLED',{delay:15});
    await page.waitForTimeout(300);
    out.typed = await ta.inputValue();
    const sb = page.locator('button', {hasText:/^Send reply$/}).first();
    out.sendDisabled = await sb.isDisabled();
    if(!out.sendDisabled){ await sb.click(); await page.waitForTimeout(3500); }
    out.dlgAfter = await page.evaluate(()=>{
      const d=[...document.querySelectorAll('[role=dialog]')].find(x=>/Message thread/.test(x.innerText||''));
      return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,400):null;});
    out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,120)));
    out.inlineErrors = await page.evaluate(()=>{
      const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      return [...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/error|failed|cannot|disabled|not allowed|try again/i.test(e.innerText)&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,100)))];});
  }
  return out;
};
