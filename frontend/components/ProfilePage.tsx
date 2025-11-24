'use client'

import { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletConnect';
import { usersAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, LinkIcon, Unlink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
    const { user, loading: authLoading, checkAuth } = useAuth();
    const { 
        account, 
        balance, 
        chainId, 
        isConnected, 
        connectWallet, 
        isLoading: walletLoading 
    } = useWallet();
    
    const [isLinking, setIsLinking] = useState(false);

    const handleLinkWallet = async () => {
        if (!account) return;
        setIsLinking(true);

        try {
            const response = await usersAPI.linkWallet(account);
            if (response.success) {
                // Refresh auth state to get the updated user object with walletAddress
                await checkAuth(); 
                toast({
                    title: 'Wallet Linked',
                    description: response.message,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Link Failed',
                description: error.message || 'Could not link wallet.',
                variant: 'destructive',
            });
        } finally {
            setIsLinking(false);
        }
    };
    
    const handleUnlinkWallet = async () => {
        setIsLinking(true); // Reusing isLinking state for the operation

        try {
            const response = await usersAPI.unlinkWallet();
            if (response.success) {
                await checkAuth();
                toast({
                    title: 'Wallet Unlinked',
                    description: response.message,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Unlink Failed',
                description: error.message || 'Could not unlink wallet.',
                variant: 'destructive',
            });
        } finally {
            setIsLinking(false);
        }
    };
    
    const loading = authLoading || walletLoading;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
    
    // Safety check - should be caught by ProtectedRoute, but good practice
    if (!user) return null;


    const isWalletLinked = user.walletAddress && user.walletAddress === account;
    const isDifferentWalletConnected = user.walletAddress && account && user.walletAddress !== account;
    const canLinkWallet = isConnected && !user.walletAddress && !isLinking;
    const isUnlinkedButConnected = isConnected && !user.walletAddress;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="font-display text-4xl font-bold mb-8 text-foreground">
                            {user.firstName}'s Profile
                        </h1>

                        <div className="grid lg:grid-cols-2 gap-8">
                            
                            {/* Card 1: Account Details (Placeholder) */}
                            <Card className="p-6">
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-3">
                                    <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
                                </CardContent>
                            </Card>

                            {/* Card 2: Web3 Wallet Status */}
                            <Card className="p-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-primary" />
                                        Web3 Wallet
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-4">
                                    
                                    {/* Display Current Wallet Status */}
                                    <div className="space-y-1">
                                        <p><strong>Connection Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
                                        <p><strong>Wallet Address:</strong> 
                                            {account ? account : <span className='text-muted-foreground'>Not Detected</span>}
                                        </p>
                                        {isConnected && balance && (
                                            <p><strong>ETH Balance:</strong> {Number(balance).toFixed(4)} ETH</p>
                                        )}
                                        {isConnected && chainId && (
                                            <p><strong>Chain ID:</strong> {chainId} ({chainId === 1 ? 'Mainnet' : chainId === 11155111 ? 'Sepolia' : 'Unknown'})</p>
                                        )}
                                    </div>

                                    {/* Action Button Area */}
                                    <div className="pt-4 border-t border-border mt-4">
                                        
                                        {/* Case 1: Wallet is NOT Connected */}
                                        {!isConnected && (
                                            <Button onClick={connectWallet} disabled={isLinking} className="w-full">
                                                <LinkIcon className="mr-2 h-4 w-4" /> Connect MetaMask
                                            </Button>
                                        )}

                                        {/* Case 2: Wallet is Connected AND Linked */}
                                        {isConnected && user.walletAddress && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> Wallet linked to this account.
                                                </p>
                                                <Button onClick={handleUnlinkWallet} variant="destructive" size="sm" disabled={isLinking} className="w-full">
                                                    {isLinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlink className="mr-2 h-4 w-4" />}
                                                    Unlink Wallet
                                                </Button>
                                                {isDifferentWalletConnected && (
                                                    <p className="text-sm text-yellow-600 pt-2">
                                                        *Note: The wallet currently connected in MetaMask is different from the linked wallet.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Case 3: Wallet is Connected but NOT Linked */}
                                        {isUnlinkedButConnected && (
                                            <Button onClick={handleLinkWallet} disabled={isLinking} className="w-full">
                                                {isLinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                                                Link {account ? account.substring(0, 6) : ''}... to Profile
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </ProtectedRoute>
    );
}