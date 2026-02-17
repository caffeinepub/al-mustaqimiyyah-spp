import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function SppSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan SPP</h1>
                    <p className="text-muted-foreground">Kelola pengaturan tarif SPP</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Pengaturan
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengaturan SPP</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        Fitur pengaturan SPP akan segera tersedia
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
