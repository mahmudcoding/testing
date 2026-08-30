export default async ({page}) => {
  const id=process.env.QA_MID, ws='W4QDF1XTURESO01';
  const out={};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  out.panelHeader = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    if(!p) return null;
    return [...p.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim()).slice(0,4);
  });
  out.api = await page.evaluate(async({id,ws})=>{
    const m = await fetch(`/api/v1/meeting/${id}`,{credentials:'include'}); const mj=JSON.parse(await m.text()).meeting;
    const c = await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'}); const ct=await c.text();
    let names=[]; try{ const cj=JSON.parse(ct); const arr=cj.channels||cj.data||cj.items||[]; names=arr.map(x=>x.name); }catch(e){ names=['PARSE_FAIL:'+ct.slice(0,150)]; }
    return {meeting_channel_id: mj.channel_id, meeting_name: mj.name, channelStatus:c.status, channelNames:names};
  }, {id, ws});
  return out;
};
