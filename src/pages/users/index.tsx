import { Button, Group, Paper } from '@mantine/core';
import dayjs from 'dayjs';
import { MRT_ColumnDef, MantineReactTable } from 'mantine-react-table';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { MdOutlineModeEdit } from 'react-icons/md';
import useSWR from 'swr';
import { NumberParam, StringParam, useQueryParams, withDefault } from 'use-query-params';

import { useMeasureHeight } from '@hooks/use-measure-height';
import { API_URL, api } from '@lib/api';

import { Content } from '../../components/layout/content';
import { Layout } from '../../components/layout/layout';
import { User, UserListPagedResponse } from '../../types/user';

type QueryParams = {
    query: string | null;
    pageIndex: number;
    pageSize: number;
};

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

const UsersPage = () => {
    const router = useRouter();
    const [query, setQuery] = useQueryParams({
        pageIndex: withDefault(NumberParam, 0),
        pageSize: withDefault(NumberParam, 30),
        query: withDefault(StringParam, '')
    });

    const { ref, height = 0 } = useMeasureHeight();

    const { data, isLoading } = useUsersList({
        query: query.query,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize
    });

    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'username', // access nested data with dot notation
                header: 'Username'
            },
            {
                accessorKey: 'email',
                header: 'Email'
            },
            {
                accessorFn(originalRow) {
                    // eslint-disable-next-line no-nested-ternary
                    return originalRow.banned ? 'Banned' : originalRow.statusId ? 'Active' : 'Inactive';
                }, // normal accessorKey
                header: 'Status'
            },
            {
                header: 'Modified at',
                accessorFn(originalRow) {
                    return dayjs(originalRow.modified).format('DD/MM/YYYY, HH:mm:ss A');
                },
                size: 220
            },
            {
                accessorKey: 'banned',
                header: 'Action',
                size: 100,
                accessorFn: (row) => row,
                // eslint-disable-next-line react/no-unstable-nested-components
                Cell: ({ cell }) => (
                    <Group noWrap>
                        <Button
                            compact
                            size="sm"
                            leftIcon={<MdOutlineModeEdit />}
                            variant="light"
                            onClick={() => {
                                router.push(`/users/edit/${cell.getValue<User>().id}`);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            compact
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() => {
                                console.log(cell.getValue<any>());
                            }}
                        >
                            Ban
                        </Button>
                    </Group>
                )
            }
        ],
        []
    );

    useEffect(() => {
        // sets initial query params in url
        setQuery((p) => p);
    }, []);

    // useEffect(() => {
    //     setQuery((p) => ({
    //         ...p,
    //         page: 1
    //     }));
    // }, [debouncedTweetContents]);
    console.log({ data });

    return (
        <Layout>
            <Content label="Users list">
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
                        columns={columns}
                        data={data?.data ?? []}
                        enableGlobalFilter={false}
                        enableStickyHeader
                        enableDensityToggle={false}
                        manualPagination
                        rowCount={data?.totalRecords ?? 0}
                        pageCount={data?.totalPages ?? 0}
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
                            density: 'xs'
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

export default UsersPage;
