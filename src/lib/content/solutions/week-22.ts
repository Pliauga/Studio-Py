// Solutions for week 22 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-22.mdx.

const solutions: Record<string, string> = {
	'w22-constant-time-check': `import hmac

def verify_bearer(header: str, expected_token: str) -> bool:
    """Extract the token after 'Bearer ' and verify it matches \`expected_token\` in constant time."""
    if not header.startswith('Bearer '):
        return False
    candidate = header.removeprefix('Bearer ').strip()
    return hmac.compare_digest(candidate, expected_token)

print(verify_bearer('Bearer tok_123', 'tok_123'), verify_bearer('Bearer wrong', 'tok_123'))`,
	'w22-fixed-window-limiter': `class TokenBucketLimiter:
    def __init__(self, capacity: float, refill_per_sec: float) -> None:
        self.capacity = capacity
        self.rate = refill_per_sec
        self.buckets: dict[str, tuple[float, float]] = {}

    def allow(self, client_id: str, now: float) -> bool:
        """Refill client_id's bucket over elapsed time up to capacity; consume 1.0 token and return True if >= 1.0 available."""
        tokens, last_time = self.buckets.get(client_id, (self.capacity, now))
        elapsed = max(0.0, now - last_time)
        tokens = min(self.capacity, tokens + elapsed * self.rate)
        if tokens < 1.0:
            self.buckets[client_id] = (tokens, now)
            return False
        self.buckets[client_id] = (tokens - 1.0, now)
        return True

limiter = TokenBucketLimiter(capacity=2.0, refill_per_sec=1.0)
outcomes = [
    limiter.allow('10.0.0.5', now=0.0),
    limiter.allow('10.0.0.5', now=0.0),
    limiter.allow('10.0.0.5', now=0.2),
    limiter.allow('10.0.0.5', now=1.0),
]
print(outcomes)`,
	'w22-hmac-tamper': `import hashlib
import hmac

def sign_webhook(secret: str, timestamp: int, body: str) -> str:
    msg = f'{timestamp}.{body}'.encode('utf-8')
    return hmac.new(secret.encode('utf-8'), msg, hashlib.sha256).hexdigest()

def verify_webhook(
    secret: str, timestamp: int, body: str, signature: str, now: int, max_skew: int = 300
) -> bool:
    """Verify that \`timestamp\` is within [now - max_skew, now] and \`signature\` matches the HMAC-SHA256 digest."""
    if not (0 <= now - timestamp <= max_skew):
        return False
    expected = sign_webhook(secret, timestamp, body)
    return hmac.compare_digest(expected, signature)

secret = 'whsec_ops_key'
body = '{"host":"srv-01","pct":95}'
ts = 1700000000
sig = sign_webhook(secret, ts, body)
results = [
    verify_webhook(secret, ts, body, sig, now=1700000120),
    verify_webhook(secret, ts, '{"host":"srv-01","pct":10}', sig, now=1700000120),
    verify_webhook(secret, ts, body, sig, now=1700000900),
    verify_webhook(secret, ts + 60, body, sign_webhook(secret, ts + 60, body), now=ts),
]
print(results)`,
	'w22-path-jail': `from pathlib import Path

def is_safe_path(base: str, user_input: str) -> bool:
    """Resolve \`base\` and \`base / user_input\` and return True only if the target remains inside \`base\`."""
    root = Path(base).resolve()
    target = (root / user_input).resolve()
    return target.is_relative_to(root)

print(is_safe_path('/tmp/reports', 'daily/eu.csv'), is_safe_path('/tmp/reports', '../secrets.env'))`
};

export default solutions;
