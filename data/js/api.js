/*============================================
 * Aetheria — AI API统一请求封装
 * 文件: js/api.js
 * 依赖: app.js (必须在此之前加载)
 * 功能: 统一封装 OpenAI 兼容格式的 AI请求
 *============================================*/

/* == BLOCK: api-config == */
function getAIConfig() {
    var raw = localStorage.getItem('aetheria_ai');
    if (!raw) return null;
    try {
        var cfg = JSON.parse(raw);
        if (cfg && cfg.apiKey && cfg.baseUrl) return cfg;
        return null;
    } catch (e) {
        return null;
    }
}

function isAIConfigured() {
    return getAIConfig() !== null;
}
/* == END: api-config == */

/* == BLOCK: api-request == */
function aiChat(messages, onChunk, onDone, onError) {
    var cfg = getAIConfig();
    if (!cfg) {
        if (onError) onError(t('ai_not_configured'));
        return;
    }

    var url = cfg.baseUrl.replace(/\/+$/, '') + '/v1/chat/completions';
    var model = cfg.model || 'gpt-4o-mini';

    var body = JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 1500
    });

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cfg.apiKey
        },
        body: body
    }).then(function(response) {
        if (!response.ok) {
            throw new Error('API Error: ' + response.status + ' ' + response.statusText);
        }
        var reader = response.body.getReader();
        var decoder = new TextDecoder('utf-8');
        var buffer = '';
        var fullText = '';

        function readStream() {
            reader.read().then(function(result) {
                if (result.done) {
                    if (onDone) onDone(fullText);
                    return;
                }
                buffer += decoder.decode(result.value, { stream: true });
                var lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line || line ==='data: [DONE]') continue;
                    if (line.indexOf('data: ') === 0) {
                        try {
                            var json = JSON.parse(line.slice(6));
                            var delta = json.choices && json.choices[0] && json.choices[0].delta;
                            if (delta && delta.content) {
                                fullText += delta.content;
                                if (onChunk) onChunk(delta.content, fullText);
                            }
                        } catch (e) {
                            // skip malformed JSON
                        }
                    }
                }
                readStream();
            }).catch(function(err) {
                if (onError) onError(err.message || String(err));
            });
        }

        readStream();
    }).catch(function(err) {
        if (onError) onError(err.message || String(err));
    });
}
/* == END: api-request == */

/* == BLOCK: api-non-stream == */
function aiChatSync(messages, onDone, onError) {
    var cfg = getAIConfig();
    if (!cfg) {
        if (onError) onError(t('ai_not_configured'));
        return;
    }

    var url = cfg.baseUrl.replace(/\/+$/, '') + '/v1/chat/completions';
    var model = cfg.model || 'gpt-4o-mini';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + cfg.apiKey
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            stream: false,
            temperature: 0.8,
            max_tokens: 1500
        })
    }).then(function(response) {
        if (!response.ok) {
            throw new Error('API Error: ' + response.status);
        }
        return response.json();
    }).then(function(data) {
        var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (onDone) onDone(text || '');
    }).catch(function(err) {
        if (onError) onError(err.message || String(err));
    });
}
/* == END: api-non-stream == */
