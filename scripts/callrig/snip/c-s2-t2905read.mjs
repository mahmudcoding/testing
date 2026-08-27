export default async ({page}) => {
  const r=await page.evaluate(()=>{
    clearInterval(window.__bgId);
    const s=window.__bg? window.__bg.s:[];
    const ch=[s[0]];
    for(let i=1;i<s.length;i++) if(s[i].badge!==s[i-1].badge) ch.push(s[i]);
    return {n:s.length, allVisible:s.every(x=>x.vis==='visible'), changes:ch, last:s.at(-1)};});
  await page.reload(); await page.waitForTimeout(7500);
  const after=await page.evaluate(()=>{
    const a=[...document.querySelectorAll('a[href*="C4QCGENERAL0001"]')]
      .filter(x=>x.getBoundingClientRect().height>0)[0];
    return a? (a.innerText||'').replace(/\s+/g,' ').slice(0,26):null;});
  const unread=await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/workspaces/W4QCF1XTURESO01/unread',{credentials:'include'})).json();
    const arr=j.unread_counts||[];
    const g=arr.find(c=>c.channel_id==='C4QCGENERAL0001');
    return g||null;});
  return {poll:r, badgeAfterReload:after, unreadApi:unread};
};
