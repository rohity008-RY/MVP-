import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function SellerProfile() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
        <Text style={styles.title}>Store setup</Text>
        <Text style={styles.copy}>Profile, locations, documents, bank, SLA, delivery fee, and auto invoicing.</Text>
      </View>
      <View style={styles.body}>
        <Card title="Store Live" copy="Enable/disable store visibility on platform." />
        <Card title="Timings + SLA" copy="09:00-21:00 · 45 minutes default delivery SLA." />
        <Card title="Compliance" copy="FSSAI, GSTIN, PAN, Legal Metrology, bank and payout details." />
        <Card title="Auto Invoicing" copy="When enabled, invoice number is generated on confirm and order moves to Bag Packed." />
      </View>
    </SafeAreaView>
  );
}

function Card({ title, copy }: { title: string; copy: string }) {
  return <View style={styles.card}><Text style={styles.name}>{title}</Text><Text style={styles.meta}>{copy}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  copy: { color: "#AAA" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 8 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted }
});
