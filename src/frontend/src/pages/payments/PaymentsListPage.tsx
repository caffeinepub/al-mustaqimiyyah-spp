import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListPayments, useDeletePayment } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PaymentsListPage() {
    const navigate = useNavigate();
    const { data: payments = [], isLoading } = useListPayments();
    const deleteMutation = useDeletePayment();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState<bigint | null>(null);

    const filteredPayments = useMemo(() => {
        return payments.filter(
            (payment) =>
                payment.studentNis.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payments, searchQuery]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteMutation.mutateAsync(deleteId);
            toast.success('Pembayaran berhasil dihapus');
            setDeleteId(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus pembayaran');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pembayaran</h1>
                    <p className="text-muted-foreground">Kelola pembayaran SPP</p>
                </div>
                <Button onClick={() => navigate({ to: '/payments/new' })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Catat Pembayaran
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari berdasarkan NIS santri atau brand..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Memuat...</div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Tidak ada pembayaran ditemukan</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>NIS Santri</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Metode</TableHead>
                                    <TableHead>Lembaga</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow key={payment.id.toString()}>
                                        <TableCell>
                                            {formatDate(payment.date)}
                                        </TableCell>
                                        <TableCell className="font-medium">{payment.studentNis}</TableCell>
                                        <TableCell>{payment.brand}</TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell className="capitalize">
                                            {payment.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'}
                                        </TableCell>
                                        <TableCell>{payment.institution.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate({ to: `/payments/${payment.id}` })}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteId(payment.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data pembayaran akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
