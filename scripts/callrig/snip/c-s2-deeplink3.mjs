export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/C4OWSYMJ03CFIKL`);
  await page.waitForTimeout(10000);
  const ui = await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    return {composerPresent:!!c, composerEditable:c?c.getAttribute('contenteditable'):null,
      messages:document.querySelectorAll('main [data-message-id]').length,
      mainText:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,120):'NO-MAIN'};
  });
  const api = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4OWSYMJ03CFIKL/messages?limit=3',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, key:j&&j.key, n:j&&j.messages&&j.messages.length};
  });
  return {ui, serverSaysForThisAccount:api};
};
