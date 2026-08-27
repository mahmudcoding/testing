export default async ({page}) => await page.evaluate(async ()=>{
  const j=await (await fetch('/api/v1/workspace/W4QAF1XTURESO01/meetings/active',{credentials:'include'})).json().catch(()=>({}));
  return {api:(j.meetings||[]).map(m=>({id:m.id,name:m.name,count:m.participant_count}))};
});
