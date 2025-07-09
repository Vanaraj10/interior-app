import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
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
  ];  const loadProject = useCallback(async () => {
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
  }, [id]);

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProject();
    }, [loadProject])
  );

  const generatePDF = () => {
    router.push(`/pdf-preview/${id}`);
  };

  if (!project) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{project.clientName}</Text>
          <Text style={styles.headerSubtitle}>Project Dashboard</Text>
        </View>
      </View>
      
      {/* Interior Type Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.interiorTypesGrid}>
          {INTERIOR_TYPES.map((type, index) => (
            <TouchableOpacity
              key={type.key}
              style={[styles.interiorTypeCard, { 
                transform: [{ scale: 1 }] 
              }]}
              onPress={() => router.push({ pathname: '/interior-measurements/[type]', params: { id, type: type.key } })}
              activeOpacity={0.8}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons name={type.icon} size={48} color="white" />
              </View>
              <Text style={styles.interiorTypeLabel}>{type.label}</Text>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={16} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <View style={styles.pdfButtonContent}>
            <Ionicons name="document-text" size={24} color="white" />
            <View>
              <Text style={styles.pdfButtonText}>Generate PDF</Text>
              <Text style={styles.pdfButtonSubtext}>Export complete report</Text>
            </View>
          </View>
          <Ionicons name="download" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#93c5fd',
    fontSize: 14,
    marginTop: 2,
  },
  pdfHeaderButton: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 24,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  interiorTypesGrid: {
    flex: 1,
    justifyContent: 'center',
  },
  interiorTypeCard: { 
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  interiorTypeLabel: { 
    flex: 1,
    marginLeft: 20,
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    padding: 20,
    paddingBottom: 32,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    elevation: 6,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pdfButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  pdfButtonSubtext: {
    color: '#a7f3d0',
    fontSize: 12,
    marginLeft: 16,
    marginTop: 2,
  },
});
