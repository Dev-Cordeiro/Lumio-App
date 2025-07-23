import React from 'react';
import { View, Text, StyleSheet, FlatList, Button, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface HistoricalLocation {
    id: string;
    name: string;
    time?: string;
    address?: string;
}

interface HistoricalItinerary {
    id: string;
    name: string;
    date: string;
    locationsDetails: HistoricalLocation[];
}

const ViewHistoricalItineraryScreen = () => {
    const router = useRouter();
    const { itinerary: itineraryParam } = useLocalSearchParams();
    const itinerary: HistoricalItinerary = itineraryParam ? JSON.parse(itineraryParam as string) : { id: '', name: '', date: '', locationsDetails: [] };

    const renderLocationItem = ({ item }: { item: HistoricalLocation }) => (
        <View style={styles.locationItem}>
            <Text style={styles.locationName}>{item.name}</Text>
            {item.time && <Text style={styles.locationDetail}>Horário: {item.time}</Text>}
            {item.address && <Text style={styles.locationDetail}>Endereço: {item.address}</Text>}
            <Button
                title="Avaliar Local"
                onPress={() => router.push({
                    pathname: "/rating",
                    params: { locationName: item.name }
                })}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{itinerary.name}</Text>
            <Text style={styles.date}>Gerado em: {itinerary.date}</Text>

            <Text style={styles.sectionTitle}>Locais do Roteiro:</Text>
            <FlatList
                data={itinerary.locationsDetails}
                renderItem={renderLocationItem}
                keyExtractor={(item, index) => item.id || index.toString()}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        color: '#333',
    },
    date: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#555',
    },
    listContent: {
        paddingBottom: 20,
    },
    locationItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    locationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    locationDetail: {
        fontSize: 14,
        color: '#666',
    },
});

export default ViewHistoricalItineraryScreen;
