import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MeasurementForm from '../components/MeasurementForm';
import { COLORS } from '../styles/colors';
import { calculateProjectTotals } from '../components/projectTotals';

const { width, height } = Dimensions.get('window');

export default function NewMeasurement() {
  const { id, type, editId, roomId, roomName } = useLocalSearchParams();
  const isCurtainRoom = type === 'curtains' && roomId && roomName;
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  
  const loadMeasurement = useCallback(async () => {
    try {
      const projectsData = await AsyncStorage.getItem('projects');
      if (projectsData) {
        const projects = JSON.parse(projectsData);
        const project = projects.find(p => p.id === id);
        
        if (project) {
          if (isCurtainRoom) {
            // Find the room and measurement within it
            const room = project.curtainRooms?.find(r => r.id === roomId);
            if (room) {
              const measurement = room.measurements?.find(m => m.id === editId);
              if (measurement) {
                setEditingMeasurement(measurement);
              }
            }
          } else {
            // Regular flow for other types
            const measurement = project.measurements?.find(m => m.id === editId);
            if (measurement) {
              setEditingMeasurement(measurement);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading measurement:', error);
    }
  }, [id, editId, roomId, isCurtainRoom]);

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
        if (isCurtainRoom) {
          // Handle curtain room measurement saving
          if (!projects[projectIndex].curtainRooms) {
            projects[projectIndex].curtainRooms = [];
          }
          
          // Find the room
          const roomIndex = projects[projectIndex].curtainRooms.findIndex(
            r => r.id === roomId
          );
          
          if (roomIndex !== -1) {
            if (!projects[projectIndex].curtainRooms[roomIndex].measurements) {
              projects[projectIndex].curtainRooms[roomIndex].measurements = [];
            }
            
            if (editingMeasurement) {
              // Update existing measurement in the room
              const measurementIndex = projects[projectIndex].curtainRooms[roomIndex].measurements.findIndex(
                m => m.id === editingMeasurement.id
              );
              
              if (measurementIndex !== -1) {
                projects[projectIndex].curtainRooms[roomIndex].measurements[measurementIndex] = {
                  ...measurementData,
                  id: editingMeasurement.id,
                  roomId: roomId,
                  roomName: roomName
                };
              }
            } else {
              // Add new measurement to the room
              projects[projectIndex].curtainRooms[roomIndex].measurements.push({
                ...measurementData,
                id: Date.now().toString(),
                roomId: roomId,
                roomName: roomName
              });
            }
          } else {
            // Create the room if it doesn't exist
            projects[projectIndex].curtainRooms.push({
              id: roomId,
              name: roomName,
              measurements: [{
                ...measurementData,
                id: Date.now().toString(),
                roomId: roomId,
                roomName: roomName
              }]
            });
          }
        } else {
          // Regular flow for other interior types
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
      
      <MeasurementForm
        onSave={handleSave}
        onCancel={() => router.back()}
        editingMeasurement={editingMeasurement}
        forceInteriorType={type}
      />
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
});
