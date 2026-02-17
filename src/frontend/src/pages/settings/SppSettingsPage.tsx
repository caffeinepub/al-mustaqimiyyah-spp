import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SppSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SPP Settings</h1>
                <p className="text-muted-foreground">Configure monthly tuition amounts</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tuition Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <p>SPP settings management coming soon</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
