export default async ({page}) => {
  const ws=page.url().split('/w/')[1].split('/')[0];
  if (!page.url().includes('/chat/mentions')) {
    await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  }
  const s=[];
  for (let i=0;i<12;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate(()=>{
      const tabs=[...document.querySelectorAll('[role="tab"]')].map(t=>t.textContent.trim().slice(0,16));
      return {tabs, rows:document.querySelectorAll('main [data-message-id]').length,
        arts:document.querySelectorAll('main article, main li').length};
    }));
    if (s.length>2 && JSON.stringify(s.at(-1))===JSON.stringify(s.at(-2))) break;
  }
  const body = await page.evaluate(()=>{
    const m=document.querySelector('main'); return m? m.innerText.replace(/\s+/g,' ').slice(0,700):'no main';
  });
  return {settle:s.at(-1), samples:s.length, body};
};
