import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Student, Institution, SppSetting, Payment, CreatePaymentRequest, StatusSantri, AppRole, UserProfile } from '../backend';

// Students
export function useListStudents(institutionId?: bigint | null, status?: StatusSantri | null) {
    const { actor, isFetching } = useActor();

    return useQuery<Student[]>({
        queryKey: ['students', institutionId?.toString(), status],
        queryFn: async () => {
            if (!actor) return [];
            return actor.listStudents(institutionId ?? null, status ?? null);
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetStudent(nis: string) {
    const { actor, isFetching } = useActor();

    return useQuery<Student | null>({
        queryKey: ['student', nis],
        queryFn: async () => {
            if (!actor) return null;
            return actor.getStudent(nis);
        },
        enabled: !!actor && !isFetching && !!nis,
    });
}

export function useAddStudent() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            nis: string;
            classNumber: bigint;
            noInduk: string;
            fullName: string;
            instId: bigint;
            guardianName: string;
            guardianPhone: string;
            enrollmentDate: bigint;
        }) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.addStudent(
                data.nis,
                data.classNumber,
                data.noInduk,
                data.fullName,
                data.instId,
                data.guardianName,
                data.guardianPhone,
                data.enrollmentDate
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}

export function useUpdateStudent() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            nis: string;
            classNumber: bigint;
            fullName: string;
            guardianName: string;
            guardianPhone: string;
        }) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.updateStudent(
                data.nis,
                data.classNumber,
                data.fullName,
                data.guardianName,
                data.guardianPhone
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['student', variables.nis] });
        },
    });
}

export function useUpdateStudentStatus() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { nis: string; status: StatusSantri }) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.updateStudentStatus(data.nis, data.status);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['student', variables.nis] });
        },
    });
}

export function useDeleteStudent() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (nis: string) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.deleteStudent(nis);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}

// Institutions
export function useListInstitutions() {
    const { actor, isFetching } = useActor();

    return useQuery<Institution[]>({
        queryKey: ['institutions'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.listInstitutions();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetInstitution(id: bigint) {
    const { actor, isFetching } = useActor();

    return useQuery<Institution | null>({
        queryKey: ['institution', id.toString()],
        queryFn: async () => {
            if (!actor) return null;
            return actor.getInstitution(id);
        },
        enabled: !!actor && !isFetching,
    });
}

// SPP Settings
export function useListSppSettings(institutionId?: bigint | null) {
    const { actor, isFetching } = useActor();

    return useQuery<SppSetting[]>({
        queryKey: ['sppSettings', institutionId?.toString()],
        queryFn: async () => {
            if (!actor) return [];
            return actor.listSppSettings(institutionId ?? null);
        },
        enabled: !!actor && !isFetching,
    });
}

export function useCreateSppSetting() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            amount: bigint;
            brand: string;
            date: bigint;
            paymentMethod: any;
            receiptImage: any;
            notes: string;
            institutionId: bigint;
        }) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.createSppSetting(
                data.amount,
                data.brand,
                data.date,
                data.paymentMethod,
                data.receiptImage,
                data.notes,
                data.institutionId
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sppSettings'] });
        },
    });
}

export function useUpdateSppSetting() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: bigint; amount: bigint; brand: string; notes: string }) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.updateSppSetting(data.id, data.amount, data.brand, data.notes);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sppSettings'] });
        },
    });
}

export function useDeleteSppSetting() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: bigint) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.deleteSppSetting(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sppSettings'] });
        },
    });
}

// Payments
export function useListPayments(institutionId?: bigint | null, studentNis?: string | null) {
    const { actor, isFetching } = useActor();

    return useQuery<Payment[]>({
        queryKey: ['payments', institutionId?.toString(), studentNis],
        queryFn: async () => {
            if (!actor) return [];
            return actor.listPayments(institutionId ?? null, studentNis ?? null);
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetPayment(id: bigint) {
    const { actor, isFetching } = useActor();

    return useQuery<Payment | null>({
        queryKey: ['payment', id.toString()],
        queryFn: async () => {
            if (!actor) return null;
            return actor.getPayment(id);
        },
        enabled: !!actor && !isFetching,
    });
}

export function useCreatePayment() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreatePaymentRequest) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.createPayment(request);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['studentPaymentHistory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}

export function useUpdatePayment() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            id: bigint;
            amount: bigint;
            date: bigint;
            paymentMethod: any;
            notes: string;
        }) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.updatePayment(data.id, data.amount, data.date, data.paymentMethod, data.notes);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payment', variables.id.toString()] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['studentPaymentHistory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}

export function useDeletePayment() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: bigint) => {
            if (!actor) throw new Error('Actor tidak tersedia');
            return actor.deletePayment(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['studentPaymentHistory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
    });
}

export function useGetStudentPaymentHistory(studentNis: string) {
    const { actor, isFetching } = useActor();

    return useQuery<Payment[]>({
        queryKey: ['studentPaymentHistory', studentNis],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getStudentPaymentHistory(studentNis);
        },
        enabled: !!actor && !isFetching && !!studentNis,
    });
}

// Dashboard
export function useGetDashboardStats() {
    const { actor, isFetching } = useActor();

    return useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            if (!actor) return null;
            return actor.getDashboardStats();
        },
        enabled: !!actor && !isFetching,
    });
}
