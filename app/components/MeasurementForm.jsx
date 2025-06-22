import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { INTERIOR_SCHEMAS } from './interiorSchemas';

export default function MeasurementForm({ onSave, onCancel, editingMeasurement }) {
  const [formData, setFormData] = useState({
    interiorType: 'curtains',
  });
  const [calculatedData, setCalculatedData] = useState({});

  useEffect(() => {
    if (editingMeasurement) {
      setFormData(editingMeasurement);
    }
  }, [editingMeasurement]);

  useEffect(() => {
    const schema = INTERIOR_SCHEMAS[formData.interiorType];
    if (schema && typeof schema.calculate === 'function') {
      setCalculatedData(schema.calculate(formData));
    }
  }, [formData]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const schema = INTERIOR_SCHEMAS[formData.interiorType];
    for (const field of schema.fields) {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        Alert.alert('Error', `${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const schema = INTERIOR_SCHEMAS[formData.interiorType];
    const calc = schema.calculate(formData);
    onSave({ ...formData, ...calc, id: editingMeasurement?.id });
  };

  const renderField = (field) => {
    if (field.type === 'text' || field.type === 'number') {
      return (
        <View key={field.name} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}{field.required ? ' *' : ''}</Text>
          <TextInput
            style={styles.input}
            value={formData[field.name]?.toString() || ''}
            onChangeText={text => updateField(field.name, text)}
            placeholder={field.label}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
          />
        </View>
      );
    }
    if (field.type === 'picker') {
      return (
        <View key={field.name} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData[field.name] || field.options[0]}
              onValueChange={value => updateField(field.name, value)}
              style={styles.picker}
            >
              {field.options.map(opt => (
                <Picker.Item key={opt} label={opt} value={opt} />
              ))}
            </Picker>
          </View>
        </View>
      );
    }
    return null;
  };

  const schema = INTERIOR_SCHEMAS[formData.interiorType];

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
              onValueChange={value => updateField('interiorType', value)}
              style={styles.picker}
            >
              {Object.entries(INTERIOR_SCHEMAS).map(([key, val]) => (
                <Picker.Item key={key} label={val.label} value={key} />
              ))}
            </Picker>
          </View>
        </View>
        {/* Dynamic Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurement Details</Text>
          {schema.fields.map(renderField)}
        </View>
        {/* Calculations */}
        {calculatedData && calculatedData.totalCost > 0 && (
          <View style={styles.calculationSection}>
            <Text style={styles.calculationTitle}>Calculated Values</Text>
            {Object.entries(calculatedData).map(([key, value]) => (
              <View key={key} style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</Text>
                <Text style={styles.calculationValue}>{typeof value === 'number' ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : value}</Text>
              </View>
            ))}
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
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
