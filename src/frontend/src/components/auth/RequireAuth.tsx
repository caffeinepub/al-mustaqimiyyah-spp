import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginButton from './LoginButton';
import { Lock } from 'lucide-react';

export default function RequireAuth({ children }: { children: ReactNode }) {
    const { identity, isInitializing } = useInternetIdentity();

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!identity) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Autentikasi Diperlukan</CardTitle>
                        <CardDescription>
                            Silakan masuk untuk mengakses Sistem Manajemen SPP
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <LoginButton />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
