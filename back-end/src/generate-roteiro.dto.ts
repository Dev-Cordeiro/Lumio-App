// src/places/dto/generate-roteiro.dto.ts
import { PlaceDto } from './places/place.dto';
import { PreferencesDto } from './preferences.dto';

export class GenerateRoteiroDto {
  startLocation: PlaceDto;
  preferences: PreferencesDto;
  extraPlaces?: any[];
}