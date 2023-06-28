import { ActionIcon, Button, Group, Paper, Text, TextInput } from '@mantine/core';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import { MRT_ColumnDef, MRT_SortingState, MantineReactTable } from 'mantine-react-table';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { MdOutlineModeEdit } from 'react-icons/md';
import useSWR from 'swr';
import { useDebouncedCallback } from 'use-debounce';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';

import { useMeasureHeight } from '@hooks/use-measure-height';
import { API_URL, api } from '@lib/api';

import { Content } from '../../components/layout/content';
import { Layout } from '../../components/layout/layout';

export interface Tournament {
    /** @format int32 */
    id: number;

    /** @format int32 */
    app_game_id: number;
    name: string | null;

    /** @format date-time */
    start_date: string;

    /** @format date-time */
    end_date: string;

    /** @format int32 */
    status_id: number;

    /** @format int32 */
    payout_id: number;

    /** @format int32 */
    entry_fee: number;

    /** @format date-time */
    created_at: string;
    payout: any;
    meta_data: any;
    give_tokens: boolean;
    f2p: boolean;
    image_url: any;

    /** @format int32 */
    tournament_platform: number;
    cash_tournament: boolean;
    free_entries: any;
    password: any;
    tournament_structure_id: any;
    payout_description: any;
    bots: any;

    /** @format int32 */
    priority_sequence: number;
    countries: any;
    user_Id: any;
    transaction_id: any;
    title: string | null;
    payout_name: string | null;
}

export interface TournamentResponseListPagedResponse {
    data: Tournament[] | null;
    succeeded: boolean;
    errors: string[] | null;
    message: string | null;

    /** @format int32 */
    pageNumber: number;

    /** @format int32 */
    pageSize: number;

    /** @format uri */
    firstPage: string | null;

    /** @format uri */
    lastPage: string | null;

    /** @format int32 */
    totalPages: number;

    /** @format int32 */
    totalRecords: number;

    /** @format uri */
    nextPage: string | null;

    /** @format uri */
    previousPage: string | null;
}

const COLUMN_LABELS: Record<
    string,
    {
        label: string;
        accessor?: MRT_ColumnDef<Tournament>['accessorKey'];
    }
> = {
    status: {
        label: 'Status',
        accessor: 'status_id'
    },
    createdAt: {
        label: 'Created At',
        accessor: 'created_at'
    },
    starts: {
        label: 'Start date',
        accessor: 'start_date'
    },
    ends: {
        label: 'End date',
        accessor: 'end_date'
    },
    title: {
        label: 'Title',
        accessor: 'title'
    },
    name: {
        label: 'Name',
        accessor: 'name'
    },
    action: {
        label: 'Actions'
    }
};

export function useGamesList(queryParams: {
    PageNumber?: number;
    PageSize?: number;
    search?: string;
    active?: boolean;
    orderBy?: string;
}) {
    const stringParams = Object.entries(queryParams)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const { data, error, isValidating, mutate, ...swrRest } = useSWR(
        `${API_URL}/api/AppGames/SearchAllGames?${stringParams}`,
        async (url: string) => api.get<TournamentResponseListPagedResponse>(url).then((res) => res.data),
        {
            keepPreviousData: true
        }
    );

    if (!data) {
        return {
            data: {
                gamesList: [],
                pageParams: {
                    totalPages: 0,
                    totalRecords: 0,
                    pageNumber: 0,
                    pageSize: 0
                }
            },
            loading: false,
            isError: false,
            isValidating,
            refresh: async () => mutate(data),
            ...swrRest
        };
    }
    const { data: listData, totalPages, totalRecords, pageNumber, pageSize } = data;

    return {
        data: {
            gamesList: listData,
            pageParams: {
                totalPages,
                totalRecords,
                pageNumber,
                pageSize
            }
        },
        loading: isValidating || (!error && !data),
        isError: error,
        isValidating,
        refresh: async () => mutate(data),
        ...swrRest
    };
}

// const getSortingValue = (sortingState: MRT_SortingState) => {
//     const sortingBy = sortingState[0]?.id;

//     if (!sortingBy) {
//         return '';
//     }

//     switch (sortingBy) {
//         case 'Status':
//             return COLUMN_LABELS.status.accessor;
//         case 'Created At':
//             return COLUMN_LABELS.createdAt.accessor;
//         case 'Modified At':
//             return COLUMN_LABELS.modifiedAt.accessor;

//         default:
//             return '';
//     }
// };

export function useTournamentsList(queryParams: {
    PageNumber?: number;
    PageSize?: number;
    search?: string;
    banned?: boolean;
    orderBy?: string;
}) {
    const stringParams = Object.entries(queryParams)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const { data, error, isValidating, mutate, ...swrRest } = useSWR(
        `${API_URL}/api/Tournaments/SearchAllTournaments?${stringParams}`,
        async (url: string) => api.get<TournamentResponseListPagedResponse>(url).then((res) => res.data),
        {
            keepPreviousData: true
        }
    );

    if (!data) {
        return {
            data: {
                tournamentsList: [],
                pageParams: {
                    totalPages: 0,
                    totalRecords: 0,
                    pageNumber: 0,
                    pageSize: 0
                }
            },
            loading: false,
            isError: false,
            isValidating,
            refresh: async () => mutate(data),
            ...swrRest
        };
    }

    const { data: listData, totalPages, totalRecords, pageNumber, pageSize } = data;

    return {
        data: {
            tournamentsList: listData,
            pageParams: {
                totalPages,
                totalRecords,
                pageNumber,
                pageSize
            }
        },
        loading: !error && !data,
        isError: error,
        isValidating,
        refresh: async () => mutate(data),
        ...swrRest
    };
}

