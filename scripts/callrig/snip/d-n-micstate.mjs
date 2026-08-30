export default async ({page}) => await page.evaluate(()=>{
  const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
  return [...document.querySelectorAll('button')].filter(vis)
    .filter(b=>/mute|microphone|camera|unmute/i.test((b.getAttribute('aria-label')||'')+(b.title||'')))
    .map(b=>({l:b.getAttribute('aria-label')||b.title,dis:b.disabled,ariaDis:b.getAttribute('aria-disabled')}));
});
