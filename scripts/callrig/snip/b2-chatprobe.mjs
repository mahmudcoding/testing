export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const ce=[...document.querySelectorAll('[contenteditable="true"]')];
    const chatIds=[...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/chat/i.test(t));
    const visChatIds=[...document.querySelectorAll('[data-testid]')].filter(e=>v(e)).map(e=>e.getAttribute('data-testid')).filter(t=>/chat/i.test(t));
    return {
      contentEditable: ce.map(e=>({vis:v(e), al:e.getAttribute('aria-label'), tid:e.getAttribute('data-testid'), ph:e.getAttribute('data-placeholder'), txt:(e.innerText||'').slice(0,40)})),
      chatTestidsAll: [...new Set(chatIds)],
      chatTestidsVisible: [...new Set(visChatIds)],
      textareas: [...document.querySelectorAll('textarea')].map(t=>({vis:v(t), ph:t.placeholder, al:t.getAttribute('aria-label')}))
    };
  });
};
