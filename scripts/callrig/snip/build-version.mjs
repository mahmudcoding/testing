export default async ({page}) => {
  return await page.evaluate(async () => {
    const out = {};
    // common places a deployed build stamps itself
    out.meta = [...document.querySelectorAll('meta[name*="version" i],meta[name*="build" i],meta[name*="commit" i]')].map(m=>m.name+'='+m.content);
    out.nextBuildId = (window.__NEXT_DATA__ && window.__NEXT_DATA__.buildId) || null;
    out.globals = Object.keys(window).filter(k=>/version|build|commit|sha/i.test(k)).slice(0,10);
    for (const p of ['/api/v1/version','/api/v1/health','/api/version','/version','/api/v1/system/settings']) {
      try { const r = await fetch(p,{credentials:'include'}); out[p]=r.status+' '+(await r.text()).slice(0,160); } catch(e){ out[p]='ERR'; }
    }
    return out;
  });
};
