import { colors } from "@bazaarsetu/ui-tokens";
import { Link } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

export default function AiAssistant() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Link href="/" asChild><Pressable><Text style={styles.back}>Back</Text></Pressable></Link>
        <Text style={styles.title}>BazaarSetu AI</Text>
        <Text style={styles.copy}>Hindi / English assistant for stock, pricing, compliance, and sales tips.</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.bubble}><Text style={styles.name}>AI</Text><Text style={styles.meta}>Mango Pickle sales are up 40%. Add 20 units today.</Text></View>
        <View style={styles.userBubble}><Text style={styles.userText}>मेरी sales कैसे बढ़ाऊं?</Text></View>
        <TextInput placeholder="Hindi या English में पूछें..." style={styles.input} />
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
  bubble: { alignSelf: "flex-start", maxWidth: "88%", backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  userBubble: { alignSelf: "flex-end", maxWidth: "82%", backgroundColor: colors.brand, borderRadius: 14, padding: 14 },
  userText: { color: "#fff", fontWeight: "800" },
  input: { marginTop: "auto", backgroundColor: "#fff", borderRadius: 24, padding: 14 },
  name: { fontWeight: "900" },
  meta: { color: colors.textMuted }
});
