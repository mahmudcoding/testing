export default async ({page}) => {
  const since = Number(process.env.QA_SINCE || 0);
  const rx = new RegExp(process.env.QA_RX || '.', 'i');
  return await page.evaluate(([s,r]) => {
    const re = new RegExp(r, 'i');
    const log = window.__dcLog || [];
    const msgs = log.filter(x => x.ev === 'msg' && x.t >= s);
    return {hooked: !!window.__dcHooked, total: log.length, since: msgs.length,
      pcs: [...new Set(log.filter(x=>x.ev==='open').map(x=>x.pc))],
      matching: msgs.filter(x => x.text && re.test(x.text)).slice(-12)
        .map(x => ({pc:x.pc, label:x.label, len:x.len, text:x.text})),
      lastFew: msgs.slice(-8).map(x => ({pc:x.pc, label:x.label, len:x.len, text:(x.text||'').slice(0,80)}))};
  }, [since, rx.source]);
}
