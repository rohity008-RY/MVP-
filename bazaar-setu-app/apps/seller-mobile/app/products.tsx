import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function SellerProducts() {
  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Products" />
      <View style={styles.body}>
        <Section title="Catalogue" copy="Search master catalogue, add products, and enter only price and quantity." />
        <Section title="My Products" copy="Live products with HSN, GST, legal metrology, tags, SLA, active/inactive state." />
        <Section title="Inventory" copy="Update quantity and price quickly. Low-stock warnings will trigger here." />
        <Section title="Add New Product" copy="Capture photo, AI extracts name/unit/HSN suggestion, Admin approves or rejects." />
      </View>
    </SafeAreaView>
  );
}

function Header({ title }: { title: string }) {
  return <View style={styles.header}><Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link><Text style={styles.title}>{title}</Text></View>;
}

function Section({ title, copy }: { title: string; copy: string }) {
  return <View style={styles.card}><Text style={styles.name}>{title}</Text><Text style={styles.meta}>{copy}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 8 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted }
});
