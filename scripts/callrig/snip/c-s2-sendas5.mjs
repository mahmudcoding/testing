const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  const reqs=[];
  page.on('request', r=>{ if(/\/api\/v1\/messaging\/messages/.test(r.url()) && r.method()==='POST')
    reqs.push({post:(r.postData()||'').slice(0,280)}); });
  const out={};
  const send = async (asFile) => {
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-pic.png`);
    await page.waitForTimeout(5000);
    if (asFile) { await page.locator('button[aria-label="Send as file"]').first().click({timeout:8000}); await page.waitForTimeout(1200); }
    const st = await page.evaluate(()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(t=>/send as/i.test(t));
    });
    await page.locator('button[aria-label="Send"]').last().click({timeout:8000});
    await page.waitForTimeout(5000);
    const res = await page.evaluate(async ()=>{
      const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
      const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=1',{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[])[0]||{};
      const el=[...document.querySelectorAll('[data-message-id]')].pop();
      return {id:m.id.slice(-6), allKeys:Object.keys(m).join(','), type:m.type===undefined?'(absent)':m.type,
        imgs: el? el.querySelectorAll('img').length:0,
        rowButtons: el? [...el.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,4):[]};
    });
    return {toggleShows:st, res};
  };
  out.asPhoto = await send(false);
  out.asFile  = await send(true);
  out.requests = reqs;
  return out;
};
