// Works for both member and guest panels.
export default async ({page}) => {
  const ms=+(process.env.QA_MS||45000), every=300;
  const t0=Date.now(); const changes=[]; let prev=null; let samples=0;
  while(Date.now()-t0<ms){
    samples++;
    const s = await page.evaluate(()=>{
      const p=document.querySelector('[data-testid="in-call-chat-panel"]')||document.querySelector('[data-testid="call-side-panel-slot"]');
      if(!p) return {noPanel:true};
      const ta=p.querySelector('textarea');
      const send=[...p.querySelectorAll('button')].find(b=>/^Send$/.test((b.innerText||'').trim())||b.getAttribute('aria-label')==='Send');
      const to=[...p.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='To');
      return {ph:ta?ta.placeholder:null, taDis:ta?ta.disabled:null,
        sendDis: send? String(send.disabled) : null, toDis: to? String(to.disabled) : null,
        notice: ((p.innerText||'').match(/Chat is [^.\n]*/)||[null])[0],
        react: p.querySelectorAll('[data-testid="ic-message-react-trigger"]').length,
        vs:document.visibilityState};
    });
    const k=JSON.stringify(s); if(k!==prev){changes.push({at:Date.now(),...s}); prev=k;}
    await page.waitForTimeout(every);
  }
  const dur=Date.now()-t0;
  return {health:{samples,durMs:dur,effectiveIntervalMs:Math.round(dur/samples)}, changes};
};
