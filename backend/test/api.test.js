const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const git = require('isomorphic-git');
const { createApp } = require('../server');

const author = { name: 'Test', email: 'test@example.com' };

// Dépôt temporaire : 5 commits sur main, une branche "feature" avec 1 commit de plus.
async function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'timeline-'));
  await git.init({ fs, dir, defaultBranch: 'main' });
  for (let i = 1; i <= 5; i++) {
    fs.writeFileSync(path.join(dir, 'file.txt'), `v${i}`);
    await git.add({ fs, dir, filepath: 'file.txt' });
    await git.commit({ fs, dir, message: `commit ${i}\n\ncorps du message`, author });
  }
  await git.branch({ fs, dir, ref: 'feature', checkout: true });
  fs.writeFileSync(path.join(dir, 'file.txt'), 'feature');
  await git.add({ fs, dir, filepath: 'file.txt' });
  await git.commit({ fs, dir, message: 'sur la branche feature', author });
  await git.checkout({ fs, dir, ref: 'main' });
  return dir;
}

async function withServer(dir, fn) {
  const server = createApp(dir).listen(0);
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

test('/api/branches liste les branches et la branche courante', async () => {
  const dir = await makeRepo();
  await withServer(dir, async (base) => {
    const body = await (await fetch(`${base}/api/branches`)).json();
    assert.equal(body.current, 'main');
    assert.deepEqual(body.branches.sort(), ['feature', 'main']);
  });
});

test('/api/commits : branche courante, première ligne du message seulement', async () => {
  const dir = await makeRepo();
  await withServer(dir, async (base) => {
    const body = await (await fetch(`${base}/api/commits`)).json();
    assert.equal(body.branch, 'main');
    assert.equal(body.commits.length, 5);
    assert.equal(body.commits[0].message, 'commit 5');
    assert.equal(body.commits[0].shortOid.length, 7);
    assert.equal(body.hasMore, false);
  });
});

test('/api/commits : pagination avec limit et skip', async () => {
  const dir = await makeRepo();
  await withServer(dir, async (base) => {
    const first = await (await fetch(`${base}/api/commits?limit=2`)).json();
    assert.deepEqual(first.commits.map((c) => c.message), ['commit 5', 'commit 4']);
    assert.equal(first.hasMore, true);
    const last = await (await fetch(`${base}/api/commits?limit=2&skip=4`)).json();
    assert.deepEqual(last.commits.map((c) => c.message), ['commit 1']);
    assert.equal(last.hasMore, false);
  });
});

test('/api/commits : une autre branche', async () => {
  const dir = await makeRepo();
  await withServer(dir, async (base) => {
    const body = await (await fetch(`${base}/api/commits?ref=feature&limit=1`)).json();
    assert.equal(body.commits[0].message, 'sur la branche feature');
  });
});

test('/api/commits : paramètres invalides refusés avec 400', async () => {
  const dir = await makeRepo();
  await withServer(dir, async (base) => {
    for (const query of ['ref=../../etc/passwd', 'ref=inconnue', 'limit=0', 'limit=101', 'limit=abc', 'skip=-1']) {
      const res = await fetch(`${base}/api/commits?${query}`);
      assert.equal(res.status, 400, query);
    }
  });
});
