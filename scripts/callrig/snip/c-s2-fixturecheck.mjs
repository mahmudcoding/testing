export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(7000);
  return page.evaluate(async(ws)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=Array.isArray(j)?j:(j.channels||j.items||[]);
    return {who:me.email||(me.user&&me.user.email),
      channelCount:arr.length,
      names:arr.map(c=>c.name).slice(0,25)};}, ws);
};
