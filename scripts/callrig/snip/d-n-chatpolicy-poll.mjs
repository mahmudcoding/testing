export default async ({page}) => {
  const ms=+(process.env.QA_MS||45000), every=300;
  const t0=Date.now(); const changes=[]; let prev=null;
  while(Date.now()-t0<ms){
    const s = await page.evaluate(()=>{
      const p=document.querySelector('[data-testid="in-call-chat-panel"]');
      const ta=p?p.querySelector('textarea'):null;
      const send=p?[...p.querySelectorAll('button')].find(b=>/^Send$/.test((b.innerText||'').trim())):null;
      return {ph:ta?ta.placeholder:null, dis:ta?ta.disabled:null,
        sendDis: send? (send.disabled||send.getAttribute('aria-disabled')) : null,
        notice: p? ((p.innerText||'').match(/Chat is [^.\n]*/)||[null])[0] : null,
        vs:document.visibilityState};
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({at:Date.now(),...s}); prev=k;}
    await page.waitForTimeout(every);
  }
  return {changes};
};
