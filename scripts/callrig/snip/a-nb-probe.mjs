export default async ({page}) => {
  const calls = JSON.parse(process.env.QA_PROBES || '[]');
  const out = [];
  for (const c of calls) {
    const r = await page.evaluate(async ([m,u,b]) => {
      try {
        const res = await fetch(u, {method:m, credentials:'include',
          headers: b ? {'content-type':'application/json'} : undefined, body: b || undefined});
        const t = await res.text();
        return {s: res.status, body: t.slice(0,220)};
      } catch(e) { return {err:String(e).slice(0,120)}; }
    }, [c.m, c.u, c.b||null]);
    out.push({m:c.m, u:c.u, ...r});
  }
  return out;
}
