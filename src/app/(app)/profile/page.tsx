
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirebaseInstances } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/lib/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/lib/firebase/errors";

type UserProfile = {
    name: string;
    institution: string;
    researchInterests: string[];
};

const genericInterests = [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Biotechnology",
    "Computational Linguistics",
    "Quantum Computing",
];

function ProfileLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-80 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex flex-wrap gap-2">
                             <Skeleton className="h-6 w-24" />
                             <Skeleton className="h-6 w-36" />
                             <Skeleton className="h-6 w-28" />
                        </div>
                        <Skeleton className="h-10 w-full mt-2" />
                         <Skeleton className="h-10 w-full mt-2" />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
}


export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        name: '',
        institution: '',
        researchInterests: [],
    });
    const [interestsInput, setInterestsInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchUserProfile = async () => {
                const { firestore } = getFirebaseInstances();
                const userDocRef = doc(firestore, "users", user.uid);
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setProfile({
                            name: data.name || user.displayName || '',
                            institution: data.institution || '',
                            researchInterests: data.researchInterests || [],
                        });
                    } else {
                        // If no profile, use auth data as default
                        setProfile({
                            name: user.displayName || '',
                            institution: '',
                            researchInterests: [],
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserProfile();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        
        const { firestore } = getFirebaseInstances();
        const userDocRef = doc(firestore, "users", user.uid);
        
        const updatedProfileData = {
            name: profile.name,
            institution: profile.institution,
            researchInterests: profile.researchInterests,
        };

        setDoc(userDocRef, updatedProfileData, { merge: true })
            .then(() => {
                toast({
                    title: "Profile Updated",
                    description: "Your changes have been saved successfully.",
                });
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updatedProfileData,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsSaving(false);
            });
    };
    
    const handleAddInterest = (interest: string) => {
        const newInterest = interest.trim();
        if (newInterest && !profile.researchInterests?.includes(newInterest)) {
            setProfile(p => ({
                ...p,
                researchInterests: [...(p.researchInterests || []), newInterest]
            }));
        }
    };
    
    const handleCustomInterestAdd = () => {
        if (interestsInput) {
            interestsInput.split(',').forEach(interest => handleAddInterest(interest));
            setInterestsInput('');
        }
    };
    
    const handleRemoveInterest = (interestToRemove: string) => {
        setProfile(p => ({
            ...p,
            researchInterests: (p.researchInterests || []).filter(i => i !== interestToRemove)
        }))
    }

    const getUserInitials = (name: string | null | undefined): string => {
        if (!name) return 'U';
        const nameParts = name.split(' ').filter(Boolean);
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return nameParts[0][0].toUpperCase();
    }

    if (authLoading || isLoading) {
        return <ProfileLoading />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Profile</h1>
                <p className="text-muted-foreground">Manage your account and research preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your public profile and personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback>{getUserInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="avatar-upload">Profile Picture</Label>
                            <Input id="avatar-upload" type="file" />
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Input id="institution" placeholder="Your institution" value={profile.institution || ''} onChange={e => setProfile({...profile, institution: e.target.value})} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="interests">Research Interests</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-16">
                            {profile.researchInterests?.map(interest => (
                                <Badge key={interest} variant="secondary" className="text-sm">
                                    {interest}
                                    <button onClick={() => handleRemoveInterest(interest)} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5">
                                        &times;
                                    </button>
                                </Badge>
                            ))}
                        </div>
                         <div className="mt-4 space-y-2">
                            <p className="text-sm text-muted-foreground">Select from common interests:</p>
                             <div className="flex flex-wrap gap-2">
                                {genericInterests.map(interest => (
                                    !profile.researchInterests?.includes(interest) && (
                                        <Badge key={interest} variant="outline" className="cursor-pointer" onClick={() => handleAddInterest(interest)}>
                                            {interest} +
                                        </Badge>
                                    )
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Input 
                                id="interests-input" 
                                placeholder="Add your own interests, separated by commas..." 
                                value={interestsInput}
                                onChange={e => setInterestsInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCustomInterestAdd()}
                            />
                            <Button onClick={handleCustomInterestAdd}>Add</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
