const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,240),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,24)).filter(Boolean).slice(-8) };},VS);
  const poll=[]; for(let i=0;i<16;i++){ poll.push(await read()); await page.waitForTimeout(800); }
  const uniq=[]; const seen=new Set();
  for(const p of poll){ const k=JSON.stringify(p); if(!seen.has(k)){seen.add(k);uniq.push(p);} }
  return { states:uniq.slice(-3), askAgain: poll.some(p=>p.btns.some(b=>/ask again|ask to join|request again|try again/i.test(b))) };
};
