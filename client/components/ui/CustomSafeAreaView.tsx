import { View, Text, ViewStyle, StyleSheet, SafeAreaView } from 'react-native'
import React, { FC } from 'react'
import { Colors } from '@/utils/Constants'

interface Props {
    children: React.ReactNode
    style?: ViewStyle
}

const CustomSafeAreaView: FC<Props> = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            <SafeAreaView />
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.secondary
    }
})

export default CustomSafeAreaView