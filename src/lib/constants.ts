export const STAGES = [
  { id: 'nouveau', label: 'Nouveau prospect', group: 'new' },
  { id: 'contact', label: 'Premier contact', group: 'progress' },
  { id: 'qualification', label: 'Qualification', group: 'progress' },
  { id: 'proposition', label: 'Proposition envoyée', group: 'progress' },
  { id: 'negociation', label: 'Négociation', group: 'progress' },
  { id: 'client', label: 'Client', group: 'won' },
  { id: 'termine', label: 'Projet terminé', group: 'won' },
  { id: 'fidele', label: 'Client fidèle', group: 'won' }
] as const;

export const TYPE_LABELS: Record<string, string> = {
  conge: 'Congé',
  absence: 'Absence',
  retard: 'Retard',
  mission: 'Mission extérieure',
  teletravail: 'Télétravail'
};

export const DISPO_LABELS: Record<string, string> = {
  temps_plein: 'Temps plein',
  mi_temps: 'Mi-temps',
  freelance: 'Freelance'
};

export const TEAM_ROLES: Record<string, string> = {
  MK: 'Chef de projet',
  AF: 'Chargée de compte',
  SK: 'Designer',
  RT: 'Développeur Front',
  JN: 'Développeur Back'
};

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  dev: 'Projet Dev',
  marketing_digital: 'Projet Marketing Digital',
  design: 'Projet Design',
  campagne_marketing: 'Campagne Marketing',
  rapide: 'Projet Rapide'
};

export const REPORT_MOOD_LABELS: Record<string, string> = {
  excellent: 'Excellent',
  bon: 'Bon',
  moyen: 'Moyen',
  difficile: 'Difficile'
};
