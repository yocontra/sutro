export declare const format: (inp: any, meta: object) => {
    results: any[];
    meta: {
        results: number;
        total: number;
    };
};
export declare const stream: {
    (counter: Promise<number>, meta: object): any;
    contentType: string;
};
