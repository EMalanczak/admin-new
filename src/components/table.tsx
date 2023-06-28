import { Box, createStyles, LoadingOverlay, Pagination, Paper, ScrollArea, Stack, UnstyledButton } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender,
    TableOptions,
    getSortedRowModel,
    SortingState,
    ColumnSort
} from '@tanstack/react-table';
import React, { memo, useEffect, useState } from 'react';

export type TableProps<T> = {
    columns: ColumnDef<T>[];
    striped?: boolean;
    highlightOnHover?: boolean;
    data: T[];
    debug?: boolean;
    height?: number;
    activePage?: number;
    totalPages?: number;
    onChangePage?: (page: number) => void;
    onSortChange?: (sorting: { id: string; desc: boolean } | null) => void;
    sort?: ColumnSort;
    emptyComponent?: any;
    loadingComponent?: any;
    isLoading?: boolean;
} & Omit<TableOptions<T>, 'getCoreRowModel'>;

export type TableColumn<T extends object> = ColumnDef<T> & {
    sortQuery?: string;
};

type TableBareProps<T> = TableProps<T> & {
    width: number;
};

const sortingIcons = {
    asc: (
        <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            aria-hidden="true"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z"
                clipRule="evenodd"
            />
        </svg>
    ),
    desc: (
        <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            aria-hidden="true"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                clipRule="evenodd"
            />
        </svg>
    ),
    default: (
        <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            aria-hidden="true"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                d="M11.47 4.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06L12 6.31 8.78 9.53a.75.75 0 01-1.06-1.06l3.75-3.75zm-3.75 9.75a.75.75 0 011.06 0L12 17.69l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 010-1.06z"
                clipRule="evenodd"
            />
        </svg>
    )
};

