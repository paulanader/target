import { StyleSheet } from "react-native";
import { colors, fontFamily } from "@/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blue[500],
    height: 48,
    width: "100%",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.white,
  },
});
