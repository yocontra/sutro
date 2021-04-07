declare type CollectionResults = {
    rows?: any[];
    count?: number;
};
export declare const format: (inp: CollectionResults | any[], meta: object) => {
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
export {};
