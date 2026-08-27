import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r => { if(r.url().includes('/api/v1/search'))
    reqs.push(decodeURIComponent(r.url().split('/api/v1/')[1]).slice(0,140)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('probe'); await page.waitForTimeout(4500);
  const dlgState = `(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Relevance');
     const rows=[...d.querySelectorAll('button')].filter(vis)
       .filter(b=>/^Open (message|file|channel)/i.test((b.getAttribute('aria-label')||b.textContent||'').trim())).length;
     return {tabs:t.slice(i,i+62), resultRows:rows}; })()`;
  out.initial = await page.evaluate(dlgState);
  const tab = async name => { const t=await page.evaluate(`(() => { ${VISFN}
      const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
      const b=[...d.querySelectorAll('button,[role=tab]')].filter(vis)
        .find(x=>new RegExp('^'+${JSON.stringify(name)}+'\\\\s*\\\\d*$').test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2),
              sel:b.getAttribute('aria-selected'), pressed:b.getAttribute('aria-pressed')}; })()`);
    if(t.none) return {name, r:'not found'};
    reqs.length=0;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(260);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(3500);
    const after = await page.evaluate(dlgState);
    return {name, selBefore:t.sel, request:reqs[0]||'(no new request)', ...after};
  };
  out.tabs=[];
  for(const n of ['Messages','Files','People','Channels','All']) out.tabs.push(await tab(n));
  await page.keyboard.press('Escape');
  return out;
};
