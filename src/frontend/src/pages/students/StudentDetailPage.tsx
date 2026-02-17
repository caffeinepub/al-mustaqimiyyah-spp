import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetStudent, useGetStudentPaymentHistory } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { StatusSantri } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentDetailPage() {
    const { nis } = useParams({ strict: false }) as { nis: string };
    const navigate = useNavigate();
    const { data: student, isLoading } = useGetStudent(nis);
    const { data: paymentHistory = [] } = useGetStudentPaymentHistory(nis);

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!student) {
        return <div className="text-center py-8">Student not found</div>;
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
                        <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Student ID</div>
                            <div className="text-base">{student.noInduk}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Class</div>
                            <div className="text-base">{Number(student.classNumber)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Institution</div>
                            <div className="text-base">{student.institution.name}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                            <Badge variant={student.status === StatusSantri.bersekolah ? 'default' : 'secondary'}>
                                {student.status === StatusSantri.bersekolah ? 'Active' : 'Graduated'}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Enrollment Date</div>
                            <div className="text-base">
                                {new Date(Number(student.enrollmentDate) / 1000000).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Guardian Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Guardian Name</div>
                            <div className="text-base">{student.guardianName}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Guardian Phone</div>
                            <div className="text-base">{student.guardianPhone}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {paymentHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No payment history</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentHistory.map((payment) => (
                                    <TableRow
                                        key={payment.id.toString()}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate({ to: `/payments/${payment.id}` })}
                                    >
                                        <TableCell>
                                            {new Date(Number(payment.date) / 1000000).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{payment.brand}</TableCell>
                                        <TableCell>Rp {Number(payment.amount).toLocaleString()}</TableCell>
                                        <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
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
