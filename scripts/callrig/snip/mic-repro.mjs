export default async ({page}) => {
  const r={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const all = await page.$$('main button');
  const lab = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = lab.findIndex(t=>/^Join$/i.test(t));
  if (i>=0){ await all[i].click(); await page.waitForTimeout(5000);
    const b2 = await page.$$('button');
    const l2 = await Promise.all(b2.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
    const j = l2.findIndex(t=>/^Join$/i.test(t));
    if (j>=0){ await b2[j].click(); await page.waitForTimeout(9000); } }
  const read = async()=>await page.evaluate(()=>{const o=[];(window.__pcs||[]).forEach(pc=>{if(pc.connectionState!=='closed')pc.getSenders().forEach(s=>{if(s.track)o.push(s.track.label+' | id '+s.track.id.slice(0,8));});});return {senders:o,gum:(window.__gumCalls||[]).length};});
  r.joined = await read();
  const sel = await page.$('button[aria-label="Select microphone"]');
  if (!sel) return {...r, err:'no mic selector'};
  await sel.click(); await page.waitForTimeout(2200);
  const m=[...(await page.$$('[role="menu"],[data-radix-popper-content-wrapper]'))].pop();
  if (m) for (const it of await m.$$('button,[role="menuitem"],[role="menuitemradio"]')) {
    const t=(await it.innerText()).trim(); if (/Fake Audio Input 1/i.test(t)) { await it.click(); r.picked=t.replace(/\n/g,' '); break; } }
  await page.waitForTimeout(6000);
  r.afterSwitch = await read();
  return r;
};
