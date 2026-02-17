import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCalendarPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Calendar</h1>
                <p className="text-muted-foreground">View payments by date</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Payment calendar view coming soon</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
