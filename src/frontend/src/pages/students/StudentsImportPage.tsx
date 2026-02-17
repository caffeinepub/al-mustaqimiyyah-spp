import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function StudentsImportPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/students' })}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Impor Data Santri</h1>
                    <p className="text-muted-foreground">Impor data santri dari file Excel</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Unggah File Excel</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p>Fitur impor Excel akan segera tersedia</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
