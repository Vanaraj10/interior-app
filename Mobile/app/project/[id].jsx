import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/colors';
import { INTERIOR_SCHEMAS } from '../components/interiorSchemas';

const { width, height } = Dimensions.get('window');

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  // Define INTERIOR_TYPES for the cards
  const INTERIOR_TYPES = [
    { key: 'curtains', label: INTERIOR_SCHEMAS.curtains.label, icon: 'logo-windows', color: '#2563eb' },
    { key: 'mosquito-nets', label: INTERIOR_SCHEMAS['mosquito-nets'].label, icon: 'bug', color: '#059669' },
    { key: 'wallpapers', label: INTERIOR_SCHEMAS.wallpapers.label, icon: 'image', color: '#dc2626' },
    { key: 'blinds', label: INTERIOR_SCHEMAS.blinds.label, icon: 'layers', color: '#7c3aed' },
    { key: "flooring", label: "Flooring", icon: "layers-outline", color: '#ea580c' },
  ];const loadProject = useCallback(async () => {
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
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
        style={styles.loadingContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading Project...</Text>
        </View>
      </LinearGradient>
    );
  }  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryLight, COLORS.accent]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[styles.patternCircle, { 
            top: Math.random() * height,
            left: Math.random() * width,
            opacity: 0.03 + Math.random() * 0.07,
          }]} />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{project.clientName}</Text>
            <Text style={styles.headerSubtitle}>Project Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.headerPdfButton} onPress={generatePDF}>
            <Ionicons name="document-text-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      > 
        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          <View style={styles.interiorTypesGrid}>
            {INTERIOR_TYPES.map((type, index) => (
              <TouchableOpacity
                key={type.key}
                style={styles.interiorTypeCard}
                onPress={() => router.push({ pathname: '/interior-measurements/[type]', params: { id, type: type.key } })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
                  style={styles.cardGradient}
                >
                  <View style={[styles.cardIconContainer, { backgroundColor: type.color }]}>
                    <Ionicons name={type.icon} size={28} color="white" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.interiorTypeLabel}>{type.label}</Text>
                    <Text style={styles.interiorTypeDescription}>
                      Add measurements and get quotes
                    </Text>
                  </View>
                  <View style={styles.cardArrow}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.pdfButton} onPress={generatePDF} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
              style={styles.pdfButtonGradient}
            >
              <View style={styles.pdfIconContainer}>
                <Ionicons name="document-text" size={24} color={COLORS.success} />
              </View>
              <View style={styles.pdfButtonContent}>
                <Text style={styles.pdfButtonText}>Generate PDF Report</Text>
                <Text style={styles.pdfButtonSubtext}>Export complete quotation</Text>
              </View>
              <Ionicons name="download-outline" size={20} color={COLORS.success} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    marginBottom: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  headerPdfButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(' + COLORS.primary.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(',') + ', 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(' + COLORS.primary.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(',') + ', 0.2)',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clientInfo: {
    width: '100%',
    gap: 8,
  },
  clientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(' + COLORS.primary.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(',') + ', 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  clientInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  servicesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  interiorTypesGrid: {
    gap: 16,
  },
  interiorTypeCard: { 
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  interiorTypeLabel: { 
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  interiorTypeDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  pdfButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  pdfButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pdfIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(' + COLORS.success.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(',') + ', 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pdfButtonContent: {
    flex: 1,
  },
  pdfButtonText: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pdfButtonSubtext: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  bottomSpacing: {
    height: 40,
  },
});
