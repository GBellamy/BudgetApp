import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { Colors } from '@/constants/theme';
import { getApiUrl, setApiUrl } from '@/constants/api';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuthStore();
  const [apiUrl, setApiUrlState] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getApiUrl().then(setApiUrlState);
  }, []);

  const handleSaveUrl = async () => {
    const url = apiUrl.trim().replace(/\/$/, '');
    if (!url.startsWith('http')) {
      Alert.alert('URL invalide', 'L\'URL doit commencer par http:// ou https://');
      return;
    }
    await setApiUrl(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      {/* User info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: colors.tint + '30' }]}>
            <Text style={[styles.avatarText, { color: colors.tint }]}>
              {user?.display_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={[styles.displayName, { color: colors.text }]}>{user?.display_name}</Text>
            <Text style={[styles.username, { color: colors.icon }]}>@{user?.username}</Text>
          </View>
        </View>
      </View>

      {/* Server URL */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connexion au serveur</Text>
        <Text style={[styles.hint, { color: colors.icon }]}>
          Entrez l'adresse IP et le port du backend sur votre réseau local.
          {'\n'}Ex: http://192.168.1.100:3000
        </Text>
        <TextInput
          style={[styles.urlInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          value={apiUrl}
          onChangeText={setApiUrlState}
          placeholder="http://192.168.1.100:3000"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saved ? '#4CAF50' : colors.tint }]}
          onPress={handleSaveUrl}
        >
          <MaterialIcons name={saved ? 'check' : 'save'} size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saved ? 'Sauvegardé !' : 'Sauvegarder'}</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: '#F44336' }]}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={20} color="#F44336" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  displayName: { fontSize: 17, fontWeight: '600' },
  username: { fontSize: 13 },
  hint: { fontSize: 13, lineHeight: 18 },
  urlInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutText: { color: '#F44336', fontWeight: '600', fontSize: 15 },
});
