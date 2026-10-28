import { ActivityIndicator, View } from "react-native";
import { styles } from "./styles";
import { colors } from "@/theme/colors";

export function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.blue[500]} style={styles.container} />
    </View>
  );
}
