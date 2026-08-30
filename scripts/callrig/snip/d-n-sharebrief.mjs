export default async ({page}) => await page.evaluate(()=>{
  const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
  const b=document.querySelector('[data-testid="call-controls-screen-share"]');
  return {btn:b?b.getAttribute('aria-label'):null,
    tracks:[...document.querySelectorAll('[data-testid="screen-share-track"]')].filter(vis).length,
    thumbs:[...new Set([...document.querySelectorAll('[data-testid="share-thumbnail"],[data-testid="screen-share-thumbnail"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim()))]};
});
