import { useCallback, useState } from "react";
import { Alert, StatusBar, View } from "react-native";
import { router, useFocusEffect } from "expo-router";

import { Button } from "@/components/Button";
import { HomeHeader, HomeHeaderProps } from "@/components/HomeHeader";
import { List } from "@/components/List";
import { Target, TargetProps } from "@/components/Target";
import { Loading } from "@/components/Loading";
import { numberToCurrency } from "@/utils/numberToCurrency";

import { useTargetDatabase } from "@/database/useTargetDatabase";
import { useTransactionsDatabase } from "@/database/useTransactionsDatabase";

const initialValue = {
  total: numberToCurrency(0),
  input: {
    label: "Entradas",
    value: numberToCurrency(0),
  },
  output: {
    label: "Saídas",
    value: numberToCurrency(0),
  },
};
export default function Index() {
  const [targets, setTargets] = useState<TargetProps[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [summary, setSummary] = useState<HomeHeaderProps>(initialValue);

  const targetsDatabase = useTargetDatabase();
  const transactionsDatabase = useTransactionsDatabase();

  async function fetchTargets(): Promise<TargetProps[]> {
    try {
      const response = await targetsDatabase.listByClosestTarget();

      return response.map((item) => ({
        id: String(item.id),
        name: item.name,
        current: numberToCurrency(item.current),
        percentage: item.percentage.toFixed(0) + "%",
        target: numberToCurrency(item.amount),
      }));
    } catch {
      Alert.alert("Não foi possível carregar as metas");
      return [];
    }
  }

  async function fetchSummary(): Promise<HomeHeaderProps> {
    try {
      const response = await transactionsDatabase.summary();

      return {
        total: numberToCurrency(
          (response?.input ?? 0) + (response?.output ?? 0),
        ),
        input: {
          label: "Entradas",
          value: numberToCurrency(response?.input ?? 0),
        },
        output: {
          label: "Saídas",
          value: numberToCurrency(response?.output ?? 0),
        },
      };
    } catch {
      Alert.alert("Erro", "Não foi possível retornar o resumo");
      return initialValue;
    }
  }

  async function fetchData() {
    const targetDataPromise = fetchTargets();
    const dataSummaryPromise = fetchSummary();

    const [targetData, dataSummary] = await Promise.all([
      targetDataPromise,
      dataSummaryPromise,
    ]);

    setTargets(targetData);
    setSummary(dataSummary);
    setIsFetching(false);
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
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader data={summary} />
      <List
        title="Metas"
        data={targets}
        keyExtractor={(item, index) => item.id ?? String(index)}
        renderItem={({ item }) => (
          <Target
            data={item}
            onPress={() => router.navigate(`/in-progress/${item.id}`)}
          />
        )}
        emptyMessage="Nenhuma meta cadastrada. Clique em criar nova meta"
        containerStyle={{ paddingHorizontal: 24 }}
      />
      <View style={{ padding: 24, paddingBottom: 32 }}>
        <Button title="Nova Meta" onPress={() => router.navigate("/target")} />
      </View>
    </View>
  );
}
