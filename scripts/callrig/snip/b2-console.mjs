export default async ({page}) => {
  const msgs=[];
  const onMsg = (m) => {
    const t=m.type();
    if(t!=='error' && t!=='warning') return;
    const txt=m.text();
    msgs.push({t, txt: txt.slice(0,220)});
  };
  const onErr = (e) => msgs.push({t:'pageerror', txt:String(e).slice(0,220)});
  page.on('console', onMsg); page.on('pageerror', onErr);
  await page.waitForTimeout(Number(process.env.QA_WATCH_MS||60000));
  page.off('console', onMsg); page.off('pageerror', onErr);
  const counts={};
  msgs.forEach(m=>{ const k=m.t+': '+m.txt.slice(0,90); counts[k]=(counts[k]||0)+1; });
  return {total: msgs.length, distinct: Object.keys(counts).length,
          top: Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10)};
};
