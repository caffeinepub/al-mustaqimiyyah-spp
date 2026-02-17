import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
    LayoutDashboard, 
    Users, 
    DollarSign, 
    Calendar, 
    FileText, 
    Settings, 
    Menu,
    Heart
} from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import ThemeToggle from '../theme/ThemeToggle';

interface AdminLayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: 'Dasbor', href: '/', icon: LayoutDashboard },
    { name: 'Santri', href: '/students', icon: Users },
    { name: 'Pembayaran', href: '/payments', icon: DollarSign },
    { name: 'Kalender', href: '/calendar', icon: Calendar },
    { name: 'Laporan', href: '/reports', icon: FileText },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const NavLinks = () => (
        <>
            {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                    <Button
                        key={item.name}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => navigate({ to: item.href })}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                    </Button>
                );
            })}
        </>
    );

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <div className="flex h-16 items-center border-b px-6">
                                    <h2 className="text-lg font-semibold">SPP Sekolah</h2>
                                </div>
                                <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
                                    <nav className="flex flex-col gap-2">
                                        <NavLinks />
                                    </nav>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>

                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold">SPP Sekolah</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LoginButton />
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar - Desktop */}
                <aside className="hidden w-64 border-r bg-muted/10 md:block">
                    <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
                        <nav className="flex flex-col gap-2">
                            <NavLinks />
                        </nav>
                    </ScrollArea>
                </aside>

                {/* Main content */}
                <main className="flex-1">
                    <div className="container py-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t bg-muted/30 py-6">
                <div className="container text-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} SPP Sekolah. Dibuat dengan{' '}
                        <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> menggunakan{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                                typeof window !== 'undefined' ? window.location.hostname : 'spp-sekolah'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline underline-offset-4 hover:text-primary"
                        >
                            caffeine.ai
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
