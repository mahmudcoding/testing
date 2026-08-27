import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const ROUTES=[
  ['/w/'+WS+'/directories?tab=people','directories/people'],
  ['/w/'+WS+'/directories?tab=channels','directories/channels'],
  ['/w/'+WS+'/calendar','calendar'],
  ['/w/'+WS+'/files','files'],
  ['/w/'+WS+'/chat/saved','saved'],
  ['/w/'+WS+'/chat/mentions','mentions'],
  ['/w/'+WS+'/c/C4QEGENERAL0001','channel'],
  ['/w/'+WS+'/c/C4QEPRIVATE0001','private channel'],
  ['/w/'+WS+'/calls','calls hub'],
];
export default async ({page}) => {
  const out={};
  for(const [path,label] of ROUTES){
    const errs=[], warns=[], http=[], pageErrs=[];
    const onC = m => { const t=m.text().slice(0,150);
      if(m.type()==='error') errs.push(t); else if(m.type()==='warning') warns.push(t); };
    const onP = e => pageErrs.push(String(e).slice(0,150));
    const onR = r => { if(r.url().includes('/api/v1/')&&r.status()>=400)
      http.push(r.status()+' '+r.request().method()+' '+r.url().split('/api/v1/')[1].slice(0,52)); };
    page.on('console',onC); page.on('pageerror',onP); page.on('response',onR);
    await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    page.off('console',onC); page.off('pageerror',onP); page.off('response',onR);
    out[label] = { consoleErrors:[...new Set(errs)].slice(0,3),
                   pageErrors:[...new Set(pageErrs)].slice(0,3),
                   httpErrors:[...new Set(http)].slice(0,3),
                   warnCount:warns.length };
  }
  return out;
};
