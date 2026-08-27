export default async ({page}) => {
  return await page.evaluate(()=>{ const l=window.__wsLog||[];
    const t0=l.length?l[0].t:0;
    const j = l.filter(x=>x.d!=='<binary>' && x.d[0]==='{' && !/"type":"(ping|pong)"/.test(x.d));
    return {total:l.length, json:j.length, span:Math.round((l[l.length-1].t-t0)/1000),
      frames:j.map(x=>({s:Math.round((x.t-t0)/1000), dir:x.dir, d:x.d.slice(0,120)}))};
  });
};
