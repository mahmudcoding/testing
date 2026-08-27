export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-people-toggle"]');
  if (await t.count() && await t.getAttribute('aria-pressed') !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate(()=>{
    const panel=document.querySelector('[data-testid="participants-list-panel"]');
    if(!panel) return {err:'no panel'};
    const btns=[...panel.querySelectorAll('button[aria-label="Participant actions"]')];
    return {
      panelText: panel.innerText.replace(/\n+/g,' | ').slice(0,300),
      actionButtons: btns.map((b,i)=>{
        // nearest ancestor that contains a participant name
        let n=b, txt='';
        for(let k=0;k<6&&n;k++,n=n.parentElement){ const t=(n.innerText||'').replace(/\n+/g,' ').trim(); if(t && t.length<60){ txt=t; break; } }
        return {i, nearestText: txt, rect:(r=>({y:Math.round(r.y)}))(b.getBoundingClientRect())};
      })
    };
  });
};
