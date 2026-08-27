export default async ({page}) => page.evaluate(()=>{
  clearInterval(window.__awId);
  const s=window.__aw? window.__aw.s:[];
  const ch=[s[0]];
  for(let i=1;i<s.length;i++){
    const a=JSON.stringify([s[i].composer,s[i].composerEditable,s[i].banner]);
    const b=JSON.stringify([s[i-1].composer,s[i-1].composerEditable,s[i-1].banner]);
    if(a!==b) ch.push(s[i]);
  }
  return {n:s.length, allVisible:s.every(x=>x.vis==='visible'), changes:ch, last:s.at(-1)};
});
