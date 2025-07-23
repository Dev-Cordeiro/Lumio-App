import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 8;
const CARD_HORIZONTAL_PADDING = 16; // igual ao FlatList
const CARD_WIDTH = (SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2 - CARD_MARGIN) / 2;
const CARD_HEIGHT = 270;
const MAP_HEIGHT = 120;

interface Waypoint {
  latitude: number;
  longitude: number;
  name: string;
  photoUrl?: string;
  imageUrl?: string;
}

interface MiniRoteiroCardProps {
  location: string;
  rating: number;
  waypoints: Waypoint[];
  onPress?: () => void;
  selected?: boolean;
}

export default function MiniRoteiroCard({ location, rating, waypoints, onPress, selected }: MiniRoteiroCardProps) {
  // Pega até 3 fotos dos waypoints
  const waypointPhotos = waypoints.slice(0, 3).map(wp => wp.photoUrl || wp.imageUrl || 'https://via.placeholder.com/40x40?text=WP');
  const mainLat = waypoints[0]?.latitude || 0;
  const mainLng = waypoints[0]?.longitude || 0;

  return (
    <TouchableOpacity style={[styles.card, selected && styles.selectedCard]} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: mainLat,
            longitude: mainLng,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          pointerEvents="none"
        >
          {waypoints[0] && (
            <Marker
              coordinate={{ latitude: mainLat, longitude: mainLng }}
              title={waypoints[0].name}
            />
          )}
        </MapView>
        <View style={styles.bookmarkIcon}>
          <MaterialIcons name="bookmark-border" size={22} color="#6B46C1" />
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{location}</Text>
        <View style={styles.bottomRow}>
          <View style={styles.avatarRow}>
            {waypointPhotos.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                style={[styles.avatarCircle, idx > 0 && { marginLeft: -10 }]}
              />
            ))}
            <Text style={styles.plusText}>+{waypoints.length}</Text>
          </View>
          <View style={styles.ratingWrapper}>
            <MaterialIcons name="star" size={13} color="#F6BA00" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    backgroundColor: '#E0E1E6',
    marginBottom: 18,
    marginRight: CARD_MARGIN,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1677FF',
  },
  mapWrapper: {
    width: '100%',
    height: MAP_HEIGHT,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bookmarkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  infoContainer: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  plusText: {
    marginLeft: 2,
    fontSize: 13,
    fontWeight: '500',
    color: '#6B46C1',
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
  },
  ratingText: {
    marginLeft: 2,
    fontSize: 12,
    fontWeight: '500',
    color: '#2D3748',
  },
}); 