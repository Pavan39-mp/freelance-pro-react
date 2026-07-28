import { useState, useMemo } from 'react';

/**
 * Global filtering pipeline ensuring consistent filter execution across all datasets
 * Original Data → Search → Status → Priority → Date → Other filters → Sort → Render UI
 */
export const useFilterPipeline = (originalData = [], config = {}) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [priority, setPriority] = useState('All');
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [otherFilters, setOtherFilters] = useState({});
    const [sortBy, setSortBy] = useState(config.initialSortBy || 'createdAt');
    const [sortOrder, setSortOrder] = useState(config.initialSortOrder || 'desc');

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const filteredData = useMemo(() => {
        let result = [...originalData];

        // 1. Search
        if (search && config.searchLogic) {
            result = result.filter(item => config.searchLogic(item, search));
        }

        // 2. Status
        if (status && status !== 'All' && config.statusLogic) {
            result = result.filter(item => config.statusLogic(item, status));
        }

        // 3. Priority
        if (priority && priority !== 'All' && config.priorityLogic) {
            result = result.filter(item => config.priorityLogic(item, priority));
        }

        // 4. Date
        if ((dateRange.start || dateRange.end) && config.dateLogic) {
            result = result.filter(item => config.dateLogic(item, dateRange));
        }

        // 5. Other filters (Project, Client, Custom combinations)
        if (Object.keys(otherFilters).length > 0 && config.otherFiltersLogic) {
            result = result.filter(item => config.otherFiltersLogic(item, otherFilters));
        }

        // 6. Sort
        if (sortBy && config.sortLogic) {
            result.sort((a, b) => config.sortLogic(a, b, sortBy, sortOrder));
        } else {
            // Default fallback string/date sort
            result.sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];
                if (typeof valA === 'string') {
                    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                if (valA instanceof Date || !isNaN(new Date(valA))) {
                    const tA = new Date(valA).getTime();
                    const tB = new Date(valB).getTime();
                    return sortOrder === 'asc' ? tA - tB : tB - tA;
                }
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            });
        }

        return result;
    }, [originalData, search, status, priority, dateRange, otherFilters, sortBy, sortOrder, config]);

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    const paginatedData = useMemo(() => {
        return filteredData.slice((page - 1) * limit, page * limit);
    }, [filteredData, page, limit]);

    return {
        search, setSearch,
        status, setStatus,
        priority, setPriority,
        dateRange, setDateRange,
        otherFilters, setOtherFilters,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        page, setPage,
        limit, setLimit,
        filteredData,
        paginatedData,
        totalCount,
        totalPages
    };
};
