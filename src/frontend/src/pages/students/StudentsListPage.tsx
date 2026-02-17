import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListStudents, useDeleteStudent } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit, Upload } from 'lucide-react';
import { StatusSantri } from '../../backend';
import { toast } from 'sonner';
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

export default function StudentsListPage() {
    const navigate = useNavigate();
    const { data: students = [], isLoading } = useListStudents();
    const deleteMutation = useDeleteStudent();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteNis, setDeleteNis] = useState<string | null>(null);

    const filteredStudents = useMemo(() => {
        return students.filter(
            (student) =>
                student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.nis.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const handleDelete = async () => {
        if (!deleteNis) return;
        try {
            await deleteMutation.mutateAsync(deleteNis);
            toast.success('Santri berhasil dihapus');
            setDeleteNis(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus santri');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Santri</h1>
                    <p className="text-muted-foreground">Kelola data santri</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate({ to: '/students/import' })}>
                        <Upload className="mr-2 h-4 w-4" />
                        Impor Excel
                    </Button>
                    <Button onClick={() => navigate({ to: '/students/new' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Santri
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari berdasarkan nama atau NIS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Memuat...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Tidak ada santri ditemukan</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Nama Lengkap</TableHead>
                                    <TableHead>Kelas</TableHead>
                                    <TableHead>Lembaga</TableHead>
                                    <TableHead>Wali</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow
                                        key={student.nis}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate({ to: `/students/${student.nis}` })}
                                    >
                                        <TableCell className="font-medium">{student.nis}</TableCell>
                                        <TableCell>{student.fullName}</TableCell>
                                        <TableCell>{Number(student.classNumber)}</TableCell>
                                        <TableCell>{student.institution.name}</TableCell>
                                        <TableCell>{student.guardianName}</TableCell>
                                        <TableCell>
                                            <Badge variant={student.status === StatusSantri.bersekolah ? 'default' : 'secondary'}>
                                                {student.status === StatusSantri.bersekolah ? 'Aktif' : 'Lulus'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate({ to: `/students/${student.nis}/edit` })}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteNis(student.nis)}
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

            <AlertDialog open={!!deleteNis} onOpenChange={() => setDeleteNis(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data santri akan dihapus secara permanen.
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
