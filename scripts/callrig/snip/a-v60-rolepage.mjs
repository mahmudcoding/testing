const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { url:location.pathname+location.search,
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,400),
      inputs:[...m.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,26),type:i.type})).slice(0,6),
      switches:[...m.querySelectorAll('[role="switch"],input[type=checkbox]')].filter(vis).length,
      btns:[...m.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,24),dis:b.disabled})).filter(b=>b.t).slice(0,12) };},VS);
};
