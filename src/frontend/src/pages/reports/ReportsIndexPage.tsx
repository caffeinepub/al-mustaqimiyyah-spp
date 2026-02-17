import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, Users, AlertCircle } from 'lucide-react';

export default function ReportsIndexPage() {
    const navigate = useNavigate();

    const reports = [
        {
            title: 'Monthly Recap',
            description: 'View payment summary by month',
            icon: Calendar,
            path: '/reports/monthly',
        },
        {
            title: 'Class Recap',
            description: 'View payment summary by class',
            icon: Users,
            path: '/reports/class',
        },
        {
            title: 'Institution Recap',
            description: 'Compare SMP and SMA payments',
            icon: FileText,
            path: '/reports/institution',
        },
        {
            title: 'Arrears Report',
            description: 'View students with outstanding payments',
            icon: AlertCircle,
            path: '/reports/arrears',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">Generate and export payment reports</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {reports.map((report) => (
                    <Card
                        key={report.path}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => navigate({ to: report.path })}
                    >
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <report.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>{report.title}</CardTitle>
                                    <CardDescription>{report.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
