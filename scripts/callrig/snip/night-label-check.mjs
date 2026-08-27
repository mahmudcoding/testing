export default async ({page}) => {
  return await page.evaluate(() => {
    const out=[];
    for (const key of ['can_manage_chat','can_manage_microphone','can_kick_participants']) {
      const b=document.querySelector('[data-testid="admin-permission-'+key+'"]');
      if(!b) { out.push({key, missing:true}); continue; }
      const id=b.id;
      const lab = id ? document.querySelector('label[for="'+CSS.escape(id)+'"]') : null;
      const wrap = b.closest('label');
      out.push({key, id, labelFor: lab?lab.innerText.trim().slice(0,50):null,
                wrappedInLabel: !!wrap, wrapText: wrap?wrap.innerText.trim().slice(0,50):null,
                checked: b.checked, disabled: b.disabled});
    }
    return out;
  });
};
