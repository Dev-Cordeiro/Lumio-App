import React from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Preferences {
    period: string | null;
    activities: string[];
    budget: string | null;
    companions: string | null;
    startDate?: string;
    endDate?: string;
}

interface Location {
    id: string;
    name: string;
    type: string;
    rating: number;
    address: string;
}

const dummyLocations: Location[] = [
    { id: '1', name: 'Parque do Povo', type: 'Natureza', rating: 4.5, address: 'Rua das Árvores, 123' },
    { id: '2', name: 'Restaurante Sabor Brasil', type: 'Gastronomia', rating: 4.0, address: 'Av. Principal, 456' },
    { id: '3', name: 'Bar do Zé', type: 'Vida Noturna', rating: 3.8, address: 'Travessa da Boémia, 789' },
    { id: '4', name: 'Museu da Cidade', type: 'Património Histórico', rating: 4.7, address: 'Praça da Cultura, 101' },
    { id: '5', name: 'Feira Livre Central', type: 'Eventos Culturais', rating: 4.2, address: 'Rua do Comércio, 202' },
    { id: '6', name: 'Shopping Avenida', type: 'Compras', rating: 4.0, address: 'Av. Shopping, 777' },
];

const RecommendedLocationsScreen = () => {
    const router = useRouter();
    const { preferences: preferencesParam } = useLocalSearchParams();
    const preferences: Preferences = preferencesParam ? JSON.parse(preferencesParam as string) : { period: null, activities: [], budget: null, companions: null };

    const [selectedLocations, setSelectedLocations] = React.useState<string[]>([]);

    const filteredLocations = dummyLocations.filter((loc: Location) =>
        preferences.activities && preferences.activities.some((prefActivity: string) => loc.type.includes(prefActivity.split(' ')[0]))
    );

    const toggleLocationSelection = (locationId: string) => {
        setSelectedLocations((prev: string[]) =>
            prev.includes(locationId) ? prev.filter(id => id !== locationId) : [...prev, locationId]
        );
    };

    const handleGenerateItinerary = () => {
        if (selectedLocations.length === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos um local para gerar o roteiro.');
            return;
        }

        const generatedItinerary = selectedLocations.map(id => {
            const loc = dummyLocations.find((l: Location) => l.id === id);
            return {
                id: loc?.id,
                name: loc?.name,
                time: 'Horário sugerido: ' + (loc?.id === '1' ? '9h-12h' : loc?.id === '2' ? '13h-15h' : loc?.id === '3' ? '20h-22h' : '15h-17h'),
                address: loc?.address,
            };
        });
        
        router.push({
            pathname: "/generated",
            params: { itinerary: JSON.stringify(generatedItinerary) }
        });
    };

    const renderItem = ({ item }: { item: Location }) => (
        <TouchableOpacity
            style={[
                styles.locationCard,
                selectedLocations.includes(item.id) && styles.locationCardSelected
            ]}
            onPress={() => toggleLocationSelection(item.id)}
        >
            <Text style={styles.locationName}>{item.name}</Text>
            <Text style={styles.locationDetails}>Tipo: {item.type}</Text>
            <Text style={styles.locationDetails}>Avaliação: {item.rating} estrelas</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Locais Recomendados</Text>
            {preferences.startDate && preferences.endDate && (
                <Text style={styles.subtitle}>De: {preferences.startDate} Até: {preferences.endDate}</Text>
            )}
            <Text style={styles.subtitle}>Baseado nas suas preferências: {preferences.budget}, {preferences.period}, {preferences.companions}</Text>
            <FlatList
                data={filteredLocations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
            <Button
                title={`Gerar Roteiro (${selectedLocations.length} selecionado(s))`}
                onPress={handleGenerateItinerary}
                disabled={selectedLocations.length === 0}
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
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    locationCard: {
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
    locationCardSelected: {
        borderColor: '#007bff',
        borderWidth: 2,
    },
    locationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    locationDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
});

export default RecommendedLocationsScreen;
