export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  return page.evaluate(async(dm)=>{
    const r=await fetch(`/api/v1/workspaces/W4QCF1XTURESO01/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const u=(j.unread_counts||[]).find(c=>c.channel_id===dm);
    return {url:location.pathname.slice(-18), unread:u?u.unread_count:null,
      lastRead:u?u.last_read_seq:null, lastMsg:u?u.last_message_seq:null};}, dm);
};
