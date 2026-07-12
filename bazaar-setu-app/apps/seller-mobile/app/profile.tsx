import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiSend } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth";

const DEMO_SELLER_ID = "demo-seller-fresh";

export default function SellerProfile() {
  const sellerId = useAuthStore((state) => state.sellerId) ?? DEMO_SELLER_ID;
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [storeLive, setStoreLive] = useState(true);
  const [autoInvoiceEnabled, setAutoInvoiceEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState("29");
  const [slaValue, setSlaValue] = useState("45");
  const [message, setMessage] = useState("Changes update the seller profile endpoint when logged in.");

  async function saveProfile() {
    await apiSend(`/api/seller/${sellerId}/profile`, "PUT", {
      storeLive,
      autoInvoiceEnabled,
      deliveryFee: Number(deliveryFee || 0),
      defaultSlaValue: Number(slaValue || 45),
      defaultSlaUnit: "minutes"
    });
    setMessage("Profile saved. Store live state, SLA, delivery fee, and auto invoice are updated.");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView>
        <View style={styles.header}>
          <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
          <Text style={styles.title}>Store setup</Text>
          <Text style={styles.copy}>Profile, locations, documents, bank, SLA, delivery fee, and auto invoicing.</Text>
          {user ? <Text style={styles.session}>{user.name ?? "Seller"} · {user.phone}</Text> : <Link href="/login" asChild><Pressable style={styles.login}><Text style={styles.loginText}>Login with OTP</Text></Pressable></Link>}
        </View>
        <View style={styles.body}>
          <ToggleCard title="Store Live" copy="Enable/disable store visibility on platform." enabled={storeLive} onPress={() => setStoreLive((value) => !value)} />
          <ToggleCard title="Auto Invoicing" copy="Enabled: invoice number generates on confirm and order moves to Bag Packed." enabled={autoInvoiceEnabled} onPress={() => setAutoInvoiceEnabled((value) => !value)} />
          <Card title="Timings + SLA" copy="Store timings: 09:00-21:00. SLA is customer-visible and used for ops monitoring.">
            <TextInput value={slaValue} onChangeText={setSlaValue} keyboardType="number-pad" placeholder="Delivery SLA minutes" style={styles.input} />
          </Card>
          <Card title="Bank & Payments" copy="Settlement bank/UPI, COD reconciliation, and delivery fee.">
            <TextInput value={deliveryFee} onChangeText={setDeliveryFee} keyboardType="number-pad" placeholder="Delivery fee" style={styles.input} />
          </Card>
          <Card title="Compliance Documents" copy="FSSAI, GSTIN, PAN, Legal Metrology, shop proof, and bank proof are visible to Ops for approval." />
          <Card title="Locations" copy="Multiple pickup locations with exact Google Maps lat/lng are supported in backend profile flow." />
          <Pressable onPress={saveProfile} style={styles.primary}><Text style={styles.primaryText}>Save profile settings</Text></Pressable>
          <Text style={styles.meta}>{message}</Text>
          {user ? <Pressable onPress={logout} style={styles.logout}><Text style={styles.dangerText}>Logout</Text></Pressable> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ title, copy, children }: { title: string; copy: string; children?: ReactNode }) {
  return <View style={styles.card}><Text style={styles.name}>{title}</Text><Text style={styles.meta}>{copy}</Text>{children}</View>;
}

function ToggleCard({ title, copy, enabled, onPress }: { title: string; copy: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{title}</Text>
          <Text style={styles.meta}>{copy}</Text>
        </View>
        <Text style={enabled ? styles.on : styles.off}>{enabled ? "On" : "Off"}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  copy: { color: "#AAA" },
  session: { color: "#fff", fontWeight: "800" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 8 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted },
  input: { backgroundColor: "#F6F5F2", borderRadius: 12, padding: 12, fontWeight: "800" },
  login: { backgroundColor: colors.brand, borderRadius: 12, padding: 12, alignSelf: "flex-start" },
  loginText: { color: "#fff", fontWeight: "900" },
  primary: { backgroundColor: colors.brand, borderRadius: 14, padding: 15, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900" },
  logout: { backgroundColor: "#FCEBEB", borderRadius: 14, padding: 14, alignItems: "center" },
  dangerText: { color: colors.red, fontWeight: "900" },
  on: { color: colors.green, fontWeight: "900" },
  off: { color: colors.red, fontWeight: "900" }
});
