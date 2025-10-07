import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const FeatureCard = ({ title, description, children }: FeatureCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  description: {
    color: '#CBD5F5',
    marginBottom: 12,
  },
  content: {
    gap: 12,
  },
});
