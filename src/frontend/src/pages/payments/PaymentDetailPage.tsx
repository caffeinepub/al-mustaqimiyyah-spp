import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPayment, useGetStudent } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function PaymentDetailPage() {
    const { id } = useParams({ strict: false }) as { id: string };
    const navigate = useNavigate();
    const { data: payment, isLoading } = useGetPayment(BigInt(id));
    const { data: student } = useGetStudent(payment?.studentNis || '');

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Placeholder for PDF download functionality
        alert('Fitur unduh PDF akan segera tersedia');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-lg font-semibold mb-2">Pembayaran tidak ditemukan</p>
                    <Button onClick={() => navigate({ to: '/payments' })}>Kembali ke Daftar Pembayaran</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/payments' })}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detail Pembayaran</h1>
                        <p className="text-muted-foreground">ID: {payment.id.toString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Unduh PDF
                    </Button>
                    <Button onClick={() => navigate({ to: `/payments/${id}/edit` })}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Tanggal Pembayaran</p>
                                <p className="font-medium">{formatDate(payment.date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Jumlah</p>
                                <p className="font-medium text-lg">{formatCurrency(payment.amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Brand/Bulan</p>
                                <p className="font-medium">{payment.brand}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
                                <p className="font-medium capitalize">
                                    {payment.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Lembaga</p>
                                <p className="font-medium">{payment.institution.name}</p>
                            </div>
                            {payment.notes && (
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">Catatan</p>
                                    <p className="font-medium">{payment.notes}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Santri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {student ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">NIS</p>
                                    <p className="font-medium">{student.nis}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                                    <p className="font-medium">{student.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Kelas</p>
                                    <p className="font-medium">{Number(student.classNumber)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama Wali</p>
                                    <p className="font-medium">{student.guardianName}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full mt-4"
                                    onClick={() => navigate({ to: `/students/${student.nis}` })}
                                >
                                    Lihat Detail Santri
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Memuat informasi santri...</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
