import { NotificationUtils } from './NotificationUtils.js';
import { UserConfig } from '../sdk/userConfig.js';

const userConfig = new UserConfig();

export class NotificationUI {
  static skeletonItem(variant = 'nav') {
    if (variant === 'nav') {
      return `
        <div class="p-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded bg-gray-200 animate-pulse"></div>
            <div class="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      `;
    }
    // body/default
    return `
      <div class="p-2">
        <div class="p-2 items-start gap-2 rounded justify-between w-full flex bg-gray-50">
          <div class="flex flex-col gap-2 w-full">
            <div class="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    `;
  }

  static renderSkeleton(container, count = 3, variant = 'nav') {
    if (!container) return;
    const items = Array.from({ length: count }).map(() => NotificationUI.skeletonItem(variant)).join('');
    container.innerHTML = items;
  }
  static renderNotificationCard(n) {
    const time = NotificationUtils.timeAgo(n.Date_Added * 1000);
    return `
      <div class="notification-card cursor-pointer${n.Is_Read ? '' : ' unread'}" data-id="${n.ID}" data-url="${n.Origin_URL}" data-type="${n.Alert_Type || ''}">
        <div class="p-2 items-start gap-2 rounded justify-between w-full flex ${n.Is_Read ? 'bg-white' : 'bg-yellow-50'}">
          <div class="flex flex-col gap-1">
            <div class="text-[#414042] text-xs font-semibold">${n.Title || ''}</div>
            <div class="text-[13px] leading-5 text-[#111827] line-clamp-2">${n.Content || ''}</div>
            ${n.Parent_Class_ID ? `<div class="text-[#586A80] text-[12px]">Class ID: ${n.Parent_Class_ID}</div>` : ''}
          </div>
          <div class="text-[12px] text-[#586A80] whitespace-nowrap">${time}</div>
        </div>
      </div>
    `;
  }

  static renderList(list, container, debugInfo) {
    if (!container) return;
    const cardsHtml = list.map(NotificationUI.renderNotificationCard).join('') || '<div style="padding:1rem;">No notifications</div>';

    let debugHtml = '';
    if (userConfig?.debug?.notifications && debugInfo) {
      const { total, byType = {}, sampleIds = [], lastQueryDebug = {} } = debugInfo;
      const typesHtml = Object.keys(byType)
        .sort((a, b) => (byType[b] || 0) - (byType[a] || 0))
        .map(t => `<div style="display:flex;justify-content:space-between;"><span>${t}</span><span>${byType[t]}</span></div>`) 
        .join('') || '<div>None</div>';
      const prefs = lastQueryDebug.preferences || {};
      const prefPairs = Object.keys(prefs).map(k => `${k}: ${prefs[k]}`).join(', ');
      debugHtml = `
        <div class="notification-debug" style="border:1px solid #e5e7eb;border-radius:6px;padding:8px;margin:8px 0;background:#f9fafb;color:#111827;">
          <div style="font-weight:600;margin-bottom:6px;">Debug: Alerts Summary</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;margin-bottom:6px;">
            <div><strong>Total</strong>: ${total ?? list.length}</div>
            <div><strong>User</strong>: ${lastQueryDebug.userId ?? ''}</div>
            <div><strong>Classes</strong>: ${(lastQueryDebug.classIds || []).join(', ')}</div>
            <div><strong>Branches</strong>: ${lastQueryDebug.addedAnyBranch ? 'enabled' : 'none'}</div>
          </div>
          <div style="margin-bottom:6px;">
            <div style="font-weight:500; margin-bottom:4px;">By Type</div>
            <div>
              ${typesHtml}
            </div>
          </div>
          <div style="font-size:12px; color:#374151; overflow:auto; white-space:nowrap;">
            <div style="font-weight:500;">Prefs:</div>
            <div>${prefPairs}</div>
            <div style="font-weight:500; margin-top:4px;">Sample IDs:</div>
            <div>${sampleIds.join(', ')}</div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `${debugHtml}${cardsHtml}`;
  }
}
