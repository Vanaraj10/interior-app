import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  Alert 
} from 'react-native';
import { INTERIOR_SCHEMAS } from '../components/interiorSchemas';

export default function InteriorMeasurements() {
  const { id, type } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [measurements, setMeasurements] = useState([]);

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
          setMeasurements(currentProject?.measurements?.filter(m => m.interiorType === type) || []);
        } else {
          Alert.alert('Error', 'Project not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
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
                await AsyncStorage.setItem('projects', JSON.stringify(projects));
                loadProject(); // Reload the data
              }
            } catch (error) {
              console.error('Error deleting measurement:', error);
            }
          },
        },
      ]
    );
  };

  const getInteriorTypeLabel = () => {
    return INTERIOR_SCHEMAS[type]?.label || type;
  };

  const generatePDF = () => {
    router.push(`/pdf-preview/${id}`);
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
          <Text style={styles.headerSubtitle}>{getInteriorTypeLabel()}</Text>
        </View>
        <TouchableOpacity onPress={generatePDF} style={styles.pdfHeaderButton}>
          <Ionicons name="document-text" size={20} color="white" />
        </TouchableOpacity>
      </View>      {/* Measurements Table */}
      <ScrollView style={styles.scrollView} horizontal>
        <View style={styles.tableContainer}>
          {measurements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyMessage}>No measurements yet</Text>
              <Text style={styles.emptySubMessage}>Add your first measurement to get started</Text>
            </View>
          ) : (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.roomColumn]}>Room</Text>
                <Text style={[styles.tableHeaderCell, styles.dimensionColumn]}>Width</Text>
                <Text style={[styles.tableHeaderCell, styles.dimensionColumn]}>Height</Text>
                {type === 'curtains' && (
                  <>
                    <Text style={[styles.tableHeaderCell, styles.infoColumn]}>Type</Text>
                    <Text style={[styles.tableHeaderCell, styles.infoColumn]}>Parts</Text>
                    <Text style={[styles.tableHeaderCell, styles.dimensionColumn]}>Pieces</Text>
                    <Text style={[styles.tableHeaderCell, styles.dimensionColumn]}>Meters</Text>
                    <Text style={[styles.tableHeaderCell, styles.costColumn]}>Cloth Cost</Text>
                    <Text style={[styles.tableHeaderCell, styles.costColumn]}>Stitching</Text>
                  </>
                )}
                {type === 'mosquito-nets' && (
                  <>
                    <Text style={[styles.tableHeaderCell, styles.infoColumn]}>Material</Text>
                    <Text style={[styles.tableHeaderCell, styles.dimensionColumn]}>Sq.Ft</Text>
                    <Text style={[styles.tableHeaderCell, styles.costColumn]}>Rate/Sq.Ft</Text>
                  </>
                )}
                {type === 'wallpapers' && (
                  <>
                    <Text style={[styles.tableHeaderCell, styles.dimensionColumn]}>Sq.Ft</Text>
                    <Text style={[styles.tableHeaderCell, styles.dimensionColumn]}>Rolls</Text>
                    <Text style={[styles.tableHeaderCell, styles.costColumn]}>Cost/Roll</Text>
                    <Text style={[styles.tableHeaderCell, styles.costColumn]}>Impl/Roll</Text>
                  </>
                )}
                <Text style={[styles.tableHeaderCell, styles.costColumn]}>Total</Text>
                <Text style={[styles.tableHeaderCell, styles.actionColumn]}>Actions</Text>
              </View>

              {/* Table Rows */}
              {measurements.map((m, index) => (
                <View key={m.id} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                  <Text style={[styles.tableCell, styles.roomColumn]}>{m.roomLabel || 'Untitled'}</Text>
                  <Text style={[styles.tableCell, styles.dimensionColumn]}>{m.width || '-'}"</Text>
                  <Text style={[styles.tableCell, styles.dimensionColumn]}>{m.height || '-'}"</Text>
                  
                  {type === 'curtains' && (
                    <>
                      <Text style={[styles.tableCell, styles.infoColumn]}>{m.curtainType || '-'}</Text>
                      <Text style={[styles.tableCell, styles.infoColumn]}>{m.parts || '-'}</Text>
                      <Text style={[styles.tableCell, styles.dimensionColumn]}>{m.pieces || '-'}</Text>
                      <Text style={[styles.tableCell, styles.dimensionColumn]}>{m.totalMeters?.toFixed(1) || '-'}</Text>
                      <Text style={[styles.tableCell, styles.costColumn]}>₹{m.clothCost?.toLocaleString('en-IN') || '0'}</Text>
                      <Text style={[styles.tableCell, styles.costColumn]}>₹{m.stitchingCost?.toLocaleString('en-IN') || '0'}</Text>
                    </>
                  )}
                  
                  {type === 'mosquito-nets' && (
                    <>
                      <Text style={[styles.tableCell, styles.infoColumn]}>{m.materialType || '-'}</Text>
                      <Text style={[styles.tableCell, styles.dimensionColumn]}>{m.totalSqft?.toFixed(1) || '-'}</Text>
                      <Text style={[styles.tableCell, styles.costColumn]}>₹{m.materialRatePerSqft || '0'}</Text>
                    </>
                  )}
                  
                  {type === 'wallpapers' && (
                    <>
                      <Text style={[styles.tableCell, styles.dimensionColumn]}>
                        {((parseFloat(m.width) || 0) * (parseFloat(m.height) || 0) / 144).toFixed(1)}
                      </Text>
                      <Text style={[styles.tableCell, styles.dimensionColumn]}>
                        {Math.max(1, Math.floor(((parseFloat(m.width) || 0) * (parseFloat(m.height) || 0) / 144) / 57))}
                      </Text>
                      <Text style={[styles.tableCell, styles.costColumn]}>₹{m.costPerRoll?.toLocaleString('en-IN') || '0'}</Text>
                      <Text style={[styles.tableCell, styles.costColumn]}>₹{m.implementationCostPerRoll?.toLocaleString('en-IN') || '0'}</Text>
                    </>
                  )}
                  
                  <Text style={[styles.tableCell, styles.costColumn, styles.totalCostCell]}>
                    ₹{(m.totalCost || m.materialCost || 0).toLocaleString('en-IN')}
                  </Text>
                  
                  <View style={[styles.tableCell, styles.actionColumn, styles.actionContainer]}>
                    <TouchableOpacity 
                      onPress={() => router.push({ 
                        pathname: '/new-measurement/[type]', 
                        params: { id, type, editId: m.id } 
                      })} 
                      style={styles.editButton}
                    >
                      <Ionicons name="pencil" size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => deleteMeasurement(m.id)} 
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Measurement Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push({ 
          pathname: '/new-measurement/[type]', 
          params: { id, type } 
        })}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Measurement</Text>
      </TouchableOpacity>
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
  pdfHeaderButton: {
    backgroundColor: '#059669',
    padding: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  tableContainer: {
    padding: 16,
    minWidth: '100%',
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  evenRow: {
    backgroundColor: '#f9fafb',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  tableCell: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    paddingVertical: 4,
  },
  totalCostCell: {
    fontWeight: 'bold',
    color: '#059669',
  },
  // Column widths
  roomColumn: {
    width: 80,
  },
  dimensionColumn: {
    width: 60,
  },
  infoColumn: {
    width: 70,
  },
  costColumn: {
    width: 70,
  },
  actionColumn: {
    width: 80,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  // ...existing code...
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyMessage: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  measurementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  measurementRoom: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  measurementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 6,
  },
  measurementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  measurementText: {
    fontSize: 14,
    color: '#374151',
  },
  measurementCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
