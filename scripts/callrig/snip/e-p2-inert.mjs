import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const state = (label) => `(() => { ${VISFN}
  const b=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'')===${JSON.stringify(label)});
  const r=b?b.getBoundingClientRect():null;
  return {
    found: !!b,
    rect: r? Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height):null,
    hitSelf: b? (()=>{const h=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); return h===b||b.contains(h)||h.contains(b);})():null,
    hitTag: b? (()=>{const h=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); return h?h.tagName+'.'+(h.className||'').toString().slice(0,25):null;})():null,
    attrs: b? Object.fromEntries([...b.attributes].map(a=>[a.name, a.value.slice(0,40)])) : null,
    disabled: b? b.disabled : null,
    openish: [...document.querySelectorAll('[data-state="open"]')].map(e=>e.tagName+':'+(e.getAttribute('data-testid')||e.getAttribute('role')||'')).slice(0,8),
    dialogs: document.querySelectorAll('[role=dialog]').length,
    portals: document.querySelectorAll('[data-radix-popper-content-wrapper]').length,
    bodyKids: document.body.children.length,
    url: location.pathname+location.search
  };
})()`;
export default async ({page}) => {
  const out={};
  const reqs=[];
  page.on('request', r => { const u=r.url(); if (u.includes('/api/')) reqs.push(r.method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,90)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  for (const label of ['Message requests','Open archived channels']) {
    reqs.length = 0;
    out[label] = {};
    out[label].before = await page.evaluate(state(label));
    try {
      await page.locator(`button[aria-label="${label}"]`).first().click({timeout: 8000});
      out[label].clicked = true;
    } catch(e) { out[label].clicked = 'ERR '+String(e).replace(/\s+/g,' ').slice(0,110); }
    const trace=[];
    for (let i=0;i<14;i++){ await page.waitForTimeout(300); const s=await page.evaluate(state(label));
      trace.push(`d${s.dialogs}p${s.portals}b${s.bodyKids}${s.attrs?(s.attrs['aria-expanded']||'-'):'?'}`); }
    out[label].trace = trace.join(' ');
    out[label].after = await page.evaluate(state(label));
    out[label].apiReqs = reqs.slice(-8);
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  }
  return out;
};
