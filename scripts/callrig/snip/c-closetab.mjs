export default async ({page, ctx}) => {
  const before = await page.evaluate(async ()=>{
    let c=null; try{c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){}
    return {inCall:!!(c&&c.meeting), id:c&&c.meeting?c.meeting.id:null, url:location.pathname,
      txt:(document.body.innerText||'').replace(/\n+/g,' | ').slice(-160)};
  });
  const blank = await ctx.newPage();
  await blank.goto('about:blank');
  await page.close();
  return {before, closedAt: new Date().toISOString()};
};
