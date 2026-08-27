export default async ({page}) => {
  const ms = Number(process.env.QA_MS||35000);
  return await page.evaluate(async (ms) => {
    const t0=Date.now(); const events=[];
    const peopleSnap = () => {
      const b = document.querySelector('[data-testid="call-controls-people-toggle"]');
      if (!b) return 'no-button';
      return JSON.stringify({txt:(b.innerText||'').replace(/\n+/g,'/'), html: b.innerHTML.replace(/\s+/g,' ').slice(0,220)});
    };
    const toastSnap = () => JSON.stringify([...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast" i]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,140)).filter(Boolean));
    let lastP = peopleSnap(), lastT = toastSnap();
    events.push({at:0, peopleButton: JSON.parse(lastP==='no-button'?'null':lastP), toasts: JSON.parse(lastT)});
    while (Date.now()-t0 < ms) {
      await new Promise(r=>setTimeout(r,300));
      const p = peopleSnap(), t = toastSnap();
      if (p !== lastP) { events.push({at: Math.round((Date.now()-t0)/100)/10+'s', peopleButtonChanged: JSON.parse(p==='no-button'?'null':p)}); lastP = p; }
      if (t !== lastT) { events.push({at: Math.round((Date.now()-t0)/100)/10+'s', toasts: JSON.parse(t)}); lastT = t; }
    }
    return {events};
  }, ms);
};
