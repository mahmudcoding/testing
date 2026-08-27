export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(6000);
  return page.evaluate(async(ws)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const cur=await fetch('/api/v1/meetings/current',{credentials:'include'});
    const ct=await cur.text();
    const act=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'});
    const at=await act.text();
    return {who:me.email||(me.user&&me.user.email),
      current:{status:cur.status, body:ct.slice(0,200)},
      active:{status:act.status, body:at.slice(0,260)}};}, ws);
};
