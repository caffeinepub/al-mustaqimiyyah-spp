import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCalendarPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Kalender Pembayaran</h1>
                <p className="text-muted-foreground">Lihat jadwal pembayaran dalam tampilan kalender</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Kalender</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        Fitur kalender pembayaran akan segera tersedia
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
