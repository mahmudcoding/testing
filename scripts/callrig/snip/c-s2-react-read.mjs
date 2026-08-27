export default async ({page}) => page.evaluate(()=>{
  clearInterval(window.__rxId);
  const s=window.__rx? window.__rx.s:[];
  const ch=[s[0]];
  for(let i=1;i<s.length;i++) if(JSON.stringify(s[i].chips)!==JSON.stringify(s[i-1].chips)) ch.push(s[i]);
  return {n:s.length, allVisible:s.every(x=>x.vis==='visible'), changes:ch.slice(0,6), last:s.at(-1)};
});
