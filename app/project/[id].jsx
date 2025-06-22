import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import InteriorSection from '../components/InteriorSection';
import MeasurementForm from '../components/MeasurementForm';

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProject();
    setRefreshing(false);
  };

  const saveMeasurement = async (measurementData) => {
    try {
      const projectsData = await AsyncStorage.getItem('projects');
      const projects = JSON.parse(projectsData);
      const projectIndex = projects.findIndex(p => p.id === id);
      
      if (projectIndex !== -1) {
        if (editingMeasurement) {
          // Update existing measurement
          const measurementIndex = projects[projectIndex].measurements.findIndex(
            m => m.id === editingMeasurement.id
          );
          if (measurementIndex !== -1) {
            projects[projectIndex].measurements[measurementIndex] = measurementData;
          }
        } else {
          // Add new measurement
          projects[projectIndex].measurements.push({
            ...measurementData,
            id: Date.now().toString()
          });
        }
        
        // Recalculate grand total
        projects[projectIndex] = calculateProjectTotals(projects[projectIndex]);
        
        await AsyncStorage.setItem('projects', JSON.stringify(projects));
        setProject(projects[projectIndex]);
        setShowMeasurementForm(false);
        setEditingMeasurement(null);
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
      Alert.alert('Error', 'Failed to save measurement');
    }
  };

  const deleteMeasurement = async (measurementId) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const projectsData = await AsyncStorage.getItem('projects');
              const projects = JSON.parse(projectsData);
              const projectIndex = projects.findIndex(p => p.id === id);
              
              if (projectIndex !== -1) {
                projects[projectIndex].measurements = projects[projectIndex].measurements.filter(
                  m => m.id !== measurementId
                );
                
                // Recalculate grand total
                projects[projectIndex] = calculateProjectTotals(projects[projectIndex]);
                
                await AsyncStorage.setItem('projects', JSON.stringify(projects));
                setProject(projects[projectIndex]);
              }
            } catch (error) {
              console.error('Error deleting measurement:', error);
            }
          },
        },
      ]
    );
  };

  const calculateProjectTotals = (projectData) => {
    const measurements = projectData.measurements || [];

    // Group measurements by interior type
    const curtainMeasurements = measurements.filter(m => m.interiorType === 'curtains');
    const netMeasurements = measurements.filter(m => m.interiorType === 'mosquito-nets');
    const wallpaperMeasurements = measurements.filter(m => m.interiorType === 'wallpapers');

    // Calculate totals for each type
    const curtainTotal = curtainMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const netTotal = netMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const wallpaperTotal = wallpaperMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);

    // Calculate rod cost for curtains only, using each measurement's rodRatePerLength
    let rodLength = 0;
    let rodCost = 0;
    curtainMeasurements.forEach(m => {
      const width = m.width || 0;
      const rate = m.rodRatePerLength || 200;
      const length = width / 12;
      rodLength += length;
      rodCost += length * rate;
    });

    const subtotal = curtainTotal + netTotal + wallpaperTotal;
    const grandTotal = subtotal + rodCost;

    return {
      ...projectData,
      curtainTotal,
      netTotal,
      wallpaperTotal,
      rodCost,
      rodLength,
      grandTotal
    };
  };

  const editMeasurement = (measurement) => {
    setEditingMeasurement(measurement);
    setShowMeasurementForm(true);
  };

  const generatePDF = () => {
    router.push(`/pdf-preview/${id}`);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (!project) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{project.clientName}</Text>
            <Text style={styles.headerSubtitle}>{project.phone}</Text>
          </View>
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={generatePDF}
          >
            <Text style={styles.pdfButtonText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Interior Sections */}
        <InteriorSection
          title="Curtains"
          icon="logo-windows"
          measurements={project.measurements?.filter(m => m.interiorType === 'curtains') || []}
          total={project.curtainTotal || 0}
          onEdit={editMeasurement}
          onDelete={deleteMeasurement}
        />

        <InteriorSection
          title="Mosquito Nets"
          icon="bug"
          measurements={project.measurements?.filter(m => m.interiorType === 'mosquito-nets') || []}
          total={project.netTotal || 0}
          onEdit={editMeasurement}
          onDelete={deleteMeasurement}
        />

        <InteriorSection
          title="Wallpapers"
          icon="image"
          measurements={project.measurements?.filter(m => m.interiorType === 'wallpapers') || []}
          total={project.wallpaperTotal || 0}
          onEdit={editMeasurement}
          onDelete={deleteMeasurement}
        />

        {/* Rod Installation */}
        {project.measurements?.some(m => m.interiorType === 'curtains') && (
          <View style={styles.rodInstallation}>
            <Text style={styles.rodTitle}>Rod Installation</Text>
            <View style={styles.rodDetails}>
              <Text style={styles.rodText}>
                Length: {(project.rodLength || 0).toFixed(1)} units
              </Text>
              <Text style={styles.rodCost}>
                {formatCurrency(project.rodCost || 0)}
              </Text>
            </View>
          </View>
        )}

        {/* Grand Total */}
        <View style={styles.grandTotalContainer}>
          <View style={styles.grandTotalContent}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalAmount}>
              {formatCurrency(project.grandTotal || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowMeasurementForm(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Measurement Form Modal */}
      <Modal
        visible={showMeasurementForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <MeasurementForm
          onSave={saveMeasurement}
          onCancel={() => {
            setShowMeasurementForm(false);
            setEditingMeasurement(null);
          }}
          editingMeasurement={editingMeasurement}
        />
      </Modal>
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
    paddingBottom:4,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  pdfButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  projectInfo: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  projectInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  projectInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  projectInfoDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  rodInstallation: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  rodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  rodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rodText: {
    fontSize: 14,
    color: '#6b7280',
  },
  rodCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  grandTotalContainer: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  grandTotalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
  },
  grandTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
