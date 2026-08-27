import { VIS } from './a-nb-lib.mjs';
const READ = `async (v) => { const vis=eval(v);
  const b=[...document.querySelectorAll('button')].filter(vis)
    .find(x=>/^Turn camera (on|off)$/.test((x.getAttribute('aria-label')||'').trim()));
  const pcs=window.__pcs||[]; let vid=null;
  for (const pc of pcs) { if(pc.connectionState==='closed') continue;
    for (const s of pc.getSenders()) if (s.track && s.track.kind==='video') vid=(s.track.label||'').slice(0,20)+':'+s.track.enabled; }
  const alerts=[...document.querySelectorAll('[role="alert"],[role="status"]')].filter(vis)
    .map(e=>(e.textContent||'').trim().slice(0,90)).filter(Boolean);
  return {label:b?b.getAttribute('aria-label'):null, disabled:b?b.disabled:null,
          pressed:b?b.getAttribute('aria-pressed'):null, videoSender:vid, alerts};
}`;
export default async ({page}) => {
  const out={net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    let b=null; try{b=(await r.text()).slice(0,140);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),body:b}); });
  await page.mouse.move(700,500); await page.waitForTimeout(500);
  out.before = await page.evaluate(([v,r])=>eval('('+r+')')(v), [VIS, READ]);
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>/^Turn camera (on|off)$/.test((x.getAttribute('aria-label')||'').trim()));
    if(b) b.click(); }, VIS);
  const seq=[];
  for (let i=0;i<8;i++){ await page.waitForTimeout(1000);
    seq.push({s:i+1, ...(await page.evaluate(([v,r])=>eval('('+r+')')(v), [VIS, READ]))}); }
  out.seq = seq.filter((x,i)=> i===0 || JSON.stringify({...x,s:0})!==JSON.stringify({...seq[i-1],s:0}));
  return out;
};
