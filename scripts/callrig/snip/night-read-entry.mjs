export default async ({page}) => page.evaluate(()=>{
  const g=(t)=>{const e=document.querySelector(`[data-testid="${t}"]`);
    return e?{checked:(e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')), disabled:e.disabled}:null;};
  const save=document.querySelector('[data-testid="meeting-settings-save"]');
  return {hostApproval:g('meeting-settings-entry-manual_admit'), anyone:g('meeting-settings-entry-open'),
          approvalSwitch:g('meeting-settings-approval-toggle'), saveDisabled: save?save.disabled:null};
});
