import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from "@react-navigation/native";

import { HighLightCard } from "../../components/HighLightCard";
import { TransactionCard, TransactionCardProps } from "../../components/TransactionCard";

import { 
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    LogoutButton,
    Icon,
    HighLightCards,
    Transactions,
    Title,
    TransactionList,
} from "./styles";

export interface DataListProps extends TransactionCardProps {
    id: string;
}

interface HighlightProps {
    amount: string
}

interface HighlightData {
    entries: HighlightProps;
    expenses: HighlightProps;
    total: HighlightProps;
}

export function Dashboard(){
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

    async function loadTransactions(){
        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensesTotal = 0;

        const transactionsFormatted: DataListProps[] = transactions
        .map((item: DataListProps) => {

            if(item.type === 'positive'){
                entriesTotal += Number(item.amount);
            }else {
                expensesTotal += Number(item.amount);
            }

            const amount = Number(item.amount)
            .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const date = Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }).format(new Date(item.date));

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date, 
            }
        });

        setTransactions(transactionsFormatted);

        const total = entriesTotal - expensesTotal;

        setHighlightData({
            entries: {
                amount: entriesTotal
                .toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })
            },
            expenses: {
                amount: expensesTotal
                .toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })
            },
            total: {
                amount: total
                .toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                })
            }
        })
        console.log(transactionsFormatted);
    }

    useEffect(()=> {
        loadTransactions();
    }, []);

    useFocusEffect(useCallback(() => {
        loadTransactions(); 
    }, []))

    return (
        <Container>
            <Header>
                <UserWrapper>
                    <UserInfo>
                        <Photo source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzj26A_IAGzabuI08ddCRTqnMiEvfYaOcyZQ&usqp=CAU' }}/>
                        <User>
                            <UserGreeting>Olá, </UserGreeting>
                            <UserName>Silvio</UserName>
                        </User>
                    </UserInfo>

                    <LogoutButton
                        onPress={() => {console.log('Logout ativo')}}
                    >
                        <Icon name="power"/>
                    </LogoutButton>
                </UserWrapper>
            </Header>

            <HighLightCards>
                <HighLightCard
                    type= "up"
                    title="Entradas"
                    amount={highlightData.entries.amount}
                    lastTransaction="Última entrada dia 13 de abril"
                />
                <HighLightCard
                    type= "down"
                    title="Saídas"
                    amount={highlightData.expenses.amount}
                    lastTransaction="Última saída dia 03 de abril"
                />
                <HighLightCard
                    type = "total"
                    title="Total"
                    amount={highlightData.total.amount}
                    lastTransaction="01 à 16 de abril"
                />
            </HighLightCards>

            <Transactions>
                <Title>Listagem</Title>

                <TransactionList
                    data={transactions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => 
                        <TransactionCard 
                            data= { item }
                        />
                }
                />
            </Transactions>
        </Container>
    )
}