'use strict';

const DEFAULT_APP_ID = '__UNI__5D7AAEE';
const DEFAULT_BATCH_LIMIT_USER = 500;
const DEFAULT_BATCH_LIMIT_CID = 1000;

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'undefined' || value === null) return [];
  return [value];
}

function compactStringArray(value) {
  const list = asArray(value)
    .map((item) => asText(item))
    .filter(Boolean);
  return Array.from(new Set(list));
}

function boolOrDefault(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const n = value.trim().toLowerCase();
    if (n === 'true' || n === '1' || n === 'yes') return true;
    if (n === 'false' || n === '0' || n === 'no') return false;
  }
  return fallback;
}

function jsonOrObject(value, fallback = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
}

function makeRequestId(seed = '') {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 12);
  const extra = asText(seed).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10);
  const id = `p${stamp}${rand}${extra}`;
  return id.slice(0, 32);
}

function chunk(list, size) {
  const arr = Array.isArray(list) ? list : [];
  const step = Math.max(1, Number(size) || 1);
  const out = [];
  for (let i = 0; i < arr.length; i += step) {
    out.push(arr.slice(i, i + step));
  }
  return out;
}

function buildMessagePayload(event) {
  const title = asText(event.title);
  const content = asText(event.content);
  if (!title || !content) {
    throw new Error('title 和 content 必填');
  }

  const rawPayload = event.payload;
  const payload =
    rawPayload && typeof rawPayload === 'object'
      ? rawPayload
      : rawPayload
      ? jsonOrObject(rawPayload, { text: asText(rawPayload) || 'push' })
      : { text: 'push' };

  const message = {
    title,
    content,
    payload,
    request_id: asText(event.request_id || event.requestId) || makeRequestId(title),
  };

  const platform = compactStringArray(event.platform);
  if (platform.length) message.platform = platform;

  const checkToken = boolOrDefault(event.check_token ?? event.checkToken, true);
  if (typeof checkToken === 'boolean') message.check_token = checkToken;

  const category = jsonOrObject(event.category, null);
  if (category) message.category = category;

  const options = jsonOrObject(event.options, null);
  if (options) message.options = options;

  const settings = jsonOrObject(event.settings, null);
  if (settings) message.settings = settings;

  if (typeof event.content_available === 'number') {
    message.content_available = event.content_available;
  }
  if (typeof event.badge !== 'undefined') {
    message.badge = event.badge;
  }
  if (asText(event.sound)) {
    message.sound = asText(event.sound);
  }
  if (asText(event.open_url || event.openUrl)) {
    message.open_url = asText(event.open_url || event.openUrl);
  }

  return message;
}

function getPushManager(event) {
  const appId = asText(event.appId || event.app_id) || DEFAULT_APP_ID;
  return uniCloud.getPushManager({ appId });
}

function normalizeAction(event) {
  return asText(event.action).toLowerCase() || 'single';
}

function checkSecret(event) {
  const expected = asText(process.env.PUSH_DISPATCH_SECRET);
  if (!expected) return;
  const provided = asText(event.secret || event.sign || event.token);
  if (!provided || provided !== expected) {
    throw new Error('secret 校验失败');
  }
}

async function sendSingle(pushManager, event, baseMessage) {
  const userId = asText(event.user_id || event.userId);
  const cid = asText(event.push_clientid || event.pushClientId || event.cid);
  const alias = asText(event.getui_alias || event.alias);

  const target = {};
  if (userId) target.user_id = userId;
  else if (cid) target.push_clientid = cid;
  else if (alias) target.getui_alias = alias;
  else throw new Error('single 模式下需要 user_id / push_clientid / getui_alias 其一');

  const res = await pushManager.sendMessage({
    ...target,
    ...baseMessage,
  });

  return {
    mode: 'single',
    target,
    result: res,
  };
}

