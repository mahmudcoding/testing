export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const targets=[["DM I am not part of",'d/C4OX37SVWDRD28T'],
                 ["private channel I am not in",'c/C4QCEMPTY000001']];
  const out=[];
  for (const [name,path] of targets) {
    await page.goto(`https://airion-cargo.store/w/${ws}/${path}`);
    await page.waitForTimeout(9000);
    out.push(await page.evaluate((name)=>{
      const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
      const main=document.querySelector('main');
      return {name, composerPresent:!!c,
        composerEditable:c?c.getAttribute('contenteditable'):null,
        messages:document.querySelectorAll('main [data-message-id]').length,
        mainText:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,110):'NO-MAIN'};
    },name));
  }
  return out;
};
