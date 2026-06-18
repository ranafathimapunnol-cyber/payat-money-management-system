import api from './api';

export const getDashboardData = async () => {
    try {
        console.log('📊 Fetching dashboard data...');
        
        const membersRes = await api.get('/members/members/');
        const members = membersRes.data || [];
        console.log('📥 Members fetched:', members.length);

        let totalKittuvan = 0;
        let totalKodukkan = 0;
        let totalPayat = 0;
        let totalIppolPayattiyath = 0;
        let totalBakki = 0;
        let activeMembers = 0;
        let totalMembers = members.length;
        let totalTransactions = 0;

        for (const member of members) {
            try {
                const transRes = await api.get(`/members/members/${member.id}/transactions/`);
                const transactions = transRes.data || [];
                totalTransactions += transactions.length;
                
                if (transactions && transactions.length > 0) {
                    const latestTransaction = transactions[0];
                    totalKittuvan += parseFloat(latestTransaction.kittuvan) || 0;
                    totalKodukkan += parseFloat(latestTransaction.kodukkan) || 0;
                    totalPayat += parseFloat(latestTransaction.payat) || 0;
                    totalIppolPayattiyath += parseFloat(latestTransaction.ippol_payattiyath) || 0;
                    totalBakki += parseFloat(latestTransaction.bakki_kittan) || 0;
                    activeMembers++;
                }
            } catch (error) {
                console.log(`ℹ️ No transactions for member: ${member.name}`);
            }
        }

        return {
            totalKittuvan: parseFloat(totalKittuvan.toFixed(2)),
            totalKodukkan: parseFloat(totalKodukkan.toFixed(2)),
            totalPayat: parseFloat(totalPayat.toFixed(2)),
            totalIppolPayattiyath: parseFloat(totalIppolPayattiyath.toFixed(2)),
            totalBakki: parseFloat(totalBakki.toFixed(2)),
            activeMembers,
            totalMembers,
            totalTransactions,
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
