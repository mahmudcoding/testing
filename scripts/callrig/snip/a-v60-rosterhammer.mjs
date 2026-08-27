const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const roster=[];
  page.on('response', r=>{ const u=r.url();
    if(/participants|roster|meeting\/[A-Z0-9]+$/i.test(u)) roster.push({u:u.split('/api/v1/')[1]?.slice(0,44), s:r.status()}); });
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    if(!l) return {closed:true};
    const rows=[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));
    return { n:rows.length, rows, placeholders:rows.filter(r=>/unknown|unnamed|loading|^$/i.test(r)) };},VS);
  // hammer the panel open/closed — one actor, fast clicks -> overlapping roster reads
  for(let i=0;i<12;i++){
    await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{});
    await page.waitForTimeout(280);
  }
  await page.waitForTimeout(1200);
  // make sure it ends OPEN
  let st = await read();
  if(st.closed){ await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  const after=[];
  for(let i=0;i<16;i++){ after.push(await read()); await page.waitForTimeout(500); }
  out.rosterRequests = roster.length;
  out.failedRequests = roster.filter(r=>r.s>=400 || r.s===0);
  out.finalStates = [...new Set(after.filter(a=>!a.closed).map(a=>JSON.stringify(a.rows)))].slice(0,4);
  out.everPlaceholder = [...new Set(after.flatMap(a=>a.placeholders||[]))];
  out.everEmpty = after.some(a=>!a.closed && a.n===0);
  out.counts = [...new Set(after.filter(a=>!a.closed).map(a=>a.n))];
  return out;
};
