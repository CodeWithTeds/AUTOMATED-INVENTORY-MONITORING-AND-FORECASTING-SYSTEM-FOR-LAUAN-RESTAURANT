export type User = {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'staff';
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Permissions = {
    canViewAdminOnlyPages: boolean;
    canEditOperationalRecords: boolean;
    canDeleteOperationalRecords: boolean;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
