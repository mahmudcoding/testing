export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const out={};
  out.tabs = await page.evaluate(()=>[...document.querySelectorAll('[role="tab"]')].map(t=>t.innerText.replace(/\n+/g,' ').trim()));
  for (const name of ['All','Group meetings','1-to-1']) {
    const t = await page.$(`[role="tab"]:has-text("${name}")`);
    if (t) { await t.click().catch(()=>{}); await page.waitForTimeout(2000);
      out[name] = await page.evaluate(()=>{const m=document.querySelector('main');const i=m.innerText.indexOf('Recent calls');return m.innerText.slice(i,i+420).replace(/\n+/g,' | ');}); }
  }
  out.api = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/meetings/history?limit=10',{credentials:'include'})).json();
    return (j.meetings||[]).map(m=>({name:m.name||'(empty)', ch:m.channel_id||'(none)', status:m.status, dur:m.ended_at}));});
  return out;
};
