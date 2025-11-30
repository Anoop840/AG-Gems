'use client'

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletConnect';
import { usersAPI, orderAPI, Order, OrdersResponse } from '@/lib/api'; // Import orderAPI and Order types
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components
import { Loader2, Wallet, LinkIcon, Unlink, CheckCircle, Package, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Helper function to format currency
const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`

// --- Order History Component ---
function OrderHistoryTab() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response: OrdersResponse = await orderAPI.getMyOrders();
            if (response.success && response.orders) {
                // Sort by creation date descending
                setOrders(response.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } else {
                setError('Failed to fetch orders.');
            }
        } catch (err: any) {
            console.error("Order Fetch Error:", err);
            setError(err.message || 'An error occurred while loading orders.');
        } finally {
            setLoading(false);
        }
    };

    const renderStatusBadge = (status: Order['orderStatus']) => {
        let colorClass = "bg-secondary text-secondary-foreground"
        if (status === 'delivered') {
          colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        } else if (status === 'shipped' || status === 'processing') {
            colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        } else if (status === 'cancelled') {
          colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
            {status}
          </span>
        )
      }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return <p className="text-destructive p-4 text-center">{error}</p>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">No Orders Found</h3>
                <p className="text-muted-foreground">It looks like you haven't placed any orders yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/shop">Start Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <Card key={order._id} className="p-6 transition-all hover:shadow-md">
                    <CardHeader className="p-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold flex flex-col sm:flex-row sm:items-center gap-2">
                           Order #{order.orderNumber}
                           {renderStatusBadge(order.orderStatus)}
                        </CardTitle>
                        <Link href={`/order-confirmation?id=${order._id}`} passHref legacyBehavior>
                            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                                View Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 mt-4 text-sm space-y-2">
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                        
                        <Separator className="my-3" />

                        <p className="font-semibold text-foreground">Items ({order.items.length}):</p>
                        <ul className="text-muted-foreground text-xs space-y-1">
                            {order.items.slice(0, 3).map((item, index) => (
                                <li key={index} className="truncate">{item.name} × {item.quantity}</li>
                            ))}
                            {order.items.length > 3 && (
                                <li>... and {order.items.length - 3} more items</li>
                            )}
                        </ul>

                        <Link href={`/order-confirmation?id=${order._id}`} passHref legacyBehavior>
                            <Button variant="link" size="sm" className="p-0 pt-2 h-auto text-primary">
                                View Order Details
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// --- Main Profile Page Component ---
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
    const isDifferentWalletConnected = user.walletAddress && account && user.walletAddress.toLowerCase() !== account.toLowerCase();
    const isUnlinkedButConnected = isConnected && !user.walletAddress;

    const renderAccountDetails = () => (
        <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Card 1: Account Details */}
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                    <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || <span className='text-muted-foreground'>N/A</span>}</p>
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
                                <p className={cn("text-sm font-medium flex items-center gap-1", isDifferentWalletConnected ? 'text-yellow-600' : 'text-green-600')}>
                                    <CheckCircle className="w-4 h-4" /> Wallet linked: {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                                </p>
                                <Button onClick={handleUnlinkWallet} variant="destructive" size="sm" disabled={isLinking} className="w-full">
                                    {isLinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlink className="mr-2 h-4 w-4" />}
                                    Unlink Wallet
                                </Button>
                                {isDifferentWalletConnected && (
                                    <p className="text-sm text-yellow-600 pt-2">
                                        *Note: A different wallet is currently connected. Unlink to connect the current one.
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
    )

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="font-display text-4xl font-bold mb-8 text-foreground">
                            {user.firstName}'s Profile
                        </h1>

                        <Tabs defaultValue="account">
                            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto mb-8">
                                <TabsTrigger value="account">Account Details</TabsTrigger>
                                <TabsTrigger value="orders">Order History</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">
                                {renderAccountDetails()}
                            </TabsContent>
                            <TabsContent value="orders">
                                <OrderHistoryTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <Footer />
            </div>
        </ProtectedRoute>
    );
}