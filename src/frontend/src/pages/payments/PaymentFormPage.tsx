import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
    useGetPayment,
    useCreatePayment,
    useUpdatePayment,
    useListStudents,
    useListInstitutions,
} from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethod } from '../../backend';
import { ExternalBlob } from '../../backend';

interface PaymentFormPageProps {
    mode: 'create' | 'edit';
}

export default function PaymentFormPage({ mode }: PaymentFormPageProps) {
    const { id } = useParams({ strict: false }) as { id?: string };
    const navigate = useNavigate();
    const { data: payment } = useGetPayment(id ? BigInt(id) : BigInt(0));
    const { data: students = [] } = useListStudents();
    const { data: institutions = [], isLoading: institutionsLoading, isError: institutionsError } = useListInstitutions();
    const createMutation = useCreatePayment();
    const updateMutation = useUpdatePayment();

    const [formData, setFormData] = useState({
        studentNis: '',
        brand: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: PaymentMethod.cash,
        notes: '',
        institutionId: '',
    });

    useEffect(() => {
        if (mode === 'edit' && payment) {
            setFormData({
                studentNis: payment.studentNis,
                brand: payment.brand,
                amount: payment.amount.toString(),
                date: new Date(Number(payment.date) / 1000000).toISOString().split('T')[0],
                paymentMethod: payment.paymentMethod,
                notes: payment.notes,
                institutionId: payment.institution.id.toString(),
            });
        }
    }, [mode, payment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (mode === 'create') {
                const emptyBlob = ExternalBlob.fromBytes(new Uint8Array(0));
                await createMutation.mutateAsync({
                    id: BigInt(Date.now()),
                    studentNis: formData.studentNis,
                    amount: BigInt(formData.amount),
                    brand: formData.brand,
                    date: BigInt(new Date(formData.date).getTime() * 1000000),
                    paymentMethod: formData.paymentMethod,
                    receiptImage: emptyBlob,
                    notes: formData.notes,
                    institutionId: BigInt(formData.institutionId),
                });
                toast.success('Pembayaran berhasil dicatat');
            } else if (id) {
                await updateMutation.mutateAsync({
                    id: BigInt(id),
                    amount: BigInt(formData.amount),
                    date: BigInt(new Date(formData.date).getTime() * 1000000),
                    paymentMethod: formData.paymentMethod,
                    notes: formData.notes,
                });
                toast.success('Pembayaran berhasil diperbarui');
            }
            navigate({ to: '/payments' });
        } catch (error: any) {
            toast.error(error.message || `Gagal ${mode === 'create' ? 'mencatat' : 'memperbarui'} pembayaran`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/payments' })}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {mode === 'create' ? 'Catat Pembayaran Baru' : 'Edit Pembayaran'}
                    </h1>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Informasi Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'create' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="student">Santri *</Label>
                                    <Select
                                        value={formData.studentNis}
                                        onValueChange={(value) => {
                                            const student = students.find((s) => s.nis === value);
                                            setFormData({
                                                ...formData,
                                                studentNis: value,
                                                institutionId: student?.institution.id.toString() || '',
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="student">
                                            <SelectValue placeholder="Pilih santri" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.nis} value={student.nis}>
                                                    {student.fullName} ({student.nis})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="institution">Lembaga *</Label>
                                    <Select 
                                        value={formData.institutionId} 
                                        onValueChange={(value) => setFormData({ ...formData, institutionId: value })}
                                        disabled={institutionsLoading || institutionsError}
                                    >
                                        <SelectTrigger id="institution">
                                            <SelectValue 
                                                placeholder={
                                                    institutionsLoading 
                                                        ? "Memuat data lembaga..." 
                                                        : institutionsError 
                                                            ? "Gagal memuat lembaga" 
                                                            : institutions.length === 0
                                                                ? "Tidak ada lembaga tersedia"
                                                                : "Pilih lembaga"
                                                } 
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {institutions.map((inst) => (
                                                <SelectItem key={inst.id.toString()} value={inst.id.toString()}>
                                                    {inst.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {institutionsError && (
                                        <p className="text-sm text-destructive">Gagal memuat data lembaga. Silakan coba lagi.</p>
                                    )}
                                    {!institutionsLoading && !institutionsError && institutions.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Tidak ada lembaga yang tersedia saat ini.</p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand/Bulan *</Label>
                            <Input
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="contoh: Januari 2024"
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Jumlah (IDR) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Tanggal Pembayaran *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                            >
                                <SelectTrigger id="paymentMethod">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={PaymentMethod.cash}>Tunai</SelectItem>
                                    <SelectItem value={PaymentMethod.transfer}>Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Catatan</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate({ to: '/payments' })}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
