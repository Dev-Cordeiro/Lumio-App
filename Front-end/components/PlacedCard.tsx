import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";

interface PlaceCardProps {
  name: string;
  location: string;
  imageUrl?: string; // agora opcional
  price: string;
  onPress?: () => void;
}

const PLACEHOLDER =
  "https://via.placeholder.com/300x200.png?text=Imagem+indisponível";

export default function PlaceCard({
  name,
  location,
  imageUrl,
  price,
  onPress,
}: PlaceCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: imageUrl || PLACEHOLDER }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>
        <Text style={styles.price}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;
const CARD_HEIGHT = 150;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "flex-start",
  },
  image: { width: "100%", height: 90 },
  info: { padding: 8, flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  location: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  price: { fontSize: 13, fontWeight: "600", color: "#3B82F6", marginTop: 4 },
});
