import { useCallback, useState } from "react";
import { Alert, StatusBar, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { List } from "@/components/List";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Progress } from "@/components/Progress";
import { PageHeader } from "@/components/PageHeader";
import { Transaction, TransactionProps } from "@/components/Transaction";

import { numberToCurrency } from "@/utils/numberToCurrency";
import { TransactionTypes } from "@/utils/TransactionTypes";

import { useTargetDatabase } from "@/database/useTargetDatabase";
import { useTransactionsDatabase } from "@/database/useTransactionsDatabase";
import dayjs from "dayjs";

const initialValue = {
  name: "",
  current: "R$ 0,00",
  target: "R$ 0,00",
  percentage: 0,
};
export default function InProgress() {
  const [details, setDetails] = useState(initialValue);
  const [isFetching, setIsFetching] = useState(true);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);

  const params = useLocalSearchParams<{ id: string }>();

  const targetDatabase = useTargetDatabase();
  const transactionsDatabase = useTransactionsDatabase();

  async function fetchTargetDetails() {
    try {
      const response = await targetDatabase.show(Number(params.id));

      const data =
        response && initialValue != null
          ? {
              name: response.name,
              current: numberToCurrency(response.current),
              target: numberToCurrency(response.amount),
              percentage: response.percentage,
            }
          : initialValue;

      setDetails(data);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os detalhes da meta");
    }
  }

  async function fetchTransactions() {
    try {
      const response = await transactionsDatabase.listByTargetId(
        Number(params.id),
      );

      const data = response.map((item) => ({
        id: String(item.id),
        value: numberToCurrency(item.amount),
        date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm"),
        description: item.observation,
        type:
          item.amount < 0 ? TransactionTypes.Output : TransactionTypes.Input,
      }));

      setTransactions(data);
    } catch {
      Alert.alert("Erro!", "Não foi possível listar as transações!");
    }
  }

  async function fetchData() {
    const targetDataPromise = fetchTargetDetails();
    const fetchTransactionsPromise = fetchTransactions();

    await Promise.all([targetDataPromise, fetchTransactionsPromise]);

    setIsFetching(false);
  }

  async function transactionRemove(id: number) {
    try {
      await transactionsDatabase.remove(id);
      fetchData();

      Alert.alert("Sucesso!", "Transação removida com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível remover a transação");
    }
  }

  function handleTransactionRemove(id: number) {
    Alert.alert("Remover", "Deseja realmente remover a transação?", [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: () => transactionRemove(id) },
    ]);
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  if (isFetching) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 32 }}>
      <StatusBar barStyle="dark-content" />
      <PageHeader
        title={details.name}
        rightButton={{
          icon: "edit",
          onPress: () => router.navigate(`/target?id=${params.id}`),
        }}
      />
      <Progress data={details} />
      <List
        title="Transações"
        data={transactions}
        renderItem={({ item }) => (
          <Transaction
            data={item}
            onRemove={() => handleTransactionRemove(Number(item.id))}
          />
        )}
        emptyMessage="Nenhuma transação. Toque em nova transação para guardar seu primeiro dinheiro aqui."
      />
      <Button
        title="Nova transação"
        onPress={() => router.navigate(`/transaction/${params.id}`)}
      />
    </View>
  );
}
