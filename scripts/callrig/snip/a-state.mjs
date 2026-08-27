export default async ({page}) => {
  await page.waitForTimeout(1500);
  return await page.evaluate(async () => {
    let cur=null; try{cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){}
    const b=document.body;
    return {url: location.href, vis: document.visibilityState,
      bodyText: b.innerText.replace(/\n+/g,' | ').slice(0,700),
      buttons: [...b.querySelectorAll('button')].map(x=>((x.getAttribute('aria-label')||x.textContent||'').trim()+'#'+(x.getAttribute('data-testid')||'-')).slice(0,55)).filter(Boolean).slice(0,30),
      cur: cur && cur.meeting ? {id:cur.meeting.id,status:cur.meeting.status} : cur};
  });
};
