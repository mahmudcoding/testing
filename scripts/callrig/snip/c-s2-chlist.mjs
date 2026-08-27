export default async ({page}) => page.evaluate(async()=>{
  const ws='W4QCF1XTURESO01';
  const j=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
  return (j.channels||j.data||j||[]).map(c=>({id:c.id, name:c.name, type:c.type, by:c.created_by}));
});
