export default async ({page}) => {
  await page.waitForTimeout(14000);
  const out=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.notifications||j.items))||[];
    const list=Array.isArray(a)?a:[];
    return {total:list.length,
      hasMuted:list.some(n=>JSON.stringify(n).includes('QA-MUTEDELIV')),
      newestBodies:list.slice(0,3).map(n=>String(n.body||'').slice(0,26))};});
  // now try to unmute through the UI once more, then re-check
  const before=await page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(-46));
  await page.locator('button[aria-label="Unmute notifications"]').first().click({timeout:5000}).catch(()=>{});
  await page.waitForTimeout(4000);
  const after=await page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(-46));
  const cleanup=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications/channels/C4OVEWOTJW1AA86/mute',
      {method:'DELETE',credentials:'include'});
    try{const k='aloqa.channel.mute';const o=JSON.parse(localStorage.getItem(k)||'{}');
      if(o&&o.state){o.state.mutedByChannel={};localStorage.setItem(k,JSON.stringify(o));}}catch(e){}
    return r.status;});
  return {notifications:out, lsBeforeUnmuteClick:before, lsAfterUnmuteClick:after, apiCleanup:cleanup};
};
