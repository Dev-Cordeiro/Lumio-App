import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const RatingScreen = () => {
    const router = useRouter();
    const { locationName: locationNameParam } = useLocalSearchParams();
    const locationName: string = locationNameParam ? locationNameParam.toString() : 'Local Visitado';

    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');

    const handleStarPress = (selectedRating: number) => {
        setRating(selectedRating);
    };

    const handleSubmitReview = () => {
        if (rating === 0) {
            Alert.alert('Atenção', 'Por favor, selecione uma avaliação de 1 a 5 estrelas.');
            return;
        }
        Alert.alert(
            'Avaliação Enviada!',
            `Local: ${locationName}\nAvaliação: ${rating} estrelas\nComentário: ${comment || 'Nenhum'}`
        );
        router.back();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Avaliar: {locationName}</Text>

            <Text style={styles.sectionTitle}>A Sua Avaliação:</Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <TouchableOpacity key={starValue} onPress={() => handleStarPress(starValue)}>
                        <Ionicons
                            name={rating >= starValue ? 'star' : 'star-outline'}
                            size={40}
                            color={rating >= starValue ? '#FFD700' : '#ccc'}
                            style={styles.starIcon}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>O Seu Comentário (opcional):</Text>
            <TextInput
                style={styles.commentInput}
                placeholder="Partilhe a sua experiência..."
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
            />

            <Button title="Enviar Avaliação" onPress={handleSubmitReview} />
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
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#555',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    starIcon: {
        marginHorizontal: 5,
    },
    commentInput: {
        width: '100%',
        height: 120,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
});

export default RatingScreen;
