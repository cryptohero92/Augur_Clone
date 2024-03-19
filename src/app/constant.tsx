export const BUY = true;
export const SELL = false;

export const YES = true;
export const NO = false;

export const mergeElements = (arr: any[]) => {
    const result: any = [];
    const map = new Map();
  
    arr.forEach(item => {
      if (map.has(item.price)) {
        const existingItem = map.get(item.price);
        existingItem.shares += item.shares;
        existingItem.total = existingItem.price * existingItem.shares;
      } else {
        map.set(item.price, { ...item, total: item.price * item.shares });
      }
    });
  
    let runningTotal = 0;
    map.forEach(value => {
      runningTotal += value.total;
      value.total = runningTotal;
      result.push(value);
    });
  
    return result;
  }

export function roundToTwo(num: number) {
  return Number(num.toFixed(2));
}