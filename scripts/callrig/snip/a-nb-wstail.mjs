export default async ({page}) => {
  const N = Number(process.env.QA_TAIL || 400);
  return await page.evaluate((n)=>{ const l=window.__wsLog||[];
    const tail=l.slice(-n); const t0=tail.length?tail[0].t:0;
    const j = tail.filter(x=>x.d!=='<binary>' && x.d[0]==='{');
    return {total:l.length, shown:j.length,
      frames: j.map(x=>({ms:Math.round((x.t-t0)/100)/10, dir:x.dir, d:x.d.slice(0,150)}))
               .filter(x=>!/"type":"(ping|pong)"/.test(x.d)).slice(-40)};
  }, N);
};