const useStyles = createStyles(
    (theme, { striped, highlightOnHover }: { striped: boolean; highlightOnHover: boolean }) => ({
        table: {
            ...theme.fn.fontStyles(),
            willChange: 'width',
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
            borderCollapse: 'collapse',
            fontSize: 14,
            // overflowY: 'scroll',
            // overflowX: 'hidden',
            borderRadius: 6
        },
        tr: {
            display: 'flex',
            flexGrow: 1,
            width: '100%',

            '&:not(:last-of-type)': {
                borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`
            }
        },
        bodyTr: {
            width: '100%',
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
            ...(striped && {
                '&:nth-of-type(odd)': {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1]
                }
            }),

            ...(highlightOnHover && {
                '&:hover': {
                    '--resize-opacity': 0.15,
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
                }
            })
        },
        head: {
            position: 'sticky',
            top: 0,
            zIndex: 1,
            height: 34,
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0]
        },
        th: {
            padding: '0.4em',
            position: 'relative',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            '--resize-opacity': 0,
            textAlign: 'left',
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
            borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
            fontSize: 14,

            '&:hover': {
                '--resize-opacity': 0.15
            },

            '&:not(:last-of-type)': {
                borderRight: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`
            }
        },
        td: {
            padding: '0.4em',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',

            '&:not(:last-of-type)': {
                borderRight: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`
            }
        },
        resizer: {
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: 6,
            background: theme.primaryColor,
            cursor: 'col-resize',
            userSelect: 'none',
            touchAction: 'none',
            opacity: 'var(--resize-opacity)',

            '&:hover': {
                '--resize-opacity': 1
            }
        },
        sortingColumn: {
            cursor: 'pointer',
            userSelect: 'none'
        },
        columnContent: {
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 14
        }
    })
);

const TableBare = memo(
    <T extends object>({
        columns,
        data,
        striped = false,
        highlightOnHover = false,
        debug = false,
        width,
        // height,
        onSortChange,
        sort,
        emptyComponent = () => <div />,
        // loadingComponent = () => <div />,
        isLoading = false,
        ...tableProps
    }: TableBareProps<T>) => {
        const { classes, cx } = useStyles({
            striped,
            highlightOnHover
        });

        const [sorting, setSorting] = useState<SortingState>(sort ? [sort] : []);
        const [widthRerender, setWidthRerender] = useState(0);

        const EmptyComponent = emptyComponent;

        const table = useReactTable({
            data,
            columns,
            columnResizeMode: 'onChange',
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
            // wrong typings in @tanstack/react-table
            onSortingChange: (getSortData: any) => {
                const sortData = getSortData();

                setSorting(sortData);
                onSortChange?.(sortData[0] ?? null);
            },
            state: {
                sorting
            },
            defaultColumn: {
                enableSorting: false
            },
            debugAll: debug,
            manualSorting: true,
            ...tableProps
        });

        useEffect(() => {
            // actually I do not like this approach but it was
            // the fastest simple solution for preventing spam updating the columns
            if (widthRerender < 3) {
                const restrictedColumns = columns.reduce(
                    (acc, col) => {
                        if (col?.size || col?.minSize) {
                            return {
                                count: acc.count + 1,
                                width: acc.width + ((col?.size || col?.minSize) ?? 0)
                            };
                        }
                        return acc;
                    },
                    {
                        count: 0,
                        width: 0
                    }
                );

                table.setColumnSizing(
                    columns.reduce(
                        (acc, col) => ({
                            ...acc,
                            [col.id!]: col.size
                                ? col.size
                                : (width - restrictedColumns.width) / (columns.length - restrictedColumns.count)
                        }),
                        {}
                    )
                );
                setWidthRerender((p) => p + 1);
            }
        }, [width]);

        useEffect(() => {
            if (sort) {
                setSorting([sort]);
            }
        }, [sort]);

        return (
            <Box
                className={classes.table}
                style={{
                    width: `max(${table.getTotalSize()}px, 100%)`,
                    height: '100%'
                    // height: height ? `${height}px` : 'auto'
                }}
            >
                <div className={classes.head}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <div className={classes.tr} key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const icon = header.column.getIsSorted()
                                    ? sortingIcons[header.column.getIsSorted() || 'default']
                                    : sortingIcons.default;

                                return (
                                    <div
                                        className={classes.th}
                                        key={header.id}
                                        // @ts-ignore
                                        colSpan={header.colSpan}
                                        style={{
                                            width: header.getSize(),
                                            position: 'relative'
                                        }}
                                    >
                                        <UnstyledButton
                                            {...{
                                                className: cx(classes.columnContent, {
                                                    [classes.sortingColumn]: header.column.getCanSort()
                                                }),
                                                onClick: () => {
                                                    switch (header.column.getIsSorted()) {
                                                        case 'desc':
                                                            header.column.toggleSorting(false);
                                                            break;
                                                        case 'asc':
                                                            header.column.clearSorting();
                                                            break;
                                                        default:
                                                            header.column.toggleSorting(true);
                                                            break;
                                                    }
                                                }
                                            }}
                                        >
                                            <span style={{ overflow: 'hidden' }}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </span>

                                            {header.column.getCanSort() && (
                                                <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
                                            )}
                                        </UnstyledButton>
                                        <Box
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={classes.resizer}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <LoadingOverlay visible={isLoading ?? false} />
                <div>
                    {data.length === 0 ? (
                        <EmptyComponent />
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <div key={row.id} data-test-id={`row-${row.id}`} className={cx(classes.tr, classes.bodyTr)}>
                                {row.getVisibleCells().map((cell) => (
                                    <div
                                        className={classes.td}
                                        key={cell.id}
                                        style={{
                                            width: cell.column.getSize(),
                                            position: 'relative'
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </Box>
        );
    }
);

TableBare.displayName = 'TableBare';

export const Table = <T extends object>({ activePage, onChangePage, totalPages, ...props }: TableProps<T>) => {
    const [ref, { width, height }] = useResizeObserver();

    return (
        <Stack
            ref={ref}
            justify="space-between"
            style={{
                height: '100%'
            }}
        >
            <ScrollArea
                scrollbarSize={8}
                type="always"
                styles={(theme) => ({
                    scrollbar: {
                        '&:hover': {
                            backgroundColor: 'transparent'
                        }
                    },
                    thumb: {
                        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[1]
                    },
                    root: {
                        flexGrow: 1,

                        '& *[data-orientation=horizontal] > *::before': {
                            minHeight: 12,
                            top: '100%'
                        },

                        '& *[data-orientation=vertical] > *::before': {
                            minWidth: 12,
                            left: '100%'
                        }
                    },
                    viewport: {
                        flexGrow: 1,
                        border: `1px solid ${
                            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
                        }`,
                        borderRadius: 6
                    }
                })}
            >
                <Paper
                    ref={ref}
                    style={{
                        flexGrow: 1
                    }}
                >
                    <TableBare {...(props as any)} width={width} height={height - 40} />
                </Paper>
            </ScrollArea>

            <Pagination
                data-test-id="pagination"
                value={activePage}
                onChange={onChangePage}
                total={totalPages || 1}
                position="center"
            />
        </Stack>
    );
};
