// Update the fetchTransactions function
const fetchTransactions = async () => {
    try {
        setLoading(true);
        const response = await axios.get('/api/admin/transactions');
        setTransactions(response.data.transactions);
        setMonthlyStats(response.data.monthlyStats);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        // Handle error appropriately
    } finally {
        setLoading(false);
    }
}; 