import type { Auth, Permissions } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            permissions: Permissions;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
