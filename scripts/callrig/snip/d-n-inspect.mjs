export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const dialogs=[...document.querySelectorAll('[role=dialog]')].map(d=>{const r=d.getBoundingClientRect();
      return {tid:d.dataset.testid||null, w:Math.round(r.width),h:Math.round(r.height), vis:vis(d),
        txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
        testids:[...d.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).slice(0,20),
        btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,15),
        inputs:[...d.querySelectorAll('input,textarea,[contenteditable]')].map(i=>({tag:i.tagName,ph:i.placeholder,al:i.getAttribute('aria-label'),dis:i.disabled}))};});
    return {backdrops:document.querySelectorAll('.aloqa-modal-backdrop').length, dialogs};
  });
};
