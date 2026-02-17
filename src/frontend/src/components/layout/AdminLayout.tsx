import { ReactNode, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Users, CreditCard, Calendar, FileText, Settings, Menu } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import ThemeToggle from '../theme/ThemeToggle';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUser';
import { AppRole } from '../../backend';
import { SiCoffeescript } from 'react-icons/si';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const navigate = useNavigate();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    const { data: userProfile } = useGetCallerUserProfile();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Students', path: '/students' },
        { icon: CreditCard, label: 'Payments', path: '/payments' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'SPP Settings', path: '/settings/spp' },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader className="border-b border-sidebar-border p-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <SiCoffeescript className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Al-Mustaqimiyyah</span>
                                <span className="text-xs text-muted-foreground">SPP Management</span>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu className="p-2">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.path}>
                                    <SidebarMenuButton
                                        onClick={() => navigate({ to: item.path })}
                                        isActive={currentPath === item.path}
                                        className="w-full"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="border-t border-sidebar-border p-4">
                        {userProfile && (
                            <div className="mb-3 text-xs text-muted-foreground">
                                <div className="font-medium text-foreground">{userProfile.name}</div>
                                <div className="capitalize">{userProfile.role.replace(/([A-Z])/g, ' $1').trim()}</div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <LoginButton />
                        </div>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset className="flex-1">
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                        <SidebarTrigger />
                        <div className="flex-1" />
                    </header>
                    <main className="flex-1 p-6">{children}</main>
                    <footer className="border-t bg-muted/30 px-6 py-4 text-center text-sm text-muted-foreground">
                        <p>
                            © {new Date().getFullYear()} Al-Mustaqimiyyah SPP Management. Built with ❤️ using{' '}
                            <a
                                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                                    window.location.hostname
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-primary hover:underline"
                            >
                                caffeine.ai
                            </a>
                        </p>
                    </footer>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
