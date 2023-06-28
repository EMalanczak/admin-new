import { ActionIcon, Box, Button, Group, Paper, Text, TextInput } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import { MRT_ColumnDef, MRT_SortingState, MantineReactTable } from 'mantine-react-table';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { MdOutlineModeEdit } from 'react-icons/md';
import useSWR from 'swr';
import { useDebouncedCallback } from 'use-debounce';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';

import { useMeasureHeight } from '@hooks/use-measure-height';
import { API_URL, api } from '@lib/api';

import { Content } from '../../components/layout/content';
import { Layout } from '../../components/layout/layout';
import { UserListPagedResponse } from '../../types/user';

type QueryParams = {
    query: string | null;
    pageIndex: number;
    pageSize: number;
};

export interface Game {
    /** @format int64 */
    id: number;

    /** @format int64 */
    userId: number;

    /** @format uuid */
    appGameUid: string;
    title: string | null;
    description: string | null;
    statusId: boolean | null;

    /** @format date-time */
    createdAt: string;

    /** @format date-time */
    modified: string;
    onesignalApi: string | null;
    onesignalAppId: string | null;

    /** @format int32 */
    p2pGamesPlayed: number | null;

    /** @format int32 */
    f2pGamesPlayed: number | null;
    currentVersion: string | null;
    currentVersionIos: string | null;
    currentVersionAndroid: string | null;
    landscape: boolean;
    defaultTournamentImage: string | null;
}

export interface AppGameListPagedResponse {
    data?: Game[] | null;
    succeeded?: boolean;
    errors?: string[] | null;
    message?: string | null;

    /** @format int32 */
    pageNumber?: number;

    /** @format int32 */
    pageSize?: number;

    /** @format uri */
    firstPage?: string | null;

    /** @format uri */
    lastPage?: string | null;

    /** @format int32 */
    totalPages?: number;

    /** @format int32 */
    totalRecords?: number;

    /** @format uri */
    nextPage?: string | null;

    /** @format uri */
    previousPage?: string | null;
}

const COLUMN_LABELS: Record<
    string,
    {
        label: string;
        accessor?: MRT_ColumnDef<Game>['accessorKey'];
    }
