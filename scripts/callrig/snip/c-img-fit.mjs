export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  return await page.evaluate(v=>{const vv=eval(v);
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    const i=[...m.querySelectorAll('img')].filter(vv)[0];
    if(!i) return {noImg:true};
    const cs=getComputedStyle(i); const r=i.getBoundingClientRect();
    return {natural:i.naturalWidth+'x'+i.naturalHeight, box:Math.round(r.width)+'x'+Math.round(r.height),
      objectFit:cs.objectFit, objectPosition:cs.objectPosition,
      naturalRatio:(i.naturalWidth/i.naturalHeight).toFixed(3), boxRatio:(r.width/r.height).toFixed(3),
      imageRendering:cs.imageRendering, maxW:cs.maxWidth, maxH:cs.maxHeight, w:cs.width, h:cs.height};}, V);
};
