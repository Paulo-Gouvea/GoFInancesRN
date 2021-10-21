import React, {useEffect, useState, useCallback} from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns';   
import { ptBR } from 'date-fns/locale';

import {
    Container,
    Header,
    Title,
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectButton,
    MonthSelectIcon,
    Month,
    LoadContainer,
} from './styles';

import { HistoryCard } from '../../components/HistoryCard';
import { categories } from '../../utils/categories';

import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect } from "@react-navigation/native";

interface TransactionData{
    type: 'positive' | 'negative';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData {
    key: string;
    name: string;
    total: number;
    totalFormatted: string;
    color: string;
    percent: string;
}

export function Resume(){
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

    const theme = useTheme();

    function handleDateChange(action: 'next' | 'previous'){
        setIsLoading(true);
        if(action === 'next') {
            setSelectedDate(addMonths(selectedDate, 1));
        }else {
            setSelectedDate(subMonths(selectedDate, 1)); 
        }
    }

    async function loadData(){

        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expenses = responseFormatted
        .filter((expense: TransactionData) => 
            expense.type === 'negative' &&
            new Date(expense.date).getMonth() === selectedDate.getMonth() &&
            new Date(expense.date).getFullYear() === selectedDate.getFullYear()
        );

        const expensesTotal = expenses
        .reduce((acumullator: number, expense: TransactionData) => {
            return acumullator + Number(expense.amount);
        }, 0)

        const totalByCategories: CategoryData[] = [];

        categories.forEach(category => {
            let categorySum = 0;

            expenses.forEach((expense: TransactionData) => {
                if(expense.category === category.key){
                    categorySum += Number(expense.amount);
                }
            });

            if(categorySum > 0){
                const totalFormatted = categorySum
                .toLocaleString('pt-BR',{
                    style: 'currency',
                    currency: 'BRL'
                })

                const percent = `${((categorySum/expensesTotal)*100).toFixed(0)}%`

                totalByCategories.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total: categorySum,
                    totalFormatted,
                    percent,
                });
            }
        })

        setTotalByCategories(totalByCategories);
        setIsLoading(false);
    }

    useEffect(()=> {
        loadData();
    }, [selectedDate])

    useFocusEffect(useCallback(() => {
        loadData(); 
    }, []))

    return(
        <Container>
            <Header>
                <Title>Resumo por categoria</Title>
            </Header>

            {
                isLoading ? 
                    <LoadContainer>
                        <ActivityIndicator color={theme.colors.primary} size="large"/> 
                    </LoadContainer>
                :
                    <Content
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingBottom: useBottomTabBarHeight()
                        }}
                    >

                        <MonthSelect>
                            <MonthSelectButton
                                onPress = {() => handleDateChange('previous')}
                            >
                                <MonthSelectIcon 
                                    name="chevron-left"
                                />
                            </MonthSelectButton>

                                <Month>
                                    { format(selectedDate, 'MMMM, yyyy', {locale: ptBR}) }
                                </Month> 

                                <MonthSelectButton
                                    onPress = {() => handleDateChange('next')}
                                >
                                <MonthSelectIcon 
                                    name="chevron-right"
                                />
                            </MonthSelectButton>
                        </MonthSelect>

                        <ChartContainer>
                            <VictoryPie
                                data={totalByCategories}
                                colorScale={totalByCategories.map(category => category.color)}
                                style={{
                                    labels: {
                                        fontSize: RFValue(18),
                                        fontWeight: 'bold',
                                        fill: theme.colors.shape
                                    }
                                }}
                                labelRadius={80}
                                x="percent"
                                y="total"
                            />  
                        </ChartContainer>
                        {
                            totalByCategories.map(item => (
                                <HistoryCard
                                    key={item.key}
                                    title={item.name}
                                    amount={item.totalFormatted}
                                    color={item.color}
                                />  
                            ))    
                        }
                    </Content>
            }
        </Container>
    )
};