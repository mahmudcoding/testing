import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/security/sessions')) api.push(r.status()+' '+r.request().method()+' …/'+u.split('/sessions')[1].slice(0,42)); });
  await page.goto(BASE+'/w/'+WS+'/settings/sessions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const read = `(async () => { const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
     const d=await r.json(); const s=d.sessions||[];
     return {n:s.length, ids:s.map(x=>x.id.slice(0,8)+(x.is_current?'(cur)':'')) }; })()`;
  out.before = await page.evaluate(read);
  api.length=0;
  out.clicked = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const b=[...m.querySelectorAll('button')].filter(vis)
      .filter(x=>(x.textContent||'').replace(/\\s+/g,' ').trim()==='Sign out');
    if(b.length!==1) return 'expected 1 exact "Sign out", got '+b.length;
    b[0].click(); return 'clicked the row-scoped Sign out';
  })()`);
  await page.waitForTimeout(2500);
  out.dialog = await page.evaluate(`(() => { ${VISFN}
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>1&&r.height>1;});
    if(!d.length) return null;
    const e=d[d.length-1];
    return {text:(e.innerText||'').replace(/\\s+/g,' ').slice(0,200),
            buttons:[...e.querySelectorAll('button')].filter(vis).map(b=>(b.textContent||'').trim().slice(0,30))}; })()`);
  if (out.dialog) {
    await page.evaluate(`(() => { ${VISFN}
      const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].pop();
      const b=[...d.querySelectorAll('button')].filter(vis)
        .find(x=>/^(sign out|confirm|yes|revoke)$/i.test((x.textContent||'').trim()));
      if(b) b.click(); })()`);
    await page.waitForTimeout(3000);
  }
  await page.waitForTimeout(3000);
  out.requests = api.slice(0,5);
  out.after = await page.evaluate(read);
  out.rowsOnScreen = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('div,li')].filter(e=>vis(e)&&/Mozilla\\/5\\.0/.test(e.innerText||'')&&(e.innerText||'').length<400)
       .filter((r,_,a)=>!a.some(o=>o!==r&&r.contains(o))).length; })()`);
  return out;
};
