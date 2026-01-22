import React from 'react'
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { Text, Card, Chip, Button } from 'react-native-paper'
import { Colors, Spacing, FontSizes } from '../constants/theme'

interface FilterOption {
    id: string
    label: string
    value: any
    type: 'checkbox' | 'range' | 'select'
}

interface FilterGroup {
    id: string
    title: string
    options: FilterOption[]
}

interface AdvancedFiltersProps {
    filters: FilterGroup[]
    selectedFilters: { [key: string]: any }
    onFilterChange: (filterId: string, value: any) => void
    onApply: () => void
    onClear: () => void
}

export default function AdvancedFilters({
    filters,
    selectedFilters,
    onFilterChange,
    onApply,
    onClear,
}: AdvancedFiltersProps) {
    const isFilterSelected = (filterId: string, value: any) => {
        const selected = selectedFilters[filterId]
        if (Array.isArray(selected)) {
            return selected.includes(value)
        }
        return selected === value
    }

    const toggleFilter = (filterId: string, value: any) => {
        const current = selectedFilters[filterId]

        if (Array.isArray(current)) {
            // Para filtros múltiples (checkbox)
            const newValue = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value]
            onFilterChange(filterId, newValue)
        } else {
            // Para filtros simples
            onFilterChange(filterId, value)
        }
    }

    const renderFilterGroup = ({ item: group }: { item: FilterGroup }) => (
        <View style={styles.filterGroup} key={group.id}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.optionsContainer}>
                {group.options.map((option) => (
                    <Chip
                        key={option.id}
                        selected={isFilterSelected(group.id, option.value)}
                        onPress={() => toggleFilter(group.id, option.value)}
                        style={styles.chip}
                        textStyle={styles.chipText}
                    >
                        {option.label}
                    </Chip>
                ))}
            </View>
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Filtros</Text>
                <Button mode="text" onPress={onClear} compact>
                    Limpiar
                </Button>
            </View>

            <FlatList
                data={filters}
                renderItem={renderFilterGroup}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={onApply}
                    style={styles.applyButton}
                    contentStyle={styles.applyButtonContent}
                >
                    Aplicar Filtros
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.white,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    listContent: {
        padding: Spacing.md,
    },
    filterGroup: {
        marginBottom: Spacing.lg,
    },
    groupTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        marginRight: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    chipText: {
        fontSize: FontSizes.sm,
    },
    footer: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.white,
    },
    applyButton: {
        backgroundColor: Colors.primary,
    },
    applyButtonContent: {
        paddingVertical: Spacing.sm,
    },
})
