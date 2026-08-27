export default async ({page}) => {
  return await page.evaluate(()=>{
    const r=window.__niv; if(!r) return {err:'none'};
    clearInterval(r.id);
    return {events:r.events.length, first:r.events[0], last:r.events[r.events.length-1],
      changes:r.events.slice(0,8).map(e=>({ms:e.ms, n:e.n, top:e.top, btns:e.btns, vis:e.vis}))};
  });
};
