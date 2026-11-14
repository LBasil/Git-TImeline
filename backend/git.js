const git = require('isomorphic-git');
const fs = require('fs');

const MAX_LIMIT = 100;

/** Nom des branches locales du dépôt. */
async function listBranches(dir) {
  return git.listBranches({ fs, dir });
}

/** Branche actuellement extraite, ou null en HEAD détaché. */
async function currentBranch(dir) {
  return (await git.currentBranch({ fs, dir })) || null;
}

function parseIntInRange(value, fallback, min, max) {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/**
 * Commits d'une branche, du plus récent au plus ancien, avec pagination.
 * `ref` doit être une branche existante : on ne résout pas de référence arbitraire.
 */
async function listCommits(dir, { ref, limit, skip } = {}) {
  const branches = await listBranches(dir);
  const branch = ref ?? (await currentBranch(dir)) ?? branches[0];
  if (!branches.includes(branch)) {
    const error = new Error(`Branche inconnue : ${branch}`);
    error.status = 400;
    throw error;
  }
  const lim = parseIntInRange(limit, 20, 1, MAX_LIMIT);
  const off = parseIntInRange(skip, 0, 0, 100000);
  if (lim === null || off === null) {
    const error = new Error(`limit doit être entre 1 et ${MAX_LIMIT}, skip positif ou nul`);
    error.status = 400;
    throw error;
  }

  // On lit un commit de plus pour savoir s'il en reste après cette page.
  const log = await git.log({ fs, dir, ref: branch, depth: off + lim + 1 });
  const page = log.slice(off, off + lim);
  return {
    branch,
    hasMore: log.length > off + lim,
    commits: page.map((c) => ({
      oid: c.oid,
      shortOid: c.oid.slice(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.commit.author.name,
      date: c.commit.author.timestamp * 1000
    }))
  };
}

module.exports = { listBranches, currentBranch, listCommits, MAX_LIMIT };
