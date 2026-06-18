
import api from './api';

export const getDashboardData = async () => {
    try {
        console.log('📊 Fetching dashboard data...');
        
        // ✅ OPTIMIZED: Fetch members and transactions in parallel (2 calls total)
        const [membersRes, transactionsRes] = await Promise.all([
            api.get('/members/members/'),
            api.get('/members/transactions/')
        ]);
        
        const members = membersRes.data || [];
        const allTransactions = transactionsRes.data || [];
        
        console.log('📥 Members fetched:', members.length);
        console.log('📥 Transactions fetched:', allTransactions.length);

        let totalKittuvan = 0;
        let totalKodukkan = 0;
        let totalPayat = 0;
        let totalIppolPayattiyath = 0;
        let totalBakki = 0;
        let totalTransactions = allTransactions.length;
        let membersWithTransactions = 0;

        // ✅ Process all transactions in JavaScript (no more API calls!)
        for (const transaction of allTransactions) {
            totalKittuvan += parseFloat(transaction.kittuvan) || 0;
            totalKodukkan += parseFloat(transaction.kodukkan) || 0;
            totalPayat += parseFloat(transaction.payat) || 0;
            totalIppolPayattiyath += parseFloat(transaction.ippol_payattiyath) || 0;
            totalBakki += parseFloat(transaction.bakki_kittan) || 0;
        }

        // Count members who have transactions
        const memberIdsWithTransactions = new Set(allTransactions.map(t => t.member));
        membersWithTransactions = memberIdsWithTransactions.size;

        return {
            totalKittuvan: parseFloat(totalKittuvan.toFixed(2)),
            totalKodukkan: parseFloat(totalKodukkan.toFixed(2)),
            totalPayat: parseFloat(totalPayat.toFixed(2)),
            totalIppolPayattiyath: parseFloat(totalIppolPayattiyath.toFixed(2)),
            totalBakki: parseFloat(totalBakki.toFixed(2)),
            activeMembers: membersWithTransactions,
            totalMembers: members.length,
            totalTransactions: totalTransactions,
        };

    } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        return {
            totalKittuvan: 0,
            totalKodukkan: 0,
            totalPayat: 0,
            totalIppolPayattiyath: 0,
            totalBakki: 0,
            activeMembers: 0,
            totalMembers: 0,
            totalTransactions: 0,
        };
    }
};
