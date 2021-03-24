export declare type MethodKeys = 'find' | 'create' | 'findById' | 'replaceById' | 'updateById' | 'deleteById';
export declare type MethodVerbs = 'get' | 'post' | 'put' | 'patch' | 'delete';
export declare type Methods = {
    [key in MethodKeys]: {
        method: MethodVerbs;
        instance: boolean;
        successCode?: number;
    };
};
declare const methods: Methods;
export default methods;
