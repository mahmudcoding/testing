export default async ({page}) => {
  const reqs = JSON.parse(process.env.QA_REQS);
  const out = [];
  for (const r of reqs) {
    const res = await page.evaluate(async (r) => {
      try {
        const opt = {method: r.m||'GET', credentials:'include', headers:{}};
        if (r.b !== undefined) { opt.headers['Content-Type']='application/json'; opt.body = JSON.stringify(r.b); }
        const resp = await fetch(r.p, opt);
        const t = await resp.text();
        return {status: resp.status, body: t.slice(0, r.n||400)};
      } catch(e) { return {status:'ERR', body: String(e).slice(0,200)}; }
    }, r);
    out.push(`${r.m||'GET'} ${r.p} -> ${res.status} :: ${res.body}`);
  }
  return out;
};
