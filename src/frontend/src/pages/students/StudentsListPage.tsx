import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListStudents, useDeleteStudent } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            toast.success('Student deleted successfully');
            setDeleteNis(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete student');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    <p className="text-muted-foreground">Manage student records</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate({ to: '/students/import' })}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Excel
                    </Button>
                    <Button onClick={() => navigate({ to: '/students/new' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or NIS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No students found</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Institution</TableHead>
                                    <TableHead>Guardian</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
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
                                                {student.status === StatusSantri.bersekolah ? 'Active' : 'Graduated'}
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the student record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
