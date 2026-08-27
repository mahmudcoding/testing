export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/workspaces/W4QCF1XTURESO01/channels',{credentials:'include'});
    const j=await r.json(); const a=j.channels||j.data||j;
    return (Array.isArray(a)?a:[]).filter(c=>/qa-/.test(c.name||''))
      .map(c=>`${c.id} ${c.name}`).slice(0,8);
  });
};
