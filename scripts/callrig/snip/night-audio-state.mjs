export default async ({page}) => {
  return await page.evaluate(()=>{
    const a=document.querySelector('audio');
    const rows=[...document.querySelectorAll('[data-testid="lobby-check-row"]')].map(r=>r.innerText.replace(/\n+/g,' | ').slice(0,50));
    const btn=[...document.querySelectorAll('main button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean);
    return {
      audio: a?{src:(a.currentSrc||'').slice(-30), paused:a.paused, currentTime:a.currentTime, duration:a.duration, ended:a.ended, readyState:a.readyState}:null,
      rows, buttons: btn
    };
  });
};
