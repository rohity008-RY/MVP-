import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../src/store/auth";

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  const loggedIn = useAuthStore((state) => Boolean(state.accessToken));
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Nirmala's Kitchen</Text>
        <Text style={styles.title}>नमस्ते, {user?.name?.split(" ")[0] ?? "Nirmala"}!</Text>
        <Text style={styles.meta}>Store Open · SLA 45 min · Auto invoice enabled</Text>
        {!loggedIn ? <Link href="/login" asChild><Pressable style={styles.loginButton}><Text style={styles.loginText}>Login with OTP</Text></Pressable></Link> : null}
        <View style={styles.statRow}>
          <View style={styles.stat}><Text style={styles.statValue}>Rs. 1,840</Text><Text style={styles.statLabel}>Sales</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>Pending</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>4.8</Text><Text style={styles.statLabel}>Rating</Text></View>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.aiCard}><Text style={styles.cardTitle}>AI Insight</Text><Text style={styles.copy}>Mango Pickle sales are up 40%. Add 10+ units to avoid stock-out cancellation.</Text></View>
        <View style={styles.grid}>
          <Tile href="/orders" label="Orders" sub="Accept, reject, pack" />
          <Tile href="/products" label="Products" sub="Catalogue and inventory" />
          <Tile href="/ai" label="AI Help" sub="Hindi/English assistant" />
          <Tile href="/analytics" label="Analytics" sub="Sales and SLA" />
          <Tile href="/profile" label="Profile" sub="Docs, SLA, payments" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Tile({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.tile}><Text style={styles.cardTitle}>{label}</Text><Text style={styles.copy}>{sub}</Text></Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { backgroundColor: colors.brandDark, padding: 18, gap: 10 },
  eyebrow: { color: "#999", fontWeight: "900", letterSpacing: 1 },
  title: { color: "#fff", fontSize: 26, fontWeight: "900" },
  meta: { color: "#AAA" },
  statRow: { flexDirection: "row", gap: 8 },
  loginButton: { alignSelf: "flex-start", backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  loginText: { color: "#fff", fontWeight: "900" },
  stat: { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 },
  statValue: { color: "#fff", fontWeight: "900" },
  statLabel: { color: "#999", fontSize: 11 },
  body: { padding: 16, gap: 14 },
  aiCard: { backgroundColor: "#EEEDFE", borderRadius: 14, padding: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "48%", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 6 },
  cardTitle: { fontWeight: "900" },
  copy: { color: colors.textMuted }
});
