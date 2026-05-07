/* == BLOCK: api-wrapper == */
window.AetheriaAPI = (function () {
  'use strict';

  function getConfig() {
    return {
      baseUrl: localStorage.getItem('aetheria_ai_baseurl') || 'https://api.deepseek.com',
      apiKey:  localStorage.getItem('aetheria_ai_key')     || '',
      model:   localStorage.getItem('aetheria_ai_model')   || 'deepseek-chat',
    };
  }

  function isConfigured() {
    return !!getConfig().apiKey;
  }

  async function chat(messages, onChunk) {
    const { baseUrl, apiKey, model } = getConfig();
    if (!apiKey) throw new Error('未配置 API Key');

    const endpoint = baseUrl.replace(/\/$/, '') + '/chat/completions';
    const stream   = typeof onChunk === 'function';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
        temperature: 0.85,
        max_tokens:  800,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API 错误 ${res.status}: ${err}`);
    }

    if (!stream) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    }

    // Streaming
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   full    = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') break;
        try {
          const parsed = JSON.parse(raw);
          const delta  = parsed.choices?.[0]?.delta?.content || '';
          if (delta) { full += delta; onChunk(delta, full); }
        } catch (_) { /* skip malformed chunks */ }
      }
    }
    return full;
  }

  return { chat, isConfigured, getConfig };
})();
/* == END: api-wrapper == */
