const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,200),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].filter(vis)
        .map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(Boolean),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,22)).filter(Boolean).slice(-6) };},VS);
  const samples=[]; for(let i=0;i<50;i++){ samples.push({t:i*1500, ...(await read())}); await page.waitForTimeout(1500); }
  const uniq=[]; const seen=new Set();
  for(const s of samples){ const k=s.txt+JSON.stringify(s.btns); if(!seen.has(k)){seen.add(k);uniq.push(s);} }
  return { watchedSeconds:75, distinctStates:uniq.length,
    first:{txt:samples[0].txt.slice(0,120), btns:samples[0].btns},
    last:{txt:samples[samples.length-1].txt.slice(0,120), btns:samples[samples.length-1].btns},
    anyToast:[...new Set(samples.flatMap(s=>s.toasts))].slice(0,5),
    everDenied: samples.some(s=>/denied|declined|rejected|not admitted|отклон/i.test(s.txt+s.toasts.join(' '))) };
};
