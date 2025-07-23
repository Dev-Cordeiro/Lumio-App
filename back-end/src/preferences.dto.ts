export class PreferencesDto {
  period: string[];        // ex: ['Manhã', 'Tarde']
  types: string[];         // ex: ['Restaurante']
  budget: string[];        // ex: ['Economy', 'Luxo']  ← se você realmente usa array de strings
  company: string[];       // ex: ['Casal', 'Família']
  budgetValue?: number;    // ex: 500
}