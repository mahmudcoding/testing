export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(x=>/Play voice-/.test([...x.querySelectorAll('button')]
        .map(b=>b.getAttribute('aria-label')||'').join(' ')));
    if(!e) return {err:'voice message not found'};
    const gfx=[...e.querySelectorAll('canvas,svg')].filter(v).map(g=>{
      const r=g.getBoundingClientRect();
      let drawn=null;
      if(g.tagName==='CANVAS'){
        try{ const ctx=g.getContext('2d');
          const d=ctx.getImageData(0,0,Math.min(g.width,60),Math.min(g.height,30)).data;
          drawn=[...d].some((x,i)=>i%4===3 && x>0);
        }catch(err){ drawn='blocked:'+String(err).slice(0,24); }
      } else {
        drawn = g.querySelectorAll('rect,path,line,polyline').length;
      }
      return {tag:g.tagName, w:Math.round(r.width), h:Math.round(r.height), drawn};});
    return {text:(e.innerText||'').replace(/\s+/g,' ').slice(0,60),
      graphics:gfx,
      wideGraphics:gfx.filter(g=>g.w>60),
      buttons:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,5)};});
};
