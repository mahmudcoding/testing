export default async ({page}) => await page.evaluate(async () => {
  const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/channels',{credentials:'include'});
  const j=await r.json().catch(()=>({}));
  const list=j.channels||j.data||[];
  const c=list.find(x=>(x.name||'').includes('e-search-control'));
  if(!c) return {found:false, n:list.length};
  const jr=await fetch(`/api/v1/channels/${c.id}/join`,{method:'POST',credentials:'include'});
  return {found:true, id:c.id, joinStatus:jr.status, resp:(await jr.text()).slice(0,120)};
});
