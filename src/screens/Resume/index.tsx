import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';

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
} from './styles';

import { HistoryCard } from '../../components/HistoryCard';
import { categories } from '../../utils/categories';

import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

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
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

    const theme = useTheme();

    async function loadData(){
        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expenses = responseFormatted
        .filter((expense: TransactionData) => expense.type === 'negative');

        const expensesTotal = expenses
        .reduce((acumullator: number, expense: TransactionData) => {
            return acumullator + Number(expense.amount);
        }, 0)

        console.log(expensesTotal);

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
    }

    useEffect(()=> {
        loadData();
    }, [])

    return(
        <Container>
            <Header>
                <Title>Resumo por categoria</Title>
            </Header>

            <Content
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: useBottomTabBarHeight()
                }}
            >

                <MonthSelect>
                    <MonthSelectButton>
                        <MonthSelectIcon 
                            name="chevron-left"
                        />
                    </MonthSelectButton>

                    <Month>Maio</Month>

                    <MonthSelectButton>
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
                        labelRadius={50}
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
        </Container>
    )
};