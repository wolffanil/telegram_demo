import { View, Text } from 'react-native'
import React from 'react'
import { homeStyles } from '@/styles/homeStyles'
import LottieView from 'lottie-react-native'
import CustomText from '../ui/CustomText'

const EmptyComponent = () => {
    return (
        <View style={homeStyles.emptyContainer}>
            <LottieView
                style={homeStyles.lottie}
                source={require('@/assets/animations/welcome.json')}
                loop
                autoPlay
            />
            <CustomText variant='h4' style={homeStyles.welcomeTitle}>Welcome to Telegram</CustomText>
            <CustomText style={homeStyles.welcomeSubTitle}>Start messaging by tapping the chat button in the bottom right corner</CustomText>
        </View>
    )
}



export default EmptyComponent