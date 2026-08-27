// Fire API calls from inside a signed-in tab.
//   QA_REQS='[{"p":"/api/v1/…","n":6000}]' ./d a:alice snip/api.mjs
//
// `n` is a DISPLAY limit, not a fetch limit — it slices the body before you see it,
// and it defaults to 400 characters. A regex or a presence check run over that slice
// is a search over the first 400 characters of the response, not over the response.
// That has already nearly produced a false finding in the direction of "it works":
// an account looked absent from a 7-member roster because it sat past the 400th
// character. Truncation is now marked, so it cannot be silent.
//
// But a marker is not enough, and one session proved it: they printed the full length
// beside the slice, looked at the slice anyway, and reasoned from it. A slice plus a
// length is a truncation you have merely annotated. **For an absence claim, never read a
// slice** — use one of these instead, which never truncate:
//
//   {"p":"/api/v1/…","keys":true}      every key path in the response, recursively
//   {"p":"/api/v1/…","find":"wait|queue|pending"}   regex over the WHOLE body
//
// Both report on the entire response regardless of `n`.
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
        const n = r.n || 400;
        // Absence-safe modes: computed over the whole body, never over a slice.
        if (r.keys || r.find) {
          const out = {status: resp.status, len: t.length};
          if (r.find) {
            const m = t.match(new RegExp(r.find, 'gi'));
            out.find = r.find;
            out.matches = m ? [...new Set(m)] : [];
            out.count = m ? m.length : 0;
          }
          if (r.keys) {
            const seen = new Set();
            const walk = (v, path) => {
              if (Array.isArray(v)) { v.forEach((x) => walk(x, path + '[]')); return; }
              if (v && typeof v === 'object') {
                for (const k of Object.keys(v)) { seen.add(path + '.' + k); walk(v[k], path + '.' + k); }
              }
            };
            try { walk(JSON.parse(t), ''); out.keys = [...seen].sort(); }
            catch { out.keys = ['(body is not JSON)']; }
          }
          return out;
        }
        return {status: resp.status, body: t.slice(0, n), len: t.length, cut: t.length > n};
      } catch(e) { return {status:'ERR', body: String(e).slice(0,200), len: 0, cut: false}; }
    }, r);
    if (r.keys || r.find) {
      const bits = [`${r.m||'GET'} ${r.p} -> ${res.status} :: FULL BODY ${res.len} chars`];
      if (res.find !== undefined) bits.push(`  find /${res.find}/ -> ${res.count} match(es) ${JSON.stringify(res.matches)}`);
      if (res.keys) bits.push(`  keys (${res.keys.length}): ${res.keys.join(' ')}`);
      out.push(bits.join('\n'));
      continue;
    }
    // Untruncated output is byte-identical to before, so nothing that parses this changes.
    const mark = res.cut
      ? `  …[TRUNCATED: showing ${res.body.length} of ${res.len} chars — an absence in this slice proves nothing; re-run with a larger n]`
      : '';
    out.push(`${r.m||'GET'} ${r.p} -> ${res.status} :: ${res.body}${mark}`);
  }
  return out;
};
