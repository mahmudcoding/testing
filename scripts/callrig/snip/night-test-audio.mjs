export default async ({page}) => {
  const net=[];
  page.on('response', r=>{ const u=r.url(); if(/\.(mp3|wav|ogg|m4a)/i.test(u)) net.push(r.status()+' '+u.slice(-60)); });
  const before=await page.evaluate(()=>({audios:document.querySelectorAll('audio').length, ctxs:(window.__ac||0)}));
  const btns=await page.$$('main button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Test audio$/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Test audio button'};
  await page.waitForTimeout(1200);
  const during=await page.evaluate(()=>({
    audios:[...document.querySelectorAll('audio')].map(a=>({src:(a.currentSrc||a.src||'').slice(-40), paused:a.paused, t:a.currentTime})),
    btn:(b=>b?b.textContent.trim().slice(0,30):null)([...document.querySelectorAll('main button')].find(x=>/test/i.test(x.textContent||''))),
    row:(r=>r?r.innerText.replace(/\n+/g,' | ').slice(0,80):null)(document.querySelectorAll('[data-testid="lobby-check-row"]')[1])
  }));
  await page.waitForTimeout(4000);
  const after=await page.evaluate(()=>({
    audios:[...document.querySelectorAll('audio')].map(a=>({paused:a.paused,t:a.currentTime})),
    btn:(b=>b?b.textContent.trim().slice(0,30):null)([...document.querySelectorAll('main button')].find(x=>/test/i.test(x.textContent||'')))
  }));
  return {clicked, beforeAudios: before.audios, during, after, mediaRequests: net};
};
