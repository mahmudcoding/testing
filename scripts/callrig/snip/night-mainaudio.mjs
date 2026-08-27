export default async ({page}) => {
  const btns=await page.$$('button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim(); if(/main call audio/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Main call audio button', labels: await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,25))};
  await page.waitForTimeout(2000);
  const pop=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,300),
      controls:[...m.querySelectorAll('input,button,[role="slider"]')].map(e=>({tag:e.tagName.toLowerCase(), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,34), type:e.type, val:e.value, min:e.min, max:e.max, t:e.getAttribute('data-testid')}))}:null;
  });
  const audioVols=await page.evaluate(()=>[...document.querySelectorAll('audio')].map(a=>({vol:a.volume, muted:a.muted, hasSrc:!!a.srcObject})));
  return {clicked, popover: pop, audioElements: audioVols};
};
