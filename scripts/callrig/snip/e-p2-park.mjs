import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(12000);
  return await page.evaluate(`(() => ({
     parkedAt:new Date().toISOString(),
     url:location.pathname,
     heapMB: performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,
     domNodes: document.getElementsByTagName('*').length,
     messages: document.querySelectorAll('[data-message-id]').length,
     visibility: document.visibilityState }))()`);
};
