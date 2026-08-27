export default async ({page}) => {
  return await page.evaluate(`(() => {
    if(window.__nTimer) clearInterval(window.__nTimer);
    const p=window.__n||[]; if(!p.length) return {none:true};
    const u=[]; let last='';
    for(const s of p){ const k=JSON.stringify(s.top); if(k!==last){ u.push(s); last=k; } }
    return {samples:p.length, spanMs:p[p.length-1].t-p[0].t, distinct:u.length,
            changes:u.slice(-5)}; })()`);
};
