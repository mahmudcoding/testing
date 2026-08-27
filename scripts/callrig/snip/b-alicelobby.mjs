export default async ({page}) => {
  return await page.evaluate(async () => {
    const visible = el => {
      const r = el.getBoundingClientRect();
      if (r.width===0 || r.height===0) return false;
      let o=1,n=el; while(n && n!==document.documentElement){ const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement; }
      return o>0.05;
    };
    const btns = [...document.querySelectorAll('button,[role=button],a')].filter(visible)
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,45), al:b.getAttribute('aria-label'), tid:b.getAttribute('data-testid')}))
      .filter(b=>b.t||b.al);
    const dialogs = [...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(visible).map(d=>d.innerText.replace(/\s+/g,' ').slice(0,300));
    const body = document.body.innerText.replace(/\s+/g,' ');
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    return {
      url: location.href,
      dialogs,
      mentionsWaiting: /wait|admit|lobby|approve|knock|request/i.test(body),
      waitingSnippet: (body.match(/.{0,80}(waiting|admit|approve|lobby).{0,80}/i)||[])[0]||null,
      buttonCount: btns.length,
      buttons: btns.map(b=>b.al||b.t).slice(0,45),
      curKeys: cur? Object.keys(cur).slice(0,25): null,
      waitingRoomApi: cur ? JSON.stringify({wr: cur.waiting_room||cur.waiting||cur.lobby||cur.pending_participants||null}).slice(0,300) : null
    };
  });
};
