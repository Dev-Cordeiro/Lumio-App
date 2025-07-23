import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { GOOGLE_PLACES_API_KEY } from "../config/config";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

type Activity = {
  title: string;
  description: string;
  duration: string;
  tip?: string;
};

type Waypoint = {
  latitude: number;
  longitude: number;
  placeId?: string;
  imageUrl?: string;
  name: string;
  type: "restaurant" | "attraction" | "activity";
  rating?: number;
  priceLevel?: number;
  activities: Activity[];
  address?: string;
  openingHours?: string;
  photoUrl?: string;
};

type Props = {
  title?: string;
  location?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  description?: string;
  imageUrl?: string;
  waypoints?: Waypoint[];
  interactiveMap?: boolean;
  mini?: boolean;
};

export default function RoteiroCard({
  title = "Lago Azul Resort",
  location = "Alto Paraíso, GO",
  rating = 4.7,
  reviews = 2498,
  price = "R$120/pessoa",
  description = "Você terá um pacote completo de viagem para as praias e belezas naturais do Lago Azul Resort. Pacotes com hospedagem em quartos recomendados, transporte e muito mais. Já visitou este paraíso no coração da Chapada dos Veadeiros? Venha conhecer!",
  imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  waypoints = [],
  interactiveMap = false,
  mini = false,
}: Props) {
  const [waypointImages, setWaypointImages] = useState<{
    [key: string]: string;
  }>({});
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [fotosBuscadas, setFotosBuscadas] = useState(false);
  const lastWaypointsHash = useRef("");

  const renderWaypointModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {selectedWaypoint && (
            <ScrollView style={styles.modalScroll}>
              <Image
                source={{
                  uri:
                    selectedWaypoint.photoUrl ||
                    selectedWaypoint.imageUrl ||
                    "https://via.placeholder.com/400x200?text=Sem+Imagem",
                }}
                style={styles.modalImage}
              />

              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle}>{selectedWaypoint.name}</Text>

                <View style={styles.modalDetails}>
                  {selectedWaypoint.rating && (
                    <View style={styles.detailItem}>
                      <MaterialIcons name="star" size={16} color="#FFD700" />
                      <Text style={styles.detailText}>
                        {selectedWaypoint.rating}
                      </Text>
                    </View>
                  )}

                  {selectedWaypoint.priceLevel && (
                    <View style={styles.detailItem}>
                      <MaterialIcons
                        name="attach-money"
                        size={16}
                        color="#4CAF50"
                      />
                      <Text style={styles.detailText}>
                        {"$".repeat(selectedWaypoint.priceLevel)}
                      </Text>
                    </View>
                  )}

                  {selectedWaypoint.address && (
                    <View style={styles.detailItem}>
                      <MaterialIcons name="place" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {selectedWaypoint.address}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.sectionTitle}>Sugestões de Atividades</Text>
                {selectedWaypoint.activities.map((activity, index) => (
                  <View key={index} style={styles.activityCard}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDuration}>
                      {activity.duration}
                    </Text>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    {activity.tip && (
                      <View style={styles.tipContainer}>
                        <MaterialIcons
                          name="lightbulb"
                          size={16}
                          color="#FFD700"
                        />
                        <Text style={styles.tipText}>{activity.tip}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[mini ? styles.cardMini : styles.card]}>
      {waypoints && waypoints.length > 0 && !mini ? (
        <MapView
          style={styles.image}
          initialRegion={{
            latitude: waypoints[0].latitude,
            longitude: waypoints[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          scrollEnabled={interactiveMap}
          zoomEnabled={interactiveMap}
        >
          {waypoints.map((point, idx) => (
            <Marker
              key={idx}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={point.name}
              description={point.name}
            />
          ))}
          <Polyline
            coordinates={waypoints}
            strokeColor="#1677FF"
            strokeWidth={3}
          />
        </MapView>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={mini ? styles.imageMini : styles.image}
        />
      )}
      <View style={mini ? styles.infoMini : styles.info}>
        <Text style={mini ? styles.titleMini : styles.title}>{title}</Text>
        <View style={mini ? styles.rowMini : styles.row}>
          <Text style={mini ? styles.locationMini : styles.location}>
            📍 {location}
          </Text>
          <Text style={mini ? styles.ratingMini : styles.rating}>
            ⭐ {rating} ({reviews})
          </Text>
          {price && (
            <Text style={mini ? styles.priceMini : styles.price}>{price}</Text>
          )}
        </View>

        {/* Miniaturas dos waypoints */}
        {waypoints && waypoints.length > 0 && (
          <View style={styles.waypointsRow}>
            {waypoints.map((wp, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.waypointThumb}
                onPress={() => {
                  setSelectedWaypoint(wp);
                  setModalVisible(true);
                }}
              >
                <Image
                  source={{
                    uri:
                      wp.photoUrl ||
                      wp.imageUrl ||
                      "https://via.placeholder.com/100x80?text=Sem+Imagem",
                  }}
                  style={styles.waypointImg}
                />
                <View style={styles.waypointInfo}>
                  <Text style={styles.waypointName} numberOfLines={1}>
                    {wp.name}
                  </Text>
                  <View style={styles.waypointType}>
                    <MaterialIcons
                      name={
                        wp.type === "restaurant"
                          ? "restaurant"
                          : wp.type === "attraction"
                          ? "landscape"
                          : "directions-walk"
                      }
                      size={12}
                      color="#666"
                    />
                    <Text style={styles.waypointTypeText}>
                      {wp.type === "restaurant"
                        ? "Restaurante"
                        : wp.type === "attraction"
                        ? "Atração"
                        : "Atividade"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.descTitle}>Sobre o Destino</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Avaliar Local</Text>
        </TouchableOpacity>
      </View>

      {renderWaypointModal()}
    </View>
  );
}

const MINI_CARD_WIDTH = 140;
const MINI_CARD_HEIGHT = 120;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E0E1E6",
    borderRadius: 24,
    margin: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: width - 32,
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  info: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  rating: {
    fontSize: 14,
    color: "#1677FF",
    marginLeft: 8,
  },
  price: {
    fontSize: 14,
    color: "#1677FF",
    marginLeft: 8,
  },
  descTitle: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    color: "#222",
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1677FF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  waypointsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  waypointThumb: {
    width: 100,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
    marginRight: 8,
    marginBottom: 8,
  },
  waypointImg: {
    width: "100%",
    height: 80,
    resizeMode: "cover",
  },
  waypointInfo: {
    padding: 4,
  },
  waypointName: {
    fontSize: 10,
    color: "#333",
    textAlign: "center",
    marginBottom: 2,
  },
  waypointType: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  waypointTypeText: {
    fontSize: 8,
    color: "#666",
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
    borderRadius: 24,
    overflow: "hidden",
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  modalDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  activityDuration: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  tipText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 4,
  },
  cardMini: {
    width: MINI_CARD_WIDTH,
    height: MINI_CARD_HEIGHT,
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginRight: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  imageMini: {
    width: MINI_CARD_WIDTH,
    height: 60,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    resizeMode: "cover",
  },
  infoMini: {
    padding: 8,
    flex: 1,
    justifyContent: "center",
  },
  titleMini: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  rowMini: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    gap: 4,
    flexWrap: "wrap",
  },
  locationMini: {
    fontSize: 9,
    color: "#666",
    marginRight: 2,
  },
  ratingMini: {
    fontSize: 9,
    color: "#1677FF",
    marginLeft: 2,
  },
  priceMini: {
    fontSize: 9,
    color: "#1677FF",
    marginLeft: 2,
  },
});

// MOCK: Card de roteiro para Palmas
export const MOCK_ROTEIRO_PALMAS = {
  title: "Roteiro Palmas Econômico",
  location: "Palmas, TO",
  rating: 4.8,
  reviews: 312,
  price: "R$350/pessoa",
  description:
    "Explore as praias de água doce, gastronomia local e pontos turísticos de Palmas em um roteiro econômico, incluindo almoço e jantar típicos.",
  imageUrl:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  waypoints: [
    {
      latitude: -10.1831,
      longitude: -48.3336,
      name: "Praia da Graciosa Palmas",
      type: "attraction",
      activities: [
        {
          title: "Passeio de Barco",
          description:
            "Explore o Lago de Palmas em um passeio de barco com guia local. Aprenda sobre a história da cidade e aprecie a vista panorâmica.",
          duration: "1h30",
          tip: "Melhor horário: início da manhã ou fim da tarde para evitar o sol forte.",
        },
        {
          title: "Banho de Lago",
          description:
            "Aproveite as águas mornas do lago para um banho refrescante. A praia tem estrutura com quiosques e guarda-sóis.",
          duration: "2h",
          tip: "Leve protetor solar e água. Os quiosques alugam cadeiras e guarda-sóis.",
        },
      ],
    },
    {
      latitude: -10.2125,
      longitude: -48.3603,
      name: "Restaurante Regional do Tocantins",
      type: "restaurant",
      activities: [
        {
          title: "Almoço Regional",
          description:
            "Experimente pratos típicos como o peixe na telha, arroz com pequi e galinhada. O restaurante oferece buffet com várias opções regionais.",
          duration: "1h",
          tip: "Peça o suco de cajá, uma fruta típica da região.",
        },
      ],
    },
    {
      latitude: -10.1856,
      longitude: -48.3331,
      name: "Praia do Prata Palmas",
      type: "attraction",
      activities: [
        {
          title: "Pôr do Sol",
          description:
            "Aproveite o belo pôr do sol na Praia do Prata, um dos melhores pontos para apreciar o fim do dia em Palmas.",
          duration: "1h",
          tip: "Chegue 30 minutos antes do pôr do sol para garantir um bom lugar.",
        },
        {
          title: "Caminhada na Orla",
          description:
            "Faça uma caminhada pela orla da praia, apreciando a vista do lago e a brisa suave.",
          duration: "45min",
          tip: "Melhor horário: início da manhã ou fim da tarde.",
        },
      ],
    },
    {
      latitude: -10.1972,
      longitude: -48.3243,
      name: "Restaurante do Lago Palmas",
      type: "restaurant",
      activities: [
        {
          title: "Jantar com Vista",
          description:
            "Desfrute de um jantar romântico com vista para o lago. O restaurante oferece pratos da culinária regional e internacional.",
          duration: "1h30",
          tip: "Faça reserva com antecedência, especialmente nos fins de semana.",
        },
      ],
    },
  ],
};
