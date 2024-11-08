// taken from ./src/Functions.ipynb in `research` branch
// new functions have also been added

import { square, min, max, sort } from 'mathjs';



export function gaussian_cyclic(c: number, mu: number, sigma: number): number {
    const g = 1/(Math.sqrt(sigma*sigma)*Math.PI)*Math.exp(
        -square((c - mu + (mu > 600 ? 1 : 0)*(c < mu - 600 ? 1 : 0)*1200
                   - (mu < 600 ? 1 : 0)*(c > mu + 600 ? 1 : 0)*1200))
        /(2*sigma*sigma)
    );

    return g;
}


export function renyiEntropy(probabilities: number[], alpha: number): number {
    if (alpha <= 0) {
        throw new Error("Alpha must be greater than 0.");
    }

    const sum = probabilities.reduce((acc, p) => acc + Math.pow(p, alpha), 0);
    return (1 / (1 - alpha)) * Math.log(sum);
}


export function normalize(arr: number[]): number[] {
    const arrMin = min(arr);
    const arrMax = max(arr);
    
    return arr.map(x => (x - arrMin)/(arrMax - arrMin));
}


export function interpolateArray(arr1: number[], arr2: number[], alpha: number): number[] {
    if (arr1.length != arr2.length) {
        throw new Error("Arrays should be of the same size");
    }
    const arrsLen = arr1.length;
    let newArr = new Array(arrsLen);

    for (let i = 0; i < arrsLen; i++) {
        newArr[i] = alpha * arr1[i] + (1 - alpha) * arr2[i]; 
    }

    return newArr;
}


function indexOfMin(arr: number[]): number {
    return arr.reduce((prev, curr, i, a) => (curr < a[prev] ? i : prev), 0);
}


export function findBestKeys(
        metric_arr: number[],
        dCents: number,
        numNewKeys: number,
        new_keys_potential: number[]
        ): number[] {
    
    let bestKeys: number[] = [];
    
    for (let i = 0; i < numNewKeys; i++) {
        const mini = indexOfMin(metric_arr);
        const newKey = new_keys_potential[mini]
        bestKeys.push(newKey);
        
        let j = 0;
        while (j < new_keys_potential.length) {
            if (Math.abs(newKey - new_keys_potential[j]) < dCents) {
                new_keys_potential.splice(j, 1);
                metric_arr.splice(j, 1);
            } else {
                j++;
            }
        }
    }

    return sort(bestKeys, "asc");
}