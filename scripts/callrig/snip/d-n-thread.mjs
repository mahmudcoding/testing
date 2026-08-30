export default async ({page}) => {
  const out={};
  // ensure chat panel open
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  const th = page.locator('[data-testid="in-call-chat-panel"] button', {hasText:/^Thread$/});
  out.threadBtns = await th.count();
  if(!out.threadBtns) return out;
  const idx = process.env.QA_IDX? +process.env.QA_IDX : out.threadBtns-1;
  await th.nth(idx).click(); await page.waitForTimeout(2500);
  out.panel = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {text:(p.innerText||'').replace(/\s+/g,' ').slice(0,600),
      testids:[...p.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).slice(0,25),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,20),
      inputs:[...p.querySelectorAll('input,textarea,[contenteditable]')].map(i=>({tag:i.tagName,ph:i.placeholder,al:i.getAttribute('aria-label'),dis:i.disabled}))};
  });
  const txt=process.env.QA_TEXT;
  if (txt){
    const ta = page.locator('[data-testid="call-side-panel-slot"] textarea').last();
    out.taCount = await ta.count();
    if(out.taCount){ await ta.click(); await ta.fill(''); await ta.type(txt,{delay:15}); await page.waitForTimeout(300);
      out.typed = await ta.inputValue();
      await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
      out.afterSend = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
        return (p.innerText||'').replace(/\s+/g,' ').slice(0,600);});
      out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,100)));
    }
  }
  return out;
};
