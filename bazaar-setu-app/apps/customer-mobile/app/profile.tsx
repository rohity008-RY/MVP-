import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.copy}>Addresses, rewards, payments, support, and become-a-seller flow live here.</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.card}><Text style={styles.name}>Rahul Kumar</Text><Text style={styles.meta}>+91 98765 43210</Text></View>
        <View style={styles.card}><Text style={styles.name}>Saved Addresses</Text><Text style={styles.meta}>Home, Office, Other. Max 5 with Google Maps lat/lng.</Text></View>
        <View style={styles.card}><Text style={styles.name}>Rewards</Text><Text style={styles.meta}>320 Bazaar Setu points</Text></View>
        <View style={styles.card}><Text style={styles.name}>Become a Seller</Text><Text style={styles.meta}>Submit lead to Admin/Support for onboarding callback.</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F5F2" },
  header: { padding: 18, backgroundColor: colors.brandDark, gap: 12 },
  back: { color: colors.brand, fontWeight: "900" },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  copy: { color: "#AAA" },
  body: { padding: 16, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 6 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted }
});
