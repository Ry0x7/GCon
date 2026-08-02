const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const appPath = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}` || "/";
};

export const currentAppPath = () => {
  const pathname = window.location.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || "/";
  }
  return pathname || "/";
};
