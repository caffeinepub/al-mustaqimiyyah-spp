import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListInstitutions } from '../../hooks/useQueries';
import { AppRole } from '../../backend';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    const { data: institutions = [], isLoading: institutionsLoading, isError: institutionsError } = useListInstitutions();
    const [name, setName] = useState('');
    const [role, setRole] = useState<AppRole>(AppRole.treasurer);
    const [institutionId, setInstitutionId] = useState<string>('');

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor tidak tersedia');
            const profile = {
                name,
                role,
                institutionId: role === AppRole.superAdmin ? undefined : BigInt(institutionId),
            };
            await actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
            toast.success('Profil berhasil dibuat');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal membuat profil');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Silakan masukkan nama Anda');
            return;
        }
        if (role !== AppRole.superAdmin && !institutionId) {
            toast.error('Silakan pilih lembaga');
            return;
        }
        saveMutation.mutate();
    };

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Selamat Datang! Atur Profil Anda</DialogTitle>
                    <DialogDescription>Silakan masukkan nama dan peran Anda untuk melanjutkan.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masukkan nama lengkap Anda"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Peran</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
                            <SelectTrigger id="role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AppRole.superAdmin}>Super Admin</SelectItem>
                                <SelectItem value={AppRole.smpAdmin}>Admin SMP</SelectItem>
                                <SelectItem value={AppRole.smaAdmin}>Admin SMA</SelectItem>
                                <SelectItem value={AppRole.treasurer}>Bendahara</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {role !== AppRole.superAdmin && (
                        <div className="space-y-2">
                            <Label htmlFor="institution">Lembaga</Label>
                            <Select 
                                value={institutionId} 
                                onValueChange={setInstitutionId}
                                disabled={institutionsLoading || institutionsError}
                            >
                                <SelectTrigger id="institution">
                                    <SelectValue 
                                        placeholder={
                                            institutionsLoading 
                                                ? "Memuat data lembaga..." 
                                                : institutionsError 
                                                    ? "Gagal memuat lembaga" 
                                                    : institutions.length === 0
                                                        ? "Tidak ada lembaga tersedia"
                                                        : "Pilih lembaga"
                                        } 
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutions.map((inst) => (
                                        <SelectItem key={inst.id.toString()} value={inst.id.toString()}>
                                            {inst.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {institutionsError && (
                                <p className="text-sm text-destructive">Gagal memuat data lembaga. Silakan coba lagi.</p>
                            )}
                            {!institutionsLoading && !institutionsError && institutions.length === 0 && (
                                <p className="text-sm text-muted-foreground">Tidak ada lembaga yang tersedia saat ini.</p>
                            )}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? 'Menyimpan...' : 'Lanjutkan'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