async function sendBatch(pushManager, event, baseMessage) {
  const userIds = compactStringArray(event.user_ids || event.userIds || event.user_id);
  const cids = compactStringArray(event.push_clientids || event.pushClientIds || event.push_clientid || event.cids);
  const aliases = compactStringArray(event.aliases || event.getui_aliases);

  let targetType = '';
  let list = [];
  let size = 0;

  if (userIds.length) {
    targetType = 'user_id';
    list = userIds;
    size = DEFAULT_BATCH_LIMIT_USER;
  } else if (cids.length) {
    targetType = 'push_clientid';
    list = cids;
    size = DEFAULT_BATCH_LIMIT_CID;
  } else if (aliases.length) {
    targetType = 'getui_alias';
    list = aliases;
    size = DEFAULT_BATCH_LIMIT_CID;
  } else {
    throw new Error('batch 模式下需要 user_ids / push_clientids / aliases 其一');
  }

  const chunks = chunk(list, size);
  const results = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const segment = chunks[i];
    const res = await pushManager.sendMessage({
      [targetType]: segment,
      ...baseMessage,
      request_id: makeRequestId(`${baseMessage.request_id}_${i}`),
    });
    results.push({
      index: i,
      size: segment.length,
      result: res,
    });
  }

  return {
    mode: 'batch',
    targetType,
    total: list.length,
    chunks: results.length,
    results,
  };
}

async function sendByCondition(pushManager, event, baseMessage) {
  const userTag = compactStringArray(event.user_tag || event.userTag || event.tags);
  const platform = compactStringArray(event.platform);

  if (!userTag.length && !boolOrDefault(event.allow_all, false)) {
    throw new Error('condition 模式请传 user_tag；如需全量推送请显式传 allow_all=true');
  }

  const payload = {
    ...baseMessage,
  };
  if (userTag.length) payload.user_tag = userTag;
  if (platform.length) payload.platform = platform;

  const res = await pushManager.sendMessage(payload);
  return {
    mode: 'condition',
    target: {
      user_tag: userTag,
      platform,
      allow_all: boolOrDefault(event.allow_all, false),
    },
    result: res,
  };
}

async function getReport(pushManager, event) {
  const taskId = asText(event.task_id || event.taskId);
  if (!taskId) {
    throw new Error('report 模式需要 task_id');
  }

  const cid = asText(event.cid);
  const result = {
    taskId,
  };

  // 注：以下查询接口可能需要单独开通权限，如未开通会返回权限相关报错。
  try {
    result.report = await pushManager.getReportDetailByTaskid(taskId);
  } catch (e) {
    result.report_error = e?.message || String(e);
  }

  if (cid) {
    try {
      result.task_detail = await pushManager.getTaskDetail({ taskId, cid });
    } catch (e) {
      result.task_detail_error = e?.message || String(e);
    }
  }

  return {
    mode: 'report',
    result,
  };
}

exports.main = async (event, context) => {
  try {
    checkSecret(event || {});
    const action = normalizeAction(event || {});
    const pushManager = getPushManager(event || {});
    const needMessage = action !== 'report';
    const message = needMessage ? buildMessagePayload(event || {}) : null;

    let data;
    if (action === 'single') {
      data = await sendSingle(pushManager, event || {}, message);
    } else if (action === 'batch') {
      data = await sendBatch(pushManager, event || {}, message);
    } else if (action === 'condition') {
      data = await sendByCondition(pushManager, event || {}, message);
    } else if (action === 'report') {
      data = await getReport(pushManager, event || {});
    } else {
      throw new Error(`不支持的 action: ${action}`);
    }

    return {
      ok: true,
      action,
      appId: asText(event?.appId || event?.app_id) || DEFAULT_APP_ID,
      request_id: message?.request_id || asText(event?.request_id || event?.requestId) || '',
      data,
    };
  } catch (err) {
    return {
      ok: false,
      errMsg: err?.message || String(err),
      stack: err?.stack || '',
    };
  }
};
