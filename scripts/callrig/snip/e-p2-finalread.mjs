export default async ({page}) => {
  // NO navigation. Reads the parked page as-is.
  return await page.evaluate(async ()=>{
    const perf=performance.memory? Math.round(performance.memory.usedJSHeapSize/1048576):null;
    const nav=performance.getEntriesByType('navigation')[0];
    const ageMin=nav? Math.round((performance.now())/60000):null;
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const last=msgs.length? msgs[msgs.length-1].innerText.replace(/\s+/g,' ').slice(0,70):null;
    let auth=null; try{ const r=await fetch('/api/v1/auth/me',{credentials:'include'}); auth={s:r.status}; }catch(e){ auth={err:String(e).slice(0,40)}; }
    return {url:location.pathname, pageAgeMin:ageMin, heapMB:perf,
      domNodes:document.querySelectorAll('*').length,
      messagesRendered:msgs.length, lastMessage:last,
      visibility:document.visibilityState, auth,
      composerPresent: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]')};
  });
};
