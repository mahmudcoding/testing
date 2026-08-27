import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET'){ let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
      api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,52)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEEMPTY000001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  // open the channel header menu and enumerate
  out.open = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const h=document.querySelector('main');
     const btns=[...h.querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(Boolean);
     return btns.slice(0,16); })()`);
  // click the channel name / options
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     return clickDeepest(document.querySelector('main'), /^(Channel options|More|Options|qa-empty)$/); })()`);
  await page.waitForTimeout(2500);
  out.menu = await page.evaluate(`(() => { ${VISFN}
     const items=[...document.querySelectorAll('[role=menuitem],[role=dialog] button,[role=menu] button')].filter(vis)
       .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,30)).filter(Boolean);
     return [...new Set(items)].slice(0,20); })()`);
  api.length=0;
  out.leaveClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const root=document.querySelector('[role=menu]')||document.querySelector('[role=dialog]')||document.body;
     return clickDeepest(root, /Leave/); })()`);
  await page.waitForTimeout(2500);
  out.confirm = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>1;}).pop();
     if(!d) return 'no dialog';
     const t=(d.innerText||'').replace(/\\s+/g,' ').slice(0,120);
     const r=clickDeepest(d, /^(Leave|Leave channel|Confirm)$/);
     return t+' >> '+r; })()`);
  await page.waitForTimeout(5000);
  out.api = api.slice(0,3);
  await page.goto(BASE+'/w/'+WS+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,140))()`);
  return out;
};
