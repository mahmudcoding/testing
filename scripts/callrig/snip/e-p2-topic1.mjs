import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=channels`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const ui = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const names=[...m.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /^(qa|e)-[a-z0-9-]+$/.test((e.textContent||'').trim()));
    return names.map(e=>{
      let row=e; for(let i=0;i<6&&row;i++){ if((row.textContent||'').length>30) break; row=row.parentElement; }
      return {name:e.textContent.trim(), row:(row?row.textContent:'').replace(/\s+/g,' ').slice(0,110)};
    });
  });
  const api = await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const b=await r.json(); const a=b.channels||b.data||[];
    return (Array.isArray(a)?a:[]).map(c=>({name:c.name, topic:c.topic??c.description??null}));
  }, WS);
  return {directoryRows:ui, apiChannels:api};
};
