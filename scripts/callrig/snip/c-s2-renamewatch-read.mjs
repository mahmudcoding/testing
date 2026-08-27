export default async ({page}) => {
  const r=await page.evaluate(()=>{
    clearInterval(window.__rnId);
    const s=window.__rn? window.__rn.s:[];
    const ch=[s[0]];
    for(let i=1;i<s.length;i++) if(s[i].header!==s[i-1].header||s[i].sidebar!==s[i-1].sidebar) ch.push(s[i]);
    return {n:s.length, allVisible:s.every(x=>x.vis==='visible'), changes:ch, last:s.at(-1)};});
  await page.reload(); await page.waitForTimeout(8000);
  const after=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const h=document.querySelector('main header')||document.querySelector('header');
    const a=[...document.querySelectorAll('a[href*="C4QCPRIVATE0001"]')].filter(vis)[0];
    return {header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,34),
      sidebar:a?(a.innerText||'').replace(/\s+/g,' ').slice(0,22):null};});
  return {poll:r, afterReload:after};
};
