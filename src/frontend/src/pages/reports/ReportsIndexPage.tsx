import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Users, AlertCircle } from 'lucide-react';

export default function ReportsIndexPage() {
    const navigate = useNavigate();

    const reports = [
        {
            title: 'Rekap Bulanan',
            description: 'Laporan pembayaran per bulan',
            icon: Calendar,
            href: '/reports/monthly',
        },
        {
            title: 'Rekap Per Kelas',
            description: 'Laporan pembayaran per kelas',
            icon: Users,
            href: '/reports/class',
        },
        {
            title: 'Rekap Per Lembaga',
            description: 'Perbandingan pembayaran antar lembaga',
            icon: FileText,
            href: '/reports/institution',
        },
        {
            title: 'Laporan Tunggakan',
            description: 'Daftar santri yang menunggak pembayaran',
            icon: AlertCircle,
            href: '/reports/arrears',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
                <p className="text-muted-foreground">Akses berbagai laporan dan analisis pembayaran SPP</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {reports.map((report) => (
                    <Card
                        key={report.href}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => navigate({ to: report.href })}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <report.icon className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{report.title}</CardTitle>
                            </div>
                            <CardDescription>{report.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
