export default async ({page}) => page.evaluate(()=>{
  clearInterval(window.__urId);
  const s=window.__ur? window.__ur.s:[];
  const ch=[s[0]];
  for(let i=1;i<s.length;i++) if(s[i].unread!==s[i-1].unread||s[i].badge!==s[i-1].badge) ch.push(s[i]);
  return {n:s.length, allVisible:s.every(x=>x.vis==='visible'), changes:ch, last:s.at(-1)};
});
