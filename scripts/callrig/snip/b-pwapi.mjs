export default async ({page}) => {
  return await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    const m=j&&j.meeting;
    return m? {id:m.id, name:m.name, pw:m.password_protected, appr:m.requires_approval, priv:m.is_private, participants:(m.participants||[]).length} : null;
  });
};
