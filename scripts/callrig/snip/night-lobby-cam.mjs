export default async ({page}) => {
  const btns=await page.$$('main button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Camera off$/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no camera button', labels: await page.evaluate(()=>[...document.querySelectorAll('main button')].map(b=>b.getAttribute('aria-label')))};
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    const prev=document.querySelector('[data-testid="lobby-preview"]');
    return {
      camButton:(b=>b?b.getAttribute('aria-label'):null)([...m.querySelectorAll('button')].find(x=>/camera/i.test(x.getAttribute('aria-label')||''))),
      videos:[...m.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused,hasSrc:!!v.srcObject,
        tracks: v.srcObject? v.srcObject.getTracks().map(t=>t.kind+':'+t.readyState):[]})),
      previewText: prev?prev.innerText.replace(/\n+/g,' | ').slice(0,120):null,
      checkRows:[...document.querySelectorAll('[data-testid="lobby-check-row"]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,60))
    };
  });
};
