export default async ({page}) => {
  await page.waitForTimeout(12000);
  return await page.evaluate(()=>{
    const f=window.__frames||[];
    const recent=f.slice(-14).map(x=>x.d.replace(/\s+/g,' ').slice(0,260));
    const hasTag=f.filter(x=>/QA-VER-WS-1/.test(x.d)).map(x=>x.d.slice(0,400));
    const unreadish=f.filter(x=>/unread|read_seq|badge|channel_seq/i.test(x.d)).map(x=>x.d.slice(0,300));
    return {total:f.length, recent, framesMentioningTheNewMessage:hasTag, framesMentioningUnread:unreadish.slice(-6)};
  });
};
