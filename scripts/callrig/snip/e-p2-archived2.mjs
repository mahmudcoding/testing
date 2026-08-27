import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const ARCH='C4QEARCHIVE0001';
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', r => { const u=r.url();
    if(u.includes('/api/v1/')&&/archiv/i.test(u)) calls.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,60)); });
  await page.goto(BASE+'/w/'+WS+'/c/'+ARCH, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  out.fullText = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,340))()`);
  out.archivedWording = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     // any visible text that says "archived" other than the channel name itself
     const hits=[...m.querySelectorAll('*')].filter(vis)
       .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim())
       .filter(t=>t.length<120 && /archiv/i.test(t) && !/^#?qa-archived$/i.test(t));
     return [...new Set(hits)].slice(0,5); })()`);
  out.composer = await page.evaluate(`(() => { ${VISFN}
     const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
     const anyEditable=[...document.querySelectorAll('[contenteditable="true"]')].filter(vis).length;
     const hint=[...document.querySelectorAll('*')].filter(vis)
       .map(n=>(n.textContent||'').trim()).filter(t=>t.length<90 && /Enter to send|read-only|cannot post|Only|archived/i.test(t));
     return {composerPresent:!!c, editableCount:anyEditable, hints:[...new Set(hint)].slice(0,4)}; })()`);
  out.emptyStateCTA = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const btns=[...m.querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
     return {buttons:[...new Set(btns)].slice(0,12),
             hasStartCTA:/Start this channel/i.test(m.innerText||''),
             hasAddUsers: btns.some(b=>/Add users?/i.test(b))}; })()`);
  // does clicking "Add users" do anything in an archived channel?
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Add users?$/i.test((x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2), disabled:b.disabled}; })()`);
  out.addUsersBtn = t;
  if(!t.none && !t.disabled){
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(4000);
    out.afterAddUsers = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
       return d? (d.innerText||'').replace(/\\s+/g,' ').slice(0,150):'(no dialog)'; })()`);
    await page.keyboard.press('Escape');
  }
  out.archivedApiCalls = calls.slice(0,4);
  out.archivedEndpointBody = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/me/channels/archived',{credentials:'include'});
     return {st:r.status, body:(await r.text()).slice(0,200)}; })()`);
  return out;
};
