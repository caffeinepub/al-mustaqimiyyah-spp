import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetStudent, useAddStudent, useUpdateStudent, useListInstitutions } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface StudentFormPageProps {
    mode: 'create' | 'edit';
}

export default function StudentFormPage({ mode }: StudentFormPageProps) {
    const { nis } = useParams({ strict: false }) as { nis?: string };
    const navigate = useNavigate();
    const { data: student } = useGetStudent(nis || '');
    const { data: institutions = [] } = useListInstitutions();
    const addMutation = useAddStudent();
    const updateMutation = useUpdateStudent();

    const [formData, setFormData] = useState({
        nis: '',
        noInduk: '',
        fullName: '',
        classNumber: '',
        institutionId: '',
        guardianName: '',
        guardianPhone: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (mode === 'edit' && student) {
            setFormData({
                nis: student.nis,
                noInduk: student.noInduk,
                fullName: student.fullName,
                classNumber: student.classNumber.toString(),
                institutionId: student.institution.id.toString(),
                guardianName: student.guardianName,
                guardianPhone: student.guardianPhone,
                enrollmentDate: new Date(Number(student.enrollmentDate) / 1000000).toISOString().split('T')[0],
            });
        }
    }, [mode, student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (mode === 'create') {
                await addMutation.mutateAsync({
                    nis: formData.nis,
                    classNumber: BigInt(formData.classNumber),
                    noInduk: formData.noInduk,
                    fullName: formData.fullName,
                    instId: BigInt(formData.institutionId),
                    guardianName: formData.guardianName,
                    guardianPhone: formData.guardianPhone,
                    enrollmentDate: BigInt(new Date(formData.enrollmentDate).getTime() * 1000000),
                });
                toast.success('Student created successfully');
            } else {
                await updateMutation.mutateAsync({
                    nis: formData.nis,
                    classNumber: BigInt(formData.classNumber),
                    fullName: formData.fullName,
                    guardianName: formData.guardianName,
                    guardianPhone: formData.guardianPhone,
                });
                toast.success('Student updated successfully');
            }
            navigate({ to: '/students' });
        } catch (error: any) {
            toast.error(error.message || `Failed to ${mode} student`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/students' })}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {mode === 'create' ? 'Add New Student' : 'Edit Student'}
                    </h1>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nis">NIS *</Label>
                                <Input
                                    id="nis"
                                    value={formData.nis}
                                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                                    disabled={mode === 'edit'}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="noInduk">Student ID *</Label>
                                <Input
                                    id="noInduk"
                                    value={formData.noInduk}
                                    onChange={(e) => setFormData({ ...formData, noInduk: e.target.value })}
                                    disabled={mode === 'edit'}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="classNumber">Class *</Label>
                                <Input
                                    id="classNumber"
                                    type="number"
                                    value={formData.classNumber}
                                    onChange={(e) => setFormData({ ...formData, classNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution *</Label>
                                <Select
                                    value={formData.institutionId}
                                    onValueChange={(value) => setFormData({ ...formData, institutionId: value })}
                                    disabled={mode === 'edit'}
                                >
                                    <SelectTrigger id="institution">
                                        <SelectValue placeholder="Select institution" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutions.map((inst) => (
                                            <SelectItem key={inst.id.toString()} value={inst.id.toString()}>
                                                {inst.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guardianName">Guardian Name *</Label>
                            <Input
                                id="guardianName"
                                value={formData.guardianName}
                                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guardianPhone">Guardian Phone *</Label>
                            <Input
                                id="guardianPhone"
                                value={formData.guardianPhone}
                                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                required
                            />
                        </div>

                        {mode === 'create' && (
                            <div className="space-y-2">
                                <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                                <Input
                                    id="enrollmentDate"
                                    type="date"
                                    value={formData.enrollmentDate}
                                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                                {addMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate({ to: '/students' })}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
