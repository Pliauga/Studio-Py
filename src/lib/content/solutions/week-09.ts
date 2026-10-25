// Solutions for week 9 exercises.
// Keyed by the PyExercise id used in src/content/lessons/week-09.mdx.

const solutions: Record<string, string> = {
	'w09-env-read': `import os

def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f'{name} is missing')
    return value

os.environ['OPS_API_KEY'] = 'live_key_99'
api_key = require_env('OPS_API_KEY')
print('OPS_API_KEY loaded:', len(api_key), 'chars')
os.environ.pop('OPS_API_KEY', None)
try:
    require_env('OPS_API_KEY')
    print('accepted')
except RuntimeError:
    print('rejected')`,
	'w09-hash-verify': `import hashlib
typed = 'password123'
stored_hash = hashlib.sha256(b'password123').hexdigest()
match = hashlib.sha256(typed.encode())
print(match.hexdigest() == stored_hash)`,
	'w09-store-split': `line = 'alice,9f8e7d6c5b4a39281726354453627180$4a1b2c3d4e5f60718293a4b5c6d7e8f9'
username, stored_cred = line.strip().split(',', 1)
print(username, '$' in stored_cred)`
};

export default solutions;
