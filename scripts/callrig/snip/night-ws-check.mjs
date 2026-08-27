export default async ({page}) => page.evaluate(()=>{
  const w=window.__ws;
  if(!w) return {noHook:true, url:location.pathname};
  return {created:w.created, opened:w.opened, closed:w.closed, errors:w.errors,
    msgIn:w.msgIn, msgOut:w.msgOut, last:w.last,
    states:(w.sockets||[]).map(s=>s.readyState),
    secsSinceLastMsg: w.lastMsg? Math.round((Date.now()-w.lastMsg)/1000) : null,
    url:location.pathname, visibility:document.visibilityState};
});
