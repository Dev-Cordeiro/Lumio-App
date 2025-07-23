import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from '../config/places';

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: any) => void;
  placeholder?: string;
}

// Função simples para gerar um token aleatório
function simpleSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = 'Buscar local...',
}) => {
  // Cria um sessionToken único por sessão de busca
  const sessionTokenRef = useRef<string>(simpleSessionToken());

  // Reinicia o sessionToken ao focar o campo (nova sessão de busca)
  const handleFocus = () => {
    sessionTokenRef.current = simpleSessionToken();
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data, details = null) => {
          console.log('Dados selecionados:', data);
          console.log('Detalhes:', details);
          onPlaceSelect(details);
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'pt-BR',
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
        onFail={error => {
          console.error('Erro detalhado:', error);
        }}
        textInputProps={{
          onFocus: handleFocus,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  searchContainer: {
    flex: 0,
  },
  searchInput: {
    height: 48,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 8,
  },
  row: {
    padding: 13,
    height: 'auto',
    minHeight: 44,
  },
  description: {
    fontSize: 14,
  },
}); 