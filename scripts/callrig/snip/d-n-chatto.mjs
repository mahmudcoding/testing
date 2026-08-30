export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="in-call-chat-panel"] button', {hasText:/^To/}).first();
  out.cnt = await b.count();
  const all = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    return [...p.querySelectorAll('button')].map(x=>({al:x.getAttribute('aria-label'),t:(x.innerText||'').replace(/\s+/g,' ').trim(),tid:x.dataset.testid||null}));
  });
  out.buttons = all;
  // click the To control
  const tob = page.locator('[data-testid="in-call-chat-panel"] button').filter({hasText:/Everyone/}).first();
  out.toCnt = await tob.count();
  if (out.toCnt) { await tob.click(); await page.waitForTimeout(1500); }
  out.menu = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const cands=[...document.querySelectorAll('[role=menu],[data-radix-menu-content],[role=listbox],[data-radix-popper-content-wrapper]')].filter(vis);
    const m=cands[cands.length-1];
    return m?{text:(m.innerText||'').replace(/\s+/g,' ').slice(0,400),
      items:[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&vis(e)).map(e=>e.innerText.trim()).slice(0,20)}:null;
  });
  return out;
};
