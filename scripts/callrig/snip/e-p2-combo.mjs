import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r => { if(r.url().includes('/api/v1/search'))
    reqs.push(decodeURIComponent(r.url().split('/api/v1/')[1]).slice(0,150)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const open = async () => { await page.evaluate(`(() => { ${VISFN}
      const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
      if(b) b.click(); })()`); await page.waitForTimeout(2600); };
  const state = `(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Relevance');
     const chips=[...d.querySelectorAll('button')].filter(vis)
       .map(b=>(b.textContent||'').trim()).filter(x=>/^in #|^@/.test(x));
     return {tabs:t.slice(i,i+70), scopeChips:chips.slice(0,3)}; })()`;
  const clickTxt = async (re) => { const t=await page.evaluate(`(() => { ${VISFN}
      const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
      const b=[...d.querySelectorAll('button,[role=tab]')].filter(vis).find(x=>${re}.test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'not found';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(240);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(3200); return 'clicked'; };

  // A: typed channel scope + Files tab
  await open(); reqs.length=0;
  await page.keyboard.type(':in #qa-general probe'); await page.waitForTimeout(4200);
  out.A_scopeOnly = {req:reqs[reqs.length-1]||'(none)', ...(await page.evaluate(state))};
  out.A_filesTab = await clickTxt('/^Files\\s*\\d*$/');
  out.A_after = {req:reqs[reqs.length-1]||'(none)', ...(await page.evaluate(state))};
  await page.keyboard.press('Escape'); await page.waitForTimeout(1400);

  // B: scope + date range + sort
  await open(); reqs.length=0;
  await page.keyboard.type(':in #qa-general probe'); await page.waitForTimeout(4200);
  out.B_date = await clickTxt('/^Last 7 days$/');
  out.B_afterDate = {req:reqs[reqs.length-1]||'(none)', ...(await page.evaluate(state))};
  out.B_sortOpen = await clickTxt('/^Relevance$/');
  out.B_sortMenu = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button')].filter(vis)
       .map(n=>(n.textContent||'').trim()).filter(x=>x&&x.length<22))].slice(0,6); })()`);
  out.B_pickDate = await clickTxt('/^Date$/');
  out.B_final = {req:reqs[reqs.length-1]||'(none)', ...(await page.evaluate(state))};
  await page.keyboard.press('Escape');
  out.allRequests = [...new Set(reqs)].slice(-4);
  return out;
};
