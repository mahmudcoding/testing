export default async ({page}) => {
  const r=await page.evaluate(()=>{
    clearInterval(window.__mwId);
    const s=window.__mw? window.__mw.s:[];
    const ch=[s[0]];
    for(let i=1;i<s.length;i++) if(s[i].header!==s[i-1].header) ch.push(s[i]);
    return {n:s.length, allVisible:s.every(x=>x.vis==='visible'), changes:ch, last:s.at(-1)};});
  await page.reload(); await page.waitForTimeout(8000);
  const after=await page.evaluate(()=>{const h=document.querySelector('main header')||document.querySelector('header');
    return (h?h.innerText:'').replace(/\s+/g,' ').slice(0,50);});
  return {poll:r, afterReload:after};
};
