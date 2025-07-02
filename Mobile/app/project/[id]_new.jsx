import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { INTERIOR_SCHEMAS } from '../components/interiorSchemas';

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);

  // Define INTERIOR_TYPES for the cards
  const INTERIOR_TYPES = [
    { key: 'curtains', label: INTERIOR_SCHEMAS.curtains.label, icon: 'logo-windows' },
    { key: 'mosquito-nets', label: INTERIOR_SCHEMAS['mosquito-nets'].label, icon: 'bug' },
    { key: 'wallpapers', label: INTERIOR_SCHEMAS.wallpapers.label, icon: 'image' },
  ];

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const projectsData = await AsyncStorage.getItem('projects');
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const currentProject = projects.find(p => p.id === id);
        if (currentProject) {
          setProject(currentProject);
        } else {
          Alert.alert('Error', 'Project not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  if (!project) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{project.clientName}</Text>
          <Text style={styles.headerSubtitle}>{project.phone}</Text>
        </View>
      </View>

      {/* Project Info */}
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>Select Interior Type</Text>
        <Text style={styles.projectSubtitle}>Choose what you want to measure</Text>
      </View>

      {/* Interior Type Cards */}
      <View style={styles.interiorTypesContainer}>
        {INTERIOR_TYPES.map(type => (
          <TouchableOpacity
            key={type.key}
            style={styles.interiorTypeCard}
            onPress={() => router.push({ 
              pathname: '/interior-measurements/[type]', 
              params: { id, type: type.key } 
            })}
          >
            <Ionicons name={type.icon} size={48} color={'#2563eb'} />
            <Text style={styles.interiorTypeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#93c5fd',
    fontSize: 14,
  },
  projectInfo: {
    padding: 24,
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  projectSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  interiorTypesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  interiorTypeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 8,
    paddingVertical: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  interiorTypeLabel: {
    marginTop: 16,
    fontSize: 18,
    color: '#2563eb',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
