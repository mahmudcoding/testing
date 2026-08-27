export default async ({page}) => {
  return await page.evaluate(async () => {
    const act = await (await fetch('/api/v1/workspace/W4QAF1XTURESO01/meetings/active',{credentials:'include'})).json();
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    return {active: (act.meetings||act.items||[]).map(m=>({id:m.id,name:m.name,status:m.status})), current: cur.meeting||null};
  });
};