> = {
    status: {
        label: 'Status',
        accessor: 'statusId'
    },
    createdAt: {
        label: 'Created At',
        accessor: 'createdAt'
    },
    modifiedAt: {
        label: 'Modified At',
        accessor: 'modified'
    },
    title: {
        label: 'Title',
        accessor: 'title'
    },
    id: {
        label: 'ID',
        accessor: 'appGameUid'
    },
    action: {
        label: 'Action'
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
        async (url: string) => api.get<AppGameListPagedResponse>(url).then((res) => res.data),
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

export function useGame(gameId: string) {
    const { data, error, mutate } = useSWR(
        `${API_URL}/api/Games/${gameId}`,
        async (url: string) => api.get(url).then((res) => res.data),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false
        }
    );

    return {
        game: data,
        isLoading: !error && !data,
        isError: error,
        refresh: async () => mutate(data)
    };
}

const getSortingValue = (sortingState: MRT_SortingState) => {
    const sortingBy = sortingState[0]?.id;

    if (!sortingBy) {
        return '';
    }

    switch (sortingBy) {
        case 'Status':
            return COLUMN_LABELS.status.accessor;
        case 'Created At':
            return COLUMN_LABELS.createdAt.accessor;
        case 'Modified At':
            return COLUMN_LABELS.modifiedAt.accessor;

        default:
            return '';
    }
};
// https://megafans-admin-api-dev.azurewebsites.net/Users/SearchAllUsers?query=&pageIndex=0&pageSize=30 40
// https://megafans-admin-api-dev.azurewebsites.net/api/Users/SearchAllUsers?appGameUid=90bd85cd-2035-43c0-a090-d5e9e372ece8&PageNumber=1&PageSize=15
export const useUsersList = ({ query, pageIndex, pageSize }: QueryParams) => {
    const urlQuery = new URLSearchParams({
        query: query ?? '',
        pageNumber: `${pageIndex + 1}`,
        pageSize: `${pageSize}`
    });

    const { data, error, isValidating, ...swrRest } = useSWR<
        | UserListPagedResponse
        | Pick<UserListPagedResponse, 'data' | 'succeeded' | 'errors' | 'totalPages' | 'totalRecords'>
    >(
        `${API_URL}/api/Users/SearchAllUsers?${urlQuery.toString()}`,
        async (url: string) => {
            try {
                const response = await api.get<UserListPagedResponse>(url);

                return response.data;
            } catch (e) {
                console.error(e);

                return {
                    data: [],
                    succeeded: false,
                    errors: ['Error'],
                    totalPages: -1,
                    totalRecords: 0
                };
            }
        },
        {
            keepPreviousData: true
        }
    );

    const isValidResponse = data?.succeeded;

    return {
        data,
        loading: !!query && (isValidating || (!error && !data)),
        error: !query || !isValidResponse || !!error,
        ...swrRest
    };
};

const GamesPage = () => {
    const [query, setQuery] = useQueryParams({
        pageIndex: withDefault(NumberParam, 0),
        pageSize: withDefault(NumberParam, 30),
        query: withDefault(StringParam, '')
    });

    const clipboard = useClipboard();

    const { ref, height = 0 } = useMeasureHeight();
    const router = useRouter();
    const [sorting, setSorting] = useState<MRT_SortingState>([]);

    const {
        data: { gamesList, pageParams },
        isError,
        refresh,
        isLoading
    } = useGamesList({
        PageNumber: query.pageIndex + 1,
        PageSize: query.pageSize,
        search: query.query || '',
        orderBy: getSortingValue(sorting)
    });

    const onPressAddGame = () => {
        router.push('/games/add');
    };

    const onSearchChange = useDebouncedCallback((event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.trim() ? event.target.value : '';

        setQuery((p) => ({
            ...p,
            query: inputValue
        }));
    }, 300);

    const onPressEditGame = (gameId: number) => {
        router.push(`/games/edit/${gameId}`);
    };

    const getFormatedDateElement = (date: string) => {
        const formatedDate = new Date(date).toLocaleString();
        return <span className="text-xs text-slate-500">{formatedDate}</span>;
    };

    const getStatus = (game: Game) => (
        <Text color={game.statusId ? 'green.4' : 'orange.5'}>{game.statusId ? 'Active' : 'Inactive'}</Text>
    );

    const getIdCell = (game: Game) => (
        <Button
            title={game.appGameUid}
            variant="transparent"
            p={0}
            sx={{
                width: '100%',

                '&:hover': {
                    textDecoration: 'underline'
                }
            }}
            styles={{
                inner: {
                    justifyContent: 'space-between',
                    width: '100%'
                },
                label: {
                    width: 200
                }
            }}
            onClick={() => {
                clipboard.copy(game.appGameUid);

                notifications.show({
                    title: 'Copy',
                    message: 'ID copied successfully',
                    color: 'green.5',
                    autoClose: 2500
                });
            }}
        >
            <Text truncate>{game.appGameUid}</Text>
            <Box ml={8}>
                <FiCopy />
            </Box>
        </Button>
    );

    const getActionsForGame = (game: Game) => (
        <Button leftIcon={<MdOutlineModeEdit />} variant="light" onClick={() => onPressEditGame(game.id)}>
            Edit
        </Button>
    );

    const columns = useMemo<MRT_ColumnDef<Game>[]>(
        () => [
            {
                accessorKey: COLUMN_LABELS.title.accessor, // access nested data with dot notation
                header: COLUMN_LABELS.title.label,
                enableSorting: false
            },
            {
                accessorFn: (row) => getIdCell(row),
                header: COLUMN_LABELS.id.label,
                enableSorting: false
            },
            {
                accessorFn: (row) => getStatus(row),
                header: COLUMN_LABELS.status.label
            },
            {
                header: COLUMN_LABELS.createdAt.label,
                accessorFn: (row) => getFormatedDateElement(row.createdAt)
            },
            {
                header: COLUMN_LABELS.modifiedAt.label,
                accessorFn: (row) => getFormatedDateElement(row.modified)
            },
            {
                header: COLUMN_LABELS.action.label,
                size: 100,
                accessorFn: (row) => row,
                Cell: ({ cell }) => getActionsForGame(cell.getValue<Game>()),
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
                    <Button onClick={onPressAddGame}>add game</Button>
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
                        data={gamesList ?? []}
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

                            // setQuery((p) => ({
                            //     ...p,
                            //     page: pageIndex,
                            //     pageSize
                            // }));
                        }}
                    />
                </Paper>
            </Content>
        </Layout>
    );
};

export default GamesPage;
