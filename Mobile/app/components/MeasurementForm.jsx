import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { INTERIOR_SCHEMAS } from "./interiorSchemas";
import DynamicFields from "./DynamicFields";
import { COLORS } from "../styles/colors";

export default function MeasurementForm({
  onSave,
  onCancel,
  editingMeasurement,
  forceInteriorType,
}) {
  const [formData, setFormData] = useState({
    interiorType: forceInteriorType || "curtains",
  });

  useEffect(() => {
    if (editingMeasurement) {
      setFormData(editingMeasurement);
    } else {
      const interiorType = forceInteriorType || "curtains";
      const schema = INTERIOR_SCHEMAS[interiorType];
      const defaults = { interiorType };
      schema.fields.forEach((field) => {
        if (field.type === "picker") {
          defaults[field.name] = field.options[0];
        } else if (field.type === "checkbox") {
          defaults[field.name] = false;
        } else {
          defaults[field.name] = "";
        }
      });
      setFormData(defaults);
    }
  }, [editingMeasurement, forceInteriorType]);

  useEffect(() => {
    // Calculation is handled in the component that uses this form
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const schema = INTERIOR_SCHEMAS[formData.interiorType];
    for (const field of schema.fields) {
      if (
        field.required &&
        (formData[field.name] === undefined ||
          formData[field.name] === null ||
          formData[field.name].toString().trim() === "")
      ) {
        Alert.alert("Error", `${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const schema = INTERIOR_SCHEMAS[formData.interiorType];
    // Convert all number fields to numbers BEFORE calculation
    const cleanedFormData = { ...formData };
    schema.fields.forEach((field) => {
      if (field.type === "number") {
        let val = cleanedFormData[field.name];
        if (typeof val === "string") val = val.replace(/[^\d.\-]/g, "");
        cleanedFormData[field.name] =
          val === "" || val === undefined || isNaN(Number(val))
            ? 0
            : Number(val);
      }
    });
    // Now run calculation with cleaned numbers
    const calc = schema.calculate(cleanedFormData);
    onSave({ ...cleanedFormData, ...calc, id: editingMeasurement?.id });
  };

  const schema = INTERIOR_SCHEMAS[formData.interiorType];
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {editingMeasurement ? "Edit Measurement" : "Add Measurement"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {schema.label}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Dynamic Fields */}
        <View style={styles.formCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
            style={styles.formCardGradient}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Measurement Details</Text>
              <DynamicFields
                schema={schema}
                formData={formData}
                updateField={updateField}
              />
            </View>
            
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.saveButtonText}>
                  {editingMeasurement ? "Update Measurement" : "Save Measurement"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formCardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.inputText,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 50,
    color: COLORS.inputText,
    paddingHorizontal: 12,
  },
  calculationSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calculationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  calculationGrid: {
    gap: 8,
  },
  calculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.success,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    paddingTop: 12,
    marginTop: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: 'white',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: 'white',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  readOnlyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  readOnlyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
