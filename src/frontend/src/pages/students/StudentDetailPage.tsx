import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetStudent, useGetStudentPaymentHistory } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Phone, User } from 'lucide-react';
import { StatusSantri } from '../../backend';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function StudentDetailPage() {
    const { nis } = useParams({ strict: false }) as { nis: string };
    const navigate = useNavigate();
    const { data: student, isLoading } = useGetStudent(nis);
    const { data: paymentHistory = [] } = useGetStudentPaymentHistory(nis);

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

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-lg font-semibold mb-2">Santri tidak ditemukan</p>
                    <Button onClick={() => navigate({ to: '/students' })}>Kembali ke Daftar Santri</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/students' })}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{student.fullName}</h1>
                        <p className="text-muted-foreground">NIS: {student.nis}</p>
                    </div>
                </div>
                <Button onClick={() => navigate({ to: `/students/${nis}/edit` })}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Santri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">NIS</p>
                                <p className="font-medium">{student.nis}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">No. Induk</p>
                                <p className="font-medium">{student.noInduk}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Kelas</p>
                                <p className="font-medium">{Number(student.classNumber)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Lembaga</p>
                                <p className="font-medium">{student.institution.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={student.status === StatusSantri.bersekolah ? 'default' : 'secondary'}>
                                    {student.status === StatusSantri.bersekolah ? 'Aktif' : 'Lulus'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tanggal Masuk</p>
                                <p className="font-medium">{formatDate(student.enrollmentDate)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Wali</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Nama Wali</p>
                                <p className="font-medium">{student.guardianName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Telepon</p>
                                <p className="font-medium">{student.guardianPhone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                    {paymentHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Belum ada riwayat pembayaran</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Bulan/Brand</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Metode</TableHead>
                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentHistory.map((payment) => (
                                    <TableRow key={payment.id.toString()}>
                                        <TableCell>{formatDate(payment.date)}</TableCell>
                                        <TableCell>{payment.brand}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell className="capitalize">
                                            {payment.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'}
                                        </TableCell>
                                        <TableCell>{payment.notes || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
