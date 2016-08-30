export interface Service {
  name: string;
  url: string;
}

export const LOCAL_URL = 'localhost';

export function distinctServices(x: Service[], y: Service[]): boolean {
  if (!x && !y) {
    return false;
  } else if (!x || !y) {
    return true;
  }
  if (x.length !== y.length) {
    return true;
  }
  for (let i = 0; i < x.length; ++i) {
    if (x[i].name !== y[i].name || x[i].url !== x[i].url) {
      return true;
    }
  }
  return false;
}
