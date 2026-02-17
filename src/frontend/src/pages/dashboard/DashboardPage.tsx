import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDashboardStats, useListPayments } from '../../hooks/useQueries';
import { Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { data: stats } = useGetDashboardStats();
    const { data: allPayments = [] } = useListPayments();

    const paymentsPerMonth = useMemo(() => {
        const monthlyData: { [key: string]: number } = {};
        allPayments.forEach((payment) => {
            const date = new Date(Number(payment.date) / 1000000);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(payment.amount);
        });

        return Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([month, amount]) => ({
                month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                amount: amount / 1000000,
            }));
    }, [allPayments]);

    const institutionComparison = useMemo(() => {
        const smpTotal = allPayments
            .filter((p) => p.institution.name.includes('SMP'))
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const smaTotal = allPayments
            .filter((p) => p.institution.name.includes('SMA'))
            .reduce((sum, p) => sum + Number(p.amount), 0);

        return [
            { name: 'SMP', value: smpTotal / 1000000 },
            { name: 'SMA', value: smaTotal / 1000000 },
        ];
    }, [allPayments]);

    const COLORS = ['oklch(var(--chart-1))', 'oklch(var(--chart-2))'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of SPP management system</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total SMP Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats ? Number(stats.totalSmpStudents) : 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total SMA Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats ? Number(stats.totalSmaStudents) : 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payments This Month</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats ? Number(stats.totalPaymentsThisMonth) : 0}</div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students in Arrears</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {stats ? Number(stats.totalArrearsThisMonth) : 0}
                        </div>
                        <Button
                            variant="link"
                            className="mt-2 h-auto p-0 text-xs"
                            onClick={() => navigate({ to: '/reports/arrears' })}
                        >
                            View Details →
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Payments Per Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={paymentsPerMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="amount" fill="oklch(var(--chart-1))" name="Amount (IDR Million)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>SMP vs SMA Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={institutionComparison}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {institutionComparison.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