const TournamentsPage = () => {
    const [query, setQuery] = useQueryParams({
        pageIndex: withDefault(NumberParam, 0),
        pageSize: withDefault(NumberParam, 30),
        query: withDefault(StringParam, '')
    });

    const { ref, height = 0 } = useMeasureHeight();
    const router = useRouter();
    const [sorting, setSorting] = useState<MRT_SortingState>([]);

    const {
        data: { tournamentsList, pageParams },
        isLoading,
        isError,
        refresh
    } = useTournamentsList({
        PageNumber: query.pageIndex + 1,
        PageSize: query.pageSize,
        search: query.query || ''
    });

    const onSearchChange = useDebouncedCallback((event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.trim() ? event.target.value : '';

        setQuery((p) => ({
            ...p,
            query: inputValue
        }));
    }, 300);

    const onPressAddTournament = () => {
        router.push('/tournaments/add');
    };

    const onPressEditTournament = (tournamentId: number) => {
        router.push(`/tournaments/edit/${tournamentId}`);
    };

    const getFormatedDateElement = (date: string) => {
        const formatedDate = new Date(date).toLocaleString();

        return <span className="text-xs text-slate-500">{formatedDate}</span>;
    };

    const getStatus = (tournament: Tournament) => (
        <Text color={tournament.status_id === 3 ? 'green.4' : 'orange.5'}>
            {tournament.status_id ? 'Active' : 'Inactive'}
        </Text>
    );

    const getActionsForTournament = (tournament: Tournament) => (
        <Button leftIcon={<MdOutlineModeEdit />} variant="light" onClick={() => onPressEditTournament(tournament.id)}>
            Edit
        </Button>
    );

    const columns = useMemo<MRT_ColumnDef<Tournament>[]>(
        () => [
            {
                header: COLUMN_LABELS.title.label,
                accessorKey: COLUMN_LABELS.title.accessor
            },
            {
                header: COLUMN_LABELS.name.label,
                accessorFn: (row) => row.name || 'Not available'
            },
            {
                header: COLUMN_LABELS.status.label,
                accessorFn: (row) => getStatus(row)
            },
            {
                header: COLUMN_LABELS.createdAt.label,
                accessorFn: (row) => getFormatedDateElement(row.created_at)
            },
            {
                header: COLUMN_LABELS.starts.label,
                accessorFn: (row) => getFormatedDateElement(row.start_date)
            },
            {
                header: COLUMN_LABELS.ends.label,
                accessorFn: (row) => getFormatedDateElement(row.end_date)
            },
            {
                header: COLUMN_LABELS.action.label,
                size: 100,
                accessorFn: (row) => row,
                Cell: ({ cell }) => getActionsForTournament(cell.getValue<Tournament>()),
                enableSorting: false
            }
        ],
        []
    );

    useEffect(() => {
        // sets initial query params in url
        setQuery((p) => p);
        // we want that only in initial render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Layout>
            <Content label="Users list">
                <Group position="apart">
                    <Button onClick={onPressAddTournament}>add game</Button>
                    <TextInput
                        icon={<IconSearch size="1.1rem" stroke={1.5} />}
                        radius="sm"
                        rightSection={
                            <ActionIcon size={24} radius="sm" color="blue" variant="light">
                                <IconArrowRight size="1.1rem" stroke={1.5} />
                            </ActionIcon>
                        }
                        placeholder="Search questions"
                        rightSectionWidth={36}
                        onChange={onSearchChange}
                    />
                </Group>
                {isError && (
                    <Text color="red.6" size="md" my={8}>
                        Error: {isError}
                    </Text>
                )}

                <Paper
                    radius={8}
                    ref={ref}
                    data-test-id="tweet-history-page"
                    sx={() => ({
                        borderRadius: 4,
                        height: '100%',
                        backgroundColor: 'transparent',
                        overflowY: 'hidden'
                    })}
                >
                    <MantineReactTable
                        enableFilters={false}
                        columns={columns}
                        enableMultiSort={false}
                        data={tournamentsList ?? []}
                        enableGlobalFilter={false}
                        enableStickyHeader
                        enableDensityToggle={false}
                        manualPagination
                        rowCount={pageParams.totalRecords ?? 0}
                        pageCount={pageParams.totalPages ?? 0}
                        onSortingChange={(sort) => {
                            setSorting(sort);
                            refresh();
                        }}
                        manualSorting
                        mantinePaperProps={{
                            style: {
                                border: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }
                        }}
                        mantineTableContainerProps={{
                            style: {
                                maxHeight: height - 56 * 2,
                                flex: 1
                            }
                        }}
                        mantineTableBodyCellProps={{
                            style: {
                                borderBottom: 'none'
                            }
                        }}
                        initialState={{
                            showSkeletons: true
                        }}
                        state={{
                            pagination: {
                                pageIndex: query.pageIndex,
                                pageSize: query.pageSize
                            },
                            isLoading,
                            showProgressBars: false,
                            showSkeletons: isLoading,
                            density: 'xs',
                            sorting
                        }}
                        // props above doesnt work
                        mantineProgressProps={{
                            style: {
                                display: 'none'
                            }
                        }}
                        onPaginationChange={(prev: any) => {
                            setQuery(
                                prev({
                                    ...query,
                                    pageIndex: query.pageIndex,
                                    pageSize: query.pageSize
                                })
                            );
                        }}
                    />
                </Paper>
            </Content>
        </Layout>
    );
};

export default TournamentsPage;
