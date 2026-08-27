export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && r.url().includes('/api/v1/meeting')){ let b=''; try{b=(await r.text()).slice(0,200);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const before=await page.evaluate(()=>({
    hasStart: !!document.querySelector('[data-testid="calls-hub-start-now"]'),
    pip: !!document.querySelector('[data-testid="draggable-pip"]'),
    main:(document.querySelector('main')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,120)}));
  if(!before.hasStart) return {before, err:'no Start now button'};
  await page.click('[data-testid="calls-hub-start-now"]');
  await page.waitForTimeout(4000);
  const after=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')].filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=ms[ms.length-1];
    return {dialog: m?m.innerText.replace(/\n+/g,' | ').slice(0,200):null,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,120)).filter(Boolean),
      url: location.href};
  });
  return {before, after, net};
};
