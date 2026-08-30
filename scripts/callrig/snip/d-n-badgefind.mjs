export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const btns = ['call-controls-chat-toggle','call-controls-people-toggle','call-controls-settings-toggle','call-controls-screen-share','call-controls-live-reaction','call-controls-breakout-rooms','call-controls-add-to-call']
      .map(t=>({t, el:document.querySelector(`[data-testid="${t}"]`)})).filter(x=>x.el)
      .map(x=>{const r=x.el.getBoundingClientRect(); return {t:x.t, x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height), cx:r.x+r.width/2, cy:r.y+r.height/2};});
    // all small visible leaf nodes whose text is a bare number, anywhere
    const badges=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&vis(e)&&/^\d+$/.test((e.innerText||'').trim()))
      .map(e=>{const r=e.getBoundingClientRect();
        // nearest toolbar button by centre distance
        let best=null,bd=1e9;
        for(const b of btns){const d=Math.hypot(r.x+r.width/2-b.cx, r.y+r.height/2-b.cy); if(d<bd){bd=d;best=b.t;}}
        return {txt:e.innerText.trim(), tid:e.dataset.testid||null, x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),
          nearest:best, dist:Math.round(bd)};});
    return {btns, badges};
  });
};
