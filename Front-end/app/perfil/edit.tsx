import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../contexts/AuthContext";
import { API_URL } from "../../config/config";

const { width } = Dimensions.get("window");

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalImageUri, setOriginalImageUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      const fullName =
        user.user_metadata.full_name || user.user_metadata.displayName || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPhone(user.user_metadata.phone_number || "");

      const currentAvatar = user.user_metadata.avatar_url || null;
      setImageUri(currentAvatar);
      setOriginalImageUri(currentAvatar);
    }
  }, [user]);

  const handleSelectPhoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permissão necessária",
        "É preciso permitir o acesso à galeria para alterar a foto."
      );
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
    }
  };

  const canSubmit = () =>
    firstName.trim() && lastName.trim() && phone.trim() && !loading;

  const handleSave = async () => {
    if (!canSubmit()) return;
    setLoading(true);

    try {
      let uploadedAvatarUrl: string | undefined = undefined;

      // 1. VERIFICAR E FAZER UPLOAD DA IMAGEM SE ELA MUDOU
      if (imageUri && imageUri !== originalImageUri) {
        const formData = new FormData();
        const uriParts = imageUri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("file", {
          uri: imageUri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);

        const uploadResponse = await fetch(`${API_URL}/upload/avatar`, {
          method: "POST",
          body: formData,
          headers: {
            // ✅ CORRECÇÃO: O Content-Type não deve ser definido manualmente para multipart/form-data.
            // O sistema (fetch) fá-lo-á automaticamente com o boundary correto.
            Authorization: `Bearer ${token}`,
          },
        });

        if (!uploadResponse.ok) {
          const errorBody = await uploadResponse.text();
          console.error("Erro no upload: ", errorBody);
          throw new Error("Falha no upload da imagem.");
        }

        const uploadResult = await uploadResponse.json();
        uploadedAvatarUrl = uploadResult.publicUrl;
      }

      // 2. PREPARAR DADOS DE TEXTO E A NOVA URL (SE HOUVER)
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const profileData: any = {
        displayName: fullName,
        phoneNumber: phone.trim(),
      };

      if (uploadedAvatarUrl) {
        profileData.avatar_url = uploadedAvatarUrl;
      }

      // 3. SALVAR OS DADOS NO PERFIL DO USUÁRIO
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Não foi possível atualizar o perfil."
        );
      }

      await refreshUser();
      Alert.alert("Sucesso", "Seu perfil foi atualizado!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido.";
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity disabled={!canSubmit()} onPress={handleSave}>
          {loading ? (
            <ActivityIndicator color="#1677FF" />
          ) : (
            <Text style={[styles.saveText, !canSubmit() && { opacity: 0.4 }]}>
              Concluir
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("../../assets/images/avatar.png")
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
        <TouchableOpacity onPress={handleSelectPhoto}>
          <Text style={styles.changePhoto}>Alterar Foto do Perfil</Text>
        </TouchableOpacity>
        {[
          { label: "Nome", value: firstName, setter: setFirstName },
          { label: "Sobrenome", value: lastName, setter: setLastName },
          { label: "Número de Celular", value: phone, setter: setPhone },
        ].map(({ label, value, setter }) => (
          <View key={label} style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={label}
                placeholderTextColor="#AAA"
              />
              {value.trim().length > 0 && (
                <MaterialIcons name="check-circle" size={24} color="#1677FF" />
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = width * 0.32;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
    backgroundColor: "#FFF",
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  saveText: { fontSize: 18, fontWeight: "600", color: "#1677FF" },
  content: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 32 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#EEE",
    marginTop: 24,
    borderWidth: 2,
    borderColor: "#1677FF",
  },
  name: { fontSize: 24, fontWeight: "700", color: "#1677FF", marginTop: 16 },
  changePhoto: {
    fontSize: 16,
    color: "#1677FF",
    marginTop: 8,
    marginBottom: 32,
  },
  fieldGroup: { width: "100%", marginBottom: 20 },
  fieldLabel: { fontSize: 16, color: "#555", marginBottom: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  input: { flex: 1, fontSize: 18, color: "#222", padding: 0, marginRight: 12 },
});
