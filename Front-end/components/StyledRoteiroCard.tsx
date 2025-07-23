// src/components/StyledRoteiroCard.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ImageSourcePropType,
  NativeSyntheticEvent,
  ImageErrorEventData,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 400;
const IMAGE_HEIGHT = 300;
// Ajuste este caminho conforme sua estrutura de pastas:
const PLACEHOLDER = require("../assets/images/placeholder.png");

export type Activity = {
  title: string;
  description: string;
  duration: string;
  tip?: string;
};

export type Waypoint = {
  latitude: number;
  longitude: number;
  photoUrl?: string;
  imageUrl?: string;
  name: string;
  type: "restaurant" | "attraction" | "activity";
  activities: Activity[];
};

interface StyledRoteiroCardProps {
  /** uma URL ou fonte de imagem para o card (agora já é a primeira imagem da API) */
  imageUrl?: string | ImageSourcePropType;
  title: string;
  location: string;
  rating: number;
  waypoints?: Waypoint[];
  interactiveMap?: boolean;
  onPress?: () => void;
}

export default function StyledRoteiroCard({
  imageUrl,
  title,
  location,
  rating,
  waypoints = [],
  interactiveMap = false,
  onPress,
}: StyledRoteiroCardProps) {
  // resolve a fonte inicial: prop > primeiro waypoint.photoUrl > primeiro waypoint.imageUrl > placeholder
  const getInitialSrc = (): ImageSourcePropType => {
    if (imageUrl) {
      return typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl;
    }
    if (waypoints[0]?.photoUrl) {
      return { uri: waypoints[0]!.photoUrl! };
    }
    if (waypoints[0]?.imageUrl) {
      return { uri: waypoints[0]!.imageUrl! };
    }
    return PLACEHOLDER;
  };

  // fallback para avatares e modal
  const propImageSource: ImageSourcePropType = imageUrl
    ? typeof imageUrl === "string"
      ? { uri: imageUrl }
      : imageUrl
    : PLACEHOLDER;

  const [mainSrc, setMainSrc] = useState<ImageSourcePropType>(getInitialSrc());
  const [selected, setSelected] = useState<Waypoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // sempre que mudar imageUrl ou waypoints, recalcula a src principal
  useEffect(() => {
    setMainSrc(getInitialSrc());
  }, [imageUrl, waypoints]);

  const openModal = (wp: Waypoint) => {
    setSelected(wp);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const onMainImageError = (_e: NativeSyntheticEvent<ImageErrorEventData>) => {
    setMainSrc(PLACEHOLDER);
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Imagem principal ou mapa */}
      <View style={styles.imageWrapper}>
        {interactiveMap && waypoints.length > 0 ? (
          <MapView
            style={styles.image}
            initialRegion={{
              latitude: waypoints[0].latitude,
              longitude: waypoints[0].longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            pointerEvents="none"
          >
            {waypoints.map((wp, i) => (
              <Marker
                key={i}
                coordinate={{ latitude: wp.latitude, longitude: wp.longitude }}
                title={wp.name}
              />
            ))}
            <Polyline
              coordinates={waypoints.map((wp) => ({
                latitude: wp.latitude,
                longitude: wp.longitude,
              }))}
              strokeColor="#1677FF"
              strokeWidth={3}
            />
          </MapView>
        ) : (
          <Image
            source={mainSrc}
            style={styles.image}
            resizeMode="cover"
            onError={onMainImageError}
          />
        )}
        <View style={styles.bookmarkIcon}>
          <MaterialIcons name="bookmark-border" size={24} color="#FFF" />
        </View>
      </View>

      {/* Título, rating, localização e miniaturas */}
      <View style={styles.infoContainer}>
        <View style={styles.topInfoRow}>
          <Text numberOfLines={2} style={styles.titleText}>
            {title}
          </Text>
          <View style={styles.ratingWrapper}>
            <MaterialIcons name="star" size={16} color="#F6BA00" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MaterialIcons name="place" size={16} color="#A0AEC0" />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        <View style={styles.avatarRow}>
          {waypoints.map((wp, idx) => {
            const initialSrc = wp.photoUrl
              ? { uri: wp.photoUrl }
              : wp.imageUrl
              ? { uri: wp.imageUrl }
              : propImageSource;
            const [src, setSrc] = useState<ImageSourcePropType>(initialSrc);
            return (
              <TouchableOpacity key={idx} onPress={() => openModal(wp)}>
                <Image
                  source={src}
                  style={styles.avatarCircle}
                  onError={() => setSrc(propImageSource)}
                />
              </TouchableOpacity>
            );
          })}
          {waypoints.length > 0 && (
            <Text style={styles.plusText}>+{waypoints.length}</Text>
          )}
        </View>
      </View>

      {/* Modal de detalhes do waypoint */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            {selected && (
              <ScrollView>
                <Image
                  source={
                    selected.photoUrl
                      ? { uri: selected.photoUrl }
                      : selected.imageUrl
                      ? { uri: selected.imageUrl }
                      : propImageSource
                  }
                  style={styles.modalImage}
                  resizeMode="cover"
                  onError={onMainImageError}
                />
                <Text style={styles.modalTitle}>{selected.name}</Text>
                {selected.activities.map((act, i) => (
                  <View key={i} style={styles.activityCard}>
                    <Text style={styles.activityTitle}>{act.title}</Text>
                    <Text style={styles.activityDuration}>{act.duration}</Text>
                    <Text style={styles.activityDescription}>
                      {act.description}
                    </Text>
                    {act.tip && (
                      <View style={styles.tipContainer}>
                        <MaterialIcons
                          name="lightbulb"
                          size={16}
                          color="#FFD700"
                        />
                        <Text style={styles.tipText}>{act.tip}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  bookmarkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 4,
  },
  infoContainer: { padding: 12 },
  topInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  titleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },
  ratingWrapper: { flexDirection: "row", alignItems: "center" },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3748",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: { marginLeft: 4, fontSize: 12, color: "#718096" },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: -8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  plusText: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: "500",
    color: "#4A5568",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
  },
  modalImage: { width: "100%", height: 200 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    margin: 16,
    color: "#222",
  },
  activityCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  activityTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  activityDuration: { fontSize: 12, color: "#666", marginVertical: 4 },
  activityDescription: { fontSize: 14, color: "#444", marginBottom: 4 },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    padding: 8,
    borderRadius: 8,
  },
  tipText: { marginLeft: 4, fontSize: 12, color: "#666" },
});
