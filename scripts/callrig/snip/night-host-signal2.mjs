export default async ({page}) => {
  const ms = Number(process.env.QA_MS||45000);
  return await page.evaluate(async (ms) => {
    const t0=Date.now(); const events=[];
    const snap = () => {
      const tb = document.querySelector('[data-testid="call-toolbar"]');
      const wc = document.querySelector('[data-testid="call-controls-waiting-count"]');
      const pb = document.querySelector('[data-testid="call-controls-people-toggle"]');
      return JSON.stringify({
        toolbarText: tb ? tb.innerText.replace(/\n+/g,'/').slice(0,120) : null,
        waitingCount: wc ? wc.textContent.trim() : null,
        peopleBtnHtmlLen: pb ? pb.innerHTML.length : null,
        peopleBtnText: pb ? pb.innerText.replace(/\n+/g,'/') : null,
        toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,120)).filter(Boolean)
      });
    };
    let last = snap();
    events.push({at:'0s', state: JSON.parse(last)});
    while (Date.now()-t0 < ms) {
      await new Promise(r=>setTimeout(r,300));
      const cur = snap();
      if (cur !== last) { events.push({at: Math.round((Date.now()-t0)/100)/10+'s', state: JSON.parse(cur)}); last = cur; }
    }
    return {events};
  }, ms);
};
