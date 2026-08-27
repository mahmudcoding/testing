const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate(async(vs)=>{const vis=eval(vs);
    const pcs=window.__pcs||[]; const rows=[];
    for(const pc of pcs){ if(pc.connectionState==='closed') continue;
      const s=await pc.getStats();
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video') rows.push({w:r.frameWidth,dec:r.framesDecoded}); }); }
    return { inbound:rows, videos:document.querySelectorAll('video').length,
      claims:[...new Set([...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
        && /camera|left the call|stopped/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)))].slice(0,4) };},VS);
  const samples=[]; for(let i=0;i<26;i++){ samples.push({t:i*1500, ...(await read())}); await page.waitForTimeout(1500); }
  const uniq=(k)=>{const s=new Set(),o=[];for(const x of samples){const v=JSON.stringify(x[k]);if(!s.has(v)){s.add(v);o.push(x[k]);}}return o;};
  const decs=samples.map(s=>s.inbound[0]?.dec).filter(x=>x!==undefined);
  return { claimSeq:uniq('claims'), videoCounts:[...new Set(samples.map(s=>s.videos))],
           inboundFirst:samples[0].inbound, inboundLast:samples[samples.length-1].inbound,
           decMonotonic: decs.every((v,i)=>i===0||v>=decs[i-1]),
           sawZeroStreams: samples.some(s=>s.inbound.length===0) };
};
