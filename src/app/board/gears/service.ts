export interface Service {
  name: string;
  url: string;
}

export function distinctServices(x: Service[], y: Service[]): boolean {
  if (!x && !y) {
    return true;
  } else if (!x || !y) {
    return false;
  }
  if (x.length !== y.length) {
    return false;
  }
  for (let i = 0; i < x.length; ++i) {
    if (x[i].name !== y[i].name || x[i].url !== x[i].url) {
      return false;
    }
  }
  return true;
}
