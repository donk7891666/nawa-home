export function assetPath(asset, basePath = import.meta.env.BASE_URL) {
  const prefix = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${prefix}${asset.replace(/^\//, '')}`;
}
