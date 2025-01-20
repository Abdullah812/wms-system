import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
export const CustodyOverview = () => {
    const supabase = useSupabaseClient();
    const [stats, setStats] = useState({
        pending: 0, active: 0, returned: 0, rejected: 0
    });
    useEffect(() => {
        const fetchCustodyStats = async () => {
            const { data, error } = await supabase.from('custody').select('status');
            if (!error) {
                const counts = data.reduce((acc, curr) => {
                    acc[curr.status]++;
                    return acc;
                }, { pending: 0, active: 0, returned: 0, rejected: 0 });
                setStats(counts);
            }
        };
        fetchCustodyStats();
    }, [supabase]);
    return (_jsx("div", { className: "card", children: _jsxs("div", { className: "card-content", children: [_jsx("h2", { children: "\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0639\u0647\u062F" }), _jsxs("div", { className: "stats", children: [_jsxs("p", { children: ["\u0627\u0644\u0639\u0647\u062F \u0627\u0644\u0645\u0639\u0644\u0642\u0629: ", stats.pending] }), _jsxs("p", { children: ["\u0627\u0644\u0639\u0647\u062F \u0627\u0644\u0646\u0634\u0637\u0629: ", stats.active] }), _jsxs("p", { children: ["\u0627\u0644\u0639\u0647\u062F \u0627\u0644\u0645\u0631\u062A\u062C\u0639\u0629: ", stats.returned] }), _jsxs("p", { children: ["\u0627\u0644\u0639\u0647\u062F \u0627\u0644\u0645\u0631\u0641\u0648\u0636\u0629: ", stats.rejected] })] })] }) }));
};
