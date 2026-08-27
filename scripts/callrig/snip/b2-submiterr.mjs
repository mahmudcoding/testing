export default async ({page}) => {
  return await page.evaluate(()=>{
    const e=document.querySelector('[data-testid="calls-start-submit-error"]');
    const dlg=[...document.querySelectorAll('[role=dialog]')].pop();
    return {err: e?(e.innerText||'').replace(/\s+/g,' ').trim():null,
            errVisible: e?!!e.offsetParent:null,
            dlgTail: dlg?(dlg.innerText||'').replace(/\n+/g,' | ').slice(-260):null};
  });
};
