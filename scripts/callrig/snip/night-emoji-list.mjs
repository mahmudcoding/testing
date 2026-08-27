export default async ({page}) => {
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    if(!m) return {none:true};
    const btns=[...m.querySelectorAll('button')].map(b=>({aria:b.getAttribute('aria-label'), txt:(b.textContent||'').trim().slice(0,4), t:b.getAttribute('data-testid')}));
    const inputs=[...m.querySelectorAll('input')].map(i=>({ph:i.placeholder,type:i.type}));
    return {total:btns.length, first20:btns.slice(0,20), inputs};
  });
};
