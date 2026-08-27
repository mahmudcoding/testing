const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    // the connection badge: an element whose text carries a quality word plus a latency in ms
    const el=[...document.querySelectorAll('*')].filter(e=>vis(e)
      && /(Excellent|Good|Fair|Poor|Weak)\s*·?\s*\d+\s*ms/i.test((e.innerText||'').replace(/\s+/g,' '))
      && e.children.length<=4)
      .sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!el) return null;
    const r=el.getBoundingClientRect();
    return { txt:(el.innerText||'').replace(/\s+/g,' ').trim().slice(0,30),
      w:+r.width.toFixed(2), h:+r.height.toFixed(2), x:+r.x.toFixed(2) };},VS);
  const samples=[];
  for(let i=0;i<24;i++){ const s=await read(); if(s) samples.push(s); await page.waitForTimeout(1500); }
  if(!samples.length) return {noBadge:true};
  const widths=[...new Set(samples.map(s=>s.w))];
  const texts=[...new Set(samples.map(s=>s.txt))];
  const xs=[...new Set(samples.map(s=>s.x))];
  return { samples:samples.length, distinctTexts:texts, distinctWidths:widths, distinctX:xs,
           widthStable:widths.length===1, xStable:xs.length===1,
           widthSpread:+(Math.max(...widths)-Math.min(...widths)).toFixed(2) };
};
