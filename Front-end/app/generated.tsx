import React from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface ItineraryItem {
    id: string;
    name: string;
    time: string;
    address: string;
}

const GeneratedItineraryScreen = () => {
    const router = useRouter();
    const { itinerary: itineraryParam } = useLocalSearchParams();
    const itinerary: ItineraryItem[] = itineraryParam ? JSON.parse(itineraryParam as string) : [];

    const handleSaveItinerary = () => {
        Alert.alert('Roteiro Salvo!', 'O Seu roteiro foi salvo com sucesso.');
        router.back();
    };

    const renderItem = ({ item }: { item: ItineraryItem }) => (
        <View style={styles.itineraryItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetail}>Horário: {item.time}</Text>
            <Text style={styles.itemDetail}>Endereço: {item.address}</Text>
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
            <Text style={styles.title}>O Seu Roteiro Personalizado!</Text>
            <FlatList
                data={itinerary}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
            <Button title="Salvar Roteiro" onPress={handleSaveItinerary} />
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
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    itineraryItem: {
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
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemDetail: {
        fontSize: 14,
        color: '#666',
    },
});

export default GeneratedItineraryScreen;
