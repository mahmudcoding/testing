export default async ({page}) => {
  const M = process.env.QA_MEET;
  return await page.evaluate(async (M) => {
    const post = async (body) => {
      const r = await fetch('/api/v1/meeting/'+M+'/messages',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const t = await r.text();
      return {s:r.status, t:t.slice(0,180)};
    };
    const out = {};
    out.empty      = await post({body:''});
    out.spaces     = await post({body:'   '});
    out.normal     = await post({body:'QA chat normal'});
    out.len1000    = await post({body:'a'.repeat(1000)});
    out.len4000    = await post({body:'b'.repeat(4000)});
    out.len4001    = await post({body:'c'.repeat(4001)});
    out.len20000   = await post({body:'d'.repeat(20000)});
    out.html       = await post({body:'<img src=x onerror="window.__CX=1"><b>bold</b>'});
    out.badRecip   = await post({body:'hi', recipient_id:'U0000000000000'});
    out.selfRecip  = await post({body:'hi self', recipient_id:'U4QAALICE000001'});
    return out;
  }, M);
};
