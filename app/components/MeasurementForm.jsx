import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  StyleSheet 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const CURTAIN_TYPES = ['Eyelet', 'Pleated', 'Plain', 'Belt Model', 'Ripple', 'Button'];
const INTERIOR_TYPES = [
  { value: 'curtains', label: 'Curtains' },
  { value: 'mosquito-nets', label: 'Mosquito Nets' },
  { value: 'wallpapers', label: 'Wallpapers' }
];

export default function MeasurementForm({ onSave, onCancel, editingMeasurement }) {
  const [formData, setFormData] = useState({
    interiorType: 'curtains',
    roomLabel: '',
    width: '',
    height: '',
    curtainType: 'Eyelet',
    clothRatePerMeter: '',
    stitchingCostPerPiece: ''
  });

  const [calculatedData, setCalculatedData] = useState({
    pieces: 0,
    totalMeters: 0,
    clothCost: 0,
    stitchingCost: 0,
    totalCost: 0
  });

  useEffect(() => {
    if (editingMeasurement) {
      setFormData({
        interiorType: editingMeasurement.interiorType || 'curtains',
        roomLabel: editingMeasurement.roomLabel || '',
        width: editingMeasurement.width?.toString() || '',
        height: editingMeasurement.height?.toString() || '',
        curtainType: editingMeasurement.curtainType || 'Eyelet',
        clothRatePerMeter: editingMeasurement.clothRatePerMeter?.toString() || '',
        stitchingCostPerPiece: editingMeasurement.stitchingCostPerPiece?.toString() || ''
      });
    }
  }, [editingMeasurement]);

  useEffect(() => {
    calculateTotals();
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePiecesFromWidth = (widthInches) => {
    const width = parseFloat(widthInches) || 0;
    
    if (width < 12) return 1.0;
    if (width <= 20) return 1.0;
    if (width <= 28) return 1.5;
    if (width <= 40) return 2.0;
    if (width <= 50) return 2.5;
    if (width <= 60) return 3.0;
    if (width <= 70) return 3.5;
    if (width <= 80) return 4.0;
    if (width <= 90) return 4.5;
    if (width <= 100) return 5.0;
    if (width <= 110) return 5.5;
    if (width <= 120) return 6.0;
    if (width <= 130) return 6.5;
    if (width <= 140) return 7.0;
    
    // Above 140 inches
    return 7 + (Math.ceil((width - 140) / 10) * 0.5);
  };

  const calculateClothMeters = (heightInches, pieces) => {
    const height = parseFloat(heightInches) || 0;
    const roundedPieces = Math.ceil(pieces); // Always round up for purchasing
    
    if (formData.interiorType === 'curtains') {
      // Curtains: ((Height + 15) × Rounded Pieces) ÷ 39
      return ((height + 15) * roundedPieces) / 39;
    } else {
      // For mosquito nets and wallpapers, use simpler calculation
      return (height * pieces) / 39;
    }
  };

  const calculateTotals = () => {
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;
    const clothRate = parseFloat(formData.clothRatePerMeter) || 0;
    const stitchingRate = parseFloat(formData.stitchingCostPerPiece) || 0;

    if (width === 0 || height === 0) {
      setCalculatedData({
        pieces: 0,
        totalMeters: 0,
        clothCost: 0,
        stitchingCost: 0,
        totalCost: 0
      });
      return;
    }

    let pieces = 0;
    let totalMeters = 0;

    if (formData.interiorType === 'curtains') {
      pieces = calculatePiecesFromWidth(width);
      totalMeters = calculateClothMeters(height, pieces);
    } else {
      // For mosquito nets and wallpapers, use area-based calculation
      pieces = Math.ceil((width * height) / 100); // Simplified calculation
      totalMeters = (width * height) / 1500; // Simplified calculation
    }

    const clothCost = totalMeters * clothRate;
    const stitchingCost = pieces * stitchingRate;
    const totalCost = clothCost + stitchingCost;

    setCalculatedData({
      pieces: pieces,
      totalMeters: totalMeters,
      clothCost: clothCost,
      stitchingCost: stitchingCost,
      totalCost: totalCost
    });
  };

  const validateForm = () => {
    if (!formData.roomLabel.trim()) {
      Alert.alert('Error', 'Room label is required');
      return false;
    }
    if (!formData.width || parseFloat(formData.width) <= 0) {
      Alert.alert('Error', 'Valid width is required');
      return false;
    }
    if (!formData.height || parseFloat(formData.height) <= 0) {
      Alert.alert('Error', 'Valid height is required');
      return false;
    }
    if (!formData.clothRatePerMeter || parseFloat(formData.clothRatePerMeter) < 0) {
      Alert.alert('Error', 'Valid cloth rate is required');
      return false;
    }
    if (!formData.stitchingCostPerPiece || parseFloat(formData.stitchingCostPerPiece) < 0) {
      Alert.alert('Error', 'Valid stitching cost is required');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const measurementData = {
      ...formData,
      width: parseFloat(formData.width),
      height: parseFloat(formData.height),
      clothRatePerMeter: parseFloat(formData.clothRatePerMeter),
      stitchingCostPerPiece: parseFloat(formData.stitchingCostPerPiece),
      ...calculatedData,
      id: editingMeasurement?.id
    };

    onSave(measurementData);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingMeasurement ? 'Edit Measurement' : 'Add Measurement'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Interior Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior Type</Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.interiorType}
              onValueChange={(value) => updateField('interiorType', value)}
              style={styles.picker}
            >
              {INTERIOR_TYPES.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurement Details</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Room/Location Label *</Text>
            <TextInput
              style={styles.input}
              value={formData.roomLabel}
              onChangeText={(text) => updateField('roomLabel', text)}
              placeholder="e.g., Master Bedroom Window 1"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Width (inches) *</Text>
              <TextInput
                style={styles.input}
                value={formData.width}
                onChangeText={(text) => updateField('width', text)}
                placeholder="72"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Height (inches) *</Text>
              <TextInput
                style={styles.input}
                value={formData.height}
                onChangeText={(text) => updateField('height', text)}
                placeholder="84"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Curtain Type (only for curtains) */}
          {formData.interiorType === 'curtains' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Curtain Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.curtainType}
                  onValueChange={(value) => updateField('curtainType', value)}
                  style={styles.picker}
                >
                  {CURTAIN_TYPES.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.rowContainer}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Cloth Rate/Meter (₹) *</Text>
              <TextInput
                style={styles.input}
                value={formData.clothRatePerMeter}
                onChangeText={(text) => updateField('clothRatePerMeter', text)}
                placeholder="80"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Stitching Cost/Piece (₹) *</Text>
              <TextInput
                style={styles.input}
                value={formData.stitchingCostPerPiece}
                onChangeText={(text) => updateField('stitchingCostPerPiece', text)}
                placeholder="60"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Calculations */}
        {(calculatedData.totalCost > 0) && (
          <View style={styles.calculationSection}>
            <Text style={styles.calculationTitle}>Calculated Values</Text>
            
            <View style={styles.calculationGrid}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Pieces Required:</Text>
                <Text style={styles.calculationValue}>{calculatedData.pieces.toFixed(1)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Total Meters:</Text>
                <Text style={styles.calculationValue}>{calculatedData.totalMeters.toFixed(2)}m</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Cloth Cost:</Text>
                <Text style={styles.calculationValue}>{formatCurrency(calculatedData.clothCost)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Stitching Cost:</Text>
                <Text style={styles.calculationValue}>{formatCurrency(calculatedData.stitchingCost)}</Text>
              </View>
              <View style={[styles.calculationRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Cost:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(calculatedData.totalCost)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {editingMeasurement ? 'Update Measurement' : 'Save Measurement'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  calculationSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  calculationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 16,
  },
  calculationGrid: {
    gap: 8,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#374151',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#3b82f6',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
