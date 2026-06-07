import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function Analytics() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
        <Text style={styles.title}>Analytics</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.row}><Stat label="This Week" value="Rs. 8,400" /><Stat label="Orders" value="56" /></View>
        <View style={styles.card}><Text style={styles.name}>Revenue chart</Text><Text style={styles.meta}>Bars and downloadable detailed reports will be rendered here.</Text></View>
        <View style={styles.ai}><Text style={styles.name}>AI Summary</Text><Text style={styles.meta}>Saturday peak. Garlic Pickle can lift avg order by Rs. 60.</Text></View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.meta}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  body: { padding: 16, gap: 12 },
  row: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  statValue: { fontWeight: "900", fontSize: 20 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 8 },
  ai: { backgroundColor: "#EEEDFE", borderRadius: 14, padding: 14, gap: 8 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted }
});
