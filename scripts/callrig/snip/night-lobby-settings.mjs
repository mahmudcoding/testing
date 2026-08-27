export default async ({page}) => {
  const btns=await page.$$('main button');
  let clicked=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Settings$/i.test(l)){ await b.click(); clicked=l; break; } }
  if(!clicked) return {err:'no Settings in lobby', labels: await page.evaluate(()=>[...document.querySelectorAll('main button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()))};
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')];
    const m=ms[ms.length-1];
    return {
      panel: m?{testid:m.getAttribute('data-testid'), text:m.innerText.replace(/\n+/g,' | ').slice(0,500),
        controls:[...m.querySelectorAll('button,select,input,[role="option"],[role="menuitem"]')].map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40), t:e.getAttribute('data-testid'), tag:e.tagName.toLowerCase()}))}:null,
      newTestids:[...new Set([...document.querySelectorAll('[data-testid*="device" i],[data-testid*="lobby" i]')].map(e=>e.getAttribute('data-testid')))]
    };
  });
};
