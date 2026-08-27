export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001', parent='M4OWSWLE61Y8WAA';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`);
  await page.waitForTimeout(7000);
  return page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    // the thread panel is the region containing the replies; take the right-hand column
    const all=[...document.querySelectorAll('button,a,[role="switch"],[role="checkbox"],input')].filter(vis)
      .map(b=>{const r=b.getBoundingClientRect();
        return {tag:b.tagName, l:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,26),
          x:Math.round(r.x), y:Math.round(r.y)};})
      .filter(b=>b.x>900);
    const txt=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
      .filter(e=>e.getBoundingClientRect().x>900)
      .map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,26);
    return {rightControls:all.slice(0,26), rightText:txt,
      followish: all.filter(b=>/follow|subscri|notif|watch|mute/i.test(b.l))};
  });
};
