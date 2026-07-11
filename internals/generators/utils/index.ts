import fs from 'fs';
import path from 'path';

export function pathExists(path: string) {
  return fs.existsSync(path);
}

export function normalizeRelativeGeneratorPath(input: string) {
  return input
    .trim()
    .replaceAll('\\', '/')
    .replace(/^\.\/+/, '')
    .replace(/\/+$/, '');
}

export function validateRelativeGeneratorPath(
  input: string,
  basePath: string,
) {
  const normalizedPath = normalizeRelativeGeneratorPath(input);
  const resolvedBasePath = path.resolve(basePath);
  const resolvedTargetPath = path.resolve(basePath, normalizedPath || '.');

  if (
    resolvedTargetPath !== resolvedBasePath &&
    !resolvedTargetPath.startsWith(`${resolvedBasePath}${path.sep}`)
  ) {
    return 'Path must stay within src/app';
  }

  if (!pathExists(resolvedTargetPath)) {
    return 'Directory does not exist';
  }

  return true;
}
