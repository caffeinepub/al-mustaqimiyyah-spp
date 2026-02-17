import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Student {
    nis: string;
    status: StatusSantri;
    classNumber: bigint;
    institution: Institution;
    fullName: string;
    guardianPhone: string;
    noInduk: string;
    enrollmentDate: bigint;
    guardianName: string;
}
export interface CreatePaymentRequest {
    id: bigint;
    receiptImage: ExternalBlob;
    paymentMethod: PaymentMethod;
    date: bigint;
    studentNis: string;
    institutionId: bigint;
    notes: string;
    brand: string;
    amount: bigint;
}
export interface Payment {
    id: bigint;
    receiptImage: ExternalBlob;
    paymentMethod: PaymentMethod;
    date: bigint;
    institution: Institution;
    createdAt: bigint;
    studentNis: string;
    notes: string;
    brand: string;
    amount: bigint;
}
export interface SppSetting {
    id: bigint;
    receiptImage: ExternalBlob;
    paymentMethod: PaymentMethod;
    date: bigint;
    institution: Institution;
    createdAt: bigint;
    notes: string;
    brand: string;
    amount: bigint;
}
export interface Institution {
    id: bigint;
    name: string;
    address: string;
}
export interface UserProfile {
    name: string;
    role: AppRole;
    institutionId?: bigint;
}
export enum AppRole {
    superAdmin = "superAdmin",
    treasurer = "treasurer",
    smpAdmin = "smpAdmin",
    smaAdmin = "smaAdmin"
}
export enum PaymentMethod {
    cash = "cash",
    transfer = "transfer"
}
export enum StatusSantri {
    bersekolah = "bersekolah",
    lulus = "lulus"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInstitution(name: string, address: string): Promise<Institution>;
    addStudent(nis: string, classNumber: bigint, noInduk: string, fullName: string, instId: bigint, guardianName: string, guardianPhone: string, enrollmentDate: bigint): Promise<Student>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPayment(request: CreatePaymentRequest): Promise<Payment>;
    createSppSetting(amount: bigint, brand: string, date: bigint, paymentMethod: PaymentMethod, receiptImage: ExternalBlob, notes: string, institutionId: bigint): Promise<SppSetting>;
    deletePayment(paymentId: bigint): Promise<void>;
    deleteSppSetting(id: bigint): Promise<void>;
    deleteStudent(nis: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        totalSmpStudents: bigint;
        totalArrearsThisMonth: bigint;
        totalSmaStudents: bigint;
        totalPaymentsThisMonth: bigint;
    }>;
    getInstitution(id: bigint): Promise<Institution | null>;
    getPayment(id: bigint): Promise<Payment | null>;
    getSppSetting(id: bigint): Promise<SppSetting | null>;
    getStudent(nis: string): Promise<Student | null>;
    getStudentPaymentHistory(studentNis: string): Promise<Array<Payment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listInstitutions(): Promise<Array<Institution>>;
    listPayments(institutionId: bigint | null, studentNis: string | null): Promise<Array<Payment>>;
    listSppSettings(institutionId: bigint | null): Promise<Array<SppSetting>>;
    listStudents(institutionId: bigint | null, status: StatusSantri | null): Promise<Array<Student>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePayment(id: bigint, amount: bigint, date: bigint, paymentMethod: PaymentMethod, notes: string): Promise<Payment>;
    updateSppSetting(id: bigint, amount: bigint, brand: string, notes: string): Promise<SppSetting>;
    updateStudent(nis: string, classNumber: bigint, fullName: string, guardianName: string, guardianPhone: string): Promise<Student>;
    updateStudentStatus(nis: string, status: StatusSantri): Promise<Student>;
}
