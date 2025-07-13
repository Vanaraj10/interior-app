import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MeasurementForm from '../components/MeasurementForm';
import { COLORS } from '../styles/colors';
import { calculateProjectTotals } from '../components/projectTotals';

export default function NewMeasurement() {
  const { id, type, editId } = useLocalSearchParams();
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const loadMeasurement = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem('projects');
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const project = projects.find(p => p.id === id);
        if (project) {
          const measurement = project.measurements?.find(m => m.id === editId);
          if (measurement) {
            setEditingMeasurement(measurement);
          }
        }
      }
    } catch (error) {
      console.error('Error loading measurement:', error);
    }
  }, [id, editId]);

  useEffect(() => {
    if (editId) {
      loadMeasurement();
    }
  }, [editId, loadMeasurement]);

  const handleSave = async (measurementData) => {
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
          projects[projectIndex].measurements = projects[projectIndex].measurements || [];
          projects[projectIndex].measurements.push({
            ...measurementData,
            id: Date.now().toString()
          });
        }
        
        // Recalculate project totals
        projects[projectIndex] = calculateProjectTotals(projects[projectIndex]);
        await AsyncStorage.setItem('projects', JSON.stringify(projects));
        
        // Navigate back to measurements page
        router.back();
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
      Alert.alert('Error', 'Failed to save measurement');
    }
  };

  return (
    <View style={styles.container}>
      <MeasurementForm
        onSave={handleSave}
        onCancel={() => router.back()}
        editingMeasurement={editingMeasurement}
        forceInteriorType={type}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
