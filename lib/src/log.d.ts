export declare function info(message: string): void;
export declare function error(message: string, options?: {
    exit?: number;
}): never;
export declare function warn(message: string): void;
export declare function waitKey(message: string): Promise<string>;
