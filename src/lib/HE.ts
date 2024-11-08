import { HE_arr } from "./HE_var1";


export function HE(x: number): number {
    const lenHE_arr = HE_arr.length;
    const dCents = 1200/(lenHE_arr - 1);

    // no interpolation
    const index = Math.round(x / dCents);
    return HE_arr[index];

    // linear interpolation
    //const index = Math.floor(x / dCents);
    //const alpha = (x - dCents * index) / index;
    //return HE_arr[index]*(1 - alpha) + HE_arr[index + 1]*alpha;
}