export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});
      const j=await r.json().catch(()=>null); return {s:r.status,j};};
    const arr=x=>Array.isArray(x)?x:((x&&(x.users||x.sessions||x.items||x.roles||x.invites))||[]);
    const me=(await g('/api/v1/auth/me')).j;
    const sess=await g('/api/v1/security/sessions');
    const blocked=await g('/api/v1/messaging/users/blocked');
    const appearance=(()=>{try{return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}')}catch{return{}}})();
    return { who:me.email.split('@')[0], name:me.name,
             language:(me.settings||{}).language,
             profileFields:(me.settings||{}).profile||null,
             contacts:(me.settings||{}).contacts||null,
             customStatus:(me.custom_status||{}).text||null,
             sessions:arr(sess.j).length,
             blocked:arr(blocked.j).length,
             appearanceNonDefault:Object.entries({theme:'system',density:'cozy',accent:'#2454D8',
               msgLayout:'standard',sidebarSide:'left',sidebarTone:'light',railTone:'dark',
               showRoles:true,linkPreviews:true,markdownPreviewPanel:false,animations:true})
               .filter(([k,v])=>appearance[k]!==v).map(([k])=>k) }; })()`);
};
