export default async ({page}) => {
  const since = Number(process.env.QA_SINCE || 0);
  const rx = new RegExp(process.env.QA_RX || '.', 'i');
  return await page.evaluate(([s,r]) => {
    const re = new RegExp(r, 'i');
    const log = (window.__wsLog2 || []).filter(x => x.t >= s);
    return {total: (window.__wsLog2||[]).length, since: log.length,
      matching: log.filter(x => (x.ascii && re.test(x.ascii)) || (x.text && re.test(x.text)))
        .slice(-10).map(x => ({dir:x.dir, sock:x.sock, kind:(x.url||'').includes('/rtc/')?'rtc':'chat', len:x.len, s:(x.ascii||x.text||'').slice(0,150)})),
      lastBinary: log.filter(x=>x.ascii).slice(-6).map(x=>({len:x.len, s:x.ascii.slice(0,120)}))};
  }, [since, rx.source]);
}
