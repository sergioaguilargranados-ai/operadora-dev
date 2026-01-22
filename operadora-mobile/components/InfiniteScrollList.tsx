import React, { useState, useCallback } from 'react'
import { FlatList, ActivityIndicator, View, StyleSheet, RefreshControl } from 'react-native'
import { Text } from 'react-native-paper'
import { Colors, Spacing, FontSizes } from '../constants/theme'

interface InfiniteScrollListProps<T> {
    data: T[]
    renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement
    onLoadMore: () => Promise<void>
    onRefresh?: () => Promise<void>
    hasMore: boolean
    loading: boolean
    keyExtractor: (item: T, index: number) => string
    ListHeaderComponent?: React.ReactElement
    ListEmptyComponent?: React.ReactElement
    estimatedItemSize?: number
}

export default function InfiniteScrollList<T>({
    data,
    renderItem,
    onLoadMore,
    onRefresh,
    hasMore,
    loading,
    keyExtractor,
    ListHeaderComponent,
    ListEmptyComponent,
    estimatedItemSize = 100,
}: InfiniteScrollListProps<T>) {
    const [refreshing, setRefreshing] = useState(false)

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            onLoadMore()
        }
    }, [loading, hasMore, onLoadMore])

    const handleRefresh = useCallback(async () => {
        if (onRefresh) {
            setRefreshing(true)
            await onRefresh()
            setRefreshing(false)
        }
    }, [onRefresh])

    const renderFooter = () => {
        if (!loading) return null

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando más resultados...</Text>
            </View>
        )
    }

    const renderEmpty = () => {
        if (loading && data.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.emptyText}>Cargando...</Text>
                </View>
            )
        }

        return ListEmptyComponent || (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay resultados</Text>
            </View>
        )
    }

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={renderEmpty}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                ) : undefined
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
                length: estimatedItemSize,
                offset: estimatedItemSize * index,
                index,
            })}
        />
    )
}

const styles = StyleSheet.create({
    footer: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: Spacing.sm,
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyText: {
        marginTop: Spacing.md,
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
})
