export default async ({page}) => {
  return await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const txt=(r.innerText||'').replace(/\n+/g,' | ');
    const p=[...r.querySelectorAll('[data-testid="call-side-panel-slot"]')][0];
    return {header: txt.slice(0,260),
      hasSideRoomName: /QA Side/.test(txt.split('Side Rooms')[0]||''),
      leaveRoomBtn: [...r.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.textContent||'').trim()).filter(t=>/leave|switch|back to main|return/i.test(t)),
      panel: p?(p.innerText||'').replace(/\n+/g,' | ').slice(0,220):null};
  });
};
