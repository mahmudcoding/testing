export default async ({page}) => {
  // ensure participants panel open
  const isParts = async ()=> await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return !!p && /^Participants/.test((p.innerText||'').trim());});
  for(let i=0;i<3 && !(await isParts()); i++){
    await page.click('button[data-testid="call-controls-people-toggle"]'); await page.waitForTimeout(2000);
  }
  return await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const tiles=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>{
      let n=b,best=b; while(n&&n!==r){const q=n.getBoundingClientRect(); if(q.width>120&&q.height>90){best=n;break;} n=n.parentElement;}
      return {who:(b.getAttribute('aria-label')||'').replace('Participant actions for ',''),
        text:(best.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)};});
    const handish=[...r.querySelectorAll('*')].filter(e=>{
      const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
      return /hand|raised/i.test(own);}).map(e=>(e.textContent||'').trim().slice(0,60)).slice(0,5);
    return {panel:p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,300):null, tiles, handMentions:handish};
  });
};
