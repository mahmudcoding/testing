import { DOM } from './lib.mjs';
// QA_WHO='QA Alice' QA_DEV='Screen sharing' QA_VAL='Allow'  — set one per-participant device permission.
// QA_DEV in {Microphone, Camera, Screen sharing}; QA_VAL in {Inherit, Allow, Block}
export default async ({page}) => {
  await page.evaluate(DOM);
  const who = process.env.QA_WHO || 'QA Alice';
  const dev = process.env.QA_DEV || 'Microphone';
  const val = process.env.QA_VAL || 'Block';
  const out = {who, dev, val};
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET'){let b=null;try{b=(await r.text()).slice(0,300);}catch(e){}
    net.push({m:r.request().method(),s:r.status(),u:u.replace(/https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,200),res:b});}});
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const tog = await page.$('[data-testid="call-controls-people-toggle"]');
  if (tog && (await tog.getAttribute('aria-pressed')) !== 'true') { await tog.click(); await page.waitForTimeout(1500); }
  // row menu
  const h = await page.evaluateHandle((who)=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const acts=[...document.querySelectorAll('button[aria-label="Participant actions"]')].filter(vis);
    for(const a of acts){let el=a;for(let i=0;i<8&&el;i++){el=el.parentElement;if(!el)break;const t=T(el);
      if(t.includes(who))return a; if(/QA (Owner|Alice|Bob|Carol|Guest|Dave|Admin)/.test(t))break;}}
    return null;}, who);
  const el=h.asElement(); out.rowFound=!!el; if(!el) return out;
  let b=await el.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(1500);
  const dh = await page.evaluateHandle(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const c=[...document.querySelectorAll('[role=menu],[data-radix-menu-content],[data-radix-popper-content-wrapper]')].filter(vis);
    const m=c[c.length-1];if(!m)return null;
    const items=[...m.querySelectorAll('*')].filter(e=>vis(e)&&/^Device permissions/.test((e.textContent||'').trim()));
    items.sort((x,y)=>x.textContent.length-y.textContent.length); return items[0]||null;});
  const de=dh.asElement(); out.menuItemFound=!!de; if(!de) return out;
  b=await de.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(1800);
  out.beforeBadges = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).find(x=>/Device permissions/.test(x.innerText||''));
    return d?(d.innerText||'').replace(/\s+/g,' ').trim():null;});
  // pick the radio
  const rh = await page.evaluateHandle(([dev,val])=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).find(x=>/Device permissions/.test(x.innerText||''));
    if(!d)return null;
    const radios=[...d.querySelectorAll('[role=radio]')].filter(vis);
    // group = smallest ancestor containing the device name AND at least one radio
    let best=null,bl=1e9;
    for(const e of d.querySelectorAll('*')){const t=T(e); if(!t.includes(dev))continue;
      const rs=[...e.querySelectorAll('[role=radio]')].filter(vis); if(rs.length<3)continue;
      if(t.length<bl){bl=t.length;best=e;}}
    if(!best)return null;
    const rs=[...best.querySelectorAll('[role=radio]')].filter(vis);
    return rs.find(r=>T(r)===val)||null;},[dev,val]);
  const re=rh.asElement(); out.radioFound=!!re; if(!re) return out;
  b=await re.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(800);
  const save = await page.$('[data-testid="device-permissions-save"]');
  out.saveDisabled = save ? await save.evaluate(e=>e.disabled) : null;
  if (save && !out.saveDisabled) { const sb=await save.boundingBox(); out.saveClickEpoch = Date.now(); await page.mouse.click(sb.x+sb.width/2,sb.y+sb.height/2); out.saved=true; await page.waitForTimeout(2500); }
  out.afterDialog = await page.evaluate(()=>{const q=window.__qa;const vis=(e)=>q.vis(e)||q.boxVis(e);
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).find(x=>/Device permissions/.test(x.innerText||''));
    return d?(d.innerText||'').replace(/\s+/g,' ').trim():'(dialog closed)';});
  out.net=net;
  return out;
};
