export declare enum Status {
    INACTIVE = 0,
    ACTIVE = 1,
    DELETED = 2
}
export declare const StateDetails: {
    [key in Status]: {
        id: number;
        name: string;
        color: string;
    };
};
export declare const Integrations: {
    [key: string]: any;
};
export declare const StatusIntegrations: {
    [key: string]: any;
};
export declare const TypeOfPayers: {
    [key: string]: {
        name: string;
    };
};
