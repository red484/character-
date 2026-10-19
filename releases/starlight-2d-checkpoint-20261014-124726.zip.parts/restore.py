from pathlib import Path
import hashlib, json
folder = Path(__file__).resolve().parent
m = json.loads((folder / 'manifest.json').read_text())
out = folder.parent / m['output']
if out.exists():
    assert hashlib.sha256(out.read_bytes()).hexdigest() == m['sha256'], 'Existing output differs; left unchanged'
    print('Already restored:', out)
else:
    data = bytearray()
    for part in m['parts']:
        block = (folder / part['file']).read_bytes()
        assert hashlib.sha256(block).hexdigest() == part['sha256'], 'Damaged part: ' + part['file']
        data.extend(block)
    assert len(data) == m['size'] and hashlib.sha256(data).hexdigest() == m['sha256']
    with out.open('xb') as f:
        f.write(data)
    print('Restored:', out)
