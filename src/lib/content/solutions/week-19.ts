// Solutions for week 19 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-19.mdx.

const solutions: Record<string, string> = {
	'w19-contextvar-trace': `from contextvars import ContextVar

trace_id: ContextVar[str] = ContextVar('trace_id', default='none')

def record_action(action: str) -> str:
    return f'{trace_id.get()}:{action}'

def run_with_trace(tid: str, action: str) -> str:
    """Bind \`trace_id\` to \`tid\` while calling \`record_action(action)\`, then always reset \`trace_id\` to its prior state."""
    token = trace_id.set(tid)
    try:
        return record_action(action)
    finally:
        trace_id.reset(token)

print(run_with_trace('tr-88', 'scan'), record_action('idle'))`,
	'w19-logger-level': `import io
import logging

def configure_logger(buf: io.StringIO) -> logging.Logger:
    """Return a logger bound to \`buf\` formatted as '%(levelname)s:%(message)s' that records WARNING and above."""
    log = logging.getLogger('test_lvl')
    handler = logging.StreamHandler(buf)
    handler.setFormatter(logging.Formatter('%(levelname)s:%(message)s'))
    log.handlers = [handler]
    log.setLevel(logging.WARNING)
    return log

buf = io.StringIO()
log = configure_logger(buf)
log.info('routine check')
log.warning('disk at 92%')
log.error('disk full')
print(buf.getvalue().strip())`,
	'w19-redact-structured-log': `import json

SENSITIVE = {'password', 'api_key', 'token'}

def safe_json_log(event: str, data: dict) -> str:
    """Return a sorted-key JSON string with 'event' and \`data\` fields, redacting any SENSITIVE key to '[REDACTED]'."""
    clean = {k: ('[REDACTED]' if k in SENSITIVE else v) for k, v in data.items()}
    return json.dumps({'event': event, **clean}, sort_keys=True)

print(safe_json_log('auth_attempt', {'user': 'alice', 'password': 'secret'}))`
};

export default solutions;
