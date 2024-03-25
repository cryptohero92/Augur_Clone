export const BUY = true;
export const SELL = false;

export const YES = true;
export const NO = false;

import { formatUnits } from 'ethers'

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

export const getBettingOptionsPromise = (eventInfo: any) => {
  let promises = [];
  for (let i = 0; i < eventInfo.bettingOptions.length; i++) {
    const contractPromise1 = fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getBetAmountOfBettingOption/${eventInfo.bettingOptions[i]}`)
    .then((response) => response.json())
    .then(({betAmount}) => ({
        bet: Number(formatUnits(betAmount, 6))
    }));

    const contractPromise2 = fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getResultOfBettingOption/${eventInfo.bettingOptions[i]}`)
    .then((response) => response.json())
    .then(({result}) => ({
        result: Number(result)
    }));

    const ipfsPromise = fetch(`https://gateway.pinata.cloud/ipfs/${eventInfo.bettingOptions[i]}`).then((response) => response.json()).then(optionInfo => ({
      title: optionInfo.title,
      image: optionInfo.image
    }));

    promises.push(Promise.all([contractPromise1, contractPromise2, ipfsPromise])
      .then((results) => (Object.assign({ipfsUrl: eventInfo.bettingOptions[i]}, ...results)))) 
  }
  return Promise.all(promises);
}

export function roundToTwo(num: number) {
  return Number(num.toFixed(2));
}