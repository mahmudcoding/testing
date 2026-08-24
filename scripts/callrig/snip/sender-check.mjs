export default async ({page}) => await page.evaluate(()=>{
  const out=[]; (window.__pcs||[]).forEach(pc=>{ if(pc.connectionState!=='closed') pc.getSenders().forEach(s=>{ if(s.track) out.push(s.track.kind+' | '+s.track.label+' | dev '+((s.track.getSettings().deviceId||'').slice(0,12))); }); });
  return {senders: out, gum:(window.__gumCalls||[]).map(c=>c.c.slice(0,130))};
});
