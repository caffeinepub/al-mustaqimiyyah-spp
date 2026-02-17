import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUser';
import AdminLayout from './components/layout/AdminLayout';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import RequireAuth from './components/auth/RequireAuth';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentsListPage from './pages/students/StudentsListPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import StudentFormPage from './pages/students/StudentFormPage';
import StudentsImportPage from './pages/students/StudentsImportPage';
import SppSettingsPage from './pages/settings/SppSettingsPage';
import PaymentsListPage from './pages/payments/PaymentsListPage';
import PaymentFormPage from './pages/payments/PaymentFormPage';
import PaymentDetailPage from './pages/payments/PaymentDetailPage';
import PaymentCalendarPage from './pages/calendar/PaymentCalendarPage';
import ReportsIndexPage from './pages/reports/ReportsIndexPage';
import MonthlyRecapReportPage from './pages/reports/MonthlyRecapReportPage';
import ClassRecapReportPage from './pages/reports/ClassRecapReportPage';
import InstitutionRecapReportPage from './pages/reports/InstitutionRecapReportPage';
import ArrearsReportPage from './pages/reports/ArrearsReportPage';

function RootLayout() {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
    const isAuthenticated = !!identity;
    const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

    return (
        <>
            <RequireAuth>
                <AdminLayout>
                    <Outlet />
                </AdminLayout>
            </RequireAuth>
            {showProfileSetup && <ProfileSetupModal />}
            <Toaster />
        </>
    );
}

const rootRoute = createRootRoute({
    component: RootLayout,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: DashboardPage,
});

const studentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/students',
    component: StudentsListPage,
});

const studentDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/students/$nis',
    component: StudentDetailPage,
});

const studentNewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/students/new',
    component: () => <StudentFormPage mode="create" />,
});

const studentEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/students/$nis/edit',
    component: () => <StudentFormPage mode="edit" />,
});

const studentsImportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/students/import',
    component: StudentsImportPage,
});

const sppSettingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/spp',
    component: SppSettingsPage,
});

const paymentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payments',
    component: PaymentsListPage,
});

const paymentNewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payments/new',
    component: () => <PaymentFormPage mode="create" />,
});

const paymentDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payments/$id',
    component: PaymentDetailPage,
});

const paymentEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payments/$id/edit',
    component: () => <PaymentFormPage mode="edit" />,
});

const calendarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/calendar',
    component: PaymentCalendarPage,
});

const reportsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports',
    component: ReportsIndexPage,
});

const monthlyReportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/monthly',
    component: MonthlyRecapReportPage,
});

const classReportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/class',
    component: ClassRecapReportPage,
});

const institutionReportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/institution',
    component: InstitutionRecapReportPage,
});

const arrearsReportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reports/arrears',
    component: ArrearsReportPage,
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    studentsRoute,
    studentDetailRoute,
    studentNewRoute,
    studentEditRoute,
    studentsImportRoute,
    sppSettingsRoute,
    paymentsRoute,
    paymentNewRoute,
    paymentDetailRoute,
    paymentEditRoute,
    calendarRoute,
    reportsRoute,
    monthlyReportRoute,
    classReportRoute,
    institutionReportRoute,
    arrearsReportRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}
