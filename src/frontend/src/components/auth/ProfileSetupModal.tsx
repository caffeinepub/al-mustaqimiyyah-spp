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
    const { data: institutions = [] } = useListInstitutions();
    const [name, setName] = useState('');
    const [role, setRole] = useState<AppRole>(AppRole.treasurer);
    const [institutionId, setInstitutionId] = useState<string>('');

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not available');
            const profile = {
                name,
                role,
                institutionId: role === AppRole.superAdmin ? undefined : BigInt(institutionId),
            };
            await actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
            toast.success('Profile created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create profile');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (role !== AppRole.superAdmin && !institutionId) {
            toast.error('Please select an institution');
            return;
        }
        saveMutation.mutate();
    };

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Welcome! Set Up Your Profile</DialogTitle>
                    <DialogDescription>Please provide your name and role to continue.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
                            <SelectTrigger id="role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={AppRole.superAdmin}>Super Admin</SelectItem>
                                <SelectItem value={AppRole.smpAdmin}>SMP Admin</SelectItem>
                                <SelectItem value={AppRole.smaAdmin}>SMA Admin</SelectItem>
                                <SelectItem value={AppRole.treasurer}>Treasurer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {role !== AppRole.superAdmin && (
                        <div className="space-y-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Select value={institutionId} onValueChange={setInstitutionId}>
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
                    )}
                    <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? 'Saving...' : 'Continue'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
