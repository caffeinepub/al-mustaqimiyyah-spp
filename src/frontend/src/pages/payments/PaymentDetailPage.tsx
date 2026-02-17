import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPayment } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Printer, Download } from 'lucide-react';

export default function PaymentDetailPage() {
    const { id } = useParams({ strict: false }) as { id: string };
    const navigate = useNavigate();
    const { data: payment, isLoading } = useGetPayment(BigInt(id));

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!payment) {
        return <div className="text-center py-8">Payment not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/payments' })}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
                        <p className="text-muted-foreground">ID: {payment.id.toString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button onClick={() => navigate({ to: `/payments/${id}/edit` })}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Student NIS</div>
                        <div className="text-base">{payment.studentNis}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Institution</div>
                        <div className="text-base">{payment.institution.name}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Brand/Month</div>
                        <div className="text-base">{payment.brand}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Amount</div>
                        <div className="text-base font-semibold">Rp {Number(payment.amount).toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Payment Date</div>
                        <div className="text-base">{new Date(Number(payment.date) / 1000000).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Payment Method</div>
                        <div className="text-base capitalize">{payment.paymentMethod}</div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="text-sm font-medium text-muted-foreground">Notes</div>
                        <div className="text-base">{payment.notes || '-'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
