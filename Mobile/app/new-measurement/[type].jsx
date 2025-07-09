import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MeasurementForm from '../components/MeasurementForm';
import { COLORS } from '../styles/colors';

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

  const calculateProjectTotals = (projectData) => {
    const measurements = projectData.measurements || [];

    // Group measurements by interior type
    const curtainMeasurements = measurements.filter(m => m.interiorType === 'curtains');
    const netMeasurements = measurements.filter(m => m.interiorType === 'mosquito-nets');
    const wallpaperMeasurements = measurements.filter(m => m.interiorType === 'wallpapers');    // Calculate totals for each type
    const curtainTotal = curtainMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const netTotal = netMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    
    // Wallpaper calculation
    let wallpaperTotal = 0;
    let totalWallpaperRolls = 0;
    let totalWallpaperMaterialCost = 0;
    let totalWallpaperImplementationCost = 0;
    wallpaperMeasurements.forEach(m => {
      const width = parseFloat(m.width) || 0;
      const height = parseFloat(m.height) || 0;
      const costPerRoll = parseFloat(m.costPerRoll) || 0;
      const implementationCostPerRoll = parseFloat(m.implementationCostPerRoll) || 0;
      
      const squareInches = width * height;
      const squareFeet = squareInches / 144;
      let rolls = squareFeet / 50;
      const decimal = rolls - Math.floor(rolls);
      if (decimal >= 0.3) {
        rolls = Math.ceil(rolls);
      } else {
        rolls = Math.max(1, Math.floor(rolls));
      }
      
      const totalMaterialCost = rolls * costPerRoll;
      const totalImplementationCost = rolls * implementationCostPerRoll;
      const totalCost = totalMaterialCost + totalImplementationCost;
      wallpaperTotal += totalCost;
      totalWallpaperRolls += rolls;
      totalWallpaperMaterialCost += totalMaterialCost;
      totalWallpaperImplementationCost += totalImplementationCost;
    });    // Calculate rod cost for curtains only
    let rodLength = 0;
    let rodCost = 0;
    curtainMeasurements.forEach(m => {
      const width = m.width || 0;
      const rate = m.rodRatePerLength || 0; // Use the actual rate from measurement, don't default to 200
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
      grandTotal,
      totalWallpaperRolls,
      totalWallpaperMaterialCost,
      totalWallpaperImplementationCost
    };
  };

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
