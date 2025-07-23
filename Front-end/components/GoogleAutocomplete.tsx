import React, { useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from '../config/places';

interface GoogleAutocompleteProps {
  onPlaceSelect: (place: any) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Função simples para gerar um token aleatório
function simpleSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const GoogleAutocomplete: React.FC<GoogleAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = 'Buscar local...',
  onFocus,
  onBlur,
}) => {
  // Cria um sessionToken único por sessão de busca
  const sessionTokenRef = useRef<string>(simpleSessionToken());

  // Reinicia o sessionToken ao focar o campo (nova sessão de busca)
  const handleFocus = () => {
    sessionTokenRef.current = simpleSessionToken();
    if (onFocus) onFocus();
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data, details = null) => {
          onPlaceSelect(details || data);
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'pt-BR',
          types: 'geocode|establishment',
          sessiontoken: sessionTokenRef.current,
        }}
        styles={{
          container: styles.searchContainer,
          textInput: styles.searchInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
        }}
        enablePoweredByContainer={false}
        fetchDetails={true}
        onFail={error => console.error('Erro:', error)}
        onNotFound={() => console.log('Nenhum resultado encontrado')}
        textInputProps={{
          autoCapitalize: 'none',
          autoCorrect: false,
          onFocus: handleFocus,
          onBlur,
        }}
        keyboardShouldPersistTaps="handled"
        minLength={2}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
        currentLocation={false}
        predefinedPlaces={[]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1,
  },
  searchContainer: {
    flex: 0,
    zIndex: 1,
  },
  searchInput: {
    height: 43,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  row: {
    padding: 13,
    height: 'auto',
    minHeight: 44,
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
}); 