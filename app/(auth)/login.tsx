import { Colors } from "@/constants/theme";
import { getApiUrl, setApiUrl } from "@/constants/api";
import { useAuthStore } from "@/store/auth-store";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [apiUrl, setApiUrlState] = useState("");
  const [urlSaved, setUrlSaved] = useState(false);
  const login = useAuthStore((s) => s.login);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    getApiUrl().then(setApiUrlState);
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert(
        "Connexion échouée",
        "Nom d'utilisateur ou mot de passe incorrect",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUrl = async () => {
    const url = apiUrl.trim().replace(/\/$/, "");
    if (!url.startsWith("http")) {
      Alert.alert("URL invalide", "L'URL doit commencer par http:// ou https://");
      return;
    }
    await setApiUrl(url);
    setUrlSaved(true);
    setTimeout(() => {
      setUrlSaved(false);
      setShowUrlModal(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.tint }]}>💰</Text>
          <Text style={[styles.title, { color: colors.text }]}>BudgetApp</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Budget du foyer
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>
            Nom d&apos;utilisateur
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Nom"
            placeholderTextColor={colors.placeholder}
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Mot de passe
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.placeholder}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.tint },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Server URL config — accessible before login */}
      <TouchableOpacity
        style={styles.serverBtn}
        onPress={() => setShowUrlModal(true)}
      >
        <MaterialIcons name="dns" size={14} color={colors.icon} />
        <Text style={[styles.serverBtnText, { color: colors.icon }]}>
          Configurer le serveur
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showUrlModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUrlModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              URL du serveur
            </Text>
            <Text style={[styles.modalHint, { color: colors.icon }]}>
              Ex : https://mon-app.up.railway.app
            </Text>
            <TextInput
              style={[
                styles.urlInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              value={apiUrl}
              onChangeText={setApiUrlState}
              placeholder="https://..."
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border }]}
                onPress={() => setShowUrlModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: urlSaved ? '#4CAF50' : colors.tint }]}
                onPress={handleSaveUrl}
              >
                <Text style={styles.modalBtnTextPrimary}>
                  {urlSaved ? "Sauvegardé !" : "Sauvegarder"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 4,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  serverBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 32,
    paddingTop: 8,
  },
  serverBtnText: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalHint: {
    fontSize: 13,
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modalBtnPrimary: {
    borderWidth: 0,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalBtnTextPrimary: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
