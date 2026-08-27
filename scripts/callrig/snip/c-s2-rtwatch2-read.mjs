export default async ({page}) => {
  const r=await page.evaluate(()=>{
    clearInterval(window.__w2Id);
    const s=window.__w2? window.__w2.s:[];
    const ch=[s[0]];
    for(let i=1;i<s.length;i++) if(s[i].header!==s[i-1].header||s[i].pinned!==s[i-1].pinned) ch.push(s[i]);
    return {n:s.length, allVisible:s.every(x=>x.vis==='visible'), changes:ch, last:s.at(-1)};});
  await page.reload(); await page.waitForTimeout(8000);
  const after=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const h=document.querySelector('main header')||document.querySelector('header');
    const strip=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all/i.test(t)&&t.length<30);
    return {header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,54), pinned:[...new Set(strip)].join('|')};});
  return {poll:r, afterReload:after};
};
