const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  // keep the Participants panel open and sample roster rows at ~400ms
  const hasList = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!hasList){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    if(!l) return {noList:true};
    const rows=[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,30));
    return { n:rows.length, rows,
      placeholders: rows.filter(r=>/unknown|unnamed|loading|\.\.\.|^$|participant \d/i.test(r)),
      header:(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,34) };},VS);
  const samples=[];
  for(let i=0;i<70;i++){ samples.push({t:i*400, ...(await read())}); await page.waitForTimeout(400); }
  const uniqRows=[]; const seen=new Set();
  for(const s of samples){ const k=JSON.stringify(s.rows); if(!seen.has(k)){seen.add(k); uniqRows.push({t:s.t, n:s.n, rows:s.rows});} }
  return { samples:samples.length,
    everyPlaceholder:[...new Set(samples.flatMap(s=>s.placeholders||[]))],
    distinctRosterStates:uniqRows.length, states:uniqRows.slice(0,8),
    countSeq:[...new Set(samples.map(s=>s.n))] };
};
