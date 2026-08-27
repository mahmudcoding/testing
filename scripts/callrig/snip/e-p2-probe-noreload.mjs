// Measures the CURRENT page without navigating — for long-session testing.
export default async ({page}) => {
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
    const me=await g('/api/v1/auth/me');
    const un=await g('/api/v1/workspaces/'+location.pathname.split('/')[2]+'/unread');
    return {
      url: location.pathname,
      pageAgeMin: Math.round(performance.now()/60000),
      heapMB: performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,
      domNodes: document.getElementsByTagName('*').length,
      messages: document.querySelectorAll('[data-message-id]').length,
      visibility: document.visibilityState,
      authStillValid: me.st===200,
      authEmail: me.j&&(me.j.user?me.j.user.email:me.j.email),
      unreadCallSt: un.st,
      composerPresent: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      sidebarChannels: [...document.querySelectorAll('a[href*="/c/"]')].length
    }; })()`);
};
