export default async ({page}) => {
  const M=process.env.QA_MEET;
  const rd = async ()=> await page.evaluate(async (M)=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const p=[...r.querySelectorAll('[data-testid="call-side-panel-slot"]')][0];
    let api=null; try{ const j=await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json();
      api=(j.participants||[]).map(x=>x.name+':'+(x.breakout_room_id||'main')); }catch(e){}
    return {panel:p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,200):null,
      tiles:[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(x=>(x.getAttribute('aria-label')||'').replace('Participant actions for ','')), api};
  }, M);
  const steps={};
  steps.start = await rd();
  // open side rooms panel and Join the public room
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-breakout-rooms'); if(b)b.click();});
  await page.waitForTimeout(2000);
  const joined = await page.evaluate(()=>{const b=[...document.querySelectorAll('[data-testid="side-room-action"]')].find(x=>/^Join$/i.test((x.textContent||'').trim())); if(b){b.click();return true;} return false;});
  await page.waitForTimeout(7000);
  steps.inRoom = await rd();
  const left = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Leave room$/i.test((x.textContent||'').trim())); if(b){b.click();return true;} return false;});
  await page.waitForTimeout(7000);
  // switch to participants panel
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-breakout-rooms'); if(b)b.click();});
  await page.waitForTimeout(800);
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-people-toggle'); if(b)b.click();});
  await page.waitForTimeout(3000);
  steps.afterLeave = await rd();
  return {joined, left, steps};
};
