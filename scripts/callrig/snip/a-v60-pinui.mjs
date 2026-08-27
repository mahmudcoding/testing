const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'guest'; const j=await r.json().catch(()=>null); return (j?.email||'').split('@')[0];});
  await page.waitForTimeout(3000);
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const labs=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length<=2
      && /^(QA (Alice|Bob))( \(you\))?$/.test((e.innerText||'').replace(/\s+/g,' ').trim()))
      .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim(), x:Math.round(e.getBoundingClientRect().x),
                y:Math.round(e.getBoundingClientRect().y), w:Math.round((e.closest('div')||e).getBoundingClientRect().width)}))
      .filter(o=>o.x<1620);
    const seen=new Set(),o=[];
    for(const l of labs){ if(seen.has(l.t))continue; seen.add(l.t); o.push(l); }
    o.sort((a,b)=>a.y-b.y||a.x-b.x);
    return { order:o.map(x=>x.t), widths:o.map(x=>x.w),
      pinMentions:[...document.querySelectorAll('[aria-label]')].filter(vis).map(e=>e.getAttribute('aria-label')).filter(a=>/pin/i.test(a||'')).slice(0,4) };},VS);
  return { who, ...(await read()) };
};
