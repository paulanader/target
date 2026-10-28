import { useEffect, useState } from "react";
import { View, Alert, StatusBar } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useTargetDatabase } from "@/database/useTargetDatabase";

export default function Target() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | null>(0);

  const params = useLocalSearchParams<{ id?: string }>();
  const targetDatabase = useTargetDatabase();

  async function update() {
    try {
      await targetDatabase.update({
        id: Number(params.id),
        name,
        amount,
      });

      Alert.alert("Sucesso", "Meta foi atualizada com sucesso", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar a meta.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function create() {
    try {
      await targetDatabase.create({ name, amount });
      Alert.alert("Nova meta", "Meta criada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível criar a meta");
      setIsProcessing(false);
    }
  }

  function handleSave() {
    if (!name.trim() || amount === null || amount <= 0) {
      return Alert.alert("Atenção", "Preencha nome e valor");
    }

    setIsProcessing(true);

    if (params?.id) {
      update();
    } else {
      create();
    }
  }

  async function fetchDetails(id: number) {
    try {
      const response = await targetDatabase.show(id);

      if (!response) {
        return;
      }

      setName(response.name);
      setAmount(response.amount);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar os detalhes da meta");
    }
  }

  async function remove(id: number) {
    try {
      setIsProcessing(true);

      await targetDatabase.remove(id);

      Alert.alert("Meta", "A meta foi removida!", [
        { text: "Ok", onPress: () => router.replace("/") },
      ]);
    } catch {
      Alert.alert("Erro", "não foi possível remover a meta");
    }
  }

  function handleRemove(id: number) {
    Alert.alert("Remover", "Deseja realmente remover?", [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        onPress: () => remove(id),
      },
    ]);
  }

  useEffect(() => {
    if (params.id) {
      fetchDetails(Number(params.id));
    }
  }, [params.id]);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <StatusBar barStyle="dark-content" />
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira"
        rightButton={
          params.id
            ? { icon: "delete", onPress: () => handleRemove(Number(params.id)) }
            : undefined
        }
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <Input
          label="Nome da Meta"
          placeholder="Ex.:Viagem para praia, Apple Watch..."
          onChangeText={setName}
          value={name}
        />
        <CurrencyInput
          label="Valor alvo (R$)"
          placeholder="Ex.:Viagem para praia, Apple Watch..."
          value={amount}
          onChangeValue={setAmount}
        />
        <Button
          title="Salvar"
          onPress={handleSave}
          isProcessing={isProcessing}
        />
      </View>
    </View>
  );
}
