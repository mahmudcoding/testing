const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const order = () => page.evaluate((vs)=>{const vis=eval(vs);
    // tile labels sit in the bottom-left badge of each card; read them in DOM order
    const labs=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length<=2
      && /^(QA (Alice|Bob|Carol|Dave|Owner|Admin)( \(you\))?|Visitor \d+)( GUEST)?$/.test((e.innerText||'').replace(/\s+/g,' ').trim()));
    const seen=new Set(),out=[];
    for(const l of labs){ const r=l.getBoundingClientRect();
      if(r.x>1600) continue;                       // skip the right-hand roster panel
      const t=(l.innerText||'').replace(/\s+/g,' ').trim();
      if(seen.has(t)) continue; seen.add(t); out.push({t, x:Math.round(r.x), y:Math.round(r.y)}); }
    out.sort((a,b)=> a.y-b.y || a.x-b.x);
    return out.map(o=>o.t);},VS);
  const samples=[];
  for(let i=0;i<12;i++){ samples.push(await order()); await page.waitForTimeout(2000); }
  const uniq=[]; const seen=new Set();
  for(const s of samples){ const k=JSON.stringify(s); if(!seen.has(k)){seen.add(k);uniq.push(s);} }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/hoist.png'});
  return { distinctOrders:uniq.length, first:samples[0], last:samples[samples.length-1], allOrders:uniq.slice(0,4) };
};
