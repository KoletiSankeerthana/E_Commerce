import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('https://ecommerce-vwsy.onrender.com/api/orders');

                console.log("ORDERS API RESPONSE:", data);
                console.log("IS ARRAY:", Array.isArray(data));

                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userInfo, navigate]);

    const handleStatusChange = async (id, status) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            await axios.put(`https://ecommerce-vwsy.onrender.com/api/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setOrders(orders.map(order => order._id === id ? { ...order, orderStatus: status } : order));
            alert("Status updated successfully");
        } catch (error) {
            console.error("Status update error:", error);
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleReturnAction = async (id, action) => {
        try {
            const status = action === 'Approve' ? 'Approved' : 'Rejected';
            // We use the same status update endpoint, passing returnStatus in body
            // Note: Our backend updateOrderStatus checks for returnStatus in body
            await axios.put(`https://ecommerce-vwsy.onrender.com/api/orders/${id}/status`, {
                status: action === 'Approve' ? 'Returned' : 'Delivered', // Update main status too? Or keep Delivered? 
                // Let's keep main status as Delivered/Returned and sync returnStatus.
                // Actually, if we look at backend, it expects `status` (orderStatus) and optionally `returnStatus`.
                // If Approved, maybe set orderStatus to 'Returned'? Or 'Delivered' is fine.
                // Let's just update `returnStatus`.
                returnStatus: status
            });
            setOrders(orders.map(order => order._id === id ? { ...order, returnStatus: status } : order));
        } catch (error) {
            alert("Failed to update return status");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Orders</h2>

            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Order ID</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>User Email</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Total</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Status</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Return</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Date</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{order.orderId || order._id}</td>
                                <td style={{ padding: '10px' }}>{order.user?.email || 'N/A'}</td>
                                <td style={{ padding: '10px' }}>₹{order.totalPrice}</td>
                                <td style={{ padding: '10px' }}>
                                    <select
                                        value={order.orderStatus === 'Order Placed' ? 'Placed' : order.orderStatus}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        disabled={order.orderStatus === 'Cancelled'}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                            backgroundColor: order.orderStatus === 'Delivered' ? '#e7f4e4' : '#fff',
                                            color: '#282c3f',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {order.returnStatus && order.returnStatus !== 'None' ? (
                                        <div style={{ fontSize: '13px' }}>
                                            <div style={{ fontWeight: 'bold', color: order.returnStatus === 'Requested' ? 'orange' : order.returnStatus === 'Approved' ? 'green' : 'red' }}>
                                                {order.returnStatus}
                                            </div>
                                            {order.returnStatus === 'Requested' && (
                                                <div style={{ marginTop: '5px', display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                                    <div style={{ fontSize: '11px', color: '#555' }}>Reason: {order.returnReason}</div>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button
                                                            onClick={() => handleReturnAction(order._id, 'Approve')}
                                                            style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReturnAction(order._id, 'Reject')}
                                                            style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td style={{ padding: '10px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '10px' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={() => navigate(`/track-order?orderId=${order.orderId}`)}
                                            style={{
                                                padding: '6px 12px',
                                                cursor: 'pointer',
                                                border: '1px solid #282c3f',
                                                borderRadius: '4px',
                                                background: '#282c3f',
                                                color: '#fff',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            View
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
